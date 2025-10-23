import type { NextAuthConfig } from "next-auth"
import type { OAuthConfig } from "next-auth/providers"
import { prisma } from "@/lib/prisma"

// ============================================================================
// TIPOS Y DEFINICIONES
// ============================================================================

type BitrixEmailEntry = {
  VALUE?: string | null
  VALUE_TYPE?: string | null
}

interface BitrixProfile {
  ID?: string | number | null
  id?: string | number | null
  EMAIL?: string | BitrixEmailEntry[] | null
  EMAIL_UNCONFIRMED?: string | null
  PERSONAL_EMAIL?: string | null
  WORK_EMAIL?: string | null
  LOGIN?: string | null
  NAME?: string | null
  FIRST_NAME?: string | null
  LAST_NAME?: string | null
  SECOND_NAME?: string | null
  PERSONAL_PHOTO?: string | null
  PERSONAL_PHOTO_URL?: string | null
  [key: string]: unknown
}

interface BitrixUserResponse {
  result?: BitrixProfile
  error?: string
  error_description?: string
  [key: string]: unknown
}

type BitrixTokenSet = {
  access_token?: string
  token_type?: string | null
  refresh_token?: string
  scope?: string
  expires?: number
  expires_in?: number
  domain?: string
  server_domain?: string
  server_endpoint?: string
  client_endpoint?: string
  rest_url?: string
  member_id?: string
  user_id?: string | number
  [key: string]: unknown
}

type BitrixUserinfoContext = {
  tokens: BitrixTokenSet
  provider: { authorization?: { params?: Record<string, string> } }
  [key: string]: unknown
}

type BitrixProviderOptions = {
  domain?: string
  oauthHost?: string
  scope?: string
  clientId?: string
  clientSecret?: string
  authorizationUrl?: string
  tokenUrl?: string
  apiUrl?: string
  userLang?: string
  redirectUri?: string
  [key: string]: unknown
}

interface BitrixSessionPayload {
  accessToken?: string
  refreshToken?: string
  tokenType?: string
  scope?: string
  expiresAt?: number
  domain?: string
  serverDomain?: string
  serverEndpoint?: string
  clientEndpoint?: string
  restUrl?: string
  memberId?: string
  userId?: string | number
}

const BITRIX_USER_AGENT = "oland-agentes/1.0"

// ============================================================================
// FUNCIONES AUXILIARES PARA NORMALIZACIÓN DE URLs
// ============================================================================

function normalizeHost(value: string) {
  return value.replace(/\/+$/, "")
}

function normalizeDomain(value: string) {
  return value.replace(/^https?:\/\//, "").replace(/\/+$/, "")
}

function ensureTrailingSlash(value: string) {
  return value.endsWith("/") ? value : `${value}/`
}

// ============================================================================
// FUNCIÓN PARA RESOLVER EL EMAIL DEL USUARIO
// ============================================================================

function resolveEmail(profile: BitrixProfile) {
  if (typeof profile.EMAIL === "string") {
    return profile.EMAIL
  }

  if (Array.isArray(profile.EMAIL)) {
    const prioritized = profile.EMAIL.find((item) => item?.VALUE_TYPE === "WORK" && item.VALUE)
    if (prioritized?.VALUE) {
      return prioritized.VALUE
    }

    const firstEmail = profile.EMAIL.find((item) => item?.VALUE)
    if (firstEmail?.VALUE) {
      return firstEmail.VALUE
    }
  }

  return profile.WORK_EMAIL ?? profile.PERSONAL_EMAIL ?? profile.EMAIL_UNCONFIRMED ?? undefined
}

// ============================================================================
// FUNCIÓN PARA PROCESAR Y ORGANIZAR LOS TOKENS DE BITRIX
// ============================================================================

function resolveBitrixSessionPayload(tokenSet: BitrixTokenSet): BitrixSessionPayload {
  const now = Math.floor(Date.now() / 1000)
  
  const expiresAt = tokenSet.expires
    ? Number(tokenSet.expires)
    : tokenSet.expires_in
      ? now + Number(tokenSet.expires_in)
      : undefined

  return {
    accessToken: tokenSet.access_token,
    refreshToken: tokenSet.refresh_token,
    tokenType: tokenSet.token_type ?? "Bearer",
    scope: tokenSet.scope,
    expiresAt,
    domain: tokenSet.domain,
    serverDomain: tokenSet.server_domain,
    serverEndpoint: tokenSet.server_endpoint,
    clientEndpoint: tokenSet.client_endpoint,
    restUrl: tokenSet.rest_url,
    memberId: tokenSet.member_id,
    userId: tokenSet.user_id,
  }
}

// ============================================================================
// FUNCIÓN PARA RENOVAR EL ACCESS TOKEN USANDO REFRESH TOKEN
// ============================================================================

async function refreshBitrixAccessToken(refreshToken: string): Promise<BitrixTokenSet> {
  const oauthHost = process.env.BITRIX_OAUTH_HOST ?? "https://oauth.bitrix.info"
  const tokenUrl = `${normalizeHost(oauthHost)}/oauth/token/`

  console.log('🔄 Renovando token de Bitrix24...')

  try {
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': BITRIX_USER_AGENT,
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: process.env.BITRIX_CLIENT_ID!,
        client_secret: process.env.BITRIX_CLIENT_SECRET!,
        refresh_token: refreshToken,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(
        `Failed to refresh Bitrix token: ${response.status} - ${JSON.stringify(errorData)}`
      )
    }

    const tokens = await response.json() as BitrixTokenSet
    
    console.log('✅ Token de Bitrix24 renovado exitosamente')
    
    return tokens
  } catch (error) {
    console.error('❌ Error al renovar token de Bitrix24:', error)
    throw error
  }
}

// ============================================================================
// PROVEEDOR DE BITRIX24
// ============================================================================

function BitrixProvider(options: BitrixProviderOptions = {}): OAuthConfig<BitrixProfile> {
  const {
    domain = process.env.BITRIX_DOMAIN,
    oauthHost = process.env.BITRIX_OAUTH_HOST ?? "https://oauth.bitrix.info",
    scope = process.env.BITRIX_SCOPE,
    clientId = process.env.BITRIX_CLIENT_ID,
    clientSecret = process.env.BITRIX_CLIENT_SECRET,
    authorizationUrl: overrideAuthorizationUrl,
    tokenUrl: overrideTokenUrl,
    apiUrl: overrideApiUrl,
    userLang: overrideUserLang,
    redirectUri: overrideRedirectUri,
    ...providerOverrides
  } = options

  if (!clientId) {
    throw new Error("Bitrix provider: missing clientId. Set BITRIX_CLIENT_ID.")
  }

  if (!clientSecret) {
    throw new Error("Bitrix provider: missing clientSecret. Set BITRIX_CLIENT_SECRET.")
  }

  if (!domain) {
    throw new Error("Bitrix provider: missing domain. Set BITRIX_DOMAIN or pass domain option.")
  }

  const portalHost = normalizeDomain(domain)
  const oauthBase = normalizeHost(oauthHost)
  const defaultAuthorizationEndpoint = ensureTrailingSlash(`https://${portalHost}/oauth/authorize`)
  
  const authorizationUrl = ensureTrailingSlash(
    (overrideAuthorizationUrl ?? process.env.BITRIX_AUTH_URL ?? defaultAuthorizationEndpoint).trim()
  )
  
  const tokenUrl = ensureTrailingSlash(
    (overrideTokenUrl ?? process.env.BITRIX_TOKEN_URL ?? `${oauthBase}/oauth/token`).trim()
  )
  
  const apiBase = normalizeHost(
    overrideApiUrl ??
      process.env.BITRIX_API_URL ??
      `https://${portalHost}/rest`
  )
  
  const userLang = overrideUserLang ?? process.env.BITRIX_USER_LANG ?? process.env.BITRIX_LANGUAGE
  const redirectUri = overrideRedirectUri ?? process.env.BITRIX_REDIRECT_URI
  const defaultUserinfoEndpoint = `${apiBase}/user.current.json`

  const authorizationParams: Record<string, string> = {}
  if (scope) authorizationParams.scope = scope
  if (redirectUri) authorizationParams.redirect_uri = redirectUri
  if (userLang) authorizationParams.user_lang = userLang

  return {
    id: "bitrix",
    name: "Bitrix24",
    type: "oauth",
    clientId,
    clientSecret,
    
    authorization: {
      url: authorizationUrl,
      params: authorizationParams,
    },
    
  token: {
  url: tokenUrl,
  // Transformar la respuesta antes de procesarla
  async conform(response) {
    const text = await response.text();
    const data = JSON.parse(text);
    
    // Agregar el token_type faltante
    data.token_type = data.token_type || "Bearer";
    
    return new Response(JSON.stringify(data), {
      status: response.status,
      statusText: response.statusText,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  },
},
    
    userinfo: {
      url: defaultUserinfoEndpoint,
      async request({ tokens }: BitrixUserinfoContext) {
        const tokenSet = tokens
        const accessToken = tokenSet.access_token
        
        if (!accessToken) {
          throw new Error("Bitrix provider: access token not found in token response.")
        }

        const restBaseCandidates: Array<string | undefined> = [
          tokenSet.client_endpoint,
          tokenSet.rest_url,
          tokenSet.server_endpoint,
          tokenSet.server_domain ? `https://${normalizeDomain(tokenSet.server_domain)}/rest/` : undefined,
          tokenSet.domain ? `https://${normalizeDomain(tokenSet.domain)}/rest/` : undefined,
          process.env.BITRIX_API_URL,
          process.env.BITRIX_DOMAIN ? `https://${normalizeDomain(process.env.BITRIX_DOMAIN)}/rest/` : undefined,
        ]

        const restBase = restBaseCandidates.find((candidate) => typeof candidate === "string" && candidate.length > 0)
        
        if (!restBase) {
          throw new Error("Bitrix provider: unable to resolve REST endpoint for userinfo.")
        }

        const userInfoUrl = `${ensureTrailingSlash(restBase)}user.current.json?auth=${accessToken}`

        const response = await fetch(userInfoUrl, {
          headers: { "User-Agent": BITRIX_USER_AGENT },
        })
        
        const payload = (await response.json()) as BitrixUserResponse

        if (!response.ok || payload.error) {
          const message = payload.error_description ?? payload.error ?? `HTTP ${response.status}`
          throw new Error(`Bitrix provider: userinfo request failed (${message}).`)
        }

        return payload.result ?? payload
      },
    },
    
    profile(profile) {
      const identifier = profile.ID ?? profile.id ?? profile.LOGIN ?? resolveEmail(profile)
      
      if (!identifier) {
        throw new Error("Bitrix provider: user profile is missing an identifier.")
      }

      const firstName = profile.NAME ?? profile.FIRST_NAME ?? ""
      const lastName = profile.LAST_NAME ?? profile.SECOND_NAME ?? ""
      const fullName = [firstName, lastName]
        .map((value) => value?.trim())
        .filter(Boolean)
        .join(" ")
      
      const email = resolveEmail(profile)

      return {
        id: String(identifier),
        name: fullName || profile.LOGIN || undefined,
        email,
        image: profile.PERSONAL_PHOTO ?? profile.PERSONAL_PHOTO_URL ?? undefined,
      }
    },
    
    checks: ["pkce", "state"],
    
    style: {
      brandColor: "#2fc6f6",
      logo: "https://authjs.dev/img/providers/bitrix24.svg",
    },
    
    options: providerOverrides,
  }
}

// ============================================================================
// CONFIGURACIÓN DE NEXTAUTH CON REFRESH TOKEN Y SINCRONIZACIÓN DE USUARIOS
// ============================================================================

const authConfig = {
  providers: [BitrixProvider()],
  
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  
  callbacks: {
    async signIn({ user, account, profile }) {
      return true
    },

    async jwt({ token, account, user, trigger }) {
      if (user) {
        token.sub = user.id
        console.log('💾 Guardando ID de usuario en token:', user.id)
      }
      
      if (account) {
        console.log('🔐 Nuevo login - Guardando tokens de Bitrix24')
        
        // Normalizar token_type si Bitrix no lo envía
        if (!account.token_type) {
          account.token_type = "Bearer"
        }
        
        const bitrix = resolveBitrixSessionPayload(account as BitrixTokenSet)
        token.bitrix = bitrix
        token.accessToken = bitrix.accessToken
        
        return token
      }

      const bitrixData = token.bitrix as BitrixSessionPayload | undefined
      
      if (!bitrixData?.expiresAt) {
        return token
      }

      const now = Math.floor(Date.now() / 1000)
      const timeUntilExpiry = bitrixData.expiresAt - now
      const shouldRefresh = timeUntilExpiry < 300
      
      if (shouldRefresh && bitrixData.refreshToken) {
        console.log(`⏰ Token expira en ${timeUntilExpiry} segundos - Renovando...`)
        
        try {
          const newTokens = await refreshBitrixAccessToken(bitrixData.refreshToken)
          const updatedBitrix = resolveBitrixSessionPayload(newTokens)
          token.bitrix = updatedBitrix
          token.accessToken = updatedBitrix.accessToken
          
          console.log('✅ Token renovado exitosamente')
        } catch (error) {
          console.error('❌ Error al renovar token:', error)
          return {
            ...token,
            error: "RefreshAccessTokenError"
          }
        }
      } else if (shouldRefresh) {
        console.warn('⚠️ Token por expirar pero no hay refresh token disponible')
      }

      return token
    },

    async session({ session, token }) {
      const bitrix = token.bitrix as BitrixSessionPayload | undefined
      
      if (token.sub) {
        session.user.id = token.sub
      }
      
      if (bitrix) {
        (session as any).bitrix = bitrix
        
        if (bitrix.accessToken) {
          (session as any).accessToken = bitrix.accessToken
        }
      }
      
      if (token.error) {
        (session as any).error = token.error
      }
      
      return session
    },
  },
} satisfies NextAuthConfig

export default authConfig
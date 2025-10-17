import NextAuth from "next-auth"
import type { OAuthConfig } from "next-auth/providers"
import { PrismaAdapter } from "@auth/prisma-adapter"
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

/**
 * Elimina las barras finales de una URL
 * Ejemplo: "https://example.com/" -> "https://example.com"
 */
function normalizeHost(value: string) {
  return value.replace(/\/+$/, "")
}

/**
 * Elimina el protocolo (http/https) y las barras finales de un dominio
 * Ejemplo: "https://company.bitrix24.com/" -> "company.bitrix24.com"
 */
function normalizeDomain(value: string) {
  return value.replace(/^https?:\/\//, "").replace(/\/+$/, "")
}

/**
 * Asegura que una URL termine con barra diagonal
 * Ejemplo: "https://example.com" -> "https://example.com/"
 */
function ensureTrailingSlash(value: string) {
  return value.endsWith("/") ? value : `${value}/`
}

// ============================================================================
// FUNCIÓN PARA RESOLVER EL EMAIL DEL USUARIO
// ============================================================================

/**
 * Extrae el email del perfil de Bitrix24
 * Bitrix puede devolver el email en diferentes formatos:
 * 1. Como string directo
 * 2. Como array de objetos con prioridad (WORK email tiene prioridad)
 * 3. En campos alternativos (WORK_EMAIL, PERSONAL_EMAIL, etc.)
 */
function resolveEmail(profile: BitrixProfile) {
  // Caso 1: EMAIL es un string directo
  if (typeof profile.EMAIL === "string") {
    return profile.EMAIL
  }

  // Caso 2: EMAIL es un array de objetos
  if (Array.isArray(profile.EMAIL)) {
    // Priorizar email de trabajo (WORK)
    const prioritized = profile.EMAIL.find((item) => item?.VALUE_TYPE === "WORK" && item.VALUE)
    if (prioritized?.VALUE) {
      return prioritized.VALUE
    }

    // Si no hay email de trabajo, tomar el primero disponible
    const firstEmail = profile.EMAIL.find((item) => item?.VALUE)
    if (firstEmail?.VALUE) {
      return firstEmail.VALUE
    }
  }

  // Caso 3: Buscar en campos alternativos
  return profile.WORK_EMAIL ?? profile.PERSONAL_EMAIL ?? profile.EMAIL_UNCONFIRMED ?? undefined
}

// ============================================================================
// FUNCIÓN PARA NORMALIZAR LA RESPUESTA DE TOKENS
// ============================================================================

/**
 * Bitrix24 a veces no envía el campo "token_type" en la respuesta
 * Esta función asegura que siempre exista y sea "Bearer"
 * Esto es necesario porque NextAuth lo espera
 */
async function parseAndNormalizeTokenResponse(response: Response) {
  const cloned = response.clone()
  const data = (await cloned.json().catch(() => null)) as BitrixTokenSet | null

  if (!data) {
    throw new Error("Bitrix provider: unable to parse token response as JSON.")
  }

  // Asegurar que token_type exista (Bitrix a veces lo omite)
  if (!data.token_type) {
    data.token_type = "Bearer"
  }

  const headers = new Headers(response.headers)
  headers.set("Content-Type", "application/json")

  return new Response(JSON.stringify(data), {
    headers,
    status: response.status,
    statusText: response.statusText,
  })
}

// ============================================================================
// FUNCIÓN PARA PROCESAR Y ORGANIZAR LOS TOKENS DE BITRIX
// ============================================================================

/**
 * Convierte los tokens de Bitrix al formato que usaremos en la sesión
 * Calcula el timestamp de expiración:
 * - Si Bitrix envía "expires": usa ese valor
 * - Si Bitrix envía "expires_in": lo suma al tiempo actual
 * - Si no envía nada: queda como undefined
 */
function resolveBitrixSessionPayload(tokenSet: BitrixTokenSet): BitrixSessionPayload {
  const now = Math.floor(Date.now() / 1000) // Tiempo actual en segundos
  
  // Calcular cuándo expira el token
  const expiresAt = tokenSet.expires
    ? Number(tokenSet.expires) // Timestamp absoluto
    : tokenSet.expires_in
      ? now + Number(tokenSet.expires_in) // Segundos desde ahora (típicamente 3600 = 1 hora)
      : undefined

  return {
    accessToken: tokenSet.access_token,
    refreshToken: tokenSet.refresh_token, // IMPORTANTE: Guardamos el refresh token
    tokenType: tokenSet.token_type ?? "Bearer",
    scope: tokenSet.scope,
    expiresAt, // Timestamp de cuándo expira
    domain: tokenSet.domain,
    serverDomain: tokenSet.server_domain,
    serverEndpoint: tokenSet.server_endpoint,
    clientEndpoint: tokenSet.client_endpoint,
    restUrl: tokenSet.rest_url, // URL base para hacer llamadas a la API
    memberId: tokenSet.member_id,
    userId: tokenSet.user_id,
  }
}

// ============================================================================
// FUNCIÓN PARA RENOVAR EL ACCESS TOKEN USANDO REFRESH TOKEN
// ============================================================================

/**
 * Cuando el accessToken expira (después de ~1 hora), esta función
 * usa el refreshToken para obtener un nuevo accessToken de Bitrix24
 * 
 * Esto permite mantener la sesión activa sin que el usuario tenga que
 * volver a hacer login
 */
async function refreshBitrixAccessToken(refreshToken: string): Promise<BitrixTokenSet> {
  // Construir la URL del endpoint de token de Bitrix
  const oauthHost = process.env.BITRIX_OAUTH_HOST ?? "https://oauth.bitrix.info"
  const tokenUrl = `${normalizeHost(oauthHost)}/oauth/token/`

  console.log('🔄 Renovando token de Bitrix24...')

  try {
    // Hacer la petición POST para renovar el token
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': BITRIX_USER_AGENT,
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token', // Tipo de grant OAuth2
        client_id: process.env.BITRIX_CLIENT_ID!,
        client_secret: process.env.BITRIX_CLIENT_SECRET!,
        refresh_token: refreshToken,
      }),
    })

    // Si la respuesta no es exitosa, lanzar error
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

  // Validaciones: Asegurar que existan las credenciales necesarias
  if (!clientId) {
    throw new Error("Bitrix provider: missing clientId. Set BITRIX_CLIENT_ID.")
  }

  if (!clientSecret) {
    throw new Error("Bitrix provider: missing clientSecret. Set BITRIX_CLIENT_SECRET.")
  }

  if (!domain) {
    throw new Error("Bitrix provider: missing domain. Set BITRIX_DOMAIN or pass domain option.")
  }

  // Construir las URLs necesarias para OAuth
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

  // Parámetros que se enviarán en la URL de autorización
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
    
    // Configuración de autorización (donde el usuario inicia sesión)
    authorization: {
      url: authorizationUrl,
      params: authorizationParams,
    },
    
    // Configuración de obtención de tokens
    token: {
      url: tokenUrl,
      async conform(response: any) {
        // Normalizar la respuesta de tokens antes de procesarla
        return parseAndNormalizeTokenResponse(response)
      },
    },
    
    // Configuración para obtener información del usuario
    userinfo: {
      url: defaultUserinfoEndpoint,
      async request({ tokens }: BitrixUserinfoContext) {
        const tokenSet = tokens
        const accessToken = tokenSet.access_token
        
        if (!accessToken) {
          throw new Error("Bitrix provider: access token not found in token response.")
        }

        // Intentar resolver la URL base de la API REST de Bitrix
        // Bitrix puede devolver esta información en diferentes campos
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

        // Construir la URL para obtener información del usuario actual
        const userInfoUrl = `${ensureTrailingSlash(restBase)}user.current.json?auth=${accessToken}`

        // Hacer la petición a Bitrix24
        const response = await fetch(userInfoUrl, {
          headers: { "User-Agent": BITRIX_USER_AGENT },
        })
        
        const payload = (await response.json()) as BitrixUserResponse

        // Verificar si hubo errores
        if (!response.ok || payload.error) {
          const message = payload.error_description ?? payload.error ?? `HTTP ${response.status}`
          throw new Error(`Bitrix provider: userinfo request failed (${message}).`)
        }

        return payload.result ?? payload
      },
    },
    
    // Transformar el perfil de Bitrix al formato estándar de NextAuth
    profile(profile) {
      // Resolver el identificador único del usuario
      const identifier = profile.ID ?? profile.id ?? profile.LOGIN ?? resolveEmail(profile)
      
      if (!identifier) {
        throw new Error("Bitrix provider: user profile is missing an identifier.")
      }

      // Construir el nombre completo del usuario
      const firstName = profile.NAME ?? profile.FIRST_NAME ?? ""
      const lastName = profile.LAST_NAME ?? profile.SECOND_NAME ?? ""
      const fullName = [firstName, lastName]
        .map((value) => value?.trim())
        .filter(Boolean)
        .join(" ")
      
      const email = resolveEmail(profile)

      // Retornar en el formato estándar de NextAuth
      return {
        id: String(identifier),
        name: fullName || profile.LOGIN || undefined,
        email,
        image: profile.PERSONAL_PHOTO ?? profile.PERSONAL_PHOTO_URL ?? undefined,
      }
    },
    
    // Habilitar PKCE y state para mayor seguridad OAuth2
    checks: ["pkce", "state"],
    
    style: {
      brandColor: "#2fc6f6",
      logo: "https://authjs.dev/img/providers/bitrix24.svg",
    },
    
    options: providerOverrides,
  }
}

// ============================================================================
// CONFIGURACIÓN DE NEXTAUTH CON REFRESH TOKEN
// ============================================================================

export const { handlers, signIn, signOut, auth } = NextAuth({
    adapter: PrismaAdapter(prisma),
  providers: [BitrixProvider()],
  
  // Configuración de sesión
  session: {
    strategy: "jwt", // Usar JWT (sin base de datos)
    maxAge: 30 * 24 * 60 * 60, // 30 días en segundos
  },
  
  callbacks: {
    /**
     * Callback JWT - Se ejecuta cada vez que se crea o actualiza el token JWT
     * 
     * Este es el corazón del sistema de refresh token:
     * 1. Cuando el usuario hace login por primera vez (account existe),
     *    guardamos todos los tokens de Bitrix
     * 2. En cada petición subsecuente, verificamos si el token está por expirar
     * 3. Si está por expirar, lo renovamos automáticamente
     */
    async jwt({ token, account, trigger }) {
      // PRIMER LOGIN: Guardar tokens iniciales de Bitrix
      if (account) {
        console.log('🔐 Nuevo login - Guardando tokens de Bitrix24')
        
        const bitrix = resolveBitrixSessionPayload(account as BitrixTokenSet)
        token.bitrix = bitrix
        token.accessToken = bitrix.accessToken
        
        return token
      }

      // RENOVACIÓN AUTOMÁTICA: Verificar si necesitamos renovar el token
      const bitrixData = token.bitrix as BitrixSessionPayload | undefined
      
      // Si no hay datos de Bitrix o no hay tiempo de expiración, retornar tal cual
      if (!bitrixData?.expiresAt) {
        return token
      }

      const now = Math.floor(Date.now() / 1000) // Tiempo actual en segundos
      const timeUntilExpiry = bitrixData.expiresAt - now // Segundos hasta que expire
      
      // Renovar si faltan menos de 5 minutos (300 segundos) para que expire
      // Esto da un margen de seguridad para evitar que expire durante una petición
      const shouldRefresh = timeUntilExpiry < 300
      
      if (shouldRefresh && bitrixData.refreshToken) {
        console.log(`⏰ Token expira en ${timeUntilExpiry} segundos - Renovando...`)
        
        try {
          // Llamar a Bitrix24 para obtener un nuevo access token
          const newTokens = await refreshBitrixAccessToken(bitrixData.refreshToken)
          
          // Actualizar los datos de la sesión con los nuevos tokens
          const updatedBitrix = resolveBitrixSessionPayload(newTokens)
          token.bitrix = updatedBitrix
          token.accessToken = updatedBitrix.accessToken
          
          console.log('✅ Token renovado exitosamente')
        } catch (error) {
          console.error('❌ Error al renovar token:', error)
          
          // Si falla la renovación, marcar el token con error
          // Esto forzará al usuario a hacer login nuevamente
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

    /**
     * Callback Session - Se ejecuta cada vez que se accede a la sesión
     * 
     * Transfiere los datos del JWT a la sesión que se expone al cliente
     * Incluye los tokens de Bitrix y marca si hubo error al renovar
     */
    async session({ session, token }) {
      const bitrix = token.bitrix as BitrixSessionPayload | undefined
      
      if (bitrix) {
        // Agregar datos de Bitrix a la sesión
        (session as any).bitrix = bitrix
        
        if (bitrix.accessToken) {
          (session as any).accessToken = bitrix.accessToken
        }
      }
      
      // Si hubo error al renovar, agregarlo a la sesión
      // Tu frontend puede verificar esto y mostrar un mensaje
      if (token.error) {
        (session as any).error = token.error
      }
      
      return session
    },
  },
})
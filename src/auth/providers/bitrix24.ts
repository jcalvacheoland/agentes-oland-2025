import type { OAuthConfig, OAuthUserConfig } from "@auth/core/providers"

export interface Bitrix24User {
  ID: number | string
  NAME?: string
  LAST_NAME?: string
  EMAIL?: string
  PERSONAL_PHOTO?: string
  [key: string]: any
}

/**
 * Bitrix24 custom OAuth provider for Auth.js
 *
 * Required env:
 * - AUTH_BITRIX24_CLIENT_ID
 * - AUTH_BITRIX24_CLIENT_SECRET
 * - AUTH_BITRIX24_PORTAL (e.g. "oland.bitrix24.com")
 */
export default function Bitrix24(
  config: OAuthUserConfig<Bitrix24User> & {
    /** Your tenant portal, e.g. "oland.bitrix24.com" */
    portal: string
    /** Optional scopes; default covers user profile access via REST */
    scope?: string
  }
): OAuthConfig<Bitrix24User> {
  const portal = config.portal?.replace(/^https?:\/\//, "").replace(/\/+$/, "")
  if (!portal) throw new Error("Bitrix24 provider requires a `portal` option, e.g. oland.bitrix24.com")

  const scope = config.scope ?? "user"

  return {
    id: "bitrix24",
    name: "Bitrix24",
    type: "oauth",

    // 1) User is sent to THEIR portal to authorize
    // https://{portal}/oauth/authorize?client_id=...&state=...
    // Add your scopes here; Bitrix devolverá scope concedido en el redirect.
    authorization: {
      url: `https://${portal}/oauth/authorize`,
      params: { scope },
    },

    // 2) Token exchange SIEMPRE en oauth.bitrix.info (según docs oficiales)
    token: {
      url: "https://oauth.bitrix.info/oauth/token",
    },

    // 3) Userinfo: usamos el server REST para pedir user.current con el access_token
    // Tip: podemos usar el "server_endpoint" del token, pero Auth.js no lo expone directamente;
    // oauth.bitrix.info hace de proxy REST, así que funciona igual.
    userinfo: {
      async request({ tokens }) {
        const res = await fetch(
          `https://oauth.bitrix.info/rest/user.current.json?auth=${encodeURIComponent(tokens.access_token!)}`
        )
        const json = await res.json()
        // Bitrix retorna { result: {...} }
        return json?.result ?? {}
      },
    },

    // 4) Mapear al perfil de Auth.js
    profile(profile) {
      const first = (profile.NAME ?? "").trim()
      const last = (profile.LAST_NAME ?? "").trim()
      const name = [first, last].filter(Boolean).join(" ") || profile.EMAIL || String(profile.ID)
      return {
        id: String(profile.ID),
        name,
        email: profile.EMAIL || null,
        image: profile.PERSONAL_PHOTO || null,
      }
    },

    // seguridad básica para OAuth2 (Bitrix no es OIDC)
    checks: ["state"],

    options: config,
  }
}

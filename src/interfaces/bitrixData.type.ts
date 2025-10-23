import { IBitrixUser } from '@/interfaces/bitrixUser.type';

export interface IBitrixData {
  user: IBitrixUser | null;
  loading: boolean;
  error: string | null;
}

// ============================================================================
// TIPOS Y DEFINICIONES de bitrix auth custom provider auth.ts
// ============================================================================

export interface BitrixEmailEntry  {
  VALUE?: string | null
  VALUE_TYPE?: string | null
}

export interface BitrixProfile {
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

 export interface BitrixUserResponse {
  result?: BitrixProfile
  error?: string
  error_description?: string
  [key: string]: unknown
}

export interface BitrixTokenSet {
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

export interface BitrixUserinfoContext  {
  tokens: BitrixTokenSet
  provider: { authorization?: { params?: Record<string, string> } }
  [key: string]: unknown
}

export interface BitrixProviderOptions  {
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

export interface BitrixSessionPayload {
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
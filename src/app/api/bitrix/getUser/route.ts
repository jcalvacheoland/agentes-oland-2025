import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { BITRIX_USER_AGENT} from "@/configuration/constants"

type BitrixSession = {
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
}

interface BitrixUserResult {
  ID?: string | number
  NAME?: string
  LAST_NAME?: string
  EMAIL?: string
  WORK_POSITION?: string
  UF_DEPARTMENT?: unknown
  [key: string]: unknown
}

interface BitrixUserResponse {
  result?: BitrixUserResult
  error?: string
  error_description?: string
}

function ensureRestBase(url: string) {
  return url.endsWith("/") ? url : `${url}/`
}

function isOAuthHost(url: string | undefined) {
  return typeof url === "string" && /bitrix\.info/i.test(url)
}

function resolveRestBase(bitrix: BitrixSession) {
  const candidates = [
    bitrix.clientEndpoint,
    bitrix.restUrl,
    bitrix.serverEndpoint,
    process.env.BITRIX_API_URL,
    bitrix.serverDomain ? `https://${bitrix.serverDomain}/rest/` : undefined,
    bitrix.domain ? `https://${bitrix.domain}/rest/` : undefined,
    process.env.BITRIX_DOMAIN ? `https://${process.env.BITRIX_DOMAIN}/rest/` : undefined,
  ].filter((candidate): candidate is string => Boolean(candidate))

  const preferred = candidates.find((candidate) => !isOAuthHost(candidate)) ?? candidates[0]
  return preferred ? ensureRestBase(preferred) : undefined
}

export async function GET() {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const bitrix = ((session as any).bitrix ?? {}) as BitrixSession
    const accessToken = bitrix.accessToken ?? (session as any).accessToken

    if (!accessToken) {
      return NextResponse.json(
        { error: "Bitrix access token not available in session" },
        { status: 401 }
      )
    }

    const restBase = resolveRestBase(bitrix)

    if (!restBase) {
      return NextResponse.json(
        { error: "Unable to resolve Bitrix REST endpoint" },
        { status: 502 }
      )
    }

    const userInfoUrl = `${restBase}user.current.json?auth=${accessToken}`
    const response = await fetch(userInfoUrl, {
      headers: { "User-Agent": BITRIX_USER_AGENT },
    })

    const payload = (await response.json()) as BitrixUserResponse

    if (!response.ok || payload?.error) {
      const message = payload?.error_description ?? payload?.error ?? `HTTP ${response.status}`
      return NextResponse.json(
        { error: "Failed to fetch Bitrix user", details: message },
        { status: response.status }
      )
    }

    const user = payload.result ?? {}
    const fullName = [user.NAME, user.LAST_NAME].filter(Boolean).join(" ")

    return NextResponse.json({
      id: user.ID ?? null,
      name: fullName || null,
      email: user.EMAIL ?? null,
      position: user.WORK_POSITION ?? null,
      department: user.UF_DEPARTMENT ?? null,
    })
  } catch (error) {
    console.error("Bitrix user fetch error", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

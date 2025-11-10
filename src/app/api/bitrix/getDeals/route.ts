import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { BITRIX_USER_AGENT } from "@/configuration/constants";

type BitrixSession = {
  accessToken?: string;
  refreshToken?: string;
  tokenType?: string;
  scope?: string;
  expiresAt?: number;
  domain?: string;
  serverDomain?: string;
  serverEndpoint?: string;
  clientEndpoint?: string;
  restUrl?: string;
};

type BitrixDealsResponse = {
  result?: unknown;
  total?: number;
  next?: number;
  time?: unknown;
  error?: string;
  error_description?: string;
  [key: string]: unknown;
};

function ensureRestBase(url: string) {
  return url.endsWith("/") ? url : `${url}/`;
}

function isOAuthHost(url: string | undefined) {
  return typeof url === "string" && /bitrix\.info/i.test(url);
}

function resolveRestBase(bitrix: BitrixSession) {
  const candidates = [
    bitrix.clientEndpoint,
    bitrix.restUrl,
    bitrix.serverEndpoint,
    process.env.BITRIX_API_URL,
    bitrix.serverDomain ? `https://${bitrix.serverDomain}/rest/` : undefined,
    bitrix.domain ? `https://${bitrix.domain}/rest/` : undefined,
    process.env.BITRIX_DOMAIN
      ? `https://${process.env.BITRIX_DOMAIN}/rest/`
      : undefined,
  ].filter((candidate): candidate is string => Boolean(candidate));

  const preferred =
    candidates.find((candidate) => !isOAuthHost(candidate)) ?? candidates[0];
  return preferred ? ensureRestBase(preferred) : undefined;
}

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Falta userId" }, { status: 400 });
    }

    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const bitrix = ((session as any).bitrix ?? {}) as BitrixSession;
    const accessToken = bitrix.accessToken ?? (session as any).accessToken;

    if (!accessToken) {
      return NextResponse.json(
        { error: "Bitrix access token not available in session" },
        { status: 401 }
      );
    }

    const restBase = resolveRestBase(bitrix);

    if (!restBase) {
      return NextResponse.json(
        { error: "Unable to resolve Bitrix REST endpoint" },
        { status: 502 }
      );
    }

    const dealsUrl = `${restBase}crm.deal.list.json?auth=${accessToken}`;
    const response = await fetch(dealsUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": BITRIX_USER_AGENT,
      },
      body: JSON.stringify({
        select: [
          "ID",
          "TITLE",
          "ASSIGNED_BY_ID",
          "DATE_CREATE",
          "STAGE_ID",
          "OPPORTUNITY",
          "UF_CRM_1757947153789",
          "UF_CRM_1733258852031",//prima neta
          "UF_CRM_1760390697734",//comisión
        ],
        filter: { ASSIGNED_BY_ID: userId },
        order: { ID: "DESC" },
      }),
    });

    const payload = (await response.json()) as BitrixDealsResponse;

    if (!response.ok || payload?.error) {
      const message =
        payload?.error_description ??
        payload?.error ??
        `HTTP ${response.status}`;
      return NextResponse.json(
        { error: "Failed to fetch Bitrix deals", details: message },
        { status: response.status }
      );
    }

    return NextResponse.json(payload);
  } catch (error) {
    console.error("Bitrix deals fetch error", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

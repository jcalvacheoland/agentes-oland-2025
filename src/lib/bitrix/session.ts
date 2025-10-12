import { auth } from "@/auth";

type BitrixSessionPayload = {
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

export type BitrixAuthContext = {
  accessToken: string;
  restBase: string;
  rawSession: BitrixSessionPayload;
};

const BITRIX_OAUTH_HOST_REGEX = /bitrix\.info/i;

const ensureRestBase = (url: string) => (url.endsWith("/") ? url : `${url}/`);

const isOAuthHost = (url: string | undefined) =>
  typeof url === "string" && BITRIX_OAUTH_HOST_REGEX.test(url);

const resolveRestBase = (bitrix: BitrixSessionPayload) => {
  const candidates = [
    bitrix.clientEndpoint,
    bitrix.restUrl,
    bitrix.serverEndpoint,
    bitrix.serverDomain ? `https://${bitrix.serverDomain}/rest/` : undefined,
    bitrix.domain ? `https://${bitrix.domain}/rest/` : undefined,
    process.env.BITRIX_API_URL,
    process.env.BITRIX_DOMAIN ? `https://${process.env.BITRIX_DOMAIN}/rest/` : undefined,
  ].filter((candidate): candidate is string => Boolean(candidate));

  const preferred =
    candidates.find((candidate) => !isOAuthHost(candidate)) ?? candidates[0];

  return preferred ? ensureRestBase(preferred) : undefined;
};

export const getBitrixAuthContext = async (): Promise<BitrixAuthContext> => {
  const session = await auth();

  if (!session) {
    throw new Error("Unauthorized");
  }

  const bitrix = ((session as any).bitrix ?? {}) as BitrixSessionPayload;
  const accessToken = bitrix.accessToken ?? (session as any).accessToken;

  if (!accessToken) {
    throw new Error("Bitrix access token not available in session");
  }

  const restBase = resolveRestBase(bitrix);

  if (!restBase) {
    throw new Error("Unable to resolve Bitrix REST endpoint");
  }

  return {
    accessToken,
    restBase,
    rawSession: bitrix,
  };
};

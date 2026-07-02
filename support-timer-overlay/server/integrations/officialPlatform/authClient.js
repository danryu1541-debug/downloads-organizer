import { env } from "../../config/env.js";

const authBaseUrl = "https://chzzk.naver.com/account-interlock";
const apiBaseUrl = "https://openapi.chzzk.naver.com";

export function buildAuthorizationUrl(state) {
  const url = new URL(authBaseUrl);
  url.searchParams.set("clientId", env.platform.clientId);
  url.searchParams.set("redirectUri", env.platform.redirectUri);
  url.searchParams.set("state", state);
  return url.toString();
}

export async function exchangeCodeForToken({ code, state }) {
  return requestToken({
    grantType: "authorization_code",
    clientId: env.platform.clientId,
    clientSecret: env.platform.clientSecret,
    code,
    state
  });
}

export async function refreshAccessToken(refreshToken) {
  return requestToken({
    grantType: "refresh_token",
    refreshToken,
    clientId: env.platform.clientId,
    clientSecret: env.platform.clientSecret
  });
}

export async function requestOpenApi(path, { accessToken, method = "GET", query, body } = {}) {
  const url = new URL(`${apiBaseUrl}${path}`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null) url.searchParams.set(key, value);
    }
  }

  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });

  if (!response.ok) {
    throw new Error(`Open API request failed: ${response.status}`);
  }

  return unwrap(await response.json());
}

function hasCredentials() {
  return Boolean(env.platform.clientId && env.platform.clientSecret);
}

async function requestToken(body) {
  if (!hasCredentials()) {
    throw new Error("Missing platform client credentials. Fill .env first.");
  }

  const response = await fetch(`${apiBaseUrl}/auth/v1/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    throw new Error(`Token request failed: ${response.status}`);
  }

  return unwrap(await response.json());
}

function unwrap(payload) {
  return payload?.content || payload;
}

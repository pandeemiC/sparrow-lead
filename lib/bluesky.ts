import type { BlueSkyToken } from "@/types";

const SERVICE = "https://bsky.social/xrpc";
const TOKEN_LIFETIME_MS = 90 * 60 * 1000;

let cached: BlueSkyToken | null = null;

export function blueSkyConfigured() {
  return Boolean(
    process.env.BLUESKY_HANDLE && process.env.BLUESKY_APP_PASSWORD,
  );
}

async function getToken(): Promise<string> {
  if (cached && cached.expiresAt > Date.now()) return cached.value;

  const res = await fetch(`${SERVICE}/com.atproto.server.createSession`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      identifier: process.env.BLUESKY_HANDLE,
      password: process.env.BLUESKY_APP_PASSWORD,
    }),
  });

  if (!res.ok) {
    throw new Error(`Bluesky login failed (${res.status})`);
  }

  const data: { accessJwt: string } = await res.json();
  cached = { value: data.accessJwt, expiresAt: Date.now() + TOKEN_LIFETIME_MS };
  return cached.value;
}

export async function blueskyGet(path: string): Promise<Response> {
  const res = await fetch(`${SERVICE}${path}`, {
    headers: { Authorization: `Bearer ${await getToken()}` },
  });
  if (res.status === 401) cached = null;
  return res;
}

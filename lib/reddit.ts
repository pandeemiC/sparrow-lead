import type { RedditToken } from "@/types";

const USER_AGENT = `web:sparrow:v1.0.0 (by /u/${process.env.REDDIT_USERNAME ?? "sparrow"})`;

let cached: RedditToken | null = null;

export function redditConfigured() {
  return Boolean(
    process.env.REDDIT_CLIENT_ID && process.env.REDDIT_CLIENT_SECRET,
  );
}

async function getToken(): Promise<string> {
  if (cached && cached.expiresAt > Date.now()) return cached.value;

  const credentials = Buffer.from(
    `${process.env.REDDIT_CLIENT_ID}:${process.env.REDDIT_CLIENT_SECRET}`,
  ).toString("base64");

  const res = await fetch("https://www.reddit.com/api/v1/access_token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": USER_AGENT,
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) {
    throw new Error(`Reddit token request failed (${res.status})`);
  }

  const data: { access_token: string; expires_in: number } = await res.json();
  cached = {
    value: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  };
  return cached.value;
}

export async function redditGet(path: string): Promise<Response> {
  const res = await fetch(`https://oauth.reddit.com${path}`, {
    headers: {
      Authorization: `Bearer ${await getToken()}`,
      "User-Agent": USER_AGENT,
    },
  });
  if (res.status === 401) cached = null;
  return res;
}

import { sendDigestEmail } from "@/lib/email";
import { NextResponse } from "next/server";

export async function GET() {
  await sendDigestEmail("lkooxer55@hotmail.com", [
    {
      title: "Anyone know a good Reddit monitoring tool?",
      score: 9,
      platform: "reddit",
      reason: "User is actively looking for exactly what your business does",
      url: "https://reddit.com/r/entrepreneur",
    },
    {
      title: "How do you track brand mentions across social media?",
      score: 7,
      platform: "hackernews",
      reason: "High intent question about social listening tools",
      url: "https://news.ycombinator.com",
    },
  ]);

  return NextResponse.json({ sent: true });
}

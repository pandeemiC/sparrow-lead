import { auth } from "@clerk/nextjs/server";
import { getDb } from "@/lib/db";
import { NextResponse } from "next/server";

async function searchReddit(keyword: string) {
  const url = `https://www.reddit.com/search.json?q=${encodeURIComponent(keyword)}&sort=new&limit=5`;
  const res = await fetch(url, {
    headers: { "User-Agent": "Sparrow/1.0" },
  });

  if (!res.ok) return [];

  const data = await res.json();
  return data.data.children.map((child: any) => ({
    platform: "reddit",
    post_url: `https://reddit.com${child.data.permalink}`,
    post_title: child.data.title,
    post_body: child.data.selftext?.slice(0, 500) || "",
    author: child.data.author,
  }));
}

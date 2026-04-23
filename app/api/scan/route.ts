import { auth } from "@clerk/nextjs/server";
import { getDb } from "@/lib/db";
import { NextResponse } from "next/server";

import { RedditResponse, HackerNewsResponse, ScannedPost } from "@/types";
import { analyzePost } from "@/lib/analysis";

async function searchReddit(keyword: string) {
  const url = `https://www.reddit.com/search.json?q=${encodeURIComponent(keyword)}&sort=new&limit=5`;
  const res = await fetch(url, {
    headers: { "User-Agent": "Sparrow/1.0" },
  });

  if (!res.ok) return [];

  const data: RedditResponse = await res.json();
  return data.data.children.map((child) => ({
    platform: "reddit",
    post_url: `https://reddit.com${child.data.permalink}`,
    post_title: child.data.title,
    post_body: child.data.selftext?.slice(0, 500) || "",
    author: child.data.author,
  }));
}

async function searchHackerNews(keyword: string) {
  const url = `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(keyword)}&tags=(story,comment)&hitsPerPage=5`;
  const res = await fetch(url);

  if (!res.ok) return [];

  const data: HackerNewsResponse = await res.json();
  return data.hits.map((hit) => ({
    platform: "hackernews",
    post_url: `https://news.ycombinator.com/item?id=${hit.objectID}`,
    post_title: hit.title || hit.story_text?.slice(0, 80) || "(no title)",
    post_body: hit.story_text?.slice(0, 500) || "",
    author: hit.author,
  }));
}

export async function POST() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sql = getDb();
  const keywords = await sql`SELECT * FROM keywords WHERE user_id = ${userId}`;

  if (keywords.length === 0) {
    return NextResponse.json({ error: "No keywords to hunt" }, { status: 400 });
  }

  const allResults = [];

  for (const kw of keywords) {
    let posts: ScannedPost[] = [];

    if (kw.platform === "reddit") {
      posts = await searchReddit(kw.keyword);
    } else if (kw.platform === "hackernews") {
      posts = await searchHackerNews(kw.keyword);
    }

    for (const post of posts) {
      const existing = await sql`
      SELECT id FROM mentions WHERE post_url = ${post.post_url}
      `;

      if (existing.length === 0) {
        const analysis = await analyzePost({
          keyword: kw.keyword,
          title: post.post_title,
          body: post.post_body,
        });

        // its the same for CLAUDE
        const inserted = await sql`
        INSERT INTO mentions (keyword_id, platform, post_url, post_title, post_body, author, ai_score, ai_reason, ai_type, ai_scored_at) VALUES (${kw.id}, ${post.platform}, ${post.post_url}, ${post.post_title}, ${post.post_body}, ${post.author}, ${analysis.score}, ${analysis.reason}, ${analysis.type}, NOW()) RETURNING *
        `;
        allResults.push(inserted[0]);
      }
    }
  }

  return NextResponse.json({ found: allResults.length, mentions: allResults });
}

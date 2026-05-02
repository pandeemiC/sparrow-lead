import { auth } from "@clerk/nextjs/server";
import { getDb } from "@/lib/db";
import { NextResponse } from "next/server";

import type { ScannedPost } from "@/types";
import { analyzePost } from "@/lib/analysis";
import { searchReddit, searchHackerNews } from "@/lib/search";

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

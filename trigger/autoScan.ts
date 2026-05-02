import { task, logger } from "@trigger.dev/sdk/v3";
import { getDb } from "@/lib/db";
import { analyzePost } from "@/lib/analysis";
import { sendDigestEmail } from "@/lib/email";
import type {
  RedditResponse,
  HackerNewsResponse,
  ScannedPost,
  Keyword,
  Payload,
  HotSignal,
} from "@/types";

async function searchReddit(keyword: string): Promise<ScannedPost[]> {
  const url = `https://www.reddit.com/search.json?q=${encodeURIComponent(keyword)}&sort=new&limit=5`;
  const res = await fetch(url, { headers: { "User-Agent": "Sparrow/1.0" } });
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

async function searchHackerNews(keyword: string): Promise<ScannedPost[]> {
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

export const autoScanTask = task({
  id: "auto-scan",
  maxDuration: 300,
  run: async (payload: Payload) => {
    const sql = getDb();
    const users = payload.userId
      ? [{ user_id: payload.userId }]
      : await sql`SELECT DISTINCT user_id FROM keywords`;

    logger.log("Starting scan", { usersFound: users.length });
    let totalFound = 0;

    for (const user of users) {
      const keywords =
        (await sql`SELECT * FROM keywords WHERE user_id = ${user.user_id}`) as Keyword[];
      const hotSignals: HotSignal[] = [];

      for (const kw of keywords) {
        let posts: ScannedPost[] = [];

        if (kw.platform === "reddit") {
          posts = await searchReddit(kw.keyword);
        } else if (kw.platform === "hackernews") {
          posts = await searchHackerNews(kw.keyword);
        }

        for (const post of posts) {
          const existing =
            await sql`SELECT id FROM mentions WHERE post_url = ${post.post_url}`;
          if (existing.length > 0) continue;

          const analysis = await analyzePost({
            keyword: kw.keyword,
            title: post.post_title,
            body: post.post_body,
          });

          await sql`INSERT INTO mentions (keyword_id, platform, post_url, post_title, post_body, author, ai_score, ai_reason, ai_type, ai_scored_at)
                    VALUES (${kw.id}, ${post.platform}, ${post.post_url}, ${post.post_title}, ${post.post_body}, ${post.author}, ${analysis.score}, ${analysis.reason}, ${analysis.type}, NOW())
          `;

          if (analysis.score >= 7) {
            hotSignals.push({
              title: post.post_title,
              score: analysis.score,
              platform: post.platform as "reddit" | "hackernews",
              reason: analysis.reason,
              url: post.post_url,
            });
          }

          totalFound++;
        }
      }

      if (!payload.userId && hotSignals.length > 0) {
        const [userRow] =
          await sql`SELECT email FROM users WHERE user_id = ${user.user_id}`;
        if (userRow?.email) {
          const topSignals = hotSignals
            .sort((a, b) => b.score - a.score)
            .slice(0, 3);
          await sendDigestEmail(userRow.email, topSignals);
          logger.log("Digest email sent", {
            userId: user.user_id,
            hotSignals: topSignals.length,
          });
        }
      }

      logger.log("Scanned user", {
        userId: user.user_id,
        keywords: keywords.length,
      });
    }

    logger.log("Scan complete", { totalFound, usersScanned: users.length });
    return { usersScanned: users.length, totalFound };
  },
});

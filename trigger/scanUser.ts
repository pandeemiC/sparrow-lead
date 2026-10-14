import { logger } from "@trigger.dev/sdk";
import { getDb } from "@/lib/db";
import { analyzePost } from "@/lib/analysis";
import { profileForScoring, toHuntProfile } from "@/lib/huntProfile";
import { searchReddit, searchHackerNews, searchBluesky } from "@/lib/search";
import type {
  ScannedPost,
  Keyword,
  HotSignal,
  ScanResult,
  SignalPlatform,
} from "@/types";

export async function scanUser(userId: string): Promise<ScanResult> {
  const sql = getDb();
  const [userRow] =
    await sql`SELECT * FROM users WHERE user_id = ${userId}`;
  const keywords =
    (await sql`SELECT * FROM keywords WHERE user_id = ${userId} AND active = true`) as Keyword[];

  const alertMinScore: number = userRow?.alert_min_score ?? 7;
  const profile = userRow ? profileForScoring(toHuntProfile(userRow)) : "";
  const hotSignals: HotSignal[] = [];
  let found = 0;

  for (const kw of keywords) {
    const posts: ScannedPost[] = [];
    try {
      if (kw.platforms.includes("reddit")) {
        posts.push(...(await searchReddit(kw.keyword)));
      }
      if (kw.platforms.includes("hackernews")) {
        posts.push(...(await searchHackerNews(kw.keyword)));
      }
      if (kw.platforms.includes("bluesky")) {
        posts.push(...(await searchBluesky(kw.keyword)));
      }
    } catch (err) {
      logger.error("Search failed for keyword", {
        keyword: kw.keyword,
        error: err instanceof Error ? err.message : String(err),
      });
      continue;
    }

    for (const post of posts) {
      try {
        const existing =
          await sql`SELECT id FROM mentions WHERE post_url = ${post.post_url}`;
        if (existing.length > 0) continue;

        const analysis = await analyzePost({
          keyword: kw.keyword,
          title: post.post_title,
          body: post.post_body,
          profile: profile || undefined,
        });

        await sql`INSERT INTO mentions (keyword_id, platform, post_url, post_title, post_body, author, ai_score, ai_reason, ai_type, ai_scored_at)
                  VALUES (${kw.id}, ${post.platform}, ${post.post_url}, ${post.post_title}, ${post.post_body}, ${post.author}, ${analysis.score}, ${analysis.reason}, ${analysis.type}, NOW())
        `;

        if (analysis.score >= alertMinScore) {
          hotSignals.push({
            title: post.post_title,
            score: analysis.score,
            platform: post.platform as SignalPlatform,
            reason: analysis.reason,
            url: post.post_url,
          });
        }

        found++;
      } catch (err) {
        logger.error("Failed to process post", {
          keyword: kw.keyword,
          url: post.post_url,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }
  }

  logger.log("Scanned user", { userId, keywords: keywords.length, found });
  return { found, hotSignals };
}

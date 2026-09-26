import { task, logger } from "@trigger.dev/sdk/v3";
import { getDb } from "@/lib/db";
import { analyzePost } from "@/lib/analysis";
import { sendDigestEmail } from "@/lib/email";
import { searchReddit, searchHackerNews } from "@/lib/search";
import type { ScannedPost, Keyword, Payload, HotSignal } from "@/types";

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
      const [userRow] =
        await sql`SELECT email, listener_context FROM users WHERE user_id = ${user.user_id}`;
      const keywords =
        (await sql`SELECT * FROM keywords WHERE user_id = ${user.user_id} AND active = true`) as Keyword[];
      const hotSignals: HotSignal[] = [];

      for (const kw of keywords) {
        const posts: ScannedPost[] = [];
        try {
          if (kw.platforms.includes("reddit")) {
            posts.push(...(await searchReddit(kw.keyword)));
          }
          if (kw.platforms.includes("hackernews")) {
            posts.push(...(await searchHackerNews(kw.keyword)));
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
              listenerContext: userRow?.listener_context ?? undefined,
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
          } catch (err) {
            logger.error("Failed to process post", {
              keyword: kw.keyword,
              url: post.post_url,
              error: err instanceof Error ? err.message : String(err),
            });
          }
        }
      }

      if (!payload.userId && hotSignals.length > 0) {
        if (userRow?.email) {
          const topSignals = hotSignals
            .sort((a, b) => b.score - a.score)
            .slice(0, 3);
          try {
            await sendDigestEmail(userRow.email, topSignals);
            logger.log("Digest email sent", {
              userId: user.user_id,
              hotSignals: topSignals.length,
            });
          } catch (err) {
            logger.error("Digest email failed", {
              userId: user.user_id,
              error: err instanceof Error ? err.message : String(err),
            });
          }
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

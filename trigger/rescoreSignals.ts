import { logger, task } from "@trigger.dev/sdk";
import { getDb } from "@/lib/db";
import { analyzePost } from "@/lib/analysis";
import { profileForScoring, toHuntProfile } from "@/lib/huntProfile";
import type { Payload } from "@/types";

// re-scores a user's untouched signals after they change their hunt profile.
// leads already on the hunt board (or dismissed) keep their score
export const rescoreSignalsTask = task({
  id: "rescore-signals",
  maxDuration: 1800,
  run: async (payload: Payload) => {
    const sql = getDb();
    const [userRow] =
      await sql`SELECT * FROM users WHERE user_id = ${payload.userId}`;
    if (!userRow) return { rescored: 0, total: 0 };

    const profile = profileForScoring(toHuntProfile(userRow));
    const rows = await sql`
      SELECT m.id, m.post_title, m.post_body, k.keyword
      FROM mentions m
      JOIN keywords k ON k.id = m.keyword_id
      WHERE k.user_id = ${payload.userId}
        AND m.status = 'new'
    `;

    let rescored = 0;
    for (const row of rows) {
      try {
        const analysis = await analyzePost({
          keyword: row.keyword,
          title: row.post_title,
          body: row.post_body,
          profile: profile || undefined,
        });
        // old reply drafts were written for the old profile, so clear them
        await sql`
          UPDATE mentions
          SET ai_score = ${analysis.score},
              ai_reason = ${analysis.reason},
              ai_type = ${analysis.type},
              ai_scored_at = NOW(),
              ai_suggested_reply = NULL
          WHERE id = ${row.id}
        `;
        rescored++;
      } catch (err) {
        logger.error("Failed to re-score signal", {
          id: row.id,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }

    logger.log("Re-scored signals", {
      userId: payload.userId,
      rescored,
      total: rows.length,
    });
    return { rescored, total: rows.length };
  },
});

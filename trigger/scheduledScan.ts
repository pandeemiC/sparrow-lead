import { schedules, logger } from "@trigger.dev/sdk";
import { getDb } from "@/lib/db";
import { sendDigestEmail } from "@/lib/email";
import { scanUser } from "./scanUser";

export const scheduledScanTask = schedules.task({
  id: "scheduled-scan",
  cron: "0 */6 * * *",
  maxDuration: 3600,
  run: async () => {
    const sql = getDb();
    const users = await sql`
      SELECT DISTINCT u.user_id, u.email, u.email_notifications
      FROM users u
      JOIN keywords k ON k.user_id = u.user_id
      WHERE u.onboarded_at IS NOT NULL
        AND u.auto_scan = true
        AND k.active = true
    `;

    logger.log("Scheduled scan starting", { users: users.length });
    let totalFound = 0;
    let emailsSent = 0;

    for (const user of users) {
      try {
        const { found, hotSignals } = await scanUser(user.user_id);
        totalFound += found;

        if (
          !user.email_notifications ||
          !user.email ||
          hotSignals.length === 0
        ) {
          continue;
        }

        const topSignals = [...hotSignals]
          .sort((a, b) => b.score - a.score)
          .slice(0, 3);

        try {
          await sendDigestEmail(user.email, topSignals);
          emailsSent++;
        } catch (err) {
          logger.error("Digest email failed", {
            userId: user.user_id,
            error: err instanceof Error ? err.message : String(err),
          });
        }
      } catch (err) {
        logger.error("Scan failed for user", {
          userId: user.user_id,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }

    logger.log("Scheduled scan complete", { totalFound, emailsSent });
    return { usersScanned: users.length, totalFound, emailsSent };
  },
});

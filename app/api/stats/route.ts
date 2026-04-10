import { auth } from "@clerk/nextjs/server";
import { getDb } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sql = getDb();

  const [totals] = await sql`
    SELECT
      COUNT(*)::int AS total_signals,
      COUNT(*) FILTER (WHERE m.created_at >= NOW() - INTERVAL '1 day')::int AS signals_today,
      MAX(m.created_at) AS last_scanned_at
    FROM mentions m
    JOIN keywords k ON m.keyword_id = k.id
    WHERE k.user_id = ${userId}
  `;

  const [kwRow] = await sql`
    SELECT COUNT(*)::int AS keywords_tracked
    FROM keywords
    WHERE user_id = ${userId}
  `;

  const huntRows = await sql`
    SELECT m.status, COUNT(*)::int AS count
    FROM mentions m
    JOIN keywords k ON m.keyword_id = k.id
    WHERE k.user_id = ${userId}
      AND m.status IN ('hunting', 'interested', 'engaged', 'hunted')
    GROUP BY m.status
  `;

  const huntCounts = { hunting: 0, interested: 0, engaged: 0, hunted: 0 };
  for (const row of huntRows) {
    huntCounts[row.status as keyof typeof huntCounts] = row.count;
  }

  const recentSignals = await sql`
    SELECT m.id, m.platform, m.post_title, m.post_url, m.ai_score, m.created_at, k.keyword
    FROM mentions m
    JOIN keywords k ON m.keyword_id = k.id
    WHERE k.user_id = ${userId} AND m.status != 'dismissed'
    ORDER BY m.created_at DESC
    LIMIT 5
  `;

  const topSignals = await sql`
    SELECT m.id, m.platform, m.post_title, m.post_url, m.ai_score, m.created_at, k.keyword
    FROM mentions m
    JOIN keywords k ON m.keyword_id = k.id
    WHERE k.user_id = ${userId} AND m.status != 'dismissed'
      AND m.created_at >= NOW() - INTERVAL '1 day'
    ORDER BY m.ai_score DESC NULLS LAST
    LIMIT 5
  `;

  const keywords = await sql`
    SELECT k.keyword, k.platform, COUNT(m.id)::int AS mention_count
    FROM keywords k
    LEFT JOIN mentions m ON m.keyword_id = k.id
    WHERE k.user_id = ${userId}
    GROUP BY k.id
    ORDER BY k.created_at DESC
  `;

  return NextResponse.json({
    totalSignals: totals.total_signals,
    signalsToday: totals.signals_today,
    keywordsTracked: kwRow.keywords_tracked,
    lastScannedAt: totals.last_scanned_at ?? null,
    huntCounts,
    topSignals,
    recentSignals,
    keywords,
  });
}

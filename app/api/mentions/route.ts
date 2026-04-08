import { auth } from "@clerk/nextjs/server";
import { getDb } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const platform = searchParams.get("platform") ?? "all";
  const intent = searchParams.get("intent") ?? "all";
  const type = searchParams.get("type") ?? "all";
  const sort = searchParams.get("sort") ?? "score";

  const sql = getDb();

  const mentions = await sql`
  SELECT
    m.id,
    m.platform,
    m.post_title,
    m.post_url,
    m.post_body,
    m.author,
    m.ai_analysis,
    m.ai_score,
    m.ai_reason,
    m.ai_type,
    m.ai_suggest_reply,
    m.status,
    m.notes,
    m.created_at,
    k.keyword
  FROM mentions m
  JOIN keywords k ON m.keyword_id = k.id
  WHERE k.user_id = ${userId}
    AND m.status != 'dismissed'
    AND (${platform} = 'all' OR m.platform = ${platform})
    AND (${type} = 'all' OR m.ai_type = ${type})
    AND (
      ${intent} = 'all'
      OR (${intent} = 'high' AND m.ai_score >= 8)
      OR (${intent} = 'medium' AND m.ai_score >= 5 AND m.ai_score < 8)
      OR (${intent} = 'low' AND m.ai_score < 5)
    )
  ORDER BY
    CASE WHEN ${sort} = 'score' THEN m.ai_score END DESC NULLS LAST,
    CASE WHEN ${sort} = 'newest' THEN m.created_at END DESC,
    CASE WHEN ${sort} = 'oldest' THEN m.created_at END ASC
  `;

  return NextResponse.json(mentions);
}

import { auth } from "@clerk/nextjs/server";
import { getDb } from "@/lib/db";
import { NextResponse } from "next/server";
import { handler } from "@/lib/api";

export const GET = handler(async () => {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sql = getDb();

  const [account] = await sql`
    SELECT email, plan, role, description, listener_context,
           email_notifications, alert_min_score, auto_scan, created_at
    FROM users WHERE user_id = ${userId}
  `;

  const keywords = await sql`
    SELECT id, keyword, platforms, active, created_at
    FROM keywords WHERE user_id = ${userId}
    ORDER BY created_at
  `;

  const signals = await sql`
    SELECT m.id, k.keyword, m.platform, m.post_title, m.post_body, m.post_url,
           m.author, m.ai_score, m.ai_reason, m.ai_type, m.ai_suggested_reply,
           m.status, m.notes, m.created_at
    FROM mentions m
    JOIN keywords k ON m.keyword_id = k.id
    WHERE k.user_id = ${userId}
    ORDER BY m.created_at
  `;

  const data = {
    exportedAt: new Date().toISOString(),
    account,
    keywords,
    signals,
  };

  return new NextResponse(JSON.stringify(data, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="sparrow-export-${new Date().toISOString().slice(0, 10)}.json"`,
    },
  });
});

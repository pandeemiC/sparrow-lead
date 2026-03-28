import { auth } from "@clerk/nextjs/server";
import { getDb } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sql = getDb();
  const mentions = await sql`
  SELECT m.*, k.keyword, k.platform as keyword_platform
  FROM mentions m
  JOIN keywords k ON m.keyword_id = k.id
  WHERE k.user_id = ${userId}
  ORDER BY m.created_at DESC
  `;

  return NextResponse.json(mentions);
}

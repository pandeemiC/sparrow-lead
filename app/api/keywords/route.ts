import { auth } from "@clerk/nextjs/server";
import { getDb } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const sql = getDb();
  const keywords = await sql`
    SELECT k.*, COUNT(m.id)::int AS mention_count
    FROM keywords k
    LEFT JOIN mentions m ON m.keyword_id = k.id
    WHERE k.user_id = ${userId}
    GROUP BY k.id
    ORDER BY k.created_at DESC
  `;
  return NextResponse.json(keywords);
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { keyword, platform } = await req.json();
  if (!keyword || !platform) {
    return NextResponse.json(
      { error: "Keyword and platform are required" },
      { status: 400 },
    );
  }

  const sql = getDb();
  const result = await sql`
  INSERT INTO keywords (user_id, keyword, platform)
  VALUES (${userId}, ${keyword}, ${platform})
  RETURNING *
  `;

  return NextResponse.json(result[0]);
}

export async function DELETE(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await req.json();

  const sql = getDb();
  await sql`DELETE FROM keywords WHERE id = ${id} AND user_id = ${userId}`;

  return NextResponse.json({ success: true });
}

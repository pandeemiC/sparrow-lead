import { auth } from "@clerk/nextjs/server";
import { getDb } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { handler } from "@/lib/api";
import { PLAN_LIMITS, type Plan } from "@/lib/plans";

export const GET = handler(async (req: NextRequest) => {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const archived = new URL(req.url).searchParams.get("archived") === "true";
  const sql = getDb();
  const keywords = await sql`
    SELECT k.*, COUNT(m.id)::int AS mention_count
    FROM keywords k
    LEFT JOIN mentions m ON m.keyword_id = k.id
    WHERE k.user_id = ${userId} AND k.active = ${!archived}
    GROUP BY k.id
    ORDER BY k.created_at DESC
  `;
  return NextResponse.json(keywords);
});

export const POST = handler(async (req: NextRequest) => {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { keyword, platforms } = await req.json();
  const trimmed = typeof keyword === "string" ? keyword.trim() : "";

  if (!trimmed || !Array.isArray(platforms) || platforms.length === 0) {
    return NextResponse.json(
      { error: "Keyword and at least one platform are required" },
      { status: 400 },
    );
  }

  const sql = getDb();

  const [userRow] = await sql`SELECT plan FROM users WHERE user_id = ${userId}`;
  const plan = (userRow?.plan ?? "free") as Plan;
  const [{ count }] = await sql`
    SELECT COUNT(*)::int AS count FROM keywords
    WHERE user_id = ${userId} AND active = true
  `;

  if (count >= PLAN_LIMITS[plan].keywords) {
    return NextResponse.json(
      {
        error: `You've reached your ${PLAN_LIMITS[plan].keywords}-keyword limit. Archive one first.`,
      },
      { status: 403 },
    );
  }

  const [created] = await sql`
    INSERT INTO keywords (user_id, keyword, platforms)
    VALUES (${userId}, ${trimmed}, ${platforms})
    RETURNING *
  `;
  return NextResponse.json(created, { status: 201 });
});

export const DELETE = handler(async (req: NextRequest) => {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await req.json();
  const sql = getDb();
  const rows = await sql`
    UPDATE keywords SET active = false
    WHERE id = ${id} AND user_id = ${userId}
    RETURNING id
  `;
  if (rows.length === 0) {
    return NextResponse.json({ error: "Keyword not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
});

export const PATCH = handler(async (req: NextRequest) => {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id, active } = await req.json();
  const sql = getDb();
  const rows = await sql`
    UPDATE keywords SET active = ${active}
    WHERE id = ${id} AND user_id = ${userId}
    RETURNING id
  `;
  if (rows.length === 0) {
    return NextResponse.json({ error: "Keyword not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
});

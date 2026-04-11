import { auth } from "@clerk/nextjs/server";
import { getDb } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { status } = await req.json();
  const sql = getDb();

  await sql`
    UPDATE mentions
    SET status = ${status}
    WHERE id = ${id}
      AND keyword_id IN (SELECT id FROM keywords WHERE user_id = ${userId})
  `;

  return NextResponse.json({ success: true });
}

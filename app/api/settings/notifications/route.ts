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
  const [row] =
    await sql`SELECT email_notifications FROM users WHERE user_id = ${userId}`;
  if (!row) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  return NextResponse.json({ emailNotifications: row.email_notifications });
});

export const PATCH = handler(async (req: Request) => {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { emailNotifications } = await req.json();
  if (typeof emailNotifications !== "boolean") {
    return NextResponse.json(
      { error: "emailNotifications must be true or false" },
      { status: 400 },
    );
  }
  const sql = getDb();
  const rows = await sql`
    UPDATE users SET email_notifications = ${emailNotifications}
    WHERE user_id = ${userId}
    RETURNING user_id
  `;
  if (rows.length === 0) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  return NextResponse.json({ emailNotifications });
});

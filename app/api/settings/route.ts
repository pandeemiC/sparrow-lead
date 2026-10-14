import { auth } from "@clerk/nextjs/server";
import { getDb } from "@/lib/db";
import { NextResponse } from "next/server";
import { handler } from "@/lib/api";
import type { UserSettings } from "@/types";

const MAX_TEXT_LENGTH = 1000;

function toSettings(row: Record<string, unknown>): UserSettings {
  return {
    emailNotifications: row.email_notifications as boolean,
    alertMinScore: row.alert_min_score as number,
    autoScan: row.auto_scan as boolean,
    role: (row.role as string) ?? "",
    description: (row.description as string) ?? "",
    listenerContext: (row.listener_context as string) ?? "",
  };
}

export const GET = handler(async () => {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sql = getDb();
  const [row] = await sql`SELECT * FROM users WHERE user_id = ${userId}`;
  if (!row) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(toSettings(row));
});

export const PATCH = handler(async (req: Request) => {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  if (
    body.emailNotifications !== undefined &&
    typeof body.emailNotifications !== "boolean"
  ) {
    return NextResponse.json(
      { error: "emailNotifications must be true or false" },
      { status: 400 },
    );
  }
  if (body.autoScan !== undefined && typeof body.autoScan !== "boolean") {
    return NextResponse.json(
      { error: "autoScan must be true or false" },
      { status: 400 },
    );
  }
  if (
    body.alertMinScore !== undefined &&
    (!Number.isInteger(body.alertMinScore) ||
      body.alertMinScore < 1 ||
      body.alertMinScore > 10)
  ) {
    return NextResponse.json(
      { error: "alertMinScore must be a whole number from 1 to 10" },
      { status: 400 },
    );
  }
  for (const field of ["role", "description", "listenerContext"]) {
    const value = body[field];
    if (
      value !== undefined &&
      (typeof value !== "string" || value.length > MAX_TEXT_LENGTH)
    ) {
      return NextResponse.json(
        { error: `${field} must be text under ${MAX_TEXT_LENGTH} characters` },
        { status: 400 },
      );
    }
  }

  const sql = getDb();
  const [row] = await sql`SELECT * FROM users WHERE user_id = ${userId}`;
  if (!row) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const current = toSettings(row);
  const next: UserSettings = {
    emailNotifications: body.emailNotifications ?? current.emailNotifications,
    alertMinScore: body.alertMinScore ?? current.alertMinScore,
    autoScan: body.autoScan ?? current.autoScan,
    role: body.role ?? current.role,
    description: body.description ?? current.description,
    listenerContext: body.listenerContext ?? current.listenerContext,
  };

  await sql`
    UPDATE users SET
      email_notifications = ${next.emailNotifications},
      alert_min_score = ${next.alertMinScore},
      auto_scan = ${next.autoScan},
      role = ${next.role},
      description = ${next.description},
      listener_context = ${next.listenerContext}
    WHERE user_id = ${userId}
  `;

  return NextResponse.json(next);
});

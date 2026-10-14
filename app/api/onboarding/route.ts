import { auth, currentUser } from "@clerk/nextjs/server";
import { getDb } from "@/lib/db";
import { NextResponse } from "next/server";
import { handler } from "@/lib/api";
import { cookies } from "next/headers";

export const POST = handler(async (req: Request) => {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { role, description, listenerContext } = await req.json();
  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses[0]?.emailAddress ?? "";

  const sql = getDb();

  await sql`
    INSERT INTO users (user_id, email, role, description, listener_context, onboarded_at)
    VALUES (${userId}, ${email}, ${role}, ${description}, ${listenerContext}, NOW())
    ON CONFLICT (user_id) DO UPDATE SET
      role = ${role},
      description = ${description},
      listener_context = ${listenerContext},
      onboarded_at = NOW()
  `;

  const cookieStore = await cookies();
  cookieStore.set("onboarded", "true", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });

  return NextResponse.json({ ok: true });
});

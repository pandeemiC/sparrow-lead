import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { setOnboardedCookie } from "@/lib/onboarding";

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.redirect(new URL("/sign-in", req.url));

  const sql = getDb();
  const [user] =
    await sql`SELECT onboarded_at FROM users WHERE user_id = ${userId}`;
  if (!user?.onboarded_at) {
    return NextResponse.redirect(new URL("/onboarding", req.url));
  }

  const res = NextResponse.redirect(new URL("/dashboard", req.url));
  setOnboardedCookie(res);
  return res;
}

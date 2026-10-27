import type { NextResponse } from "next/server";

export function setOnboardedCookie(res: NextResponse) {
  res.cookies.set("onboarded", "true", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });
}

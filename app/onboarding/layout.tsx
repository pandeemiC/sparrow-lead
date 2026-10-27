import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (userId) {
    const sql = getDb();
    const [user] =
      await sql`SELECT onboarded_at FROM users WHERE user_id = ${userId}`;
    if (user?.onboarded_at) redirect("/api/onboarding/restore");
  }
  return children;
}

import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { currentUser } from "@clerk/nextjs/server";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { getDb } from "@/lib/db";
import { PlanProvider } from "@/components/dashboard/PlanContext";
import type { Plan } from "@/lib/plans";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sql = getDb();
  const user = await currentUser();

  const [userRow] =
    await sql`SELECT plan FROM users WHERE user_id = ${user?.id}`;

  const plan = (userRow?.plan ?? "free") as Plan;

  const userData = {
    name: user?.firstName
      ? `${user.firstName} ${user.lastName ?? ""}`.trim()
      : (user?.emailAddresses[0]?.emailAddress ?? "User"),
    email: user?.emailAddresses[0]?.emailAddress ?? "",
    imageUrl: user?.imageUrl ?? "",
  };

  return (
    <div className={`${GeistSans.className} ${GeistMono.variable}`}>
      <PlanProvider plan={plan}>
        <DashboardShell user={userData}>{children}</DashboardShell>
      </PlanProvider>
    </div>
  );
}

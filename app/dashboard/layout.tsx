import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { currentUser } from "@clerk/nextjs/server";
import DashboardShell from "@/components/dashboard/DashboardShell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();

  const userData = {
    name: user?.firstName
      ? `${user.firstName} ${user.lastName ?? ""}`.trim()
      : (user?.emailAddresses[0]?.emailAddress ?? "User"),
    email: user?.emailAddresses[0]?.emailAddress ?? "",
    imageUrl: user?.imageUrl ?? "",
  };

  return (
    <div className={`${GeistSans.className} ${GeistMono.variable}`}>
      <DashboardShell user={userData}>{children}</DashboardShell>
    </div>
  );
}

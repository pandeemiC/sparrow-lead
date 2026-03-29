import { Inter } from "next/font/google";
import { currentUser } from "@clerk/nextjs/server";
import DashboardShell from "@/components/dashboard/DashboardShell";

const inter = Inter({ subsets: ["latin"] });

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
    <div className={inter.className}>
      <DashboardShell user={userData}>{children}</DashboardShell>
    </div>
  );
}

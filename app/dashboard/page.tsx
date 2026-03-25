import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import KeywordManager from "@/components/dashboard/KeywordManager";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await currentUser();

  return (
    <div className="min-h-screen bg-background pt-24 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-white/50 mt-1">
            Welcome, {user?.firstName || user?.emailAddresses[0]?.emailAddress}
          </p>
        </div>

        <KeywordManager userId={userId} />
      </div>
    </div>
  );
}

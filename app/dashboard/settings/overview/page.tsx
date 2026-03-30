import { currentUser } from "@clerk/nextjs/server";
import Image from "next/image";
import { Shield } from "luce-react";

export default async function SettingsOverview() {
  const user = await currentUser();

  const isOAuthUser = (user?.externalAccounts ?? []).length > 0;
  const provider = user?.externalAccounts?.[0]?.provider;

  const name = user?.firstName
    ? `${user.firstName} ${user.lastName ?? ""}`.trim()
    : (user?.emailAddresses[0]?.emailAddress ?? "User");
  const email = user?.emailAddresses[0]?.emailAddress ?? "";

  return (
    <div>
      <p>SettingsOverview</p>
    </div>
  );
}

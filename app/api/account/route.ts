import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { handler } from "@/lib/api";
import { deleteUserData } from "@/lib/account";

export const DELETE = handler(async () => {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // a paid plan has to be cancelled first, same rule as the settings page
  const sql = getDb();
  const [row] = await sql`SELECT plan FROM users WHERE user_id = ${userId}`;
  if (row && row.plan && row.plan !== "free") {
    return NextResponse.json(
      { error: "Cancel your subscription before deleting your account" },
      { status: 409 },
    );
  }

  // data first, so a failure here leaves the account intact to try again
  await deleteUserData(userId);
  const client = await clerkClient();
  await client.users.deleteUser(userId);

  return NextResponse.json({ deleted: true });
});

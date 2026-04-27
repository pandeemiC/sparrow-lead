import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { tasks } from "@trigger.dev/sdk/v3";

export async function POST() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const handle = await tasks.trigger("auto-scan", { userId });

  return NextResponse.json({ runId: handle.id });
}

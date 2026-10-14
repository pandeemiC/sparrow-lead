import { auth } from "@clerk/nextjs/server";
import { getDb } from "@/lib/db";
import { NextResponse } from "next/server";
import { handler } from "@/lib/api";

export const PATCH = handler(
  async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { status, notes } = await req.json();

    if (status === undefined && notes === undefined) {
      return NextResponse.json(
        { error: "Nothing to update" },
        { status: 400 },
      );
    }

    const sql = getDb();
    let matched = 0;

    if (status !== undefined) {
      const rows = await sql`
        UPDATE mentions
        SET status = ${status}
        WHERE id = ${id}
          AND keyword_id IN (SELECT id FROM keywords WHERE user_id = ${userId})
        RETURNING id
      `;
      matched = rows.length;
    }

    if (notes !== undefined) {
      const rows = await sql`
        UPDATE mentions
        SET notes = ${notes}
        WHERE id = ${id}
          AND keyword_id IN (SELECT id FROM keywords WHERE user_id = ${userId})
        RETURNING id
      `;
      matched = rows.length;
    }

    if (matched === 0) {
      return NextResponse.json({ error: "Signal not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  },
);

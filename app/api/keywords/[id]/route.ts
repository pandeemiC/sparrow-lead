import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { handler } from "@/lib/api";
import { BOARD_STATUSES, deleteBlockReason } from "@/lib/keywords";

// really deletes a keyword and its signals. DELETE /api/keywords (no id) only
// pauses, this is the extra step for cleaning up paused keywords
export const DELETE = handler(
  async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const sql = getDb();

    const [kw] = await sql`
      SELECT
        k.active,
        COUNT(m.id) FILTER (WHERE m.status = ANY(${BOARD_STATUSES}))::int AS board_leads,
        COUNT(m.id)::int AS signals
      FROM keywords k
      LEFT JOIN mentions m ON m.keyword_id = k.id
      WHERE k.id = ${id} AND k.user_id = ${userId}
      GROUP BY k.id
    `;
    if (!kw) {
      return NextResponse.json({ error: "Keyword not found" }, { status: 404 });
    }

    const reason = deleteBlockReason({
      active: kw.active,
      boardLeads: kw.board_leads,
    });
    if (reason) {
      return NextResponse.json({ error: reason }, { status: 409 });
    }

    // the same rules again inside the delete itself, in case a lead was added
    // to the board between the check above and this line
    const deleted = await sql`
      DELETE FROM keywords k
      WHERE k.id = ${id}
        AND k.user_id = ${userId}
        AND k.active = false
        AND NOT EXISTS (
          SELECT 1 FROM mentions m
          WHERE m.keyword_id = k.id AND m.status = ANY(${BOARD_STATUSES})
        )
      RETURNING k.id
    `;
    if (deleted.length === 0) {
      return NextResponse.json(
        {
          error:
            "This keyword can't be deleted right now. Refresh and try again.",
        },
        { status: 409 },
      );
    }

    return NextResponse.json({ deleted: true, signals: kw.signals });
  },
);

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { tasks } from "@trigger.dev/sdk/v3";
import { getDb } from "@/lib/db";
import { handler } from "@/lib/api";
import { PROFILE_MAX_LENGTH, toHuntProfile } from "@/lib/huntProfile";
import type { HuntProfileSaveMode } from "@/types";

const TEXT_FIELDS = [
  "role",
  "offer",
  "lookingFor",
  "signals",
  "ignore",
  "replyTone",
] as const;
const MODES: HuntProfileSaveMode[] = ["keep", "rescore", "fresh"];

// how much existing data each save option would touch, shown in the save pop-up
async function counts(userId: string) {
  const sql = getDb();
  const [row] = await sql`
    SELECT
      COUNT(*) FILTER (WHERE m.status = 'new')::int AS untouched,
      COUNT(*) FILTER (WHERE m.status IN ('new', 'dismissed'))::int AS removable,
      COUNT(*) FILTER (WHERE m.status IN ('hunting', 'interested', 'engaged', 'hunted'))::int AS on_board
    FROM mentions m
    JOIN keywords k ON k.id = m.keyword_id
    WHERE k.user_id = ${userId}
  `;
  const [kw] =
    await sql`SELECT COUNT(*)::int AS keywords FROM keywords WHERE user_id = ${userId}`;
  return {
    untouched: row.untouched as number,
    removable: row.removable as number,
    onBoard: row.on_board as number,
    keywords: kw.keywords as number,
  };
}

export const GET = handler(async () => {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sql = getDb();
  const [row] = await sql`SELECT * FROM users WHERE user_id = ${userId}`;
  if (!row) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    profile: toHuntProfile(row),
    counts: await counts(userId),
  });
});

export const PUT = handler(async (req: Request) => {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const mode = body.mode as HuntProfileSaveMode;
  if (!MODES.includes(mode)) {
    return NextResponse.json(
      { error: "mode must be keep, rescore or fresh" },
      { status: 400 },
    );
  }
  for (const field of TEXT_FIELDS) {
    const value = body.profile?.[field];
    if (typeof value !== "string" || value.length > PROFILE_MAX_LENGTH) {
      return NextResponse.json(
        {
          error: `${field} must be text under ${PROFILE_MAX_LENGTH} characters`,
        },
        { status: 400 },
      );
    }
  }

  const p = body.profile;
  const sql = getDb();

  // save replaces the whole profile every time
  const [row] = await sql`
    UPDATE users SET
      role = ${p.role.trim()},
      description = ${p.offer.trim()},
      listener_context = ${p.lookingFor.trim()},
      hunt_signals = ${p.signals.trim()},
      hunt_ignore = ${p.ignore.trim()},
      reply_tone = ${p.replyTone.trim()},
      profile_updated_at = NOW()
    WHERE user_id = ${userId}
    RETURNING *
  `;
  if (!row) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  let rescoring = 0;
  if (mode === "rescore") {
    rescoring = (await counts(userId)).untouched;
    if (rescoring > 0) await tasks.trigger("rescore-signals", { userId });
  }

  if (mode === "fresh") {
    // signals go, keywords go, hunt board leads stay. keywords that still have
    // leads on the board are paused instead of deleted, or the leads would go with them
    await sql.transaction([
      sql`
        DELETE FROM mentions m USING keywords k
        WHERE m.keyword_id = k.id
          AND k.user_id = ${userId}
          AND m.status IN ('new', 'dismissed')
      `,
      sql`
        DELETE FROM keywords k
        WHERE k.user_id = ${userId}
          AND NOT EXISTS (SELECT 1 FROM mentions m WHERE m.keyword_id = k.id)
      `,
      sql`UPDATE keywords SET active = false WHERE user_id = ${userId}`,
    ]);
  }

  return NextResponse.json({
    profile: toHuntProfile(row),
    counts: await counts(userId),
    rescoring,
  });
});

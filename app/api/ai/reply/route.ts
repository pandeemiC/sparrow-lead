import { auth } from "@clerk/nextjs/server";
import { getDb } from "@/lib/db";
import { NextResponse } from "next/server";
import { generateContent } from "@/lib/gemini";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { mentionId } = await req.json();
  if (!mentionId) {
    return NextResponse.json({ error: "mentionId required" }, { status: 400 });
  }

  const sql = getDb();

  const rows = await sql`
    SELECT m.id, m.post_title, m.post_body, m.ai_reason, m.ai_type, m.ai_suggested_reply, k.keyword
    FROM mentions m
    JOIN keywords k ON k.id = m.keyword_id
    WHERE m.id = ${mentionId}
      AND k.user_id = ${userId}
    LIMIT 1
  `;

  if (rows.length === 0) {
    return NextResponse.json({ error: "Mention not found" }, { status: 404 });
  }

  const mention = rows[0];
  if (mention.ai_suggested_reply) {
    return NextResponse.json({ reply: mention.ai_suggested_reply });
  }

  try {
    const response = await generateContent({
      model: "gemini-3.1-flash-lite",
      contents: `You are helping a founder or someone who is looking for leads to their field (keywords), reply to a social media post where someone expresses a problem, need or interest.
        
          Post title: "${mention.post_title}"
          Post body: "${(mention.post_body ?? "").slice(0, 500)}"
          Keyword tracked: "${mention.keyword}"
          Signal type: "${mention.ai_type ?? "general"}"
          Why this is a signal: "${mention.ai_reason ?? ""}"
  
          Write a short, genuine reply (2-3 sentences). Do NOT be salesy or mention any product directly. Sound like a real person who has dealt with this problem. End with a helpful question or offer. Return only the reply text, no quotes, no labels.
      `,
      config: {
        maxOutputTokens: 300,
        thinkingConfig: { thinkingBudget: 0 },
      },
    });

    const reply = response.text?.trim() ?? "Could not generate a reply.";
    await sql`
        UPDATE mentions SET ai_suggested_reply = ${reply} WHERE id = ${mentionId}
      `;
    return NextResponse.json({ reply });
  } catch {
    return NextResponse.json(
      {
        error: "The AI is busy right now. Please try again in a moment.",
      },
      { status: 503 },
    );
  }
}

import { extractSub } from "@/lib/utils";
import type { MentionRow, SignalPlatform, SignalType } from "@/types";

export function toMentionRow(row: Record<string, unknown>): MentionRow {
  const platform = row.platform as SignalPlatform;
  const url = (row.post_url as string) ?? "";
  return {
    id: row.id as string,
    platform,
    source: extractSub(platform, url),
    author: (row.author as string) ?? "",
    keyword: (row.keyword as string) ?? "",
    title: (row.post_title as string) || "(no title)",
    body: (row.post_body as string) ?? "",
    url,
    score: (row.ai_score as number | null) ?? null,
    reason: (row.ai_reason as string | null) ?? null,
    type: (row.ai_type as SignalType | null) ?? null,
    reply: (row.ai_suggested_reply as string | null) ?? null,
    status: (row.status as string) ?? "new",
    notes: (row.notes as string | null) ?? null,
    createdAt: row.created_at as string,
  };
}

export type ScoreTier = "hi" | "md" | "lo";

export function scoreTier(score: number | null): ScoreTier {
  if (score === null) return "lo";
  if (score >= 8) return "hi";
  if (score >= 5) return "md";
  return "lo";
}

export function scoreColor(score: number | null): string {
  const tier = scoreTier(score);
  if (tier === "hi") return "var(--r1)";
  if (tier === "md") return "var(--amber)";
  return "rgba(255,255,255,.4)";
}

export function scoreLabel(score: number | null): string {
  const tier = scoreTier(score);
  if (tier === "hi") return "HOT";
  if (tier === "md") return "WARM";
  return "COLD";
}

export function shortAgo(dateStr: string): string {
  const minutes = Math.max(
    0,
    Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000),
  );
  if (minutes < 60) return `${minutes}m`;
  if (minutes < 1440) return `${Math.round(minutes / 60)}h`;
  return `${Math.round(minutes / 1440)}d`;
}

export function platformVar(platform: string): string {
  if (platform === "reddit") return "var(--rd)";
  if (platform === "hackernews") return "var(--hn)";
  if (platform === "bluesky") return "var(--bs)";
  return "var(--unk)";
}

import type { HuntProfile } from "@/types";

export const PROFILE_MAX_LENGTH = 1000;

// db row (users table) → hunt profile
export function toHuntProfile(row: Record<string, unknown>): HuntProfile {
  const text = (v: unknown) => (typeof v === "string" ? v : "");
  return {
    role: text(row.role),
    offer: text(row.description),
    lookingFor: text(row.listener_context),
    signals: text(row.hunt_signals),
    ignore: text(row.hunt_ignore),
    replyTone: text(row.reply_tone),
    updatedAt: row.profile_updated_at
      ? new Date(row.profile_updated_at as string).toISOString()
      : null,
  };
}

// the part of the profile the AI uses to score a post, skipping empty fields
export function profileForScoring(p: HuntProfile): string {
  const lines = [
    p.role && `Their role: ${p.role}`,
    p.offer && `What they offer or are after: ${p.offer}`,
    p.lookingFor && `Who they are looking for: ${p.lookingFor}`,
    p.signals && `Score higher when a post shows: ${p.signals}`,
    p.ignore && `Score low when a post is about: ${p.ignore}`,
  ].filter(Boolean);
  return lines.join("\n");
}

// the part the AI uses when drafting a reply
export function profileForReply(p: HuntProfile): string {
  const lines = [
    p.role && `You are writing as: ${p.role}`,
    p.offer && `What you offer: ${p.offer}`,
    p.replyTone && `How the reply should sound: ${p.replyTone}`,
  ].filter(Boolean);
  return lines.join("\n");
}

// true when a change affects how posts are scored (reply tone alone does not)
export function scoringChanged(a: HuntProfile, b: HuntProfile): boolean {
  return (
    a.role !== b.role ||
    a.offer !== b.offer ||
    a.lookingFor !== b.lookingFor ||
    a.signals !== b.signals ||
    a.ignore !== b.ignore
  );
}

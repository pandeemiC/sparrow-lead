import type { HuntStatus } from "@/types";

// signals with these statuses are leads on the hunt board
export const BOARD_STATUSES: HuntStatus[] = [
  "hunting",
  "interested",
  "engaged",
  "hunted",
];

// deleting a keyword also deletes its signals (the database cascades), so it's
// only allowed once the keyword is paused and none of its leads are on the hunt board.
// returns why it can't be deleted, or null when it can
export function deleteBlockReason({
  active,
  boardLeads,
}: {
  active: boolean;
  boardLeads: number;
}): string | null {
  if (active) return "Pause this keyword before deleting it";
  if (boardLeads > 0) {
    const leads = boardLeads === 1 ? "1 lead" : `${boardLeads} leads`;
    return `This keyword has ${leads} on your Hunt Board. Move or finish them first.`;
  }
  return null;
}

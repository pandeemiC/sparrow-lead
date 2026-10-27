import { describe, it, expect } from "vitest";
import { deleteBlockReason } from "@/lib/keywords";

describe("deleteBlockReason", () => {
  it("allows deleting a paused keyword with no hunt board leads", () => {
    expect(deleteBlockReason({ active: false, boardLeads: 0 })).toBeNull();
  });

  it("blocks deleting a keyword that is still active", () => {
    expect(deleteBlockReason({ active: true, boardLeads: 0 })).toBe(
      "Pause this keyword before deleting it",
    );
  });

  it.each([
    [
      1,
      "This keyword has 1 lead on your Hunt Board. Move or finish them first.",
    ],
    [
      3,
      "This keyword has 3 leads on your Hunt Board. Move or finish them first.",
    ],
  ])(
    "blocks deleting a keyword with %s hunt board lead(s)",
    (boardLeads, reason) => {
      expect(deleteBlockReason({ active: false, boardLeads })).toBe(reason);
    },
  );
});

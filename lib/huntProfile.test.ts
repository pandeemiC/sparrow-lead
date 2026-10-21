import type { HuntProfile } from "@/types";
import {
  toHuntProfile,
  profileForScoring,
  profileForReply,
  scoringChanged,
} from "@/lib/huntProfile";
import { describe, it, expect } from "vitest";

// test fixtures

const base: HuntProfile = {
  role: "freelancer",
  offer: "client portals for designers",
  lookingFor: "small agencies",
  signals: "mentions a budget",
  ignore: "job ads",
  replyTone: "friendly and short",
  updatedAt: null,
};

const empty: HuntProfile = {
  role: "",
  offer: "",
  lookingFor: "",
  signals: "",
  ignore: "",
  replyTone: "",
  updatedAt: null,
};

describe("scoringChanged", () => {
  it("is false when nothing changed", () => {
    expect(scoringChanged(base, base)).toBe(false);
  });

  it("is false when only the reply tone changed", () => {
    const edited = { ...base, replyTone: "formal" };
    expect(scoringChanged(base, edited)).toBe(false);
  });

  it.each(["role", "offer", "lookingFor", "signals", "ignore"] as const)(
    "is true when %s changed",
    (field) => {
      const edited = { ...base, [field]: "something new" };
      expect(scoringChanged(base, edited)).toBe(true);
    },
  );
});

// profiles

describe("profileForScoring", () => {
  it("includes every scoring field", () => {
    const text = profileForScoring(base);
    expect(text).toContain("Their role: freelancer");
    expect(text).toContain(
      "What they offer or are after: client portals for designers",
    );
    expect(text).toContain("Who they are looking for: small agencies");
    expect(text).toContain("Score higher when a post shows: mentions a budget");
    expect(text).toContain("Score low when a post is about: job ads");
  });

  it("leaves out the reply tone", () => {
    expect(profileForScoring(base)).not.toContain("friendly and short");
  });

  it("skips the whole line when a field is empty", () => {
    const text = profileForScoring({ ...base, ignore: "" });
    expect(text).not.toContain("Score low when a post is about");
  });

  it("is empty for an empty profile", () => {
    expect(profileForScoring(empty)).toBe("");
  });
});

describe("profileForReply", () => {
  it("includes role, offer, tone", () => {
    const text = profileForReply(base);
    expect(text).toContain("You are writing as: freelancer");
    expect(text).toContain("What you offer: client portals for designers");
    expect(text).toContain("How the reply should sound: friendly and short");
  });

  it("leaves out the scoring-only fields", () => {
    const text = profileForReply(base);
    expect(text).not.toContain("job ads");
    expect(text).not.toContain("small agencies");
  });

  it("is empty for an empty profile", () => {
    expect(profileForReply(empty)).toBe("");
  });
});

const changed = { ...base, replyTone: "formal" };

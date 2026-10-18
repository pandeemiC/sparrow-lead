import { describe, it, expect } from "vitest";
import { scoreTier, scoreLabel, scoreColor, platformVar } from "@/lib/score";

// hi (high), md (medium), lo, (low)

// table test

describe("scoreTier", () => {
  it.each([
    [10, "hi"],
    [8, "hi"],
    [7, "md"],
    [5, "md"],
    [4, "lo"],
    [1, "lo"],
    [null, "lo"],
  ])("scoreTier(%s) is %s", (score, tier) => {
    expect(scoreTier(score)).toBe(tier);
  });
});

describe("scoreLabel", () => {
  it.each([
    [10, "HOT"],
    [8, "HOT"],
    [7, "WARM"],
    [5, "WARM"],
    [4, "COLD"],
    [1, "COLD"],
    [null, "COLD"],
  ])("scoreLabel(%s) is %s", (score, label) => {
    expect(scoreLabel(score)).toBe(label);
  });
});

describe("scoreColor", () => {
  it.each([
    [10, "var(--r1)"],
    [8, "var(--r1)"],
    [7, "var(--amber)"],
    [5, "var(--amber)"],
    [4, "rgba(255,255,255,.4)"],
    [1, "rgba(255,255,255,.4)"],
    [null, "rgba(255,255,255,.4)"],
  ])("scoreColor(%s) is %s", (score, color) => {
    expect(scoreColor(score)).toBe(color);
  });
});

describe("platformVar", () => {
  it.each([
    ["reddit", "var(--rd)"],
    ["hackernews", "var(--hn)"],
    ["bluesky", "var(--bs)"],
    ["anything else", "var(--unk)"],
  ])("platformVar(%s) is %s", (platform, color) => {
    expect(platformVar(platform)).toBe(color);
  });
});

//  seperate/individual testing

// describe("scoreTier", () => {
//   it("marks 8 and higher as hi(high)", () => {
//     expect(scoreTier(8)).toBe("hi");
//     expect(scoreTier(10)).toBe("hi");
//   });

//   it("marks 5 or/to 7 as md(medium)", () => {
//     expect(scoreTier(5)).toBe("md");
//     expect(scoreTier(7)).toBe("md");
//   });

//   it("marks below 5 to be lo(low)", () => {
//     expect(scoreTier(4)).toBe("lo");
//     expect(scoreTier(1)).toBe("lo");
//   });

//   it("marks missing score as lo(low)", () => {
//     expect(scoreTier(null)).toBe("lo");
//   });
// });

import { describe, it, expect } from "vitest";
import { scoreTier } from "@/lib/score";

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

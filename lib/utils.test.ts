import { describe, it, expect } from "vitest";
import { extractSub } from "@/lib/utils";

describe("extractSub", () => {
  it.each([
    [
      "reddit",
      "https://reddit.com/r/startups/comments/abc123/looking_for_a_crm/",
      "r/startups",
    ],
    ["reddit", "https://reddit.com/user/someone", "Reddit"],
    [
      "bluesky",
      "https://bsky.app/profile/someone.bsky.social/post/3kabc",
      "Bluesky",
    ],
    ["hackernews", "https://news.ycombinator.com/item?id=41234567", "HN"],
  ])("extractSub(%s, %s) is %s", (platform, url, expected) => {
    expect(extractSub(platform, url)).toBe(expected);
  });
});

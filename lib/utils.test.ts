import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { extractSub, timeAgo } from "@/lib/utils";

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

describe("timeAgo", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-21T12:00:00Z"));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it.each([
    ["2026-10-21T11:59:30Z", "30s ago"],
    ["2026-10-21T11:59:00Z", "1m ago"],
    ["2026-10-21T11:55:00Z", "5m ago"],
    ["2026-10-21T11:00:00Z", "1h ago"],
    ["2026-10-21T10:30:00Z", "1h ago"],
    ["2026-10-20T12:00:00Z", "1d ago"],
    ["2026-10-18T12:00:00Z", "3d ago"],
  ])("timeAgo(%s) is %s", (date, expected) => {
    expect(timeAgo(date)).toBe(expected);
  });

  // regression test
  it("never shows a negative time for a date in the future", () => {
    expect(timeAgo("2026-10-21T12:05:00Z")).toBe("0s ago");
  });
});

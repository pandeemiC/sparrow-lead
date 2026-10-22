import { describe, it, expect, vi, beforeEach } from "vitest";
import { analyzePost } from "@/lib/analysis";
import { generateContent } from "@/lib/gemini";

vi.mock("@/lib/gemini", () => ({
  generateContent: vi.fn(),
}));
const mockGemini = vi.mocked(generateContent);

const post = {
  keyword: "crm for freelancers",
  title: "Looking for a simple CRM",
  body: "Any recommendations under $20 a month?",
};

// gemini mock reply
function geminiReplies(text: string | undefined) {
  mockGemini.mockResolvedValue({ text } as Awaited<
    ReturnType<typeof generateContent>
  >);
}

describe("analyzePost", () => {
  beforeEach(() => {
    mockGemini.mockReset();
  });

  it("returns the score when gemini replies with valid json", async () => {
    geminiReplies(
      '{"score": 8, "reason": "asks for a recommendation", "type": "seeking_recommendation"}',
    );

    const result = await analyzePost(post);

    expect(result).toEqual({
      score: 8,
      reason: "asks for a recommendation",
      type: "seeking_recommendation",
    });
  });

  it("falls back to a low score when the reply isn't valid json", async () => {
    geminiReplies("Sure! Here is my analysis: score 8");

    const result = await analyzePost(post);

    expect(result).toEqual({
      score: 1,
      reason: "Could not analyze this post",
      type: "general",
    });
  });

  it("falls back to a low score when the reply is empty", async () => {
    geminiReplies(undefined);

    const result = await analyzePost(post);
    expect(result.score).toBe(1);
  });

  it("calls gemini once per post", async () => {
    geminiReplies('{"score": 5, "reason": "x", "type": "question"}');

    await analyzePost(post);

    expect(mockGemini).toHaveBeenCalledTimes(1);
  });

  it("puts the post and the hunt profile in the prompt", async () => {
    geminiReplies('{"score": 5, "reason": "x", "type": "question"}');

    await analyzePost({ ...post, profile: "Their role: freelancer" });

    const prompt = mockGemini.mock.calls[0][0].contents as string;
    expect(prompt).toContain("Looking for a simple CRM");
    expect(prompt).toContain("crm for freelancers");
    expect(prompt).toContain("Their role: freelancer");
  });

  it("leaves the profile section out when there is no profile", async () => {
    geminiReplies('{"score": 5, "reason": "x", "type": "question"}');

    await analyzePost(post);

    const prompt = mockGemini.mock.calls[0][0].contents as string;
    expect(prompt).not.toContain("About the user");
  });

  it.each([
    ['{"score": 15, "reason": "x", "type": "question"}', 10], // too high: capped at 10
    ['{"score": 0, "reason": "x", "type": "question"}', 1], // too low: raised to 1
    ['{"score": 7.6, "reason": "x", "type": "question"}', 8], // decimal: rounded
    ['{"score": "7", "reason": "x", "type": "question"}', 7], // number as text: considered usable
  ])("keeps the score between 1 and 10 for %s", async (reply, expected) => {
    geminiReplies(reply);

    const result = await analyzePost(post);

    expect(result.score).toBe(expected);
  });

  it("falls back when the score isn't a num", async () => {
    geminiReplies('{"score": "high", "reason": "x", "type": "question"}');

    const result = await analyzePost(post);

    expect(result.score).toBe(1);
    expect(result.reason).toBe("Could not analyze this post");
  });

  it("uses general for a type it doesn't know", async () => {
    geminiReplies('{"score": 6, "reason": "x", "type": "spam_bot"}');
    const result = await analyzePost(post);

    expect(result.type).toBe("general");
  });
});

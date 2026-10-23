import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ai, generateContent } from "@/lib/gemini";
import { ApiError, GenerateContentResponse } from "@google/genai";

const params = {
  model: "gemini-3.1-flash-lite",
  contents: "this is a mock test content",
};

// successful mock response
const ok = { text: '{"score": 5}' } as GenerateContentResponse;

function apiError(status: number) {
  return new ApiError({ message: `status ${status}`, status });
}

describe("generateContent", () => {
  let callGemini: ReturnType<typeof vi.spyOn>; // 4sk
  beforeEach(() => {
    vi.useFakeTimers();
    callGemini = vi.spyOn(ai.models, "generateContent");
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("returns instantly when the first try works", async () => {
    callGemini.mockResolvedValue(ok);

    const result = await generateContent(params);

    expect(result).toBe(ok);
    expect(callGemini).toHaveBeenCalledTimes(1);
  });

  it("retries after 503 and returns after the 2 tries", async () => {
    callGemini
      .mockRejectedValueOnce(apiError(503))
      .mockRejectedValueOnce(apiError(503))
      .mockResolvedValueOnce(ok);

    const promise = generateContent(params);
    await vi.runAllTimersAsync();

    await expect(promise).resolves.toBe(ok);
    expect(callGemini).toHaveBeenCalledTimes(3);
  });

  it("also retries when rate limited on 429", async () => {
    callGemini.mockRejectedValueOnce(apiError(429)).mockResolvedValueOnce(ok);

    const promise = generateContent(params);
    await vi.runAllTimersAsync();

    await expect(promise).resolves.toBe(ok);
    expect(callGemini).toHaveBeenCalledTimes(2);
  });

  it("stops on first try with no retry when the status is invalid (400)", async () => {
    callGemini.mockRejectedValue(apiError(400));

    await expect(generateContent(params)).rejects.toThrow("status 400");
    expect(callGemini).toHaveBeenCalledTimes(1);
  });

  // standard logic test for 3 tries to stop
  it("gives up after 3 retries", async () => {
    callGemini.mockRejectedValue(apiError(503));

    const promise = generateContent(params);
    const check = expect(promise).rejects.toThrow("status 503");
    await vi.runAllTimersAsync();
    await check;

    expect(callGemini).toHaveBeenCalledTimes(4);
  });

  // standard logic test for timer to extend each try
  it("wait timer extends each retry (500ms > 1000ms > 2000ms", async () => {
    callGemini
      .mockRejectedValueOnce(apiError(503))
      .mockRejectedValueOnce(apiError(503))
      .mockResolvedValueOnce(ok);

    const promise = generateContent(params);

    await vi.advanceTimersByTimeAsync(0);
    expect(callGemini).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(499);
    expect(callGemini).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(1);
    expect(callGemini).toHaveBeenCalledTimes(2);

    await vi.advanceTimersByTimeAsync(999);
    expect(callGemini).toHaveBeenCalledTimes(2);
    await vi.advanceTimersByTimeAsync(1);
    expect(callGemini).toHaveBeenCalledTimes(3);

    await expect(promise).resolves.toBe(ok);
  });
});

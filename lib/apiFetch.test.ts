import { describe, it, vi, expect, afterEach } from "vitest";
import { apiFetch } from "@/lib/apiFetch";

function fakeResponse(body: unknown, status: number) {
  return new Response(JSON.stringify(body), { status });
}

describe("apiFetch", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns the json bodyy when successful", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      fakeResponse({ name: "x" }, 200),
    );

    const data = await apiFetch("/api/anything");
    expect(data).toEqual({ name: "x" });
  });

  it("throws the error message once unsuccessful", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      fakeResponse({ error: "Keyword too long" }, 400),
    );

    await expect(apiFetch("/api/something")).rejects.toThrow(
      "Keyword too long",
    );
  });

  it("throws a generic message on nothing", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(fakeResponse({}, 500));
    await expect(apiFetch("/api/something")).rejects.toThrow(
      "Request failed (500)",
    );
  });
});

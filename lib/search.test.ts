import { describe, it, expect, vi, afterEach } from "vitest";
import { cleanHtml, searchHackerNews } from "@/lib/search";

describe("cleanHtml", () => {
  it.each([
    ["Don&#x27;t use spreadsheets", "Don't use spreadsheets"],
    ["first<p>second", "first second"],
    ['<a href="https://x.com">link</a> here', "link here"],
    ["a &gt; b &amp;&amp; c &lt; d", "a > b && c < d"],
    ["say &quot;hi&quot;", 'say "hi"'],
    ["path&#x2F;to", "path/to"],
    ["  lots   of\n\nspace  ", "lots of space"],
    ["&amp;lt;", "&lt;"], // literally returning lt if typed deliberately
  ])("cleanHtml(%s) is %s", (html, expected) => {
    expect(cleanHtml(html)).toBe(expected);
  });
});

function fakeResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status });
}

describe("searchHackerNews", () => {
  afterEach(() => {
    vi.restoreAllMocks(); //puts the real back after test
  });

  it("turns a story into a post", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      fakeResponse({
        hits: [
          {
            objectID: "111",
            title: "Ask HN: What CRM do you use?",
            story_text: "Looking for something &amp; simple",
            comment_text: null,
            story_title: null,
            author: "doe",
            url: null,
          },
        ],
      }),
    );

    const posts = await searchHackerNews("crm");

    expect(posts).toEqual([
      {
        platform: "hackernews",
        post_url: "https://news.ycombinator.com/item?id=111",
        post_title: "Ask HN: What CRM do you use?",
        post_body: "Looking for something & simple",
        author: "doe",
      },
    ]);
  });

  it("uses comments opening as the title", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      fakeResponse({
        hits: [
          {
            objectID: "222",
            title: null,
            story_text: null,
            comment_text: "I&#x27;m looking for a CRM<p>Budget is $9M",
            story_title: "ask HN: CRM?",
            author: "Rapunzel",
            url: null,
          },
        ],
      }),
    );
    // first item
    const [post] = await searchHackerNews("looking for a crm");

    expect(post.post_title).toBe("I'm looking for a CRM Budget is $9M");
    expect(post.post_body).toBe("I'm looking for a CRM Budget is $9M");
  });

  it("fallsback to (no title) when a hit has no text", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      fakeResponse({
        hits: [
          {
            objectID: "333",
            title: null,
            story_text: null,
            comment_text: null,
            story_title: null,
            author: "x",
            url: null,
          },
        ],
      }),
    );

    const [post] = await searchHackerNews("crm");

    expect(post.post_title).toEqual("(no title)");
    expect(post.post_body).toEqual("");
  });

  it("searches newest first for exact phrase", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(fakeResponse({ hits: [] }));

    await searchHackerNews("crm for freelancers");

    const url = String(fetchSpy.mock.calls[0][0]);
    expect(url).toContain("search_by_date");
    expect(url).toContain(encodeURIComponent('"crm for freelancers'));
  });

  it("throws when hacker news returns an error", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      fakeResponse({ message: "down" }, 500),
    );

    await expect(searchHackerNews("crm")).rejects.toThrow(
      'Hacker News search failed (500) for "crm"',
    );
  });
});

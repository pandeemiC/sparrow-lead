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

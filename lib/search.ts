import type { RedditResponse, HackerNewsResponse, ScannedPost } from "@/types";
import { redditConfigured, redditGet } from "@/lib/reddit";

let warnedRedditMissing = false;

export async function searchReddit(keyword: string): Promise<ScannedPost[]> {
  if (!redditConfigured()) {
    if (!warnedRedditMissing) {
      console.warn(
        "[search] Reddit skipped: REDDIT_CLIENT_ID / REDDIT_CLIENT_SECRET not set",
      );
      warnedRedditMissing = true;
    }
    return [];
  }

  const res = await redditGet(
    `/search?q=${encodeURIComponent(keyword)}&sort=new&limit=5&type=link&raw_json=1`,
  );
  if (!res.ok) {
    throw new Error(`Reddit search failed (${res.status}) for "${keyword}"`);
  }

  const data: RedditResponse = await res.json();
  return data.data.children.map((child) => ({
    platform: "reddit",
    post_url: `https://reddit.com${child.data.permalink}`,
    post_title: child.data.title,
    post_body: child.data.selftext?.slice(0, 500) || "",
    author: child.data.author,
  }));
}

export async function searchHackerNews(
  keyword: string,
): Promise<ScannedPost[]> {
  const url = `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(keyword)}&tags=(story,comment)&hitsPerPage=5`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(
      `Hacker News search failed (${res.status}) for "${keyword}"`,
    );
  }
  const data: HackerNewsResponse = await res.json();
  return data.hits.map((hit) => ({
    platform: "hackernews",
    post_url: `https://news.ycombinator.com/item?id=${hit.objectID}`,
    post_title: hit.title || hit.story_text?.slice(0, 80) || "(no title)",
    post_body: hit.story_text?.slice(0, 500) || "",
    author: hit.author,
  }));
}

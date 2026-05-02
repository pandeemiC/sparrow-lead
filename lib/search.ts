import type { RedditResponse, HackerNewsResponse, ScannedPost } from "@/types";

export async function searchReddit(keyword: string): Promise<ScannedPost[]> {
  const url = `https://www.reddit.com/search.json?q=${encodeURIComponent(keyword)}&sort=new&limit=5`;
  const res = await fetch(url, { headers: { "User-Agent": "Sparrow/1.0" } });
  if (!res.ok) return [];
  const data: RedditResponse = await res.json();
  return data.data.children.map((child) => ({
    platform: "reddit",
    post_url: `https://reddit.com${child.data.permalink}`,
    post_title: child.data.title,
    post_body: child.data.selftext?.slice(0, 500) || "",
    author: child.data.author,
  }));
}

export async function searchHackerNews(keyword: string): Promise<ScannedPost[]> {
  const url = `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(keyword)}&tags=(story,comment)&hitsPerPage=5`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data: HackerNewsResponse = await res.json();
  return data.hits.map((hit) => ({
    platform: "hackernews",
    post_url: `https://news.ycombinator.com/item?id=${hit.objectID}`,
    post_title: hit.title || hit.story_text?.slice(0, 80) || "(no title)",
    post_body: hit.story_text?.slice(0, 500) || "",
    author: hit.author,
  }));
}

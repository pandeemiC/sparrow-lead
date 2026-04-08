export type Keyword = {
  id: string;
  user_id: string;
  keyword: string;
  platform: string;
  created_at: string;
};

export type Mention = {
  id: string;
  keyword_id: string;
  platform: string;
  post_url: string;
  post_title: string | null;
  post_body: string | null;
  author: string | null;
  ai_analysis: AiAnalysis | null;
  relevance_score: number | null;
  created_at: string;
};

export type AiAnalysis = {
  relevance: number;
  reasoning: string;
  suggested_reply: string;
};

export type AnalyzePostInput = {
  keyword: string;
  title: string;
  body: string;
};

export type RedditPost = {
  data: {
    permalink: string;
    title: string;
    selftext: string;
    author: string;
  };
};

export type RedditResponse = {
  data: {
    children: RedditPost[];
  };
};

export type HackerNewsHit = {
  url: string | null;
  objectID: string;
  title: string;
  story_text: string | null;
  author: string;
};

export type HackerNewsResponse = {
  hits: HackerNewsHit[];
};

export type ScannedPost = {
  platform: string;
  post_url: string;
  post_title: string;
  post_body: string;
  author: string;
};

export type SignalPlatform = "reddit" | "hackernews";

export type SignalType =
  | "seeking_recommendation"
  | "pain_point"
  | "competitor_complaint"
  | "question"
  | "general";

export type Signal = {
  id: string;
  platform: SignalPlatform;
  source: string;
  author: string;
  timeAgo: string;
  keyword: string;
  title: string;
  body: string;
  postUrl: string;
  aiScore: number | null;
  aiReason: string | null;
  aiType: SignalType | null;
  status: "new" | "hunting" | "dismissed";
};

export type SignalFilters = {
  platform: "all" | "reddit" | "hackernews";
  intent: "all" | "high" | "medium" | "low";
  sort: "score" | "newest" | "oldest";
  type: "all" | SignalType;
};

export type HuntStatus = "hunting" | "interested" | "engaged" | "hunted";

export type Lead = {
  id: string;
  title: string;
  source: string;
  platform: "reddit" | "hackernews";
  postUrl: string;
  keyword: string;
  timeAgo: string;
  aiScore: number | null;
  aiReason: string | null;
  status: HuntStatus;
  notes: string | null;
};

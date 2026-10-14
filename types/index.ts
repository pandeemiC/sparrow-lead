export type Keyword = {
  id: string;
  user_id: string;
  keyword: string;
  platforms: string[];
  created_at: string;
};

export type Payload = {
  userId: string;
};

export type UserSettings = {
  emailNotifications: boolean;
  alertMinScore: number;
  autoScan: boolean;
  role: string;
  description: string;
  listenerContext: string;
};

export type AccountSession = {
  id: string;
  device: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
  revoke: () => Promise<unknown>;
};

export type ScanResult = {
  found: number;
  hotSignals: HotSignal[];
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
  score: number;
  reason: string;
  type: string;
};

export type AnalyzePostInput = {
  keyword: string;
  title: string;
  body: string;
  // the user's hunt profile, already written out as text for the prompt
  profile?: string;
};

export type HuntProfile = {
  role: string;
  offer: string;
  lookingFor: string;
  signals: string;
  ignore: string;
  replyTone: string;
  updatedAt: string | null;
};

// what happens to existing data when the hunt profile is saved
export type HuntProfileSaveMode = "keep" | "rescore" | "fresh";

// how much existing data each save option would touch
export type HuntProfileCounts = {
  untouched: number;
  removable: number;
  onBoard: number;
  keywords: number;
};

export type RedditPost = {
  data: {
    permalink: string;
    title: string;
    selftext: string;
    author: string;
  };
};

export type BlueSkyPost = {
  uri: string;
  author: { handle: string; displayName?: string };
  record: { text: string; createdAt: string };
};

export type BlueSkyResponse = {
  posts: BlueSkyPost[];
};

export type RedditResponse = {
  data: {
    children: RedditPost[];
  };
};

export type RedditToken = {
  value: string;
  expiresAt: number;
};

export type BlueSkyToken = {
  value: string;
  expiresAt: number;
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

export type SignalPlatform = "reddit" | "hackernews" | "bluesky";

export type HotSignal = {
  title: string;
  score: number;
  platform: "reddit" | "hackernews" | "bluesky";
  reason: string;
  url: string;
};

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
  createdAt: string;
  aiType: SignalType | null;
  status: "new" | "hunting" | "dismissed";
};

export type SignalFilters = {
  platform: "all" | "reddit" | "hackernews" | "bluesky";
  intent: "all" | "high" | "medium" | "low";
  sort: "score" | "newest" | "oldest";
  type: "all" | SignalType;
};

export type MentionRow = {
  id: string;
  platform: SignalPlatform;
  source: string;
  author: string;
  keyword: string;
  title: string;
  body: string;
  url: string;
  score: number | null;
  reason: string | null;
  type: SignalType | null;
  reply: string | null;
  status: string;
  notes: string | null;
  createdAt: string;
};

export type SourceStatus = {
  platform: SignalPlatform;
  active: boolean;
};

export type HuntStatus = "hunting" | "interested" | "engaged" | "hunted";

export type Lead = {
  id: string;
  title: string;
  source: string;
  platform: "reddit" | "hackernews" | "bluesky";
  postUrl: string;
  keyword: string;
  timeAgo: string;
  aiScore: number | null;
  aiReason: string | null;
  status: HuntStatus;
  notes: string | null;
};

export type SignalPreview = {
  id: string;
  platform: string;
  post_title: string;
  post_url: string;
  ai_score: number | null;
  created_at: string;
  keyword: string;
};

export type KeywordStat = {
  keyword: string;
  platforms: string[];
  mention_count: number;
};

export type HuntLeadPreview = {
  id: string;
  platform: string;
  post_title: string;
  post_url: string;
  ai_score: number | null;
  status: string;
  keyword: string;
};

export type Stats = {
  totalSignals: number;
  signalsToday: number;
  keywordsTracked: number;
  lastScannedAt: string | null;
  huntCounts: {
    hunting: number;
    interested: number;
    engaged: number;
    hunted: number;
  };
  recentSignals: SignalPreview[];
  topSignals: SignalPreview[];
  keywords: KeywordStat[];
  huntLeads: HuntLeadPreview[];
  signalsThisMonth: number;
  sources: SourceStatus[];
  autoScan: boolean;
};

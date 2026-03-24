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

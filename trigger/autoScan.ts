import { schedules, logger } from "@trigger.dev/sdk/v3";
import { getDb } from "@/lib/db";
import { analyzePost } from "@/lib/analysis";
import type {
  RedditResponse,
  HackerNewsResponse,
  ScannedPost,
  Keyword,
} from "@/types";

async function searchReddit() {}

async function searchHackerNews() {}

export const autoScanTask = schedules;

import type { SignalPlatform } from "@/types";

// sample data for the homepage animations. none of this is real usage data,
// it only shows what a signal looks like

export type SamplePost = {
  platform: SignalPlatform;
  source: string;
  score: number;
  type: string;
  title: string;
  why: string;
  ago: string;
};

export const SAMPLE_POSTS: SamplePost[] = [
  {
    platform: "reddit",
    source: "r/freelance",
    score: 9,
    type: "Seeking recommendation",
    title:
      "Any invoicing tool that handles multiple currencies? Mine keeps breaking.",
    why: "Names the exact need and is ready to switch.",
    ago: "12m",
  },
  {
    platform: "hackernews",
    source: "Ask HN",
    score: 6,
    type: "Pain point",
    title: "How do you keep track of feature requests from customers?",
    why: "Real frustration, still exploring options.",
    ago: "40m",
  },
  {
    platform: "bluesky",
    source: "Bluesky",
    score: 8,
    type: "Competitor complaint",
    title:
      "Done paying per seat for a scheduling tool. What else is out there?",
    why: "Unhappy with a competitor and asking for alternatives.",
    ago: "1h",
  },
  {
    platform: "reddit",
    source: "r/SaaS",
    score: 9,
    type: "Seeking recommendation",
    title: "Alternative to Notion for client portals? Want to move this week.",
    why: "Clear requirement with a deadline.",
    ago: "2h",
  },
];

// what the intent section cycles through
export const INTENT_EXAMPLES: SamplePost[] = [
  SAMPLE_POSTS[3],
  {
    platform: "hackernews",
    source: "Ask HN",
    score: 6,
    type: "Pain point",
    title: "Our feature requests live in five different spreadsheets.",
    why: "Describes the problem but isn't shopping yet.",
    ago: "3h",
  },
  {
    platform: "reddit",
    source: "r/webdev",
    score: 8,
    type: "Seeking recommendation",
    title:
      "Looking for a designer for a small SaaS landing page, budget ready.",
    why: "Hiring now, with budget mentioned.",
    ago: "25m",
  },
  {
    platform: "bluesky",
    source: "Bluesky",
    score: 3,
    type: "General",
    title: "Funny how every startup ends up building its own CRM.",
    why: "On topic, but no sign they need anything.",
    ago: "5h",
  },
];

export const REPLY_DRAFTS = [
  "Had the same problem with currencies. I ended up using a tool that converts at payment time, happy to share what worked.",
  "We moved our client portal off Notion last month. One link per client with files and invoices made the difference.",
  "If per-seat pricing is the blocker, look at tools that charge per booking page instead.",
];

export const SCAN_LOG = [
  "scanning 4 keywords",
  "reddit · r/SaaS · 42 new posts",
  "reddit · r/freelance · 31 new posts",
  "hacker news · Ask HN · 18 new posts",
  "bluesky · 57 new posts",
  "scoring 148 posts",
  "3 high intent · 9 worth a look",
];

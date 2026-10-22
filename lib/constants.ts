import {
  Crosshair,
  LayoutDashboard,
  Radio,
  Tag,
  Target,
  LayoutList,
  Bell,
  ScanLine,
  CreditCard,
  Shield,
  BarChart2,
  User,
} from "lucide-react";
import type { SignalPlatform, SignalType, HuntStatus, Lead } from "@/types";

export const PLATFORMS: { value: SignalPlatform; label: string }[] = [
  { value: "reddit", label: "Reddit" },
  { value: "hackernews", label: "Hacker News" },
  { value: "bluesky", label: "Bluesky" },
];

export const PLATFORM_LABELS: Record<SignalPlatform, string> = {
  reddit: "Reddit",
  hackernews: "Hacker News",
  bluesky: "Bluesky",
};

export const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Signals", href: "/dashboard/signals", icon: Radio },
  { label: "Keywords", href: "/dashboard/keywords", icon: Tag },
  { label: "Hunt Profile", href: "/dashboard/hunt-profile", icon: Crosshair },
  { label: "Hunt Board", href: "/dashboard/hunt-board", icon: Target },
];

export const SIGNAL_TYPE_TAG_CLASS: Record<SignalType, string> = {
  seeking_recommendation: "type-tag-seeking",
  pain_point: "type-tag-pain",
  competitor_complaint: "type-tag-competitor",
  question: "type-tag-question",
  general: "type-tag-general",
};

export const SIGNAL_TYPE_LABELS: Record<SignalType, string> = {
  seeking_recommendation: "Seeking Rec",
  pain_point: "Pain Point",
  competitor_complaint: "Competitor",
  question: "Question",
  general: "General",
};

export const SIGNAL_TYPES = Object.keys(SIGNAL_TYPE_LABELS) as SignalType[];

export const settingsItems = [
  { label: "Overview", href: "/dashboard/settings/overview", icon: LayoutList },
  { label: "Account", href: "/dashboard/settings/account", icon: User },
  {
    label: "Scan Preferences",
    href: "/dashboard/settings/scan-preferences",
    icon: ScanLine,
  },
  {
    label: "Notifications",
    href: "/dashboard/settings/notifications",
    icon: Bell,
  },
  { label: "Privacy", href: "/dashboard/settings/privacy", icon: Shield },
  { label: "Billing", href: "/dashboard/settings/billing", icon: CreditCard },
  { label: "Usage", href: "/dashboard/settings/usage", icon: BarChart2 },
];

export const ROLE_OPTIONS = [
  { label: "Founder / Business Owner", value: "founder" },
  { label: "Developer", value: "developer" },
  { label: "Marketer / Growth", value: "marketer" },
  { label: "Student", value: "student" },
  { label: "Other", value: "other" },
];

export const ALERT_SCORE_OPTIONS = [
  { label: "Warm (5+)", value: "5" },
  { label: "Hot (7+)", value: "7" },
  { label: "Very hot (9+)", value: "9" },
];

export const HUNT_COLUMNS: { id: HuntStatus; label: string; color: string }[] =
  [
    { id: "hunting", label: "Hunting (NEW)", color: "text-white/40" },
    { id: "interested", label: "Interested", color: "text-white/60" },
    { id: "engaged", label: "Engaged", color: "text-white/80" },
    { id: "hunted", label: "Hunted", color: "text-white" },
  ];

export const MOCK_LEADS: Lead[] = [
  {
    id: "l1",
    platform: "reddit",
    postUrl: "#",
    source: "r/entrepreneur",
    keyword: "better CRM",
    timeAgo: "3h ago",
    title: "Looking for a CRM that won't break the bank",
    aiScore: 9,
    aiReason:
      "Actively switching CRMs due to cost — strong buyer intent, team size mentioned.",
    status: "hunting",
    notes: null,
  },
  {
    id: "l2",
    platform: "hackernews",
    postUrl: "#",
    source: "HN",
    keyword: "lead tracking",
    timeAgo: "6h ago",
    title: "Ask HN: How are indie hackers tracking sales leads?",
    aiScore: 8,
    aiReason:
      "Indie hacker actively seeking lightweight CRM, explicit budget constraint.",
    status: "hunting",
    notes: null,
  },
  {
    id: "l3",
    platform: "reddit",
    postUrl: "#",
    source: "r/SaaS",
    keyword: "outreach tool",
    timeAgo: "1d ago",
    title: "Pain with current outreach stack — considering switching",
    aiScore: 6,
    aiReason:
      "Has a problem but hasn't committed to switching — medium intent.",
    status: "interested",
    notes: "Replied in thread, waiting for response.",
  },
  {
    id: "l4",
    platform: "reddit",
    postUrl: "#",
    source: "r/startups",
    keyword: "better CRM",
    timeAgo: "4d ago",
    title:
      "Switching from Salesforce — need something that doesn't require a consultant",
    aiScore: 9,
    aiReason:
      "B2B SaaS team actively leaving Salesforce, self-serve is key requirement.",
    status: "engaged",
    notes: "Sent DM with Sparrow link.",
  },
  {
    id: "l5",
    platform: "hackernews",
    postUrl: "#",
    source: "HN",
    keyword: "sales pipeline",
    timeAgo: "5d ago",
    title: "Ask HN: Best lightweight sales pipeline tool for a solo founder?",
    aiScore: 8,
    aiReason:
      "Solo founder actively seeking, mentioned frustration with existing tools.",
    status: "hunted",
    notes: "Signed up on free plan.",
  },
];

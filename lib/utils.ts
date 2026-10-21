import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function timeAgo(dateStr: string): string {
  const diff = Math.max(
    0,
    Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000),
  );
  //sec
  if (diff < 60) return `${diff}s ago`;
  //min
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  //hr
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  //day
  return `${Math.floor(diff / 86400)}d ago`;
}

export function extractSub(platform: string, postUrl: string): string {
  if (platform === "reddit") {
    const match = postUrl.match(/reddit\.com\/(r\/[^/]+)/);
    return match ? match[1] : "Reddit";
  }
  if (platform === "bluesky") return "Bluesky";
  return "HN";
}

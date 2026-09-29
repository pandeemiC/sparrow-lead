import { FaRedditAlien, FaYCombinator, FaBluesky } from "react-icons/fa6";
import type { IconType } from "react-icons";
import type { SignalPlatform } from "@/types";

const ICONS: Record<SignalPlatform, IconType> = {
  reddit: FaRedditAlien,
  hackernews: FaYCombinator,
  bluesky: FaBluesky,
};

const COLORS: Record<SignalPlatform, string> = {
  reddit: "text-orange-400",
  hackernews: "text-orange-300",
  bluesky: "text-sky-400",
};

export default function PlatformIcon({
  platform,
  size = 11,
  className = "",
}: {
  platform: string;
  size?: number;
  className?: string;
}) {
  const Icon = ICONS[platform as SignalPlatform];
  if (!Icon) return null;
  return (
    <Icon
      size={size}
      className={`${COLORS[platform as SignalPlatform]} ${className}`}
    />
  );
}

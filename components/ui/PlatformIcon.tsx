import { FaRedditAlien, FaYCombinator, FaBluesky } from "react-icons/fa6";
import type { IconType } from "react-icons";
import type { SignalPlatform } from "@/types";

const ICONS: Record<SignalPlatform, IconType> = {
  reddit: FaRedditAlien,
  hackernews: FaYCombinator,
  bluesky: FaBluesky,
};

export const PLATFORM_HEX: Record<SignalPlatform, string> = {
  reddit: "#E2501A",
  hackernews: "#FFA552",
  bluesky: "#6EC1FF",
};

export default function PlatformIcon({
  platform,
  size = 11,
  className = "",
  plain = false,
}: {
  platform: string;
  size?: number;
  className?: string;
  plain?: boolean;
}) {
  const Icon = ICONS[platform as SignalPlatform];
  if (!Icon) return null;
  return (
    <Icon
      size={size}
      className={className}
      style={
        plain ? undefined : { color: PLATFORM_HEX[platform as SignalPlatform] }
      }
    />
  );
}

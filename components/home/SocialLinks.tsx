import { FaGithub, FaLinkedinIn } from "react-icons/fa";
import { cn } from "@/lib/utils";
import { GITHUB_URL, LINKEDIN_URL } from "./contact";

const LINKS = [
  { label: "GitHub", href: GITHUB_URL, icon: FaGithub },
  { label: "LinkedIn", href: LINKEDIN_URL, icon: FaLinkedinIn },
];

// round icon buttons linking to GitHub and LinkedIn
export default function SocialLinks({
  size = "md",
  className,
}: {
  size?: "sm" | "md";
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {LINKS.map(({ label, href, icon: Icon }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          title={label}
          className={cn(
            "grid place-items-center rounded-full border border-white/12 text-ink-2 transition-colors hover:border-r1/50 hover:bg-r1/10 hover:text-ink",
            size === "sm" ? "size-8" : "size-10",
          )}
        >
          <Icon className={size === "sm" ? "size-3.5" : "size-4"} />
        </a>
      ))}
    </div>
  );
}

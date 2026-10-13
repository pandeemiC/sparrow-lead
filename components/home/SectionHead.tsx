import { cn } from "@/lib/utils";

// plain section heading: serif title + one short paragraph, no eyebrows or counters
export default function SectionHead({
  title,
  intro,
  light = false,
  className,
}: {
  title: string;
  intro?: string;
  light?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("max-w-[44rem]", className)}>
      <h2
        className={cn(
          "font-display text-[clamp(34px,4.2vw,58px)] leading-[1.04] font-normal tracking-[-0.015em] text-balance",
          light ? "text-[#1C1113]" : "text-ink",
        )}
      >
        {title}
      </h2>
      {intro && (
        <p
          className={cn(
            "mt-5 max-w-[36em] text-[16px] leading-relaxed",
            light ? "text-[#1C1113]/70" : "text-ink-2",
          )}
        >
          {intro}
        </p>
      )}
    </div>
  );
}

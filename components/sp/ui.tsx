import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

// small building blocks shared by the dashboard pages

export function Card({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[18px] border border-line bg-linear-to-b from-white/3 to-white/[1.2%]",
        className,
      )}
      {...props}
    />
  );
}

type ButtonOptions = {
  variant?: "default" | "primary";
  size?: "md" | "sm";
  spinning?: boolean;
};

// exported so a <Link> can look like a button too
export function buttonClass({
  variant = "default",
  size = "md",
  spinning = false,
}: ButtonOptions = {}) {
  return cn(
    "inline-flex h-9 items-center justify-center gap-2 whitespace-nowrap rounded-full border border-line-2 bg-panel-2 px-4 text-[13px] font-medium transition-all",
    "not-disabled:hover:border-white/28 not-disabled:hover:bg-white/7 disabled:opacity-40 [&_svg]:size-[15px]",
    variant === "primary" &&
      "border-0 bg-linear-to-b from-r1 to-r2 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_6px_20px_rgba(255,36,56,0.3)] not-disabled:hover:brightness-108",
    size === "sm" && "h-8 px-[13px] text-[12.5px]",
    spinning && "[&_svg]:animate-spin",
  );
}

export function Button({
  variant,
  size,
  spinning,
  className,
  ...props
}: ComponentProps<"button"> & ButtonOptions) {
  return (
    <button
      className={cn(buttonClass({ variant, size, spinning }), className)}
      {...props}
    />
  );
}

const ghostTones = {
  default: "",
  done: "border-green/40 text-[#7be3a0]",
  danger: "not-disabled:hover:border-r1 not-disabled:hover:text-r1",
  accent: "not-disabled:hover:border-r1 not-disabled:hover:bg-r1/10",
};

export function GhostButton({
  tone = "default",
  className,
  ...props
}: ComponentProps<"button"> & { tone?: keyof typeof ghostTones }) {
  return (
    <button
      className={cn(
        "inline-flex h-8 items-center gap-[7px] whitespace-nowrap rounded-full border border-line-2 bg-transparent px-3 text-[12.5px] text-ink-2 transition-all",
        "not-disabled:hover:border-white/30 not-disabled:hover:text-ink disabled:cursor-not-allowed disabled:opacity-35 [&_svg]:size-3.5",
        ghostTones[tone],
        className,
      )}
      {...props}
    />
  );
}

export function IconButton({ className, ...props }: ComponentProps<"button">) {
  return (
    <button
      className={cn(
        "grid size-8 flex-none place-items-center rounded-[9px] border border-transparent bg-transparent p-0 text-ink-2",
        "not-disabled:hover:border-line-2 not-disabled:hover:text-ink [&_svg]:size-4",
        className,
      )}
      {...props}
    />
  );
}

// pill shaped segmented control (sort, platform filters)
export function Seg({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex rounded-full border border-line bg-white/5 p-[3px]",
        className,
      )}
      {...props}
    />
  );
}

export function SegButton({
  active,
  className,
  ...props
}: ComponentProps<"button"> & { active: boolean }) {
  return (
    <button
      className={cn(
        "flex items-center gap-1.5 rounded-full border-0 bg-transparent px-3 py-[5px] text-xs text-ink-3 [&_svg]:size-[13px]",
        active && "bg-white/10 text-ink",
        className,
      )}
      {...props}
    />
  );
}

// small uppercase mono label
export function Label({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "font-mono text-[10px] leading-[normal] font-medium tracking-[0.18em] text-ink-3 uppercase",
        className,
      )}
      {...props}
    />
  );
}

export function SectionTitle({ className, ...props }: ComponentProps<"h2">) {
  return (
    <h2
      className={cn(
        "mb-[18px] font-mono text-[10px] leading-[normal] font-medium tracking-[0.18em] text-ink-3 uppercase",
        className,
      )}
      {...props}
    />
  );
}

// keyword tag on signal / lead cards
export function KwTag({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "max-w-[220px] truncate rounded-full border border-line bg-black/25 px-[9px] py-0.5 font-mono text-[10.5px] leading-[normal] font-medium text-ink-2",
        className,
      )}
      {...props}
    />
  );
}

export function Loading({ children }: { children: React.ReactNode }) {
  return (
    <div className="py-10 font-mono text-[11px] leading-[normal] font-medium tracking-[0.16em] text-ink-3">
      {children}
    </div>
  );
}

// thin progress bar, the <i> is the fill (gsap animates it on some pages)
export function Bar({
  pct,
  className,
  fillClassName,
  fillStyle,
}: {
  pct: number;
  className?: string;
  fillClassName?: string;
  fillStyle?: React.CSSProperties;
}) {
  return (
    <div
      className={cn("h-1 overflow-hidden rounded-[9px] bg-white/7", className)}
    >
      <i
        className={cn(
          "block h-full origin-left rounded-[9px] bg-linear-to-r from-r2 to-r1",
          fillClassName,
        )}
        style={{ width: `${pct}%`, ...fillStyle }}
      />
    </div>
  );
}

export function Switch({
  on,
  className,
  ...props
}: ComponentProps<"button"> & { on: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      className={cn(
        "relative h-[18px] w-8 flex-none rounded-full border-0 bg-white/14 p-0 transition-colors duration-200",
        on && "bg-r1",
        className,
      )}
      {...props}
    >
      <i
        className={cn(
          "absolute top-0.5 left-0.5 size-3.5 rounded-full bg-white transition-transform duration-200",
          on && "translate-x-3.5",
        )}
      />
    </button>
  );
}

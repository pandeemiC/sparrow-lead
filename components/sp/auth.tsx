import type { ComponentProps } from "react";
import { FaGithub } from "react-icons/fa";
import { cn } from "@/lib/utils";

// pieces shared by sign in, sign up and onboarding

export function GlassHead({
  title,
  sub,
  titleClassName,
}: {
  title: React.ReactNode;
  sub: React.ReactNode;
  titleClassName?: string;
}) {
  return (
    <div className="mb-[26px] flex items-baseline justify-between">
      <div
        className={cn(
          "font-display text-[30px] leading-none font-normal tracking-[-0.01em]",
          titleClassName,
        )}
      >
        {title}
      </div>
      <div className="font-mono text-[10px] leading-[normal] font-normal tracking-[0.18em] text-white/38 uppercase">
        {sub}
      </div>
    </div>
  );
}

export function AuthError({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4 rounded-[10px] border border-r1/25 bg-r1/8 px-3 py-2.5 text-[12.5px] text-[#ff8a95]">
      {children}
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-white/12 bg-black/25 px-3.5 py-[13px] font-body text-[14.5px] leading-[normal] font-light text-white outline-0 transition-[border-color,box-shadow,background-color] duration-150 placeholder:text-white/28 focus:border-r1/55 focus:bg-black/32 focus:shadow-[0_0_0_4px_rgba(255,36,56,0.1)]";

export function Field({
  label,
  htmlFor,
  reveal,
  children,
}: {
  label?: string;
  htmlFor?: string;
  // show / hide toggle for password inputs
  reveal?: { shown: boolean; onToggle: () => void };
  children: React.ReactNode;
}) {
  return (
    <div className="relative mb-[18px]">
      {label && (
        <label
          htmlFor={htmlFor}
          className="mb-2 block font-mono text-[10px] leading-[normal] font-normal tracking-[0.18em] text-white/50 uppercase"
        >
          {label}
        </label>
      )}
      {children}
      {reveal && (
        <button
          type="button"
          onClick={reveal.onToggle}
          className="absolute right-2.5 bottom-[9px] border-0 bg-transparent p-1.5 font-mono text-[10px] leading-[normal] font-normal tracking-[0.14em] text-white/50 uppercase hover:text-white"
        >
          {reveal.shown ? "Hide" : "Show"}
        </button>
      )}
    </div>
  );
}

export function AuthInput({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(inputClass, className)} {...props} />;
}

export function AuthTextarea({
  className,
  ...props
}: ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(inputClass, "resize-none leading-[1.55]", className)}
      {...props}
    />
  );
}

// big red pill button, the arrow nudges right on hover
export function SubmitButton({
  arrow = true,
  className,
  children,
  ...props
}: ComponentProps<"button"> & { arrow?: boolean }) {
  return (
    <button
      className={cn(
        "group flex h-12 w-full items-center justify-center gap-2.5 rounded-full border-0 bg-linear-to-b from-r1 to-r2 font-body text-sm leading-[normal] font-medium text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_10px_30px_rgba(255,36,56,0.35)] transition-[filter] duration-150 not-disabled:hover:brightness-108 disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {children}
      {arrow && (
        <span className="transition-transform duration-200 group-enabled:group-hover:translate-x-[3px]">
          →
        </span>
      )}
    </button>
  );
}

export function BackButton({ className, ...props }: ComponentProps<"button">) {
  return (
    <button
      className={cn(
        "h-12 flex-1 rounded-full border border-white/14 bg-white/4 font-body text-[13.5px] leading-[normal] font-normal text-white/75 transition-all duration-150 hover:border-white/28 hover:text-white",
        className,
      )}
      {...props}
    />
  );
}

export function ButtonRow({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("mt-1.5 flex gap-2.5", className)} {...props} />;
}

export function Divider({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-[22px] flex items-center gap-3.5 font-mono text-[10px] leading-[normal] font-normal tracking-[0.2em] text-white/35 uppercase before:h-px before:flex-1 before:bg-white/12 after:h-px after:flex-1 after:bg-white/12">
      {children}
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      width="15"
      height="15"
    >
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917"
      />
      <path
        fill="#FF3D00"
        d="m6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.9 11.9 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917"
      />
    </svg>
  );
}

const ssoButtonClass =
  "flex h-11 items-center justify-center gap-[9px] rounded-xl border border-white/12 bg-white/4 font-body text-[13px] leading-[normal] font-normal text-white transition-all duration-150 not-disabled:hover:border-white/25 not-disabled:hover:bg-white/7";

export function SsoButtons({
  onSelect,
}: {
  onSelect: (strategy: "oauth_google" | "oauth_github") => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-2.5 min-[561px]:grid-cols-2">
      <button
        type="button"
        className={ssoButtonClass}
        onClick={() => onSelect("oauth_google")}
      >
        <GoogleIcon />
        Google
      </button>
      <button
        type="button"
        className={ssoButtonClass}
        onClick={() => onSelect("oauth_github")}
      >
        <FaGithub size={15} />
        GitHub
      </button>
    </div>
  );
}

export function Footnote({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-[22px] text-center text-[13px] text-white/50 [&_a]:border-b [&_a]:border-white/30 [&_a]:text-white [&_a:hover]:border-r1">
      {children}
    </div>
  );
}

export function Hint({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      className={cn("-mt-1.5 mb-4 text-xs text-white/42", className)}
      {...props}
    />
  );
}

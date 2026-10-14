import Image from "next/image";
import Link from "next/link";
import sparrowLogo from "@/public/sparrow-no-text-logo.png";
import { cn } from "@/lib/utils";

// bird mark + serif wordmark, same pairing as the original logo
export default function Brand({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="Sparrow home"
      className={cn("group flex items-center gap-3", className)}
    >
      <Image
        src={sparrowLogo}
        alt=""
        width={46}
        height={30}
        priority
        className="h-auto w-[46px] drop-shadow-[0_0_8px_rgba(255,36,56,0.55)] transition-[filter] duration-500 group-hover:drop-shadow-[0_0_12px_rgba(255,36,56,0.95)]"
      />
      <span className="font-display text-[26px] leading-none tracking-[-0.01em] text-ink">
        Sparrow
      </span>
    </Link>
  );
}

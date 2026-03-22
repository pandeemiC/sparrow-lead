import { ReactNode } from "react";
import { X } from "lucide-react";

interface SignalCardProps {
  icon: ReactNode;
  source: string;
  priority: "High" | "Medium" | "Low";
  quote: string;
  match: string;
  time: string;
}

function SignalCard({ icon, source, priority, quote, match, time }: SignalCardProps) {
  const priorityStyles = {
    High: "bg-sparrow-red/20 text-sparrow-bright",
    Medium: "bg-yellow-500/20 text-yellow-400",
    Low: "bg-white/10 text-white/40",
  };

  const matchStyles = {
    High: "bg-green-500/20 text-green-400",
    Medium: "bg-green-500/20 text-green-400",
    Low: "bg-white/10 text-white/40",
  };

  return (
    <div className="signal-card transition-all duration-300">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-white/40 text-xs">{source}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${priorityStyles[priority]}`}>
            {priority}
          </span>
          <X size={14} className="text-white/20 cursor-pointer hover:text-white/40 transition-colors" />
        </div>
      </div>
      <p className="text-white/70 text-sm leading-relaxed">{quote}</p>
      <div className="mt-3 flex items-center gap-2">
        <span className={`text-[10px] px-2 py-0.5 rounded-full ${matchStyles[priority]}`}>
          {match}
        </span>
        <span className="text-[10px] text-white/30">{time}</span>
      </div>
    </div>
  );
}

export default function HeroCards() {
  return (
    <div className="fade-mask">
      <div className="grid grid-cols-2 gap-x-4 gap-y-4">
        <div className="mt-0">
          <SignalCard
            icon={<span className="bg-orange-600 rounded-sm text-white text-xs w-5 h-5 flex items-center justify-center"><span className="font-bold">R</span></span>}
            source="r/startups"
            priority="High"
            quote="&quot;We've been using Asana but it's too complex for our 5-person team. Any alternatives?&quot;"
            match="92% match"
            time="Signal hunted 2m ago"
          />
        </div>
        <div className="mt-12">
          <SignalCard
            icon={<span className="text-white text-sm font-bold">𝕏</span>}
            source="@founder_mike"
            priority="Medium"
            quote="&quot;Looking for a lightweight PM tool that doesn't require a PhD to set up. Suggestions?&quot;"
            match="87% match"
            time="Signal hunted 8m ago"
          />
        </div>
        <div className="mt-0">
          <SignalCard
            icon={<span className="bg-orange-500 rounded-sm text-white text-xs w-5 h-5 flex items-center justify-center"><span className="font-bold">Y</span></span>}
            source="Hacker News"
            priority="High"
            quote="&quot;Ask HN: What do you use for managing small team projects without the bloat?&quot;"
            match="78% match"
            time="Signal hunted 14m ago"
          />
        </div>
        <div className="mt-12">
          <SignalCard
            icon={<span className="bg-orange-600 rounded-sm text-white text-xs w-5 h-5 flex items-center justify-center"><span className="font-bold">R</span></span>}
            source="r/SaaS"
            priority="Low"
            quote="&quot;Any recommendations for tools that help track social mentions of your brand?&quot;"
            match="64% match"
            time="Signal hunted 22m ago"
          />
        </div>
      </div>
    </div>
  );
}

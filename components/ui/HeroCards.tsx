"use client";

import { ReactNode } from "react";
import { X } from "lucide-react";
import { motion } from "framer-motion";
import { FaRedditAlien, FaXTwitter, FaYCombinator } from "react-icons/fa6";

interface SignalCardProps {
  icon: ReactNode;
  source: string;
  priority: "High" | "Medium" | "Low";
  quote: string;
  match: string;
  time: string;
}

const cards: SignalCardProps[] = [
  {
    icon: <FaRedditAlien className="text-white bg-orange-500" />,
    source: "r/startups",
    priority: "High",
    quote:
      "\"We've been using Asana but it's too complex for our 5-person team. Any alternatives?\"",
    match: "92% match",
    time: "Signal hunted 2m ago",
  },
  {
    icon: <FaXTwitter className="text-white bg-slate-900" />,
    source: "@founder_mike",
    priority: "Medium",
    quote:
      '"Looking for a lightweight PM tool that doesn\'t require a PhD to set up. Suggestions?"',
    match: "87% match",
    time: "Signal hunted 8m ago",
  },
  {
    icon: <FaYCombinator className="bg-orange-400 text-white" />,
    source: "Hacker News",
    priority: "High",
    quote:
      '"Ask HN: What do you use for managing small team projects without the bloat?"',
    match: "78% match",
    time: "Signal hunted 14m ago",
  },
  {
    icon: <FaRedditAlien className="text-white bg-orange-500" />,
    source: "r/SaaS",
    priority: "Low",
    quote:
      '"Any recommendations for tools that help track social mentions of your brand?"',
    match: "64% match",
    time: "Signal hunted 22m ago",
  },
  {
    icon: <FaXTwitter className="text-white bg-slate-900" />,
    source: "@sarahbuilds",
    priority: "High",
    quote:
      '"Our team just ditched Monday.com — too expensive for what you get. What are people switching to?"',
    match: "94% match",
    time: "Signal hunted 5m ago",
  },
  {
    icon: <FaRedditAlien className="text-white bg-orange-500" />,
    source: "r/entrepreneur",
    priority: "Medium",
    quote:
      '"Need a CRM that actually works for solo founders. Salesforce is overkill. Ideas?"',
    match: "81% match",
    time: "Signal hunted 11m ago",
  },
  {
    icon: <FaYCombinator className="text-white bg-orange-400" />,
    source: "Hacker News",
    priority: "Low",
    quote:
      '"Show HN: I\'m building a tool to replace our internal project tracker. Anyone done this?"',
    match: "69% match",
    time: "Signal hunted 18m ago",
  },
  {
    icon: <FaRedditAlien className="text-white bg-orange-500" />,
    source: "r/smallbusiness",
    priority: "High",
    quote:
      '"We spend 2 hours a day on manual lead tracking. There has to be a better way."',
    match: "96% match",
    time: "Signal hunted 1m ago",
  },
];

function SignalCard({
  icon,
  source,
  priority,
  quote,
  match,
  time,
}: SignalCardProps) {
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
    <div className="signal-card transition-all duration-300 shrink-0 p-3">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-white/40 text-xs">{source}</span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${priorityStyles[priority]}`}
          >
            {priority}
          </span>
          <X
            size={14}
            className="text-white/20 cursor-pointer hover:text-white/40 transition-colors"
          />
        </div>
      </div>
      <p className="text-white/70 text-sm leading-relaxed">{quote}</p>
      <div className="mt-3 flex items-center gap-2">
        <span
          className={`text-[10px] px-2 py-0.5 rounded-full ${matchStyles[priority]}`}
        >
          {match}
        </span>
        <span className="text-[10px] text-white/30">{time}</span>
      </div>
    </div>
  );
}

function ScrollColumn({
  items,
  duration,
  offset = false,
}: {
  items: SignalCardProps[];
  duration: number;
  offset?: boolean;
}) {
  const doubled = [...items, ...items];

  return (
    <div
      className="relative h-125 overflow-hidden"
      style={{
        maskImage:
          "linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)",
        WebkitMaskImage:
          "linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)",
      }}
    >
      <motion.div
        className="flex flex-col gap-4 will-change-transform"
        initial={{ y: offset ? "-50%" : "0%" }}
        animate={{ y: offset ? "0%" : "-50%" }}
        transition={{
          duration,
          repeat: Infinity,
          ease: "linear",
          repeatType: "loop",
        }}
      >
        {doubled.map((card, i) => (
          <SignalCard
            key={`${card.source}-${i}`}
            icon={card.icon}
            source={card.source}
            priority={card.priority}
            quote={card.quote}
            match={card.match}
            time={card.time}
          />
        ))}
      </motion.div>
    </div>
  );
}

export default function HeroCards() {
  const col1 = cards.filter((_, i) => i % 2 === 0);
  const col2 = cards.filter((_, i) => i % 2 === 1);

  return (
    <div className="grid grid-cols-2 gap-4">
      <ScrollColumn items={col1} duration={80} />
      <ScrollColumn items={col2} duration={80} offset />
    </div>
  );
}

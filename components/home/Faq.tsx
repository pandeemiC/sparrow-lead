"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import Backdrop, { Glow } from "./Backdrop";

const QUESTIONS = [
  {
    q: "Who is Sparrow for?",
    a: "Anyone looking for people who need what they have, or who have what they need. Founders find customers, freelancers find clients, and anyone can find gigs, jobs or answers.",
  },
  {
    q: "How is it different from searching myself?",
    a: "Searching means checking every site by hand, one query at a time. Sparrow watches all three sources for your keywords, has AI read each new post, and ranks them by how relevant each post is, so you only open the ones worth answering.",
  },
  {
    q: "Which platforms does it watch?",
    a: "Reddit, Hacker News and Bluesky. Each keyword can listen on one, two or all three.",
  },
  {
    q: "Do I need accounts on those platforms?",
    a: "No. Sparrow only reads public posts, so there's nothing to connect or log into. When you find a post worth answering, you reply from your own account.",
  },
  {
    q: "What makes a good keyword?",
    a: "The words someone would actually write when they need you, like “looking for a CRM” or “recommend a logo designer”. Short, specific phrases beat single words. Start with three to five and pause the ones that bring noise.",
  },
  {
    q: "Can I track my own brand or a competitor?",
    a: "Yes, add the name as a keyword and you'll see new posts that mention it. Complaints about a competitor are flagged as their own type, and they're often the best leads you'll get.",
  },
  {
    q: "How soon will I see results?",
    a: "Right away. Press scan and new posts usually arrive within a minute. After that Sparrow checks again every 6 hours on its own, and can email you the best new leads if you turn that on.",
  },
  {
    q: "What does the intent score mean, and is it always right?",
    a: "It's a 1 to 10 rating of how relevant the post is, with a one-line reason. It's AI, so it can misread sarcasm or a vague post. Use it to decide what to open first, not as a final verdict.",
  },
  {
    q: "Does it work in other languages?",
    a: "Yes. Write a keyword in any language and Sparrow finds posts using those words. The AI reads and scores them too, and writes its short explanation in English.",
  },
  {
    q: "Does it post anything for me?",
    a: "Never. It drafts a reply you can edit and copy, and you post it yourself. Sparrow only reads public posts, and you can export everything it saved for you from settings.",
  },
];

export default function Faq() {
  const [open, setOpen] = useState(0);
  const { isSignedIn } = useAuth();

  return (
    <section id="faq" className="relative isolate py-28 md:py-36">
      <Backdrop tint="#1a0a0e">
        <Glow
          className="top-[20%] left-[-10%] size-140"
          color="rgba(126,15,27,0.32)"
        />
      </Backdrop>
      <div className="mx-auto grid max-w-310 gap-12 px-5 md:px-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <h2 className="font-display text-[clamp(34px,3.6vw,50px)] leading-[1.06] tracking-[-0.015em] text-balance">
            Questions before you try it.
          </h2>
          <p className="mt-5 max-w-[26em] text-[16px] leading-relaxed text-ink-2">
            The fastest answer is usually to add one keyword and run a scan. It
            takes about a minute.
          </p>
          <Link
            href={isSignedIn ? "/dashboard/keywords" : "/sign-up"}
            className="mt-8 inline-flex h-12 items-center rounded-xl bg-linear-to-b from-[#ff3446] to-r2 px-6 text-[14.5px] font-medium text-white shadow-[0_10px_40px_-10px_rgba(255,36,56,0.7),inset_0_1px_0_rgba(255,255,255,0.25)] transition-transform hover:-translate-y-px"
          >
            {isSignedIn ? "Add a keyword" : "Create a free account"}
          </Link>
        </div>

        <div className="border-t border-white/10">
          {QUESTIONS.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={item.q} className="border-b border-white/10">
                <button
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  aria-expanded={isOpen}
                  className="flex w-full cursor-pointer items-center justify-between gap-6 py-6 text-left"
                >
                  <span
                    className={cn(
                      "font-display text-[clamp(19px,1.8vw,24px)] leading-snug transition-colors",
                      isOpen ? "text-ink" : "text-ink-2 hover:text-ink",
                    )}
                  >
                    {item.q}
                  </span>
                  <span
                    className={cn(
                      "relative grid size-9 flex-none place-items-center rounded-full border transition-colors duration-300",
                      isOpen
                        ? "border-r1 bg-r1 shadow-[0_0_18px_-2px_rgba(255,36,56,0.7)]"
                        : "border-white/15",
                    )}
                  >
                    <i
                      className={cn(
                        "absolute h-px w-3.5",
                        isOpen ? "bg-white" : "bg-ink",
                      )}
                    />
                    <i
                      className={cn(
                        "absolute h-px w-3.5 transition-transform duration-300",
                        isOpen ? "rotate-0 bg-white" : "rotate-90 bg-ink",
                      )}
                    />
                  </span>
                </button>
                <div
                  className={cn(
                    "grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(.2,.8,.2,1)]",
                    isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                  )}
                >
                  <div className="overflow-hidden">
                    <p className="max-w-[40em] pr-12 pb-7 text-[15.5px] leading-relaxed text-ink-2">
                      {item.a}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

"use client";

import { PLAN_LIMITS, type Plan } from "@/lib/plans";
import { usePlan } from "@/components/dashboard/PlanContext";
import { SettingsCard } from "@/components/ui/SettingsUI";
import { SectionTitle } from "@/components/sp/ui";
import { cn } from "@/lib/utils";

const PLANS: { id: Plan; name: string }[] = [
  { id: "free", name: "Free" },
  { id: "pro", name: "Pro" },
  { id: "growth", name: "Growth" },
];

const fmt = (n: number) => n.toLocaleString("en-US");

// paid plans aren't live yet, so this page only shows what each plan includes
export default function SettingsBilling() {
  const { plan } = usePlan();

  return (
    <div className="space-y-4">
      <SettingsCard>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <SectionTitle className="mb-0">Billing</SectionTitle>
          <span className="rounded-full border border-amber/30 bg-amber/10 px-3 py-1 text-[12px] text-amber">
            Coming soon
          </span>
        </div>
        <p className="mt-3 max-w-[34rem] text-sm leading-relaxed text-ink-3">
          Paid plans aren&apos;t open yet. Everyone is on the Free plan for now,
          and nothing is charged. When Pro and Growth launch, you&apos;ll be
          able to upgrade here.
        </p>
      </SettingsCard>

      <div className="grid gap-4 md:grid-cols-3">
        {PLANS.map((p) => {
          const limits = PLAN_LIMITS[p.id];
          const current = p.id === plan;
          return (
            <SettingsCard key={p.id} className={cn(current && "border-r1/40")}>
              <div className="flex items-center justify-between gap-2">
                <p className="text-base font-semibold text-ink">{p.name}</p>
                <span className="text-[12px] text-ink-3">
                  {current ? "Your plan" : "Coming soon"}
                </span>
              </div>
              <ul className="mt-4 space-y-2 text-sm text-ink-2">
                <li>{fmt(limits.keywords)} keywords</li>
                <li>{fmt(limits.signals)} signals a month</li>
              </ul>
            </SettingsCard>
          );
        })}
      </div>
    </div>
  );
}

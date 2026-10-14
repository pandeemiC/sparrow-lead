"use client";

import { createContext, useContext } from "react";
import { PLAN_LIMITS, type Plan } from "@/lib/plans";

type PlanContextValue = {
  plan: Plan;
  limits: (typeof PLAN_LIMITS)[Plan];
};

const PlanContext = createContext<PlanContextValue>({
  plan: "free",
  limits: PLAN_LIMITS["free"],
});

export function PlanProvider({
  plan,
  children,
}: {
  plan: Plan;
  children: React.ReactNode;
}) {
  return (
    <PlanContext.Provider value={{ plan, limits: PLAN_LIMITS[plan] }}>
      {children}
    </PlanContext.Provider>
  );
}

export function usePlan() {
  return useContext(PlanContext);
}

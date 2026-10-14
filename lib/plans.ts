// source
export const PLAN_LIMITS = {
  free: { keywords: 20, signals: 1000, scans: 30 },
  pro: { keywords: 50, signals: 5000, scans: -1 },
  growth: { keywords: 100, signals: 20000, scans: -1 },
} as const;

export type Plan = keyof typeof PLAN_LIMITS;

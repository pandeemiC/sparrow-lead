// source
export const PLAN_LIMITS = {
  free:   { keywords: 5,   signals: 100,   scans: 30 },
  pro:    { keywords: 25,  signals: 2000,  scans: -1 },
  growth: { keywords: 100, signals: 10000, scans: -1 },
} as const;

export type Plan = keyof typeof PLAN_LIMITS;

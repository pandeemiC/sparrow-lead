import {
  LayoutDashboard,
  Radio,
  Tag,
  Target,
  LayoutList,
  Bell,
  ScanLine,
  CreditCard,
  KeyRound,
} from "lucide-react";

export const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Signals", href: "/dashboard/signals", icon: Radio },
  { label: "Keywords", href: "/dashboard/keywords", icon: Tag },
  { label: "Hunt Board", href: "/dashboard/hunt-board", icon: Target },
];

export const settingsItems = [
  { label: "Overview", href: "/dashboard/settings/overview", icon: LayoutList },
  { label: "Notifications", href: "/dashboard/settings/notifications", icon: Bell },
  { label: "Scan Preferences", href: "/dashboard/settings/scan", icon: ScanLine },
  { label: "Billing", href: "/dashboard/settings/billing", icon: CreditCard },
  { label: "API Keys", href: "/dashboard/settings/api", icon: KeyRound },
];

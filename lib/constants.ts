import {
  LayoutDashboard,
  Radio,
  Tag,
  Target,
  LayoutList,
  Bell,
  ScanLine,
  CreditCard,
  Shield,
  BarChart2,
  User,
} from "lucide-react";

export const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Signals", href: "/dashboard/signals", icon: Radio },
  { label: "Keywords", href: "/dashboard/keywords", icon: Tag },
  { label: "Hunt Board", href: "/dashboard/hunt-board", icon: Target },
];

export const settingsItems = [
  { label: "Overview", href: "/dashboard/settings/overview", icon: LayoutList },
  { label: "Account", href: "/dashboard/settings/account", icon: User },
  { label: "Scan Preferences", href: "/dashboard/settings/scan-preferences", icon: ScanLine },
  { label: "Notifications", href: "/dashboard/settings/notifications", icon: Bell },
  { label: "Privacy", href: "/dashboard/settings/privacy", icon: Shield },
  { label: "Billing", href: "/dashboard/settings/billing", icon: CreditCard },
  { label: "Usage", href: "/dashboard/settings/usage", icon: BarChart2 },
];

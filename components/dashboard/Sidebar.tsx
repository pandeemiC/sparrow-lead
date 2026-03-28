"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { motion } from "motion/react";
import {
  LayoutDashboard,
  Radio,
  Tag,
  Target,
  Settings,
  ChevronLeft,
} from "lucide-react";
import sparrowLogo from "@/public/sparrow-no-text-logo.png";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Signals", href: "/dashboard/signals", icon: Radio },
  { label: "Keywords", href: "/dashboard/keywords", icon: Tag },
  { label: "Hunt Board", href: "/dashboard/hunt", icon: Target },
];

export default function Sidebar() {
  return (
    <motion.aside>
      <div></div>
    </motion.aside>
  );
}

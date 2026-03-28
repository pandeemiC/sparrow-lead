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
  const [isOpen, setIsOpen] = useState(true);
  const pathname = usePathname();

  return (
    <motion.aside
      animate={{ width: isOpen ? 240 : 64 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="relative flex flex-col h-full bg-[#0d0d0d] border-r border-white/5 shrink-0 overflow-hidden"
    >
      <div className="flex items-center gap-3 px-4 h-16 border-b border-white/5 shrink-0">
        <Image
          src={sparrowLogo}
          alt="Sparrow"
          width={28}
          height={28}
          style={{ width: "auto", height: "auto" }}
        />
        {isOpen && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-white font-bold text-lg whitespace-nowrap"
          >
            Sparrow
          </motion.span>
        )}
      </div>

      <nav></nav>
    </motion.aside>
  );
}

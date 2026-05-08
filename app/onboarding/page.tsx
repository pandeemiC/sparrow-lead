"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  Code2,
  TrendingUp,
  GraduationCap,
  User,
} from "lucide-react";
import Image from "next/image";

const roles = [
  { value: "founder", label: "Founder / Business Owner", icon: Briefcase },
  { value: "developer", label: "Developer", icon: Code2 },
  { value: "marketer", label: "Marketer / Growth", icon: TrendingUp },
  { value: "student", label: "Student", icon: GraduationCap },
  { value: "other", label: "Other", icon: User },
];

export default function OnboardingPage() {
  const router = useRouter();

  const [step, setStep] = useState(1);
}

"use client";

import { motion } from "motion/react";

export default function AnimatedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#0a0202]">
      <motion.div
        className="absolute rounded-full w-[750px] h-[750px] blur-[80px] top-[-15%] left-[-10%]
          bg-[radial-gradient(ellipse_at_center,rgba(210,18,18,0.72)_0%,rgba(160,0,0,0.3)_45%,transparent_70%)]"
        animate={{ x: [0, 60, -30, 40, 0], y: [0, -60, 40, -20, 0], scale: [1, 1.1, 0.92, 1.06, 1] }}
        transition={{ duration: 9, ease: "easeInOut", repeat: Infinity }}
      />
      <motion.div
        className="absolute rounded-full w-[600px] h-[600px] blur-[70px] bottom-[-15%] right-[-20%]
          bg-[radial-gradient(ellipse_at_center,rgba(170,8,8,0.6)_0%,rgba(110,0,0,0.22)_50%,transparent_72%)]"
        animate={{ x: [0, -50, 30, -40, 0], y: [0, 50, -35, 20, 0], scale: [1, 0.9, 1.12, 0.96, 1] }}
        transition={{ duration: 11, ease: "easeInOut", repeat: Infinity, delay: 1.5 }}
      />
      <motion.div
        className="absolute rounded-full w-[450px] h-[450px] blur-[60px] top-[35%] left-[30%]
          bg-[radial-gradient(ellipse_at_center,rgba(230,30,30,0.45)_0%,rgba(180,0,0,0.15)_55%,transparent_75%)]"
        animate={{ x: [0, 40, -55, 20, 0], y: [0, -40, 55, -15, 0], scale: [1, 1.14, 0.88, 1.08, 1] }}
        transition={{ duration: 7, ease: "easeInOut", repeat: Infinity, delay: 3 }}
      />
      <div className="absolute inset-0 [background-image:var(--grain)] [background-size:256px_256px] bg-repeat mix-blend-overlay opacity-55" />
    </div>
  );
}

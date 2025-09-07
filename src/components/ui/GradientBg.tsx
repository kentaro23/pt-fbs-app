"use client";

import { motion } from "framer-motion";

export default function GradientBg() {
  return (
    <>
      <div className="pointer-events-none fixed inset-0 -z-50 bg-[radial-gradient(60%_40%_at_0%_0%,rgba(59,130,246,0.12),transparent),radial-gradient(40%_40%_at_100%_100%,rgba(16,185,129,0.12),transparent)]" />
      <div className="pointer-events-none fixed inset-0 -z-40 opacity-[0.06] [background-image:url('data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'160\' height=\'160\' viewBox=\'0 0 10 10\'><circle cx=\'1\' cy=\'1\' r=\'1\' fill=\'%23000\' opacity=\'0.7\'/></svg>')]" />
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="pointer-events-none fixed inset-x-0 top-[-10%] -z-30 h-[40vh] bg-gradient-to-b from-white/30 to-transparent dark:from-white/5"
      />
    </>
  );
}



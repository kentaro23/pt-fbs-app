"use client";

import { useEffect, useState } from "react";

interface DashboardClientProps {
  children: React.ReactNode;
}

export default function DashboardClient({ children }: DashboardClientProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div style={{ display: "none" }} data-dashboard-client="loading" />;
  }

  return (
    <div data-dashboard-client="mounted">
      {children}
    </div>
  );
}

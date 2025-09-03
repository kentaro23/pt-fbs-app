"use client";
import { useEffect, useState } from "react";

export default function ClientRefGuard() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  // 確実にクライアント参照を生成するため、実際の状態を使用
  if (!mounted) {
    return null;
  }

  return <span data-client-ref="1" style={{ display: "none" }} />;
}

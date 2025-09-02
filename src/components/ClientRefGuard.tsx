"use client";
import { useEffect } from "react";

export default function ClientRefGuard() {
  // 副作用を持たせて最適化（tree-shake）対象から外す
  useEffect(() => {
    // no-op: client reference marker
  }, []);
  return <span data-client-ref="1" style={{ display: "none" }} />;
}

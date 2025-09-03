"use client";

import { useEffect, useState } from "react";

export default function ClientReferenceMarker() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // クライアント参照を確実に生成するためのマーカー
  return (
    <div style={{ display: "none" }} data-client-reference-marker="true">
      {isClient ? "client" : "server"}
    </div>
  );
}

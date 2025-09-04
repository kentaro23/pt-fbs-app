"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const [expanded, setExpanded] = useState(false);
  useEffect(() => {
    // 本番でも詳細をコンソールに残す
    console.error("App error:", error);
  }, [error]);
  return (
    <div className="min-h-dvh grid place-items-center p-6">
      <div className="max-w-xl w-full space-y-4 text-center">
        <h1 className="text-2xl font-bold">エラーが発生しました</h1>
        <p className="text-muted-foreground">{error?.message || "予期せぬエラーです"}</p>
        {error?.digest && (
          <p className="text-xs text-muted-foreground">digest: {error.digest}</p>
        )}
        <div className="flex justify-center gap-2">
          <Button onClick={() => reset()}>再試行</Button>
          <Button asChild variant="outline">
            <Link href="/">ホームへ戻る</Link>
          </Button>
          <Button variant="ghost" onClick={() => setExpanded(v => !v)}>詳細</Button>
        </div>
        {expanded && (
          <pre className="mt-2 max-h-72 overflow-auto rounded bg-muted p-3 text-left text-xs">
            {String(error?.stack || "(no stack)")}
          </pre>
        )}
      </div>
    </div>
  );
}



"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type Props = {
  children?: React.ReactNode;
  submittingText?: string;
  className?: string;
  variant?: React.ComponentProps<typeof Button>["variant"];
  size?: React.ComponentProps<typeof Button>["size"];
};

export function SubmitButton({
  children,
  submittingText = "送信中...",
  className,
  variant,
  size,
}: Props) {
  const [submitting, setSubmitting] = useState(false);
  return (
    <Button
      type="submit"
      onClick={() => setSubmitting(true)}
      disabled={submitting}
      aria-busy={submitting}
      aria-live="polite"
      variant={variant}
      size={size}
      className={className}
    >
      {submitting ? submittingText : children}
    </Button>
  );
}



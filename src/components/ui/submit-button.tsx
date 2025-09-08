"use client";

import { useFormStatus } from "react-dom";
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
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      aria-live="polite"
      variant={variant}
      size={size}
      className={className}
    >
      {pending ? submittingText : children}
    </Button>
  );
}



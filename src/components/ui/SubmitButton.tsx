"use client";

import { Loader2 } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

interface SubmitButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  pending: boolean;
  pendingLabel?: ReactNode;
}

const BASE_CLASSES =
  "w-full h-11 flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed";

export function SubmitButton({ pending, pendingLabel, className, children, disabled, ...rest }: SubmitButtonProps) {
  return (
    <button type="submit" {...rest} disabled={disabled || pending} className={className ?? BASE_CLASSES}>
      {pending ? (
        <>
          <Loader2 size={16} className="animate-spin shrink-0" aria-hidden />
          {pendingLabel != null && <span>{pendingLabel}</span>}
        </>
      ) : (
        children
      )}
    </button>
  );
}

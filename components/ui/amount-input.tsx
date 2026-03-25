"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface AmountInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  currency?: string;
}

export const AmountInput = forwardRef<HTMLInputElement, AmountInputProps>(
  ({ className, currency = "RUB", ...props }, ref) => {
    return (
      <div className="relative flex items-center">
        <input
          ref={ref}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          placeholder="0.00"
          className={cn(
            "h-9 w-full min-w-0 rounded-md border border-input bg-background pr-14 pl-3 text-[0.9375rem] transition-colors outline-none",
            "placeholder:text-muted-foreground",
            "focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20",
            "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
            className
          )}
          {...props}
        />
        <span className="pointer-events-none absolute right-3 text-[0.875rem] text-muted-foreground select-none">
          {currency}
        </span>
      </div>
    );
  }
);

AmountInput.displayName = "AmountInput";

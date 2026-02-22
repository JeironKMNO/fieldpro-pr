"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "../lib/utils";

const Checkbox = React.forwardRef<
  React.ElementRef<"button">,
  React.ComponentPropsWithoutRef<"button"> & {
    checked?: boolean | "indeterminate";
    onCheckedChange?: (checked: boolean | "indeterminate") => void;
  }
>(({ className, checked, onCheckedChange, ...props }, ref) => {
  const [internalChecked, setInternalChecked] = React.useState<boolean | "indeterminate">(checked ?? false);
  
  const isControlled = checked !== undefined;
  const isChecked = isControlled ? checked : internalChecked;
  
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const newValue = isChecked === true ? false : true;
    if (!isControlled) {
      setInternalChecked(newValue);
    }
    onCheckedChange?.(newValue);
    props.onClick?.(e);
  };

  return (
    <button
      ref={ref}
      type="button"
      role="checkbox"
      aria-checked={isChecked === "indeterminate" ? "mixed" : isChecked}
      onClick={handleClick}
      className={cn(
        "peer h-4 w-4 shrink-0 rounded-sm border border-steel-600 ring-offset-steel-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-gold data-[state=checked]:text-steel-950",
        isChecked && "bg-gold border-gold",
        className
      )}
      {...props}
    >
      {isChecked === true && (
        <Check className="h-3 w-3 text-steel-950" strokeWidth={3} />
      )}
      {isChecked === "indeterminate" && (
        <div className="h-0.5 w-2 mx-auto bg-steel-950" />
      )}
    </button>
  );
});
Checkbox.displayName = "Checkbox";

export { Checkbox };

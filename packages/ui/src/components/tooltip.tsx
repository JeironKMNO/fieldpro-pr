"use client";

import * as React from "react";
import { cn } from "../lib/utils";

interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  className?: string;
}

const Tooltip = ({ children, content, side = "top", className }: TooltipProps) => {
  const [isVisible, setIsVisible] = React.useState(false);
  
  const sideClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
  };

  const arrowClasses = {
    top: "top-full left-1/2 -translate-x-1/2 -mt-1 border-l-transparent border-r-transparent border-b-transparent",
    right: "right-full top-1/2 -translate-y-1/2 -ml-1 border-t-transparent border-b-transparent border-l-transparent",
    bottom: "bottom-full left-1/2 -translate-x-1/2 -mb-1 border-l-transparent border-r-transparent border-t-transparent",
    left: "left-full top-1/2 -translate-y-1/2 -mr-1 border-t-transparent border-b-transparent border-r-transparent",
  };

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className={cn("absolute z-50", sideClasses[side], className)}>
          <div className="px-3 py-1.5 text-xs font-medium text-white bg-steel-800 rounded-lg shadow-lg border border-steel-700 whitespace-nowrap">
            {content}
          </div>
          <div className={cn("absolute w-2 h-2 border-4 border-steel-800", arrowClasses[side])} />
        </div>
      )}
    </div>
  );
};

export { Tooltip };

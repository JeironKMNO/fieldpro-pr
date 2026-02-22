"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../lib/utils";

interface AccordionItem {
  id: string;
  title: React.ReactNode;
  content: React.ReactNode;
}

interface AccordionProps {
  items: AccordionItem[];
  defaultExpanded?: string[];
  className?: string;
  allowMultiple?: boolean;
}

const Accordion = ({
  items,
  defaultExpanded = [],
  className,
  allowMultiple = false,
}: AccordionProps) => {
  const [expanded, setExpanded] = React.useState<string[]>(defaultExpanded);

  const toggleItem = (id: string) => {
    setExpanded((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }
      if (allowMultiple) {
        return [...prev, id];
      }
      return [id];
    });
  };

  return (
    <div className={cn("space-y-2", className)}>
      {items.map((item) => {
        const isExpanded = expanded.includes(item.id);
        return (
          <div
            key={item.id}
            className="rounded-lg border border-steel-800 bg-steel-900/50 overflow-hidden"
          >
            <button
              onClick={() => toggleItem(item.id)}
              className="flex w-full items-center justify-between px-4 py-3 text-left font-medium text-white hover:bg-steel-800/50 transition-colors"
            >
              <span>{item.title}</span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 text-steel-400 transition-transform duration-200",
                  isExpanded && "rotate-180"
                )}
              />
            </button>
            <div
              className={cn(
                "overflow-hidden transition-all duration-200",
                isExpanded ? "max-h-96" : "max-h-0"
              )}
            >
              <div className="px-4 pb-4 text-sm text-steel-400">
                {item.content}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export { Accordion };

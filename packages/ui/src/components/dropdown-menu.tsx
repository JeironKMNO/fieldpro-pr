"use client";

import * as React from "react";
import { Check, ChevronRight, Circle } from "lucide-react";
import { cn } from "../lib/utils";

const DropdownMenu = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <DropdownMenuContext.Provider value={{ isOpen, setIsOpen }}>
      <div ref={containerRef} className="relative inline-block">
        {children}
      </div>
    </DropdownMenuContext.Provider>
  );
};

const DropdownMenuContext = React.createContext<{
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
}>({ isOpen: false, setIsOpen: () => {} });

const useDropdownMenu = () => React.useContext(DropdownMenuContext);

const DropdownMenuTrigger = ({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) => {
  const { isOpen, setIsOpen } = useDropdownMenu();
  
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement, {
      onClick: () => setIsOpen(!isOpen),
    });
  }
  
  return (
    <button onClick={() => setIsOpen(!isOpen)}>
      {children}
    </button>
  );
};

const DropdownMenuContent = ({
  children,
  className,
  align = "center",
}: {
  children: React.ReactNode;
  className?: string;
  align?: "start" | "center" | "end";
}) => {
  const { isOpen } = useDropdownMenu();
  
  if (!isOpen) return null;

  const alignClasses = {
    start: "left-0",
    center: "left-1/2 -translate-x-1/2",
    end: "right-0",
  };

  return (
    <div
      className={cn(
        "absolute z-50 mt-2 min-w-[8rem] overflow-hidden rounded-md border border-steel-800 bg-steel-900 p-1 text-steel-200 shadow-lg",
        alignClasses[align],
        className
      )}
    >
      {children}
    </div>
  );
};

const DropdownMenuItem = ({
  children,
  className,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}) => {
  const { setIsOpen } = useDropdownMenu();
  
  return (
    <button
      disabled={disabled}
      onClick={() => {
        onClick?.();
        setIsOpen(false);
      }}
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-steel-800 hover:text-white focus:bg-steel-800 focus:text-white disabled:pointer-events-none disabled:opacity-50",
        className
      )}
    >
      {children}
    </button>
  );
};

const DropdownMenuSeparator = ({ className }: { className?: string }) => (
  <div className={cn("-mx-1 my-1 h-px bg-steel-800", className)} />
);

const DropdownMenuLabel = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("px-2 py-1.5 text-xs font-semibold text-steel-500", className)}>
    {children}
  </div>
);

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
};

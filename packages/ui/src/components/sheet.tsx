"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "../lib/utils";

interface SheetProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const SheetContext = React.createContext<{
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
}>({ isOpen: false, setIsOpen: () => {} });

const useSheet = () => React.useContext(SheetContext);

const Sheet = ({ children, open, onOpenChange }: SheetProps) => {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;

  const setIsOpen = (value: boolean) => {
    if (!isControlled) setInternalOpen(value);
    onOpenChange?.(value);
  };

  return (
    <SheetContext.Provider value={{ isOpen, setIsOpen }}>
      {children}
    </SheetContext.Provider>
  );
};

const SheetTrigger = ({
  children,
  asChild,
}: {
  children: React.ReactNode;
  asChild?: boolean;
}) => {
  const { setIsOpen } = useSheet();

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(
      children as React.ReactElement<{ onClick: () => void }>,
      {
        onClick: () => setIsOpen(true),
      }
    );
  }

  return <button onClick={() => setIsOpen(true)}>{children}</button>;
};

const SheetClose = ({ children }: { children: React.ReactNode }) => {
  const { setIsOpen } = useSheet();

  return <button onClick={() => setIsOpen(false)}>{children}</button>;
};

const SheetContent = ({
  children,
  className,
  side = "right",
}: {
  children: React.ReactNode;
  className?: string;
  side?: "left" | "right" | "top" | "bottom";
}) => {
  const { isOpen, setIsOpen } = useSheet();

  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sideClasses = {
    left: "inset-y-0 left-0 h-full w-3/4 max-w-sm",
    right: "inset-y-0 right-0 h-full w-3/4 max-w-sm",
    top: "inset-x-0 top-0 w-full h-auto",
    bottom: "inset-x-0 bottom-0 w-full h-auto",
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-steel-950/80 backdrop-blur-sm transition-opacity"
        onClick={() => setIsOpen(false)}
      />
      {/* Sheet */}
      <div
        className={cn(
          "fixed z-50 bg-steel-900 shadow-2xl border-steel-800",
          side === "left" || side === "right" ? "border-l" : "border-t",
          sideClasses[side],
          className
        )}
      >
        <button
          onClick={() => setIsOpen(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-steel-900 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2"
        >
          <X className="h-4 w-4 text-steel-400" />
        </button>
        <div className="h-full overflow-auto p-6">{children}</div>
      </div>
    </>
  );
};

const SheetHeader = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={cn(
      "flex flex-col space-y-2 text-center sm:text-left",
      className
    )}
  >
    {children}
  </div>
);

const SheetTitle = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <h2 className={cn("text-lg font-semibold text-white", className)}>
    {children}
  </h2>
);

const SheetDescription = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => <p className={cn("text-sm text-steel-400", className)}>{children}</p>;

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
};

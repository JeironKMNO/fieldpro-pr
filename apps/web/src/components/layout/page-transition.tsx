"use client";

import { usePathname } from "next/navigation";
import { ReactNode, useEffect, useRef, useState } from "react";

interface PageTransitionProps {
  children: ReactNode;
}

/**
 * Lightweight CSS-only page transition — no framer-motion overhead.
 * Simple opacity fade-in on mount: fast, silky, zero jank.
 */
export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const [displayChildren, setDisplayChildren] = useState(children);
  const [isVisible, setIsVisible] = useState(true);
  const prevPathname = useRef(pathname);

  useEffect(() => {
    if (pathname === prevPathname.current) return;
    prevPathname.current = pathname;

    // Instant swap — just fade the new content in
    setIsVisible(false);
    setDisplayChildren(children);

    const t = requestAnimationFrame(() => {
      setIsVisible(true);
    });

    return () => cancelAnimationFrame(t);
  }, [pathname, children]);

  // Keep children updated if not navigating
  useEffect(() => {
    if (pathname === prevPathname.current) {
      setDisplayChildren(children);
    }
  }, [children, pathname]);

  return (
    <div
      style={{
        opacity: isVisible ? 1 : 0,
        transition: "opacity 0.12s ease-out",
        willChange: "opacity",
        height: "100%",
      }}
    >
      {displayChildren}
    </div>
  );
}

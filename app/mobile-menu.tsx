"use client";

import { useRef } from "react";

// Sluit het mobiele menu zodra er op een link wordt geklikt.
export default function MobileMenu({ label, children }: { label: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDetailsElement>(null);
  return (
    <details
      ref={ref}
      className="mobile-menu"
      onClick={(e) => {
        if ((e.target as HTMLElement).closest("a")) ref.current?.removeAttribute("open");
      }}
    >
      <summary aria-label={label}><span /><span /></summary>
      <div className="mobile-panel">{children}</div>
    </details>
  );
}

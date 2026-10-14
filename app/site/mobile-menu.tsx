"use client";

import { useRef } from "react";

/** Mobiel menu dat sluit zodra een link wordt aangeklikt. */
export default function MobileMenu({ label, children }: { label: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDetailsElement>(null);
  return (
    <details
      ref={ref}
      className="menu"
      onClick={(e) => {
        if ((e.target as HTMLElement).closest("a")) ref.current?.removeAttribute("open");
      }}
    >
      <summary aria-label={label}>
        <span />
        <span />
      </summary>
      <nav className="menu-panel" aria-label={label}>
        {children}
      </nav>
    </details>
  );
}

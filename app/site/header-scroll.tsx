"use client";

import { useEffect } from "react";

/** Geeft de header een vaste achtergrond zodra er gescrold wordt. */
export default function HeaderScroll() {
  useEffect(() => {
    const header = document.querySelector(".header");
    if (!header) return;
    const update = () => header.classList.toggle("is-solid", window.scrollY > 24);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  return null;
}

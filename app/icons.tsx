import type { IconName } from "./i18n";

const paths: Record<IconName, React.ReactNode> = {
  // Stucspaan
  trowel: (
    <>
      <path d="M5 21h14l-2-6H7z" />
      <path d="M12 15V9" />
      <path d="M9.5 9h5V5.5a2.5 2.5 0 0 0-5 0z" />
    </>
  ),
  // Verfroller
  roller: (
    <>
      <rect x="3" y="3" width="15" height="6" rx="1" />
      <path d="M18 6h2.5v5H11v3" />
      <rect x="9.5" y="14" width="3" height="7" rx="0.5" />
    </>
  ),
  // Tegels
  tiles: (
    <>
      <rect x="3" y="3" width="8" height="8" />
      <rect x="13" y="3" width="8" height="8" />
      <rect x="3" y="13" width="8" height="8" />
      <rect x="13" y="13" width="8" height="8" />
    </>
  ),
  // Vloerdelen
  floor: (
    <>
      <path d="M3 20 9 4" />
      <path d="M9 20 15 4" />
      <path d="M15 20 21 4" />
      <path d="M2 20h20" />
    </>
  ),
  // Deur
  door: (
    <>
      <path d="M5 21V3h14v18" />
      <path d="M3 21h18" />
      <circle cx="15.5" cy="12.5" r="0.75" fill="currentColor" />
    </>
  ),
  // Keukenkast
  kitchen: (
    <>
      <rect x="3" y="9" width="18" height="12" />
      <path d="M12 9v12" />
      <path d="M2 9h20" />
      <path d="M9 13v2M15 13v2" />
      <path d="M7 3v3M12 3v3M17 3v3" />
    </>
  ),
  // Sloophamer
  hammer: (
    <>
      <path d="m14 5 5 5" />
      <path d="M11.5 7.5 16.5 2.5l5 5-5 5" />
      <path d="M14 10 4 20" />
    </>
  ),
  // Woning (dakhoek uit het logo)
  house: (
    <>
      <path d="M3 11 12 3l9 8" />
      <path d="M6 9v12h12V9" />
      <path d="M10 21v-6h4v6" />
    </>
  ),
};

export function Icon({ name }: { name: IconName }) {
  return (
    <svg
      className="icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

export function PhoneIcon() {
  return (
    <svg className="icon-inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z" />
    </svg>
  );
}

export function WhatsAppIcon() {
  return (
    <svg className="icon-inline" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3z" />
    </svg>
  );
}

export function ArrowIcon() {
  return (
    <svg className="icon-inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function CheckIcon() {
  return (
    <svg className="icon-inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m4 12.5 5 5L20 6.5" />
    </svg>
  );
}

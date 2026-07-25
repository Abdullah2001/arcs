import type { Metadata } from "next";
import { headers } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") ??
    requestHeaders.get("host") ??
    "localhost:3000";
  const protocol =
    requestHeaders.get("x-forwarded-proto") ??
    (host.startsWith("localhost") ? "http" : "https");
  const ogImage = new URL("/og.png", `${protocol}://${host}`).toString();
  const title = "AR Civil Solutions | Renovatiebedrijf Eindhoven";
  const description =
    "AR Civil Solutions verzorgt stucwerk, schilderwerk, tegelwerk, vloeren, montage, keukenwerk, sloopwerk en complete renovaties in Eindhoven en omgeving.";

  return {
    title,
    description,
    icons: {
      icon: "/images/brand/logo-square.png",
      shortcut: "/images/brand/logo-square.png",
    },
    openGraph: {
      title,
      description,
      type: "website",
      locale: "nl_NL",
      images: [
        {
          url: ogImage,
          width: 1729,
          height: 910,
          alt: "AR Civil Solutions — Van uitdaging naar oplossing",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}

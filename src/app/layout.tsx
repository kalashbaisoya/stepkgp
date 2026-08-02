import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

// Plus Jakarta Sans: rounded, low-contrast letterforms that read smoothly
// against the soft clay surfaces.
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "STEP · IIT Kharagpur Incubation Management Platform",
    template: "%s · STEP IIT KGP",
  },
  description:
    "Science & Technology Entrepreneurs' Park, IIT Kharagpur. Building deep-tech ventures since 1986.",
  metadataBase: new URL(process.env.APP_URL ?? "http://localhost:3000"),
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "STEP IIT Kharagpur",
  url: process.env.APP_URL ?? "http://localhost:3000",
  logo: `${process.env.APP_URL ?? "http://localhost:3000"}/icon.png`,
  description:
    "Science & Technology Entrepreneurs' Park, IIT Kharagpur. Building deep-tech ventures since 1986.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={jakarta.variable} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}

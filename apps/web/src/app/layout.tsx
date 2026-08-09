import type { ReactNode, ReactElement } from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"),
  title: {
    default: "VIP Maths — Question Bank & Paper Generator",
    template: "%s | VIP Maths",
  },
  description:
    "Teacher-first mathematics question bank and deterministic exam paper generation platform for schools, tuition centers, and colleges.",
  applicationName: "VIP Maths",
  authors: [{ name: "VIP Maths Team" }],
  keywords: [
    "VIP Maths",
    "Mathematics Question Bank",
    "Exam Paper Generator",
    "Question Bank",
    "Teacher Tools",
    "Indian Academic Curriculum",
  ],
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
      { url: "/brand/icon/vip-maths-icon-64.png", type: "image/png", sizes: "64x64" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    title: "VIP Maths — Question Bank & Paper Generator",
    description:
      "Original, clean-room educational question bank and deterministic paper generation platform.",
    siteName: "VIP Maths",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "VIP Maths",
      },
    ],
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>): ReactElement {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}

import type { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: "VIP Maths",
  description: "Teacher-first mathematics question bank and paper generation platform",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

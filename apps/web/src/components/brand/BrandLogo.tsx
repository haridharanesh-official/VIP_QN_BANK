import type { ReactElement } from "react";
import Image from "next/image";
import Link from "next/link";

interface BrandLogoProps {
  readonly size?: "sm" | "md" | "lg";
  readonly showLink?: boolean;
  readonly className?: string;
}

export function BrandLogo({
  size = "md",
  showLink = true,
  className = "",
}: BrandLogoProps): ReactElement {
  const dimensions = {
    sm: { width: 140, height: 140 },
    md: { width: 200, height: 200 },
    lg: { width: 280, height: 280 },
  }[size];

  const content = (
    <div
      aria-label="VIP Maths"
      className={`inline-flex flex-col items-center justify-center ${className}`}
      style={{ display: "inline-flex", flexDirection: "column", alignItems: "center" }}
    >
      <Image
        src="/brand/logo/vip-maths-full-optimized.webp"
        alt="VIP Maths"
        width={dimensions.width}
        height={dimensions.height}
        priority={size === "lg" || size === "md"}
        style={{ objectFit: "contain", height: "auto" }}
      />
    </div>
  );

  if (showLink) {
    return (
      <Link href="/dashboard" className="inline-flex focus-visible:outline-none" aria-label="VIP Maths Home">
        {content}
      </Link>
    );
  }

  return content;
}

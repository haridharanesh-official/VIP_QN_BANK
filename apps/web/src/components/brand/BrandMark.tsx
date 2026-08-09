import type { ReactElement } from "react";
import Image from "next/image";
import Link from "next/link";

interface BrandMarkProps {
  readonly size?: number;
  readonly showText?: boolean;
  readonly showLink?: boolean;
}

export function BrandMark({
  size = 36,
  showText = true,
  showLink = true,
}: BrandMarkProps): ReactElement {
  const content = (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "10px",
        textDecoration: "none",
      }}
    >
      <Image
        src="/brand/icon/vip-maths-icon-192.png"
        alt="VIP Maths"
        width={size}
        height={size}
        style={{
          borderRadius: "8px",
          objectFit: "contain",
          flexShrink: 0,
        }}
      />
      {showText && (
        <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
          <span
            style={{
              fontSize: "1.125rem",
              fontWeight: 850,
              color: "#ffffff",
              letterSpacing: "-0.01em",
            }}
          >
            VIP Maths
          </span>
          <span
            style={{
              fontSize: "0.6875rem",
              fontWeight: 700,
              color: "var(--brand-orange)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginTop: "2px",
            }}
          >
            Question Bank
          </span>
        </div>
      )}
    </div>
  );

  if (showLink) {
    return (
      <Link
        href="/dashboard"
        style={{ textDecoration: "none", display: "inline-flex" }}
        aria-label="VIP Maths Dashboard"
      >
        {content}
      </Link>
    );
  }

  return content;
}

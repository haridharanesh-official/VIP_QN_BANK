import type { ReactElement, ReactNode } from "react";

export interface BadgeProps {
  readonly variant?: "approved" | "draft" | "pending" | "danger" | "default";
  readonly children: ReactNode;
}

export function Badge({ variant = "default", children }: BadgeProps): ReactElement {
  const badgeClass = variant !== "default" ? `badge-${variant}` : "";
  return <span className={`badge ${badgeClass}`.trim()}>{children}</span>;
}

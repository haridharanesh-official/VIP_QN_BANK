import type { ReactElement } from "react";

export interface SkeletonProps {
  readonly width?: string;
  readonly height?: string;
  readonly className?: string;
}

export function Skeleton({
  width = "100%",
  height = "20px",
  className = "",
}: SkeletonProps): ReactElement {
  return <div className={`skeleton ${className}`.trim()} style={{ width, height }} />;
}

export function SkeletonCard(): ReactElement {
  return (
    <div className="card" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <Skeleton width="40%" height="16px" />
      <Skeleton width="80%" height="24px" />
      <Skeleton width="60%" height="16px" />
    </div>
  );
}

export function SkeletonTable(): ReactElement {
  return (
    <div className="table-container" style={{ padding: "16px" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <Skeleton width="100%" height="32px" />
        <Skeleton width="100%" height="24px" />
        <Skeleton width="100%" height="24px" />
        <Skeleton width="100%" height="24px" />
      </div>
    </div>
  );
}

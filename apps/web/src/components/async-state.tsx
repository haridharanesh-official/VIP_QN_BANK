import type { ReactElement, ReactNode } from "react";
import { EmptyState as UIEmptyState } from "./ui/EmptyState";
import { ErrorState as UIErrorState } from "./ui/ErrorState";
import { SkeletonCard } from "./ui/Skeleton";

export function LoadingState(): ReactElement {
  return (
    <div style={{ display: "grid", gap: "16px", margin: "24px 0" }}>
      <SkeletonCard />
      <SkeletonCard />
    </div>
  );
}

export function ErrorState({
  title,
  message,
  onRetry,
}: {
  readonly title?: string;
  readonly message: string;
  readonly onRetry?: () => void;
}): ReactElement {
  return <UIErrorState title={title} message={message} onRetry={onRetry} />;
}

export function EmptyState({
  title,
  message,
  action,
}: {
  readonly title?: string;
  readonly message: string;
  readonly action?: ReactNode;
}): ReactElement {
  return <UIEmptyState title={title} message={message} action={action} />;
}

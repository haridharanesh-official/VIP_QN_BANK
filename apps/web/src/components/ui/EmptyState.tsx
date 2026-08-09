import type { ReactElement, ReactNode } from "react";

export interface EmptyStateProps {
  readonly title?: string;
  readonly message?: string;
  readonly action?: ReactNode;
}

export function EmptyState({
  title = "No items found",
  message = "There are no records to display at this time.",
  action,
}: EmptyStateProps): ReactElement {
  return (
    <div className="empty-state">
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-desc">{message}</p>
      {action && <div style={{ marginTop: "12px" }}>{action}</div>}
    </div>
  );
}

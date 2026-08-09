import type { ReactElement, ReactNode } from "react";
import { Button } from "./Button";

export interface ErrorStateProps {
  readonly title?: string;
  readonly message?: string;
  readonly onRetry?: () => void;
  readonly action?: ReactNode;
}

export function ErrorState({
  title = "Something went wrong",
  message = "An error occurred while loading this data.",
  onRetry,
  action,
}: ErrorStateProps): ReactElement {
  return (
    <div className="error-state" role="alert">
      <h3 className="error-state-title">{title}</h3>
      <p className="error-state-desc">{message}</p>
      {(onRetry || action) && (
        <div style={{ marginTop: "12px", display: "flex", gap: "8px" }}>
          {onRetry && (
            <Button variant="secondary" size="sm" onClick={onRetry}>
              Try again
            </Button>
          )}
          {action}
        </div>
      )}
    </div>
  );
}

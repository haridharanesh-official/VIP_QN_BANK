import type { ReactElement, ReactNode } from "react";

export interface AlertProps {
  readonly variant?: "danger" | "success" | "warning" | "info";
  readonly children: ReactNode;
  readonly className?: string;
}

export function Alert({ variant = "danger", children, className = "" }: AlertProps): ReactElement {
  return (
    <div className={`alert alert-${variant} ${className}`.trim()} role="alert">
      <div>{children}</div>
    </div>
  );
}

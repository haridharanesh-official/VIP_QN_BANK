import type { ReactElement, ReactNode } from "react";

export interface CardProps {
  readonly title?: string;
  readonly action?: ReactNode;
  readonly children: ReactNode;
  readonly className?: string;
}

export function Card({ title, action, children, className = "" }: CardProps): ReactElement {
  return (
    <article className={`card ${className}`.trim()}>
      {(title || action) && (
        <div className="card-title-bar">
          {title && <h2>{title}</h2>}
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </article>
  );
}

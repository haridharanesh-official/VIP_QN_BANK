import type { ReactElement, ReactNode } from "react";

export interface PageHeaderProps {
  readonly title: string;
  readonly description?: string;
  readonly eyebrow?: string;
  readonly actions?: ReactNode;
}

export function PageHeader({
  title,
  description,
  eyebrow,
  actions,
}: PageHeaderProps): ReactElement {
  return (
    <header className="page-header no-print">
      <div>
        {eyebrow && <span className="eyebrow-tag">{eyebrow}</span>}
        <h1 className="page-header-title">{title}</h1>
        {description && <p className="page-header-description">{description}</p>}
      </div>
      {actions && <div className="page-header-actions">{actions}</div>}
    </header>
  );
}

export interface PageContainerProps {
  readonly children: ReactNode;
  readonly className?: string;
}

export function PageContainer({ children, className = "" }: PageContainerProps): ReactElement {
  return <main id="main-content" className={`app-content ${className}`.trim()}>{children}</main>;
}

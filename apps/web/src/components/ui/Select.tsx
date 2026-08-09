import type { ReactElement, SelectHTMLAttributes } from "react";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  readonly label?: string;
  readonly error?: string;
}

export function Select({
  label,
  error,
  id,
  className = "",
  children,
  ...props
}: SelectProps): ReactElement {
  const selectId = id ?? (label ? `select-${label.toLowerCase().replace(/\s+/g, "-")}` : undefined);

  return (
    <div className="form-group">
      {label && (
        <label htmlFor={selectId} className="form-label">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`select ${error ? "error" : ""} ${className}`.trim()}
        aria-invalid={Boolean(error)}
        {...props}
      >
        {children}
      </select>
      {error && <span className="form-error">{error}</span>}
    </div>
  );
}

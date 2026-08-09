import type { InputHTMLAttributes, ReactElement } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  readonly label?: string;
  readonly helperText?: string;
  readonly error?: string;
}

export function Input({
  label,
  helperText,
  error,
  id,
  className = "",
  ...props
}: InputProps): ReactElement {
  const inputId = id ?? (label ? `input-${label.toLowerCase().replace(/\s+/g, "-")}` : undefined);

  return (
    <div className="form-group">
      {label && (
        <label htmlFor={inputId} className="form-label">
          {label}
          {helperText && <small>{helperText}</small>}
        </label>
      )}
      <input
        id={inputId}
        className={`input ${error ? "error" : ""} ${className}`.trim()}
        aria-invalid={Boolean(error)}
        aria-describedby={error && inputId ? `${inputId}-error` : undefined}
        {...props}
      />
      {error && (
        <span id={inputId ? `${inputId}-error` : undefined} className="form-error">
          {error}
        </span>
      )}
    </div>
  );
}

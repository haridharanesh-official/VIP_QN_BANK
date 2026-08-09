import type { ReactElement, TextareaHTMLAttributes } from "react";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  readonly label?: string;
  readonly helperText?: string;
  readonly error?: string;
}

export function Textarea({
  label,
  helperText,
  error,
  id,
  className = "",
  ...props
}: TextareaProps): ReactElement {
  const textareaId =
    id ?? (label ? `textarea-${label.toLowerCase().replace(/\s+/g, "-")}` : undefined);

  return (
    <div className="form-group">
      {label && (
        <label htmlFor={textareaId} className="form-label">
          {label}
          {helperText && <small>{helperText}</small>}
        </label>
      )}
      <textarea
        id={textareaId}
        className={`textarea ${error ? "error" : ""} ${className}`.trim()}
        aria-invalid={Boolean(error)}
        aria-describedby={error && textareaId ? `${textareaId}-error` : undefined}
        {...props}
      />
      {error && (
        <span id={textareaId ? `${textareaId}-error` : undefined} className="form-error">
          {error}
        </span>
      )}
    </div>
  );
}

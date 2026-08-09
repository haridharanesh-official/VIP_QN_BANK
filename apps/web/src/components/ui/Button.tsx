import type { ButtonHTMLAttributes, ReactElement, ReactNode } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: "primary" | "secondary" | "quiet" | "danger";
  readonly size?: "sm" | "md" | "lg";
  readonly loading?: boolean;
  readonly children: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  children,
  className = "",
  type = "button",
  ...props
}: ButtonProps): ReactElement {
  const variantClass = `btn-${variant}`;
  const sizeClass = size !== "md" ? `btn-${size}` : "";

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`btn ${variantClass} ${sizeClass} ${className}`.trim()}
      {...props}
    >
      {loading ? (
        <>
          <span
            style={{
              display: "inline-block",
              width: "14px",
              height: "14px",
              border: "2px solid currentColor",
              borderRightColor: "transparent",
              borderRadius: "50%",
              animation: "spin 0.6s linear infinite",
            }}
            aria-hidden="true"
          />
          <span>Loading…</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}

"use client";

import type { ReactElement } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandMark } from "../brand/BrandMark";
import { MAIN_NAVIGATION, SETTINGS_NAVIGATION } from "../../config/navigation";

interface SidebarProps {
  readonly institutionName?: string;
  readonly userRole?: string;
  readonly onSignOut: () => void;
  readonly isMobileOpen?: boolean;
  readonly onCloseMobile?: () => void;
}

export function Sidebar({
  institutionName,
  userRole,
  onSignOut,
  isMobileOpen = false,
  onCloseMobile,
}: SidebarProps): ReactElement {
  const pathname = usePathname();

  return (
    <aside
      className={`app-sidebar ${isMobileOpen ? "mobile-open" : ""}`}
      aria-label="Main Navigation"
    >
      <div className="sidebar-header">
        <BrandMark size={36} showText={true} />
      </div>

      <nav className="sidebar-nav">
        {MAIN_NAVIGATION.filter(item => !item.requiredRole || !userRole || item.requiredRole.includes(userRole)).map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-link ${isActive ? "active" : ""}`}
              onClick={onCloseMobile}
              aria-current={isActive ? "page" : undefined}
            >
              <span>{item.label}</span>
            </Link>
          );
        })}

        <div className="sidebar-section-label">
          Settings
        </div>

        {SETTINGS_NAVIGATION.filter(item => !item.requiredRole || !userRole || item.requiredRole.includes(userRole)).map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-link ${isActive ? "active" : ""}`}
              onClick={onCloseMobile}
              aria-current={isActive ? "page" : undefined}
            >
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        {institutionName && (
          <div>
            <span className="institution-pill" title={`Active Institution: ${institutionName}`}>
              {institutionName}
            </span>
          </div>
        )}
        <button
          type="button"
          className="btn btn-quiet sidebar-signout-btn"
          onClick={onSignOut}
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}

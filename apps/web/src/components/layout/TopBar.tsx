"use client";

import type { ReactElement } from "react";
import { BrandMark } from "../brand/BrandMark";

interface TopBarProps {
  readonly onToggleMobileMenu: () => void;
  readonly onSignOut: () => void;
}

export function TopBar({ onToggleMobileMenu, onSignOut }: TopBarProps): ReactElement {
  return (
    <header className="app-topbar">
      <div className="topbar-left">
        <button
          type="button"
          className="mobile-menu-toggle"
          onClick={onToggleMobileMenu}
          aria-label="Toggle navigation menu"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <div style={{ display: "flex", alignItems: "center" }}>
          <BrandMark size={28} showText={true} />
        </div>
      </div>

      <div className="topbar-right">
        <button
          type="button"
          className="btn btn-quiet btn-sm"
          onClick={onSignOut}
        >
          Sign out
        </button>
      </div>
    </header>
  );
}

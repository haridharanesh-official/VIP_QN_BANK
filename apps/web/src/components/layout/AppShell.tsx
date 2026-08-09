"use client";

import { useState, type ReactNode, type ReactElement } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { PageContainer } from "./PageContainer";
import { createClient } from "../../lib/supabase/client";
import { clearBrowserSession } from "../../lib/auth-route-policy";

interface AppShellProps {
  readonly children: ReactNode;
  readonly institutionName?: string;
  readonly userRole?: string;
}

export function AppShell({ children, institutionName, userRole }: AppShellProps): ReactElement {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleSignOut(): Promise<void> {
    await clearBrowserSession(() => createClient().auth.signOut(), localStorage);
    router.replace("/login");
    router.refresh();
  }

  return (
    <div className="app-shell">
      <Sidebar
        institutionName={institutionName}
        userRole={userRole}
        onSignOut={handleSignOut}
        isMobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div
        className={`mobile-nav-backdrop ${mobileOpen ? "open" : ""}`}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />

      <div className="app-main">
        <TopBar
          onToggleMobileMenu={() => setMobileOpen((prev) => !prev)}
          onSignOut={handleSignOut}
        />
        <PageContainer>{children}</PageContainer>
      </div>
    </div>
  );
}

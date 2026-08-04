"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode, ReactElement } from "react";
import { createClient } from "../lib/supabase/client";
import { clearBrowserSession } from "../lib/auth-route-policy";
const links = [["/dashboard", "Overview"], ["/questions", "Question bank"], ["/blueprints", "Blueprints"], ["/papers", "Saved papers"]] as const;
export function AppShell({ children }: { readonly children: ReactNode }): ReactElement {
  const pathname = usePathname(); const router = useRouter();
  async function logout(): Promise<void> { await clearBrowserSession(() => createClient().auth.signOut(), localStorage); router.replace("/login"); router.refresh(); }
  return <main className="shell"><aside className="sidebar"><Link className="brand" href="/dashboard">VIP Maths</Link><nav>{links.map(([href, label]) => <Link key={href} className={pathname.startsWith(href) ? "active" : ""} href={href}>{label}</Link>)}</nav><button className="quiet logout" onClick={logout}>Sign out</button></aside><section className="content">{children}</section></main>;
}

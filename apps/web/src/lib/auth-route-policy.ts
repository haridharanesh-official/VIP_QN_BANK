const protectedPaths = ["/dashboard", "/questions", "/blueprints", "/papers"];
const guestPaths = ["/login", "/register"];

export function authRedirect(pathname: string, authenticated: boolean): string | null {
  if (!authenticated && protectedPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`))) return "/login";
  if (authenticated && guestPaths.includes(pathname)) return "/dashboard";
  return null;
}

export async function clearBrowserSession(signOut: () => Promise<unknown>, storage: Pick<Storage, "removeItem">): Promise<void> {
  await signOut();
  storage.removeItem("edugen_institution_id");
}

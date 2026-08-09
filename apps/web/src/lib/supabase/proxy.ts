import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { supabaseConfig } from "./config";
import { authRedirect } from "../auth-route-policy";

function copySessionCookies(source: NextResponse, target: NextResponse): NextResponse {
  source.cookies.getAll().forEach((cookie) => target.cookies.set(cookie));
  for (const header of ["cache-control", "expires", "pragma"]) {
    const value = source.headers.get(header);
    if (value) target.headers.set(header, value);
  }
  return target;
}

export async function updateSession(request: NextRequest): Promise<NextResponse> {
  let response = NextResponse.next({ request });
  const { url, publishableKey } = supabaseConfig();
  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet, headers) => {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        Object.entries(headers).forEach(([name, value]) => response.headers.set(name, value));
      },
    },
  });
  const { data, error } = await supabase.auth.getClaims();
  const authenticated = request.cookies.has("edugen_access") || (!error && Boolean(data?.claims?.sub));
  const pathname = request.nextUrl.pathname;
  const redirectPath = authRedirect(pathname, authenticated);
  if (redirectPath === "/login") {
    const destination = request.nextUrl.clone();
    destination.pathname = "/login";
    destination.searchParams.set("next", pathname);
    return copySessionCookies(response, NextResponse.redirect(destination));
  }
  if (redirectPath === "/dashboard") {
    const destination = request.nextUrl.clone();
    destination.pathname = "/dashboard";
    destination.search = "";
    return copySessionCookies(response, NextResponse.redirect(destination));
  }
  return response;
}

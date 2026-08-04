import { NextResponse, type NextRequest } from "next/server";
import { API_URL } from "../../../lib/api";
import { createClient } from "../../../lib/supabase/server";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const destination = request.nextUrl.clone();
  const code = request.nextUrl.searchParams.get("code");
  if (!code) { destination.pathname = "/login"; destination.search = "?error=confirmation_failed"; return NextResponse.redirect(destination); }
  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data.session) { destination.pathname = "/login"; destination.search = "?error=confirmation_failed"; return NextResponse.redirect(destination); }
  const metadata = data.user.user_metadata;
  const profile = { firstName: metadata.firstName, lastName: metadata.lastName, institutionName: metadata.institutionName, institutionType: metadata.institutionType };
  const response = await fetch(`${API_URL}/auth/supabase/bootstrap`, { method: "POST", headers: { authorization: `Bearer ${data.session.access_token}`, "content-type": "application/json" }, body: JSON.stringify(profile), cache: "no-store" });
  const result = await response.json().catch(() => null) as { memberships?: readonly { institutionId: string }[] } | null;
  if (!response.ok || !result?.memberships?.[0]) { destination.pathname = "/login"; destination.search = "?error=setup_failed"; return NextResponse.redirect(destination); }
  destination.pathname = "/dashboard";
  destination.search = "";
  destination.searchParams.set("institution", result.memberships[0].institutionId);
  return NextResponse.redirect(destination);
}

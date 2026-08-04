import { createBrowserClient } from "@supabase/ssr";
import { supabaseConfig } from "./config";

let browserClient: ReturnType<typeof createBrowserClient> | undefined;
export function createClient(): ReturnType<typeof createBrowserClient> {
  const { url, publishableKey } = supabaseConfig();
  browserClient ??= createBrowserClient(url, publishableKey);
  return browserClient;
}

export function developmentAuthBypassEnabled(): boolean {
  const enabled = process.env.DEV_AUTH_BYPASS === "true";
  if (process.env.NODE_ENV === "production" && enabled) throw new Error("DEV_AUTH_BYPASS is forbidden in production.");
  return process.env.NODE_ENV === "development" && enabled;
}

export function browserDevelopmentAuthBypassEnabled(): boolean {
  const enabled = process.env.NEXT_PUBLIC_DEV_AUTH_BYPASS === "true";
  if (process.env.NODE_ENV === "production" && enabled) throw new Error("NEXT_PUBLIC_DEV_AUTH_BYPASS is forbidden in production.");
  return process.env.NODE_ENV === "development" && enabled;
}

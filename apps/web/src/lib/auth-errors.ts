export function authErrorMessage(code: string | undefined, fallback: string): string {
  switch (code) {
    case "invalid_credentials": return "Email or password is incorrect.";
    case "email_not_confirmed": return "Confirm your email before signing in.";
    case "user_already_exists": return "An account already exists for this email.";
    case "weak_password": return "Use at least 10 characters with uppercase, lowercase, and a number.";
    case "over_email_send_rate_limit": return "Please wait before requesting another confirmation email.";
    default: return fallback;
  }
}

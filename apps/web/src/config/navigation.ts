export interface NavItemConfig {
  readonly id: string;
  readonly href: string;
  readonly label: string;
  readonly requiredRole?: readonly string[];
  readonly featureFlag?: string;
}

export const MAIN_NAVIGATION: readonly NavItemConfig[] = [
  { id: "dashboard", href: "/dashboard", label: "Dashboard" },
  { id: "questions", href: "/questions", label: "Question Bank" },
  { id: "review", href: "/questions/review", label: "Review Queue", requiredRole: ["OWNER", "MANAGER", "REVIEWER"] },
  { id: "blueprints", href: "/blueprints", label: "Blueprints" },
  { id: "papers", href: "/papers", label: "Generated Papers" },
] as const;

export const SETTINGS_NAVIGATION: readonly NavItemConfig[] = [
  { id: "institution-branding", href: "/settings/institution", label: "Institution Branding", requiredRole: ["OWNER", "MANAGER"] },
] as const;

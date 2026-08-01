import { isDevTestModeEnabled } from "@/lib/test-mode";

export type AppRole = "CITOYEN" | "AGENT" | "OFFICIER" | "PROPRIETAIRE";

const OWNER_MODE_KEY = "kronodoc_owner_mode";
const OWNER_EMAIL_PREFIXES = ["owner", "admin", "proprietaire", "kronodoc"];

export const ROLE_OPTIONS: Array<{ value: AppRole; label: string; helper: string }> = [
  {
    value: "CITOYEN",
    label: "Citoyen / Usager",
    helper: "Je demande un acte d'état civil ou un document public.",
  },
  {
    value: "AGENT",
    label: "Agent de guichet / Mairie",
    helper: "Je traite les dossiers et vérifie les pièces au guichet.",
  },
  {
    value: "OFFICIER",
    label: "Officier / Valideur",
    helper: "Je valide, signe et scelle les actes officiels.",
  },
];

export function isOwnerModeEnabled(): boolean {
  if (typeof window === "undefined") return false;

  const params = new URLSearchParams(window.location.search);
  const urlOwnerFlag = params.get("owner") === "1";
  const storageFlag = window.localStorage.getItem(OWNER_MODE_KEY) === "1";

  return urlOwnerFlag || storageFlag;
}

export function enableOwnerMode(): void {
  if (typeof window === "undefined") return;

  const url = new URL(window.location.href);
  url.searchParams.set("owner", "1");
  window.localStorage.setItem(OWNER_MODE_KEY, "1");
  window.history.replaceState({}, "", url.toString());
}

export function disableOwnerMode(): void {
  if (typeof window === "undefined") return;

  const url = new URL(window.location.href);
  url.searchParams.delete("owner");
  window.localStorage.removeItem(OWNER_MODE_KEY);
  window.history.replaceState({}, "", url.toString());
}

export function normalizeRole(role: unknown): AppRole | null {
  if (typeof role !== "string") return null;

  const normalized = role.trim().toUpperCase();
  if (normalized === "CITOYEN" || normalized === "USAGER") return "CITOYEN";
  if (normalized === "AGENT" || normalized === "GUICHET") return "AGENT";
  if (normalized === "OFFICIER" || normalized === "VALIDATEUR") return "OFFICIER";
  if (
    normalized === "PROPRIETAIRE" ||
    normalized === "OWNER" ||
    normalized === "ADMIN" ||
    normalized === "ADMINISTRATEUR"
  )
    return "PROPRIETAIRE";

  return null;
}

export function getUserRole(
  user:
    | { user_metadata?: { role?: unknown }; app_metadata?: { role?: unknown }; email?: string }
    | null
    | undefined,
): AppRole | null {
  if (!user) return null;

  const metadataRole = user.user_metadata?.role ?? user.app_metadata?.role ?? null;
  const normalizedRole = normalizeRole(metadataRole);
  if (normalizedRole) return normalizedRole;

  const email = user.email?.toLowerCase() ?? "";
  if (OWNER_EMAIL_PREFIXES.some((prefix) => email.includes(prefix))) {
    return "PROPRIETAIRE";
  }

  return "CITOYEN";
}

export function isRoleBypassEnabled(): boolean {
  return isOwnerModeEnabled();
}

export function getRoleHomePath(role: AppRole | null | undefined): string {
  switch (role) {
    case "AGENT":
      return "/agent";
    case "OFFICIER":
    case "PROPRIETAIRE":
      return "/officier";
    case "CITOYEN":
    default:
      return "/citoyen";
  }
}

export function canAccessRoute(role: AppRole | null | undefined, route: string): boolean {
  const normalizedRole = role ?? "CITOYEN";

  if (isRoleBypassEnabled() && normalizedRole === "PROPRIETAIRE") {
    return true;
  }

  if (route === "/citoyen") return normalizedRole === "CITOYEN";
  if (route === "/agent")
    return (
      normalizedRole === "AGENT" ||
      normalizedRole === "OFFICIER" ||
      normalizedRole === "PROPRIETAIRE"
    );
  if (route === "/officier")
    return normalizedRole === "OFFICIER" || normalizedRole === "PROPRIETAIRE";

  return true;
}

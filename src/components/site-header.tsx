import { Link } from "@tanstack/react-router";
import { ShieldCheck, UserCircle2 } from "lucide-react";
import { useSession } from "@/hooks/use-session";

export function SiteHeader() {
  const { user, loading } = useSession();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div className="ci-flag-bar h-1 w-full" />
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <ShieldCheck className="h-5 w-5" strokeWidth={2.4} />
          </div>
          <div className="leading-tight">
            <div className="font-display text-base font-bold tracking-tight text-foreground">
              KronoDoc <span className="text-primary">CI</span>
            </div>
            <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              État civil digital
            </div>
          </div>
        </Link>
        <nav className="hidden items-center gap-1 text-sm font-medium md:flex">
          <NavLink to="/citoyen">Portail Citoyen</NavLink>
          <NavLink to="/agent">Guichet Agent</NavLink>
          <NavLink to="/officier">Console Officier</NavLink>
          <NavLink to="/verifier">Vérifier un document</NavLink>
        </nav>
        {loading ? (
          <div className="h-9 w-28 animate-pulse rounded-md bg-muted" />
        ) : user ? (
          <Link
            to="/mon-espace"
            className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          >
            <UserCircle2 className="h-4 w-4" />
            Mon espace
          </Link>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              to="/auth"
              className="hidden h-9 items-center rounded-md border border-input bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-accent sm:inline-flex"
            >
              Connexion
            </Link>
            <Link
              to="/auth"
              className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
            >
              Faire une demande
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="rounded-md px-3 py-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      activeProps={{ className: "text-foreground bg-muted" }}
    >
      {children}
    </Link>
  );
}

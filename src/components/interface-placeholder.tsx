import { Link } from "@tanstack/react-router";
import { ArrowLeft, Construction } from "lucide-react";
import type { ReactNode } from "react";
import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";

interface Props {
  eyebrow: string;
  title: string;
  description: string;
  features: string[];
  phase: string;
  accent?: "orange" | "green" | "ink";
  icon?: ReactNode;
}

export function InterfacePlaceholder({
  eyebrow,
  title,
  description,
  features,
  phase,
  icon,
}: Props) {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à l'accueil
        </Link>

        <div className="mt-8 rounded-2xl border border-border bg-card p-8 shadow-[var(--shadow-institutional)] sm:p-10">
          <div className="flex items-start gap-5">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
              {icon}
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-primary">
                {eyebrow}
              </div>
              <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                {title}
              </h1>
              <p className="mt-3 max-w-2xl text-muted-foreground">{description}</p>
            </div>
          </div>

          <div className="mt-8 rounded-xl border border-dashed border-border bg-muted/40 p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Construction className="h-4 w-4 text-primary" />
              {phase}
            </div>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Cette interface sera construite dans une phase à venir de la
              feuille de route. Voici ce qu'elle contiendra&nbsp;:
            </p>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {features.map((f) => (
                <li
                  key={f}
                  className="flex items-start gap-2 rounded-md bg-card px-3 py-2 text-sm text-foreground shadow-sm"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  FileText,
  PlusCircle,
  User,
  LogOut,
  Clock,
  CheckCircle2,
  Archive,
  RefreshCw,
  Download,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const Route = createFileRoute("/mon-espace")({
  head: () => ({
    meta: [
      { title: "Mon Espace — KronoDoc CI" },
      {
        name: "description",
        content:
          "Suivez vos demandes, retrouvez vos documents et renouvelez vos actes en un clic.",
      },
    ],
  }),
  component: MonEspacePage,
});

// Interface pour typer les données d'un dossier dans l'espace citoyen
interface DossierCitoyen {
  id: string;
  doc: string;
  date: string;
  statut: "En attente de signature" | "Archivé" | "Rejeté";
  icon: React.ElementType;
  color: string;
  actions: ("download" | "renew")[];
}

// En production, cette liste serait chargée depuis une API backend pour l'utilisateur connecté
const DOSSIERS_CITOYEN: DossierCitoyen[] = [
  {
    id: "KDC-2026-08122",
    doc: "Certificat de résidence",
    date: "Aujourd'hui à 11:45",
    statut: "En attente de signature",
    icon: Clock,
    color: "text-amber-500",
    actions: [] as ("download" | "renew")[],
  },
  {
    id: "KDC-2025-98471",
    doc: "Extrait d'acte de naissance",
    date: "14 mars 2025",
    statut: "Archivé",
    icon: Archive,
    color: "text-muted-foreground",
    actions: ["download", "renew"] as ("download" | "renew")[],
  },
  {
    id: "KDC-2024-51109",
    doc: "Légalisation de signature",
    date: "02 septembre 2024",
    statut: "Archivé",
    icon: Archive,
    color: "text-muted-foreground",
    actions: ["download"] as ("download" | "renew")[],
  },
];

function MonEspacePage() {
  return (
    <div className="min-h-screen bg-muted/40">
      <SiteHeader />

      <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
              Mon Espace
            </h1>
            <p className="mt-1 text-muted-foreground">
              Suivez vos demandes et retrouvez tous vos documents.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold text-foreground">
                Kouassi Aya Marie
              </span>
            </div>
            <Link
              to="/"
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-institutional)]">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <h2 className="text-lg font-semibold text-foreground">
              Mes demandes
            </h2>
            <Link
              to="/citoyen"
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
            >
              <PlusCircle className="h-4 w-4" />
              Nouvelle demande
            </Link>
          </div>

          <div className="mt-4 flow-root">
            {/* Affichage des dossiers du citoyen */}
            <ul className="-my-4 divide-y divide-border">
              {DOSSIERS_CITOYEN.map((dossier) => (
                <li
                  key={dossier.id}
                  className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 py-4"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`grid h-9 w-9 place-items-center rounded-lg bg-muted ${dossier.color}`}
                    >
                      <dossier.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-foreground">
                        {dossier.doc}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {dossier.id} · {dossier.date}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                        dossier.statut === "En attente de signature"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {dossier.statut}
                    </div>
                    <div className="flex items-center gap-2">
                      {dossier.actions.includes("download") && (
                        <button className="grid h-8 w-8 place-items-center rounded-md border bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                          <Download className="h-4 w-4" />
                        </button>
                      )}
                      {/* Le bouton "Renouveler" est une fonctionnalité clé pour les extraits d'acte */}
                      {dossier.actions.includes("renew") && (
                        <button className="inline-flex h-8 items-center gap-1.5 rounded-md border border-primary/50 bg-primary/10 px-3 text-xs font-semibold text-primary transition-colors hover:bg-primary/20">
                          <RefreshCw className="h-3.5 w-3.5" />
                          Renouveler
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link
            to="/"
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            Retour à l'accueil
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
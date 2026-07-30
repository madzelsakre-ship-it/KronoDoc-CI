import { createFileRoute, Link } from "@tanstack/react-router";
import {
  PlusCircle,
  User,
  LogOut,
  Clock,
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

// --- C. Machine d'états détaillée ---
// Typage précis des statuts possibles pour un dossier, comme demandé.
type DossierStatus =
  | "BROUILLON"
  | "SOUMIS"
  | "PAIEMENT_EN_ATTENTE"
  | "EN_CONTROLE_AGENT"
  | "A_COMPLETER"
  | "REJETE_AGENT"
  | "EN_ATTENTE_SIGNATURE"
  | "SIGNE"
  | "ARCHIVE"
  | "ANNULE";

// Interface pour typer les données d'un dossier, intégrant la machine d'états.
interface DossierCitoyen {
  id: string;
  doc: string;
  date: string;
  statut: DossierStatus;
  actions: ("download" | "renew" | "complete" | "pay")[];
}

// En production, cette liste serait chargée depuis une API backend pour l'utilisateur connecté
const DOSSIERS_CITOYEN: DossierCitoyen[] = [
  {
    id: "KDC-2025-98471",
    doc: "Extrait d'acte de naissance",
    date: "14 mars 2025",
    statut: "SIGNE",
    actions: ["download", "renew"],
  },
  {
    id: "KDC-2024-51109",
    doc: "Légalisation de signature",
    date: "02 septembre 2024",
    statut: "ARCHIVE",
    actions: ["download"],
  },
  {
    id: "KDC-2026-08122",
    doc: "Certificat de résidence",
    date: "Aujourd'hui à 11:45",
    statut: "EN_ATTENTE_SIGNATURE",
    actions: [],
  },
  {
    id: "KDC-2026-08120",
    doc: "Certificat de vie",
    date: "Hier à 16:20",
    statut: "A_COMPLETER",
    actions: ["complete"],
  },
  {
    id: "KDC-2026-08115",
    doc: "Certificat de résidence",
    date: "Il y a 2 jours",
    statut: "REJETE_AGENT",
    actions: [],
  },
  {
    id: "KDC-2026-08111",
    doc: "Extrait d'acte de mariage",
    date: "Il y a 3 jours",
    statut: "BROUILLON",
    actions: ["complete"],
  },
  {
    id: "KDC-2026-08109",
    doc: "Permis d'inhumer",
    date: "Il y a 4 jours",
    statut: "ANNULE",
    actions: [],
  },
];

// --- Composant pour afficher le statut du dossier ---
function StatusPill({ status }: { status: DossierStatus }) {
  const statusMap: Record<
    DossierStatus,
    {
      label: string;
      icon: React.ElementType;
      color: string;
    }
  > = {
    BROUILLON: {
      label: "Brouillon",
      icon: FileText,
      color: "bg-gray-100 text-gray-600",
    },
    SOUMIS: {
      label: "Soumis",
      icon: FileClock,
      color: "bg-blue-100 text-blue-800",
    },
    PAIEMENT_EN_ATTENTE: {
      label: "Paiement requis",
      icon: Hourglass,
      color: "bg-amber-100 text-amber-800",
    },
    EN_CONTROLE_AGENT: {
      label: "En contrôle",
      icon: FileClock,
      color: "bg-blue-100 text-blue-800",
    },
    A_COMPLETER: {
      label: "À compléter",
      icon: FileWarning,
      color: "bg-yellow-100 text-yellow-800",
    },
    REJETE_AGENT: {
      label: "Rejeté",
      icon: XCircle,
      color: "bg-red-100 text-red-800",
    },
    EN_ATTENTE_SIGNATURE: {
      label: "Prêt pour signature",
      icon: Clock,
      color: "bg-purple-100 text-purple-800",
    },
    SIGNE: {
      label: "Signé et disponible",
      icon: CheckCircle2,
      color: "bg-green-100 text-green-800",
    },
    ARCHIVE: {
      label: "Archivé",
      icon: Archive,
      color: "bg-gray-100 text-gray-600",
    },
    ANNULE: {
      label: "Annulé",
      icon: XCircle,
      color: "bg-red-100 text-red-800",
    },
  };

  const { label, icon: Icon, color } = statusMap[status] || statusMap.BROUILLON;

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${color}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </div>
  );
}

// Helper pour afficher la bonne icône à gauche de la ligne
function StatusIcon({ status }: { status: DossierStatus }) {
  const iconMap: Record<DossierStatus, React.ElementType> = {
    BROUILLON: FileText,
    SOUMIS: FileClock,
    PAIEMENT_EN_ATTENTE: Hourglass,
    EN_CONTROLE_AGENT: FileClock,
    A_COMPLETER: FileWarning,
    REJETE_AGENT: XCircle,
    EN_ATTENTE_SIGNATURE: Clock,
    SIGNE: CheckCircle2,
    ARCHIVE: Archive,
    ANNULE: XCircle,
  };
  const colorMap: Record<DossierStatus, string> = {
    BROUILLON: "text-gray-500",
    SOUMIS: "text-blue-500",
    PAIEMENT_EN_ATTENTE: "text-amber-500",
    EN_CONTROLE_AGENT: "text-blue-500",
    A_COMPLETER: "text-yellow-500",
    REJETE_AGENT: "text-red-500",
    EN_ATTENTE_SIGNATURE: "text-purple-500",
    SIGNE: "text-green-500",
    ARCHIVE: "text-gray-500",
    ANNULE: "text-red-500",
  };

  const Icon = iconMap[status] || FileQuestion;
  const color = colorMap[status] || "text-gray-500";
  return <div className={`grid h-9 w-9 place-items-center rounded-lg bg-muted ${color}`}><Icon className="h-4 w-4" /></div>
}

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
                  <div className="flex min-w-0 items-center gap-3">
                    {/* L'icône est maintenant déterminée par le statut */}
                    <StatusIcon status={dossier.statut} />
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
                    <StatusPill status={dossier.statut} />
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
                      {dossier.actions.includes("complete") && (
                        <button className="inline-flex h-8 items-center gap-1.5 rounded-md border border-primary/50 bg-primary/10 px-3 text-xs font-semibold text-primary transition-colors hover:bg-primary/20">
                          <RefreshCw className="h-3.5 w-3.5" />
                          Compléter
                        </button>
                      )}
                      {dossier.actions.includes("pay") && (
                        <button className="inline-flex h-8 items-center gap-1.5 rounded-md border border-amber-500/50 bg-amber-500/10 px-3 text-xs font-semibold text-amber-700 transition-colors hover:bg-amber-500/20">
                          Payer
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
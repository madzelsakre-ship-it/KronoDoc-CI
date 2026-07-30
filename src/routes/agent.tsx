import { createFileRoute, Link, redirect, useRouter } from "@tanstack/react-router";
import {
  ArrowLeft,
  ScanLine,
  CheckCircle2,
  XCircle,
  Clock,
  FileCheck2,
  AlertTriangle,
  Camera,
  User,
  Home,
  CreditCard,
  ArrowRight,
  Search,
  Bell,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { supabase } from "@/integrations/supabase/client";
import { getQueue, Dossier } from "@/lib/mock-data";
import { SiteFooter } from "@/components/site-footer";

export const Route = createFileRoute("/agent")({
  head: () => ({
    meta: [
      { title: "Guichet Agent — KronoDoc CI" },
      {
        name: "description",
        content:
          "Dashboard des agents de guichet : scan QR, OCR des pièces originales, comparaison automatique et validation en un clic.",
      },
      { property: "og:title", content: "Guichet Agent — KronoDoc CI" },
      {
        property: "og:description",
        content:
          "Scannez le QR, comparez les pièces, validez. L'agent devient valideur, plus dactylographe.",
      },
    ],
  }),
  // --- Sécurisation de la route ---
  // Ce bloc s'exécute avant que la page ne soit rendue.
  beforeLoad: async ({ location }) => {
    const { data: { session } } = await supabase.auth.getSession();
    // Si l'utilisateur n'est pas connecté, on le redirige vers la page de connexion.
    if (!session) {
      throw redirect({
        to: "/auth",
        search: {
          // Après connexion, il sera redirigé vers la page qu'il tentait d'accéder.
          redirect: location.href,
        },
      });
    }

    // Vérifie si l'utilisateur a le rôle "AGENT" ou "OFFICIER" (un officier peut voir la console agent)
    const userRole = session.user?.user_metadata?.role;
    if (userRole !== 'AGENT' && userRole !== 'OFFICIER') {
      // Si l'utilisateur n'a pas le bon rôle, on le redirige vers l'accueil.
      throw redirect({ to: '/' });
    }
  },
  component: AgentPage,
});

function AgentPage() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Hero */}
      <section className="border-b border-border bg-gradient-to-b from-muted/50 to-background">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à l'accueil
          </Link>

          <div className="mt-6 grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                Interface 2 · Agents de guichet
              </div>
              <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                L'agent devient <span className="text-primary">valideur</span>,
                plus dactylographe.
              </h1>
              <p className="mt-4 max-w-xl text-lg text-muted-foreground">
                Un scan de QR injecte tout le dossier. L'OCR compare les pièces
                originales automatiquement. Il ne reste qu'à cocher la
                checklist et à valider.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <MiniStat value="< 45 s" label="par dossier" />
                <MiniStat value="0" label="ressaisie" />
                <MiniStat value="100 %" label="traçabilité" />
              </div>
            </div>

            {/* Aperçu file d'attente */}
            <QueuePreview onRefresh={() => {
              // Force le re-rendu de la page pour afficher les nouvelles données
              router.invalidate();
            }} />
          </div>
        </div>
      </section>

      {/* Workflow guichet */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="max-w-2xl">
          <h2 className="font-display text-3xl font-bold tracking-tight text-foreground">
            3 gestes. Une validation.
          </h2>
          <p className="mt-3 text-muted-foreground">
            Le workflow au guichet a été pensé pour être maîtrisé en 15 minutes
            de formation.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          <StepCard
            step="01"
            icon={<ScanLine className="h-5 w-5" />}
            title="Scanner le QR citoyen"
            desc="Le dossier pré-rempli s'affiche instantanément à l'écran. Nom, adresse, justificatif, paiement — tout est déjà là."
          />
          <StepCard
            step="02"
            icon={<Camera className="h-5 w-5" />}
            title="Scanner les originaux"
            desc="CNI, facture CIE/SODECI. L'OCR extrait les données et les compare automatiquement avec la pré-demande."
          />
          <StepCard
            step="03"
            icon={<CheckCircle2 className="h-5 w-5" />}
            title="Valider et transmettre"
            desc="Un clic. Le dossier passe à l'officier pour signature. Le citoyen est notifié en temps réel."
          />
        </div>
      </section>

      {/* Dashboard mockup */}
      <section className="border-y border-border bg-muted/30 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Aperçu — Dashboard agent
            </div>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-foreground">
              Un dossier ouvert au guichet
            </h2>
            <p className="mt-3 text-muted-foreground">
              Exemple : demande de certificat de résidence — Mme Kouassi Adjoua,
              présentée au guichet 3 de la mairie de Cocody.
            </p>
          </div>

          <DossierMockup />
        </div>
      </section>

      {/* Bénéfices agent */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Benefit
            icon={<Clock className="h-5 w-5" />}
            title="Fini les files d'attente"
            desc="Traitement en < 45 s. Un agent absorbe 4× plus de dossiers par jour."
          />
          <Benefit
            icon={<AlertTriangle className="h-5 w-5" />}
            title="Fini les erreurs de saisie"
            desc="Les noms de rue, dates, numéros de lot ne sont jamais retapés."
          />
          <Benefit
            icon={<FileCheck2 className="h-5 w-5" />}
            title="Fini la paperasse"
            desc="Le registre papier reste imprimable, mais tout est déjà archivé."
          />
          <Benefit
            icon={<CheckCircle2 className="h-5 w-5" />}
            title="Fini le stress"
            desc="Chaque action est tracée. L'agent est protégé, la mairie aussi."
          />
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function MiniStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-lg border border-border bg-card px-4 py-3">
      <div className="font-display text-xl font-bold text-primary">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function StepCard({
  step,
  icon,
  title,
  desc,
}: {
  step: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-institutional)]">
      <div className="absolute right-4 top-4 font-display text-4xl font-black text-muted/60">
        {step}
      </div>
      <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <h3 className="mt-4 font-display text-lg font-bold text-foreground">
        {title}
      </h3>
      <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}

function QueuePreview({ onRefresh }: { onRefresh: () => void }) {
  // --- Lecture des données depuis la source partagée ---
  const items = getQueue();

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-elevated)]">
      <div className="flex items-center justify-between border-b border-border bg-muted/50 px-5 py-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
          </span>
          File d'attente — Guichet 3
        </div>
        <button onClick={onRefresh} className="text-xs text-muted-foreground hover:text-foreground">
          Actualiser
        </button>
      </div>
      <ul className="divide-y divide-border">
        {items.map((it, i) => (
          <li key={i} className="flex items-center justify-between px-5 py-3">
            <div className="flex items-center gap-3">
              <div className="grid h-8 w-8 place-items-center rounded-full bg-muted text-xs font-semibold text-foreground">
                {it.avatar}
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground">{it.nom}</div>
                <div className="text-xs text-muted-foreground">{it.doc}</div>
              </div>
            </div>
            <StatusPill status={it.statut} color={it.color} textColor={it.textColor} />
          </li>
        ))}
      </ul>
      <div className="border-t border-border bg-muted/40 px-5 py-2.5 text-xs text-muted-foreground">
        14 dossiers traités ce matin · Temps moyen 42 s
      </div>
    </div>
  );
}

function StatusPill({ status, color, textColor }: { status: Dossier['statut']; color: string; textColor: string }) {
  const map: Record<Dossier['statut'], { text: string; cls: string }> = {
    en_attente: { text: "En attente", cls: "" }, // Les couleurs viennent des props
    ocr_ok: { text: "OCR OK", cls: "" },
    valide: { text: "Validé", cls: "" },
    rejete: { text: "Rejeté", cls: "" },
    signature: { text: "→ Officier", cls: "" },
  };
  const s = map[status] || map.en_attente;
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold`} style={{ backgroundColor: color, color: textColor }}>
      {s.text}
    </span>
  );
}

function DossierMockup() {
  return (
    <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-elevated)]">
      {/* Barre navigateur */}
      <div className="flex items-center gap-2 border-b border-border bg-muted/60 px-4 py-2.5">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-warning" />
          <span className="h-2.5 w-2.5 rounded-full bg-success" />
        </div>
        <div className="mx-auto flex items-center gap-2 rounded-md bg-card px-3 py-1 text-xs text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-success" />
          agent.kronodoc.ci / dossier / #KD-2026-04128
        </div>
      </div>

      <div className="grid gap-0 lg:grid-cols-[220px_1fr]">
        {/* Sidebar */}
        <aside className="hidden border-r border-border bg-muted/30 p-4 lg:block">
          <div className="mb-4 flex items-center gap-2 rounded-md bg-card px-2.5 py-2 text-xs">
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">Rechercher…</span>
          </div>
          <SideItem icon={<ScanLine className="h-4 w-4" />} label="Scanner un QR" active />
          <SideItem icon={<Clock className="h-4 w-4" />} label="File d'attente" badge="4" />
          <SideItem icon={<FileCheck2 className="h-4 w-4" />} label="Dossiers traités" />
          <SideItem icon={<Bell className="h-4 w-4" />} label="Notifications" badge="2" />
          <div className="mt-6 border-t border-border pt-4">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Aujourd'hui
            </div>
            <div className="mt-2 rounded-md bg-card p-3 text-xs">
              <div className="flex items-baseline justify-between">
                <span className="text-muted-foreground">Traités</span>
                <span className="font-display text-lg font-bold text-primary">14</span>
              </div>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-muted-foreground">Rejetés</span>
                <span className="font-semibold text-foreground">1</span>
              </div>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-muted-foreground">Temps moy.</span>
                <span className="font-semibold text-foreground">42 s</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Zone principale */}
        <div className="p-6">
          {/* En-tête dossier */}
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Dossier #KD-2026-04128
              </div>
              <h3 className="mt-1 font-display text-2xl font-bold text-foreground">
                Certificat de résidence
              </h3>
              <div className="mt-1 text-sm text-muted-foreground">
                Reçu il y a 38 s · Timbre payé (Wave)
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              En cours de vérification
            </span>
          </div>

          {/* Grille données / vérifications */}
          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            {/* Données pré-remplies */}
            <div className="rounded-xl border border-border bg-muted/30 p-4">
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <User className="h-3.5 w-3.5" />
                Données citoyen (pré-remplies)
              </div>
              <Field label="Nom" value="KOUASSI" />
              <Field label="Prénom(s)" value="Adjoua Marie" />
              <Field label="Née le" value="12 mars 1991 · Bouaké" />
              <Field label="Adresse" value="Cocody, Riviera Golf, Îlot 12, Lot 47" />
              <Field label="CNI" value="C 0092 4471 8" />
            </div>

            {/* OCR + comparaison */}
            <div className="rounded-xl border border-success/40 bg-success/5 p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-success">
                  <ScanLine className="h-3.5 w-3.5" />
                  OCR des originaux
                </div>
                <span className="rounded-full bg-success px-2 py-0.5 text-[10px] font-bold text-success-foreground">
                  100 % concordance
                </span>
              </div>
              <CheckItem
                icon={<CreditCard className="h-3.5 w-3.5" />}
                label="CNI"
                detail="Nom + date de naissance identiques"
                ok
              />
              <CheckItem
                icon={<Home className="h-3.5 w-3.5" />}
                label="Facture CIE (n° 8842-7712)"
                detail="Adresse identique · Compteur au nom du demandeur"
                ok
              />
              <CheckItem
                icon={<CreditCard className="h-3.5 w-3.5" />}
                label="Paiement du timbre"
                detail="1 000 F CFA · Wave · Réf WV8827K"
                ok
              />
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
            <label className="flex items-center gap-2 text-sm text-foreground">
              <span className="grid h-5 w-5 place-items-center rounded border-2 border-primary bg-primary text-primary-foreground">
                <CheckCircle2 className="h-3.5 w-3.5" />
              </span>
              Originaux physiques présentés et conformes
            </label>
            <div className="flex flex-wrap items-center gap-2">
              <button className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
                <XCircle className="h-4 w-4 text-destructive" />
                Rejeter avec motif
              </button>
              <button className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90">
                Valider et transmettre à l'officier
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SideItem({
  icon,
  label,
  active,
  badge,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  badge?: string;
}) {
  return (
    <div
      className={`mb-1 flex items-center justify-between rounded-md px-2.5 py-2 text-sm ${
        active
          ? "bg-primary/10 font-semibold text-primary"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
    >
      <span className="flex items-center gap-2">
        {icon}
        {label}
      </span>
      {badge && (
        <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">
          {badge}
        </span>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="mb-2 last:mb-0">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="text-sm font-medium text-foreground">{value}</div>
    </div>
  );
}

function CheckItem({
  icon,
  label,
  detail,
  ok,
}: {
  icon: React.ReactNode;
  label: string;
  detail: string;
  ok: boolean;
}) {
  return (
    <div className="mb-2 flex items-start gap-2 rounded-md bg-card px-3 py-2 shadow-sm last:mb-0">
      <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-success text-success-foreground">
        <CheckCircle2 className="h-3 w-3" />
      </span>
      <div className="flex-1">
        <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
          {icon}
          {label}
        </div>
        <div className="text-xs text-muted-foreground">{detail}</div>
      </div>
      {ok && (
        <span className="text-[10px] font-bold uppercase tracking-wider text-success">
          OK
        </span>
      )}
    </div>
  );
}

function Benefit({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <h3 className="mt-4 font-display text-base font-bold text-foreground">
        {title}
      </h3>
      <p className="mt-1.5 text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft,
  QrCode,
  ShieldCheck,
  ShieldAlert,
  Scan,
  Search,
  CheckCircle2,
  XCircle,
  Building2,
  Landmark,
  Banknote,
  Briefcase,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const Route = createFileRoute("/verifier")({
  head: () => ({
    meta: [
      { title: "Vérifier un document — KronoDoc CI" },
      {
        name: "description",
        content:
          "Banques, ambassades, employeurs, police : scannez le QR d'un document d'état civil pour prouver son authenticité en 2 secondes.",
      },
      { property: "og:title", content: "Vérifier un document — KronoDoc CI" },
      {
        property: "og:description",
        content:
          "Scan du QR ou saisie du numéro de dossier. Résultat immédiat : authentique ou falsifié.",
      },
    ],
  }),
  component: VerifierPage,
});

type Result = null | "valid" | "invalid";

function VerifierPage() {
  const [ref, setRef] = useState("");
  const [result, setResult] = useState<Result>(null);

  function handleCheck(e: React.FormEvent) {
    e.preventDefault();
    const cleaned = ref.trim().toUpperCase();
    if (!cleaned) return;
    // Démo : KD-2026-* → authentique, sinon falsifié
    setResult(cleaned.startsWith("KD-2026-") ? "valid" : "invalid");
  }

  function useExample() {
    setRef("KD-2026-04128");
    setResult("valid");
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Hero + outil de vérification */}
      <section className="border-b border-border bg-gradient-to-b from-muted/50 to-background">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à l'accueil
          </Link>

          <div className="mt-6 grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-start">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                Service public — Vérification
              </div>
              <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                Un document.{" "}
                <span className="text-primary">Deux secondes.</span> La preuve.
              </h1>
              <p className="mt-4 max-w-xl text-lg text-muted-foreground">
                Vous êtes une banque, une ambassade, un employeur ou une
                administration ? Scannez le QR d'un document d'état civil
                émis via KronoDoc CI pour prouver son authenticité —
                gratuitement, sans compte, sans installation.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <MiniStat value="< 2 s" label="par vérification" />
                <MiniStat value="Gratuit" label="et public" />
                <MiniStat value="0 %" label="faux acceptés" />
              </div>
            </div>

            {/* Formulaire vérification */}
            <div className="rounded-2xl border border-border bg-card shadow-[var(--shadow-elevated)]">
              <div className="flex items-center gap-2 border-b border-border bg-muted/40 px-5 py-3">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">
                  Vérifier un document
                </span>
              </div>
              <div className="p-6">
                {/* Zone scan QR */}
                <button
                  type="button"
                  className="group flex w-full items-center gap-4 rounded-xl border border-dashed border-primary/40 bg-primary/5 p-4 text-left transition-colors hover:border-primary hover:bg-primary/10"
                  onClick={useExample}
                >
                  <div className="grid h-14 w-14 place-items-center rounded-lg bg-primary text-primary-foreground shadow-sm">
                    <Scan className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="font-display text-base font-bold text-foreground">
                      Scanner le QR code
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Ouvrir la caméra — le résultat s'affiche instantanément
                    </div>
                  </div>
                </button>

                <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-wider text-muted-foreground">
                  <span className="h-px flex-1 bg-border" />
                  ou
                  <span className="h-px flex-1 bg-border" />
                </div>

                {/* Saisie manuelle */}
                <form onSubmit={handleCheck}>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Numéro de dossier
                  </label>
                  <div className="mt-1.5 flex gap-2">
                    <input
                      value={ref}
                      onChange={(e) => setRef(e.target.value)}
                      placeholder="KD-2026-04128"
                      className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/20"
                    />
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
                    >
                      <Search className="h-4 w-4" />
                      Vérifier
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={useExample}
                    className="mt-2 text-xs text-primary underline-offset-2 hover:underline"
                  >
                    Essayer avec un exemple → KD-2026-04128
                  </button>
                </form>

                {/* Résultat */}
                {result && <ResultCard variant={result} refValue={ref} />}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comment ça marche */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="max-w-2xl">
          <h2 className="font-display text-3xl font-bold tracking-tight text-foreground">
            La fin des faux documents d'état civil.
          </h2>
          <p className="mt-3 text-muted-foreground">
            Chaque document émis via KronoDoc CI est scellé par une signature
            cryptographique (SHA-256) liée à l'officier. Toute modification
            invalide le sceau — impossible de contrefaire.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          <StepCard
            step="01"
            icon={<QrCode className="h-5 w-5" />}
            title="Le QR est unique"
            desc="Généré lors de la signature de l'officier. Il contient un lien signé et un hash du document."
          />
          <StepCard
            step="02"
            icon={<Scan className="h-5 w-5" />}
            title="Le scan interroge KronoDoc"
            desc="Le serveur compare le hash au document original archivé. Si tout concorde, il renvoie les données publiques."
          />
          <StepCard
            step="03"
            icon={<ShieldCheck className="h-5 w-5" />}
            title="Résultat immédiat"
            desc="Authentique, avec la mairie émettrice et la date. Ou falsifié, avec un avertissement clair."
          />
        </div>
      </section>

      {/* Qui vérifie */}
      <section className="border-t border-border bg-muted/30 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl font-bold tracking-tight text-foreground">
              Fait pour tous ceux qui reçoivent des dossiers
            </h2>
            <p className="mt-3 text-muted-foreground">
              La vérification est publique et gratuite. Aucun compte, aucune
              app à installer.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <AudienceCard icon={<Banknote className="h-5 w-5" />} title="Banques" desc="Ouverture de compte, KYC." />
            <AudienceCard icon={<Landmark className="h-5 w-5" />} title="Ambassades" desc="Dossiers de visa et passeport." />
            <AudienceCard icon={<Briefcase className="h-5 w-5" />} title="Employeurs" desc="Recrutement et contrats." />
            <AudienceCard icon={<Building2 className="h-5 w-5" />} title="Administrations" desc="Écoles, hôpitaux, notaires." />
          </div>
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
      <h3 className="mt-4 font-display text-lg font-bold text-foreground">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}

function AudienceCard({
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
      <div className="mt-3 font-display text-base font-bold text-foreground">{title}</div>
      <div className="text-xs text-muted-foreground">{desc}</div>
    </div>
  );
}

function ResultCard({ variant, refValue }: { variant: "valid" | "invalid"; refValue: string }) {
  if (variant === "valid") {
    return (
      <div className="mt-6 overflow-hidden rounded-xl border border-success/40 bg-success/5">
        <div className="flex items-center gap-2 bg-success px-4 py-2.5 text-sm font-bold text-success-foreground">
          <CheckCircle2 className="h-4 w-4" />
          Document authentique
        </div>
        <div className="space-y-2 p-4 text-sm">
          <Row label="Type" value="Certificat de résidence" />
          <Row label="Titulaire" value="KOUASSI Adjoua Marie" />
          <Row label="Mairie émettrice" value="Cocody, Abidjan" />
          <Row label="Signé par" value="Mme le Maire — 24/07/2026" />
          <Row label="Référence" value={refValue || "KD-2026-04128"} />
          <div className="mt-3 flex items-center gap-2 rounded-md bg-card px-3 py-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-success" />
            Sceau cryptographique vérifié · SHA-256
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="mt-6 overflow-hidden rounded-xl border border-destructive/40 bg-destructive/5">
      <div className="flex items-center gap-2 bg-destructive px-4 py-2.5 text-sm font-bold text-destructive-foreground">
        <XCircle className="h-4 w-4" />
        Document non reconnu
      </div>
      <div className="space-y-2 p-4 text-sm text-foreground">
        <div className="flex items-start gap-2">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
          <div>
            Aucun document ne correspond à la référence{" "}
            <span className="font-mono font-semibold">{refValue}</span> dans
            le registre KronoDoc CI. Il peut s'agir d'un faux, d'une erreur
            de saisie, ou d'un document non émis par cette plateforme.
          </div>
        </div>
        <div className="mt-3 rounded-md bg-card px-3 py-2 text-xs text-muted-foreground">
          Astuce : les références KronoDoc commencent toujours par{" "}
          <span className="font-mono">KD-AAAA-</span>.
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-success/20 pb-1.5 last:border-b-0 last:pb-0">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <span className="text-right text-sm font-semibold text-foreground">{value}</span>
    </div>
  );
}

import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import {
  ArrowLeft,
  Signature,
  ShieldCheck,
  FileCheck2,
  Send,
  Printer,
  Clock,
  BarChart3,
  CheckCircle2,
  QrCode,
  Eye,
  Fingerprint,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { supabase } from "@/integrations/supabase/client";
import { SiteFooter } from "@/components/site-footer";

export const Route = createFileRoute("/officier")({
  head: () => ({
    meta: [
      { title: "Console Officier — KronoDoc CI" },
      {
        name: "description",
        content:
          "Parapheur numérique du Maire, de l'Adjoint ou du Sous-Préfet. Signez, certifiez, envoyez — depuis n'importe où.",
      },
      { property: "og:title", content: "Console Officier — KronoDoc CI" },
      {
        property: "og:description",
        content:
          "Un parapheur électronique digne d'un officier d'état civil. Signature en un clic, PDF/A certifié, envoi automatique.",
      },
    ],
  }),
  // --- Sécurisation de la route ---
  beforeLoad: async ({ location }) => {
    const { data } = await supabase.auth.getSession();
    // Si l'utilisateur n'est pas connecté, on le redirige vers la page de connexion.
    if (!data.session) {
      throw redirect({
        to: "/auth",
        search: {
          // Après connexion, il sera redirigé vers la page qu'il tentait d'accéder.
          redirect: location.href,
        },
      });
    }
    // NOTE: En production, on vérifierait ici si l'utilisateur a bien le rôle "officier"
    // et si son compte a été validé par un administrateur.
  },
  component: OfficierPage,
});

function OfficierPage() {
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

          <div className="mt-6 grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                Interface 3 · Maire · Adjoint · Sous-Préfet
              </div>
              <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                Signez, certifiez,{" "}
                <span className="text-primary">depuis n'importe où</span>.
              </h1>
              <p className="mt-4 max-w-xl text-lg text-muted-foreground">
                Un parapheur électronique digne d'un officier d'état civil. Les
                dossiers traités par les agents arrivent prêts à signer. Un
                clic suffit — le PDF/A certifié part immédiatement au citoyen.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <MiniStat value="1 clic" label="pour signer" />
                <MiniStat value="PDF/A" label="certifié" />
                <MiniStat value="24/7" label="disponibilité" />
              </div>
            </div>

            {/* Aperçu tableau signatures */}
            <SignaturePreview />
          </div>
        </div>
      </section>

      {/* Sécurité de la signature */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="max-w-2xl">
          <h2 className="font-display text-3xl font-bold tracking-tight text-foreground">
            Une signature aussi forte qu'un cachet officiel.
          </h2>
          <p className="mt-3 text-muted-foreground">
            Chaque signature repose sur une clé cryptographique liée à
            l'identité de l'officier. Aucun document ne peut être modifié
            après coup sans invalider la signature.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          <SecCard
            icon={<Fingerprint className="h-5 w-5" />}
            title="Authentification forte"
            desc="Connexion par mot de passe + code SMS. Option biométrie sur mobile pour les usages fréquents."
          />
          <SecCard
            icon={<ShieldCheck className="h-5 w-5" />}
            title="Signature cryptographique"
            desc="Chaque document scellé par un hash SHA-256 signé avec la clé privée de l'officier."
          />
          <SecCard
            icon={<QrCode className="h-5 w-5" />}
            title="QR d'authenticité"
            desc="Toute personne — banque, ambassade — peut vérifier la validité en scannant le QR."
          />
        </div>
      </section>

      {/* Console mockup */}
      <section className="border-y border-border bg-muted/30 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Aperçu — Console officier
            </div>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-foreground">
              La console du Maire, ouverte ce matin
            </h2>
            <p className="mt-3 text-muted-foreground">
              8 dossiers en attente de signature. Aperçu rapide, signature
              groupée possible.
            </p>
          </div>

          <ConsoleMockup />
        </div>
      </section>

      {/* Rôles et délégation */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-6 md:grid-cols-3">
          <RoleCard
            title="Maire"
            desc="Accès total. Peut déléguer temporairement aux adjoints (durée fixée, journalisée)."
          />
          <RoleCard
            title="Adjoint au Maire"
            desc="Signe les actes courants (résidence, vie, célibat). Rapport automatique au Maire."
          />
          <RoleCard
            title="Sous-Préfet"
            desc="Console dédiée pour les zones rurales. Même sécurité, même traçabilité."
          />
        </div>

        <div className="mt-10 rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-institutional)] sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="font-display text-xl font-bold text-foreground">
                Un tableau de bord digne d'un cabinet du Maire
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Volumes, délais, types de documents, agents les plus rapides.
                Exportable vers le Ministère.
              </p>
            </div>
            <button className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
              <BarChart3 className="h-4 w-4 text-primary" />
              Voir les indicateurs
            </button>
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

function SecCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-institutional)]">
      <div className="grid h-11 w-11 place-items-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <h3 className="mt-4 font-display text-lg font-bold text-foreground">
        {title}
      </h3>
      <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}

function SignaturePreview() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-elevated)]">
      <div className="flex items-center justify-between border-b border-border bg-muted/50 px-5 py-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Signature className="h-4 w-4 text-primary" />
          À signer
        </div>
        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">
          8 dossiers
        </span>
      </div>
      <ul className="divide-y divide-border">
        {[
          { name: "KOUASSI Adjoua", doc: "Certificat de résidence", time: "il y a 2 min" },
          { name: "BAKARY Ouattara", doc: "Extrait de naissance", time: "il y a 8 min" },
          { name: "AYA Tanoh", doc: "Certificat de vie", time: "il y a 14 min" },
        ].map((it, i) => (
          <li key={i} className="flex items-center justify-between px-5 py-3">
            <div>
              <div className="text-sm font-semibold text-foreground">
                {it.doc}
              </div>
              <div className="text-xs text-muted-foreground">
                {it.name} · {it.time}
              </div>
            </div>
            <button className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm">
              Signer
            </button>
          </li>
        ))}
      </ul>
      <div className="flex items-center justify-between border-t border-border bg-muted/40 px-5 py-3">
        <span className="text-xs text-muted-foreground">
          + 5 autres en attente
        </span>
        <button className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
          Tout signer <CheckCircle2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

function ConsoleMockup() {
  return (
    <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-elevated)]">
      <div className="flex items-center gap-2 border-b border-border bg-muted/60 px-4 py-2.5">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-warning" />
          <span className="h-2.5 w-2.5 rounded-full bg-success" />
        </div>
        <div className="mx-auto flex items-center gap-2 rounded-md bg-card px-3 py-1 text-xs text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-success" />
          officier.kronodoc.ci / parapheur
        </div>
      </div>

      <div className="grid gap-0 lg:grid-cols-[1fr_360px]">
        {/* Liste dossiers */}
        <div className="border-r border-border p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="font-display text-xl font-bold text-foreground">
                Parapheur — 8 dossiers
              </h3>
              <p className="text-xs text-muted-foreground">
                Trié par ancienneté · Mairie de Cocody
              </p>
            </div>
            <button className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Tout signer
            </button>
          </div>

          <div className="space-y-2">
            <DossierRow name="KOUASSI Adjoua" doc="Certificat de résidence" ref="KD-2026-04128" agent="Yao K." active />
            <DossierRow name="BAKARY Ouattara" doc="Extrait de naissance" ref="KD-2026-04127" agent="Diaby M." />
            <DossierRow name="AYA Tanoh" doc="Certificat de vie" ref="KD-2026-04126" agent="Yao K." />
            <DossierRow name="KOUAMÉ N'guessan" doc="Certificat de célibat" ref="KD-2026-04125" agent="Traoré A." />
            <DossierRow name="DIABATÉ Fatou" doc="Certificat de résidence" ref="KD-2026-04124" agent="Yao K." />
          </div>
        </div>

        {/* Aperçu document + signature */}
        <aside className="bg-muted/30 p-6">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Aperçu du dossier
          </div>
          <h4 className="mt-1 font-display text-base font-bold text-foreground">
            Certificat de résidence
          </h4>
          <div className="mt-1 text-xs text-muted-foreground">KD-2026-04128</div>

          {/* Mini document */}
          <div className="mt-4 rounded-lg border border-border bg-white p-4 shadow-sm">
            <div className="text-center">
              <div className="text-[8px] font-semibold uppercase tracking-widest text-muted-foreground">
                République de Côte d'Ivoire
              </div>
              <div className="mt-1 text-[10px] font-bold text-foreground">
                Mairie de Cocody
              </div>
              <div className="mt-3 font-display text-sm font-black text-foreground">
                CERTIFICAT DE RÉSIDENCE
              </div>
            </div>
            <div className="mt-3 space-y-1 text-[10px] text-foreground">
              <div>Nom : KOUASSI Adjoua Marie</div>
              <div>Née le : 12/03/1991 à Bouaké</div>
              <div>Réside à : Cocody Riviera Golf, Îlot 12, Lot 47</div>
            </div>
            <div className="mt-3 flex items-end justify-between">
              <div className="h-10 w-10 rounded bg-muted grid place-items-center">
                <QrCode className="h-6 w-6 text-foreground" />
              </div>
              <div className="text-right text-[8px] text-muted-foreground">
                <div>Fait à Cocody, le 24/07/2026</div>
                <div className="mt-2 border-t border-dashed border-border pt-1">
                  Zone signature
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-lg border border-success/40 bg-success/5 p-3 text-xs text-foreground">
            <div className="flex items-center gap-1.5 font-semibold text-success">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Vérifié par l'agent Yao K.
            </div>
            <div className="mt-0.5 text-muted-foreground">
              Originaux conformes · OCR 100 %
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <button className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90">
              <Signature className="h-4 w-4" />
              Signer et envoyer
            </button>
            <div className="flex gap-2">
              <button className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-md border border-border bg-card px-3 py-2 text-xs font-medium text-foreground hover:bg-muted">
                <Eye className="h-3.5 w-3.5" />
                Aperçu
              </button>
              <button className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-md border border-border bg-card px-3 py-2 text-xs font-medium text-foreground hover:bg-muted">
                <Printer className="h-3.5 w-3.5" />
                Imprimer
              </button>
            </div>
          </div>

          <div className="mt-4 flex items-start gap-2 rounded-md border border-border bg-card p-3 text-xs text-muted-foreground">
            <Send className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
            Après signature : envoi automatique par email + WhatsApp au
            citoyen, archivage horodaté.
          </div>
        </aside>
      </div>
    </div>
  );
}

function DossierRow({
  name,
  doc,
  ref,
  agent,
  active,
}: {
  name: string;
  doc: string;
  ref: string;
  agent: string;
  active?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between rounded-lg border p-3 ${
        active
          ? "border-primary bg-primary/5"
          : "border-border bg-card hover:bg-muted/50"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-muted">
          <FileCheck2 className="h-4 w-4 text-primary" />
        </div>
        <div>
          <div className="text-sm font-semibold text-foreground">{doc}</div>
          <div className="text-xs text-muted-foreground">
            {name} · {ref} · Agent {agent}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Clock className="h-3.5 w-3.5" />
        Prêt
      </div>
    </div>
  );
}

function RoleCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-institutional)]">
      <div className="text-xs font-semibold uppercase tracking-wider text-primary">
        Rôle
      </div>
      <h3 className="mt-1 font-display text-xl font-bold text-foreground">
        {title}
      </h3>
      <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}

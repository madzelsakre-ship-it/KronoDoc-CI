import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ScanLine,
  QrCode,
  Signature,
  Smartphone,
  ShieldCheck,
  Clock,
  Users,
  Building2,
  CheckCircle2,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CertificatResidenceFocus } from "@/components/certificat-residence-focus";
import { FaqSection } from "@/components/faq-section";
import { Testimonials } from "@/components/testimonials";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "KronoDoc CI — État civil digital de Côte d'Ivoire" },
      {
        name: "description",
        content:
          "Saisie zéro, automatisation maximale. Obtenez vos actes d'état civil en moins de 3 minutes au guichet grâce au QR code et à l'OCR.",
      },
      { property: "og:title", content: "KronoDoc CI — État civil digital" },
      {
        property: "og:description",
        content:
          "Le citoyen devient acteur, l'agent devient valideur, chaque document est infalsifiable.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <Hero />
      <Stats />
      <Interfaces />
      <Flow />
      <CertificatResidenceFocus />
      <Documents />
      <Testimonials />
      <Security />
      <FaqSection />
      <CTA />
      <SiteFooter />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.04]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, var(--ci-orange) 0%, transparent 40%), radial-gradient(circle at 80% 60%, var(--ci-green) 0%, transparent 45%)",
        }}
      />
      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.15fr_1fr] lg:py-24">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            Projet pilote — République de Côte d'Ivoire
          </div>
          <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            L'état civil ivoirien,
            <br />
            <span className="text-primary">réinventé pour 3 minutes</span>{" "}
            au guichet.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Le citoyen fait sa pré-demande depuis chez lui. L'agent scanne un QR
            code et valide. L'officier signe numériquement. Fin.
            <span className="font-medium text-foreground"> Zéro frappe clavier, zéro faux document.</span>
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/citoyen"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
            >
              Commencer une demande
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/verifier"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-border bg-card px-6 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
            >
              <QrCode className="h-4 w-4" />
              Vérifier un document
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-success" /> Signature numérique légale
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-success" /> Paiement Mobile Money
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-success" /> Archivage PDF/A
            </span>
          </div>
        </div>

        <HeroCard />
      </div>
    </section>
  );
}

function HeroCard() {
  return (
    <div className="relative">
      <div className="absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-br from-primary/10 via-transparent to-success/10 blur-2xl" />
      <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-elevated)]">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <div className="ci-flag-bar h-6 w-1.5 rounded-full" />
            <div>
              <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Certificat de résidence
              </div>
              <div className="font-display text-base font-semibold text-foreground">
                Mairie de Cocody
              </div>
            </div>
          </div>
          <div className="rounded-full bg-success/10 px-2.5 py-1 text-xs font-semibold text-success">
            Signé
          </div>
        </div>
        <dl className="mt-4 space-y-2.5 text-sm">
          <Row label="Titulaire" value="Kouassi Aya Marie" />
          <Row label="Né(e) le" value="14 mars 1998 à Bouaké" />
          <Row label="Adresse" value="Rue J24, Cocody Angré 7ᵉ tranche" />
          <Row label="N° dossier" value="KDC-2026-08421" />
        </dl>
        <div className="mt-5 flex items-center gap-4 rounded-lg border border-dashed border-border bg-muted/60 p-4">
          <div className="grid h-16 w-16 shrink-0 place-items-center rounded-md bg-foreground">
            <QrCode className="h-10 w-10 text-background" />
          </div>
          <div className="text-xs text-muted-foreground">
            <div className="font-semibold text-foreground">QR d'authenticité (SHA-256)</div>
            Scannable par toute banque, ambassade ou administration.
          </div>
        </div>
        <div className="mt-5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Signature className="h-3.5 w-3.5" /> Signé par M. le Maire · 26/07/2026
          </div>
          <span className="font-mono text-muted-foreground">PDF/A</span>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium text-foreground">{value}</dd>
    </div>
  );
}

function Stats() {
  const items = [
    { icon: Clock, value: "< 3 min", label: "au guichet" },
    { icon: Users, value: "0", label: "frappe clavier par l'agent" },
    { icon: ShieldCheck, value: "100%", label: "documents infalsifiables" },
    { icon: Building2, value: "5", label: "types d'actes en Phase 1" },
  ];
  return (
    <section className="border-y border-border bg-card/50">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-4 py-10 sm:px-6 md:grid-cols-4">
        {items.map((it) => (
          <div key={it.label} className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
              <it.icon className="h-5 w-5" />
            </div>
            <div>
              <div className="font-display text-xl font-bold text-foreground">{it.value}</div>
              <div className="text-xs text-muted-foreground">{it.label}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Interfaces() {
  const cards = [
    {
      to: "/citoyen",
      icon: Smartphone,
      title: "Portail Citoyen",
      desc: "Pré-demande depuis mobile, upload des pièces, paiement Wave/Orange/MTN, réception du PDF par WhatsApp.",
      cta: "Faire une demande",
    },
    {
      to: "/agent",
      icon: ScanLine,
      title: "Guichet Agent",
      desc: "Scan QR → dossier injecté. OCR de la pièce originale, incohérences surlignées, validation en un clic.",
      cta: "Ouvrir le guichet",
    },
    {
      to: "/officier",
      icon: Signature,
      title: "Console Officier",
      desc: "Parapheur numérique du Maire ou de l'Adjoint. Signature électronique, PDF/A certifié, envoi automatique.",
      cta: "Espace officier",
    },
  ];
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <div className="max-w-2xl">
        <div className="text-sm font-semibold uppercase tracking-wider text-primary">3 circuits</div>
        <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Une plateforme, trois parcours métiers.
        </h2>
        <p className="mt-3 text-muted-foreground">
          Type A : guichet physique mandaté par la mairie. Type B : validation numérique par agent. Type C : eCitizen souverain pour CNI, passeport et grands titres biométriques.
        </p>
      </div>
      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {cards.map((c) => (
          <Link
            key={c.title}
            to={c.to}
            className="group flex flex-col rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-institutional)] transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[var(--shadow-elevated)]"
          >
            <div className="grid h-11 w-11 place-items-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              <c.icon className="h-5 w-5" />
            </div>
            <h3 className="mt-4 font-display text-lg font-bold text-foreground">{c.title}</h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{c.desc}</p>
            <div className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
              {c.cta}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function Flow() {
  const steps = [
    { n: "A", t: "Type A · Présentiel", d: "Pré-demande + QR + validation physique au guichet par l'agent municipal." },
    { n: "B", t: "Type B · Numérique", d: "Demande en ligne, contrôle par agent, paiement Mobile Money et timbre numérique." },
    { n: "C", t: "Type C · eCitizen", d: "Pré-enrôlement biométrique, centre agréé, rendez-vous et titres souverains nationaux." },
    { n: "04", t: "L'officier signe", d: "Signature numérique, PDF/A avec QR d'authenticité, envoi WhatsApp ou retrait physique." },
  ];
  return (
    <section className="bg-muted/40 py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="max-w-2xl">
          <div className="text-sm font-semibold uppercase tracking-wider text-primary">Le flux complet</div>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Du canapé du citoyen au tampon de la mairie.
          </h2>
        </div>
        <ol className="mt-10 grid gap-4 md:grid-cols-4">
          {steps.map((s, i) => (
            <li
              key={s.n}
              className="relative rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-institutional)]"
            >
              <div className="font-mono text-xs font-bold tracking-wider text-primary">{s.n}</div>
              <h3 className="mt-2 font-display text-base font-bold text-foreground">{s.t}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{s.d}</p>
              {i < steps.length - 1 && (
                <div className="absolute right-3 top-1/2 hidden -translate-y-1/2 text-muted-foreground md:block">
                  <ArrowRight className="h-4 w-4" />
                </div>
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Documents() {
  const docs = [
    { name: "Certificat de résidence", priority: true },
    { name: "Acte de naissance (extrait)" },
    { name: "Certificat de nationalité" },
    { name: "Légalisation de signature" },
    { name: "Certificat de vie" },
  ];
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-center">
        <div>
          <div className="text-sm font-semibold uppercase tracking-wider text-primary">Phase 1</div>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            5 documents essentiels, dématérialisés dès le lancement.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Nous démarrons par les actes les plus demandés dans les mairies
            ivoiriennes. Les autres suivront dans les phases 2 à 5.
          </p>
        </div>
        <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-institutional)]">
          {docs.map((d, i) => (
            <li key={d.name} className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-4">
                <span className="font-mono text-xs text-muted-foreground">
                  0{i + 1}
                </span>
                <span className="font-medium text-foreground">{d.name}</span>
              </div>
              {d.priority ? (
                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                  Priorité absolue
                </span>
              ) : (
                <span className="text-xs text-muted-foreground">Disponible</span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Security() {
  const items = [
    { t: "QR code SHA-256", d: "Chaque document contient un QR signé vérifiable par n'importe qui." },
    { t: "PDF/A archivable", d: "Format d'archivage légal, non modifiable, valeur juridique." },
    { t: "Signature électronique", d: "Clé privée de l'officier, horodatage, journal d'audit complet." },
    { t: "RGPD & chiffrement", d: "Données personnelles chiffrées au repos, conformes aux exigences." },
  ];
  return (
    <section className="bg-foreground py-20 text-background">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="max-w-2xl">
          <div className="text-sm font-semibold uppercase tracking-wider text-primary">
            Sécurité & authenticité
          </div>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Infalsifiable, traçable, légal.
          </h2>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {items.map((it) => (
            <div key={it.t} className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <h3 className="mt-3 font-display text-base font-bold">{it.t}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-background/70">{it.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-10 shadow-[var(--shadow-elevated)]">
        <div className="ci-flag-bar absolute inset-x-0 top-0 h-1" />
        <div className="grid gap-6 md:grid-cols-[1.5fr_1fr] md:items-center">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Prêt à réduire vos files d'attente de 2 h à 3 min&nbsp;?
            </h2>
            <p className="mt-3 text-muted-foreground">
              KronoDoc CI se déploie en 10 semaines par mairie pilote. Contactez
              nous pour rejoindre le programme.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row md:flex-col">
            <Link
              to="/citoyen"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
            >
              Essayer le portail citoyen
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/officier"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-border bg-background px-6 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
            >
              Voir la console officier
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

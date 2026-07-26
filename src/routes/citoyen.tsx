import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Smartphone,
  ArrowLeft,
  ArrowRight,
  Check,
  Upload,
  CreditCard,
  QrCode,
  Home,
  FileText,
  MessageCircle,
  Wallet,
  Camera,
  ShieldCheck,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const Route = createFileRoute("/citoyen")({
  head: () => ({
    meta: [
      { title: "Portail Citoyen — KronoDoc CI" },
      {
        name: "description",
        content:
          "Faites votre pré-demande d'acte d'état civil depuis votre mobile. Paiement Mobile Money, QR code, réception par WhatsApp.",
      },
      { property: "og:title", content: "Portail Citoyen — KronoDoc CI" },
      {
        property: "og:description",
        content:
          "Pré-demande, upload des pièces, paiement et QR code — depuis chez vous.",
      },
    ],
  }),
  component: CitoyenPage,
});

function CitoyenPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à l'accueil
        </Link>

        <div className="mt-6 grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
              <Smartphone className="h-3.5 w-3.5" />
              Interface 1 · Grand public
            </div>
            <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
              Votre acte, préparé
              <br />
              <span className="text-primary">depuis votre canapé.</span>
            </h1>
            <p className="mt-4 max-w-xl text-lg text-muted-foreground">
              Le self-service qui remplace l'attente au guichet. Vous préparez
              votre dossier depuis votre téléphone, vous payez, et vous ne venez
              que pour retirer.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="#demo"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
              >
                Voir la démo interactive
                <ArrowRight className="h-4 w-4" />
              </a>
              <Link
                to="/verifier"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-border bg-card px-6 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
              >
                <QrCode className="h-4 w-4" />
                Vérifier un document
              </Link>
            </div>
            <ul className="mt-8 grid gap-2 sm:grid-cols-2">
              {[
                "Paiement Wave / Orange / MTN",
                "Réception par email + WhatsApp",
                "QR code d'authenticité",
                "Historique de toutes vos démarches",
              ].map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          <PhoneMockup />
        </div>
      </section>

      {/* Demo interactive : 4 étapes */}
      <section id="demo" className="bg-muted/40 py-16 lg:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-2xl">
            <div className="text-sm font-semibold uppercase tracking-wider text-primary">
              Démo — Certificat de résidence
            </div>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              4 écrans, 3 minutes, un document légal.
            </h2>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            <ScreenCard
              step="01"
              title="Identité"
              icon={<FileText className="h-5 w-5" />}
              body={
                <>
                  <MiniField label="Nom" value="KOUASSI" />
                  <MiniField label="Prénom" value="Aya Marie" />
                  <MiniField label="Né(e) le" value="14 / 03 / 1998" />
                  <MiniField label="Adresse" value="Rue J24, Cocody Angré" />
                </>
              }
            />
            <ScreenCard
              step="02"
              title="Pièces justificatives"
              icon={<Upload className="h-5 w-5" />}
              body={
                <div className="space-y-2">
                  <UploadRow label="CNI (recto / verso)" state="ok" />
                  <UploadRow label="Facture CIE" state="ok" />
                  <UploadRow label="Attestation d'hébergement" state="optional" />
                </div>
              }
            />
            <ScreenCard
              step="03"
              title="Paiement du timbre"
              icon={<CreditCard className="h-5 w-5" />}
              body={
                <div className="space-y-2">
                  <PaymentOption label="Wave" active />
                  <PaymentOption label="Orange Money" />
                  <PaymentOption label="MTN Money" />
                  <div className="mt-3 flex items-center justify-between rounded-md bg-primary/10 px-3 py-2 text-sm">
                    <span className="text-muted-foreground">Total</span>
                    <span className="font-bold text-primary">1 500 FCFA</span>
                  </div>
                </div>
              }
            />
            <ScreenCard
              step="04"
              title="Votre QR code"
              icon={<QrCode className="h-5 w-5" />}
              body={
                <div className="flex flex-col items-center gap-2">
                  <div className="grid h-24 w-24 place-items-center rounded-md bg-foreground">
                    <QrCode className="h-16 w-16 text-background" />
                  </div>
                  <div className="text-center text-xs text-muted-foreground">
                    Dossier <span className="font-mono text-foreground">KDC-2026-08421</span>
                  </div>
                  <div className="rounded-full bg-warning/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-warning-foreground">
                    En attente
                  </div>
                </div>
              }
            />
          </div>
        </div>
      </section>

      {/* Cas particulier hébergement */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-warning/30 bg-warning/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-warning-foreground">
              <Home className="h-3.5 w-3.5" />
              Cas particulier
            </div>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Vous n'avez pas de facture à votre nom ?
            </h2>
            <p className="mt-4 text-muted-foreground">
              C'est le cas le plus fréquent : locataire, jeune vivant chez ses
              parents, hébergement chez un proche. Le portail vous accompagne
              avec une <strong className="text-foreground">déclaration d'hébergement intégrée</strong>, signée
              directement sur l'écran du téléphone — plus besoin de faire tamponner un papier.
            </p>
            <ol className="mt-6 space-y-3 text-sm">
              {[
                "Vous téléversez la CNI de la personne qui vous héberge.",
                "L'attestation d'hébergement est pré-remplie automatiquement.",
                "Vous et l'hébergeant signez tour à tour sur l'écran.",
                "Le tout est ajouté à votre dossier — aucun déplacement en plus.",
              ].map((s, i) => (
                <li key={i} className="flex gap-3">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {i + 1}
                  </span>
                  <span className="text-foreground">{s}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-br from-warning/10 via-transparent to-primary/10 blur-2xl" />
            <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-elevated)]">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">
                    Formulaire hébergement
                  </div>
                  <div className="font-display text-base font-semibold text-foreground">
                    Attestation à signer
                  </div>
                </div>
                <span className="rounded-full bg-warning/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-warning-foreground">
                  À signer
                </span>
              </div>
              <div className="mt-4 space-y-2 text-sm">
                <MiniField label="Hébergeant" value="M. KOUASSI Jean" />
                <MiniField label="Lien" value="Père du demandeur" />
                <MiniField label="Adresse" value="Rue J24, Cocody Angré" />
                <MiniField label="CNI hébergeant" value="✓ Téléversée" />
              </div>
              <div className="mt-5 rounded-lg border border-dashed border-border bg-muted/60 p-4">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">
                  Signature de l'hébergeant
                </div>
                <div className="mt-2 h-14 rounded-md border border-border bg-card">
                  <svg viewBox="0 0 240 56" className="h-full w-full">
                    <path
                      d="M10 40 C 30 10, 50 50, 70 30 S 110 20, 140 35 S 200 15, 230 30"
                      stroke="var(--ci-ink)"
                      strokeWidth="2"
                      fill="none"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>
              <button className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-primary text-sm font-semibold text-primary-foreground shadow-sm">
                <Check className="h-4 w-4" /> Confirmer et joindre au dossier
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Après validation : réception */}
      <section className="bg-foreground py-16 text-background lg:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.05] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
                <ShieldCheck className="h-3.5 w-3.5" />
                Après la signature
              </div>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
                Le document arrive
                <br />
                sur votre téléphone.
              </h2>
              <p className="mt-4 max-w-lg text-background/70">
                Dès que l'officier signe, vous recevez le PDF certifié
                automatiquement — prêt à envoyer à votre banque, votre
                employeur ou une ambassade.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <ChannelCard icon={<MessageCircle className="h-4 w-4" />} label="WhatsApp" />
                <ChannelCard icon={<FileText className="h-4 w-4" />} label="Email PDF/A" />
                <ChannelCard icon={<QrCode className="h-4 w-4" />} label="QR d'authenticité" />
                <ChannelCard icon={<Wallet className="h-4 w-4" />} label="Reçu Mobile Money" />
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
              <div className="flex items-center gap-2 border-b border-white/10 pb-3">
                <div className="grid h-8 w-8 place-items-center rounded-full bg-[#25D366]">
                  <MessageCircle className="h-4 w-4 text-white" />
                </div>
                <div>
                  <div className="text-sm font-semibold">Mairie de Cocody</div>
                  <div className="text-[10px] text-background/60">via WhatsApp Business</div>
                </div>
              </div>
              <div className="mt-4 space-y-3">
                <ChatBubble>
                  Bonjour Aya, votre certificat de résidence a été signé par M.
                  le Maire. Voici votre document officiel. ✅
                </ChatBubble>
                <div className="ml-4 rounded-lg border border-white/10 bg-white/[0.05] p-3">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-md bg-primary/20 text-primary">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold">
                        certificat-residence-KDC-2026-08421.pdf
                      </div>
                      <div className="text-[10px] text-background/60">
                        PDF/A · 218 Ko · QR d'authenticité inclus
                      </div>
                    </div>
                  </div>
                </div>
                <ChatBubble>
                  Vous pouvez le vérifier à tout moment sur kronodoc.ci/verifier
                </ChatBubble>
              </div>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

/* ------------------------------ Sub-components ------------------------------ */

function PhoneMockup() {
  return (
    <div className="relative mx-auto w-full max-w-[320px]">
      <div className="absolute -inset-6 -z-10 rounded-[3rem] bg-gradient-to-br from-primary/15 via-transparent to-success/15 blur-2xl" />
      <div className="rounded-[2.5rem] border-[10px] border-foreground bg-foreground p-1.5 shadow-[var(--shadow-elevated)]">
        <div className="overflow-hidden rounded-[2rem] bg-background">
          <div className="ci-flag-bar h-1 w-full" />
          <div className="flex items-center justify-between px-5 pt-4 text-[10px] font-medium text-muted-foreground">
            <span>9:41</span>
            <span>KronoDoc CI</span>
          </div>
          <div className="px-5 py-4">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-primary">
              Nouvelle demande
            </div>
            <h3 className="mt-0.5 font-display text-lg font-bold text-foreground">
              Certificat de résidence
            </h3>
            <div className="mt-4 space-y-2 rounded-lg border border-border bg-card p-3 text-xs">
              <MiniField label="Nom" value="KOUASSI Aya" />
              <MiniField label="Quartier" value="Cocody Angré" />
              <MiniField label="Timbre" value="1 500 FCFA" />
            </div>

            <div className="mt-4 rounded-lg border border-dashed border-border bg-muted/50 p-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                <Camera className="h-3.5 w-3.5 text-primary" />
                Prenez en photo votre CNI
              </div>
              <div className="mt-2 grid h-16 place-items-center rounded-md bg-card/60 text-[10px] text-muted-foreground">
                Aperçu de la caméra
              </div>
            </div>

            <button className="mt-4 inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-md bg-primary text-xs font-semibold text-primary-foreground">
              Payer avec Wave
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
            <div className="mt-2 text-center text-[9px] text-muted-foreground">
              Sécurisé par CinetPay · BCEAO
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ScreenCard({
  step,
  title,
  icon,
  body,
}: {
  step: string;
  title: string;
  icon: React.ReactNode;
  body: React.ReactNode;
}) {
  return (
    <div className="flex flex-col rounded-2xl border border-border bg-card shadow-[var(--shadow-institutional)]">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-md bg-primary/10 text-primary">
            {icon}
          </div>
          <div>
            <div className="text-[10px] font-mono font-semibold tracking-wider text-primary">
              {step}
            </div>
            <div className="font-display text-sm font-bold text-foreground">
              {title}
            </div>
          </div>
        </div>
      </div>
      <div className="p-4 text-xs">{body}</div>
    </div>
  );
}

function MiniField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-1.5 last:border-0 last:pb-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}

function UploadRow({ label, state }: { label: string; state: "ok" | "optional" }) {
  return (
    <div className="flex items-center justify-between rounded-md border border-border bg-muted/40 px-3 py-2">
      <div className="flex items-center gap-2">
        <Upload className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-foreground">{label}</span>
      </div>
      {state === "ok" ? (
        <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-semibold text-success">
          <Check className="h-3 w-3" /> OK
        </span>
      ) : (
        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
          Optionnel
        </span>
      )}
    </div>
  );
}

function PaymentOption({ label, active }: { label: string; active?: boolean }) {
  return (
    <div
      className={`flex items-center justify-between rounded-md border px-3 py-2 ${
        active ? "border-primary bg-primary/5" : "border-border bg-card"
      }`}
    >
      <span className="text-foreground">{label}</span>
      <span
        className={`grid h-4 w-4 place-items-center rounded-full border ${
          active ? "border-primary bg-primary" : "border-border"
        }`}
      >
        {active && <span className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />}
      </span>
    </div>
  );
}

function ChannelCard({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm">
      <span className="grid h-7 w-7 place-items-center rounded-md bg-primary/20 text-primary">
        {icon}
      </span>
      {label}
    </div>
  );
}

function ChatBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-white/[0.08] px-3 py-2 text-sm text-background">
      {children}
    </div>
  );
}

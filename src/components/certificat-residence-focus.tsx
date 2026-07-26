import {
  Smartphone,
  ScanLine,
  Signature,
  FileCheck2,
  Home,
  CreditCard,
  UserCheck,
  Printer,
  MessageCircle,
  AlertTriangle,
} from "lucide-react";

/**
 * Focus détaillé sur le Certificat de résidence — document phare de la Phase 1.
 * Reprend le flux exact décrit dans le cahier des charges.
 */
export function CertificatResidenceFocus() {
  return (
    <section id="certificat-residence" className="relative bg-gradient-to-b from-background to-muted/40 py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Focus — Document phare
          </div>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Certificat de résidence : de 48 h à moins de 3 min.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Passeport, inscription scolaire, ouverture de compte, recrutement —
            c'est l'acte le plus demandé en mairie. Voici comment KronoDoc CI
            l'automatise de bout en bout, y compris pour les hébergés.
          </p>
        </div>

        {/* 3 étapes majeures */}
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          <StageCard
            index="Étape 1"
            title="La pré-demande citoyen"
            subtitle="Sur smartphone ou en cybercafé"
            icon={<Smartphone className="h-5 w-5" />}
            accent="orange"
            items={[
              { icon: <UserCheck className="h-4 w-4" />, text: "Saisie du nom, prénom, date de naissance, adresse exacte (quartier, secteur, îlot)." },
              { icon: <FileCheck2 className="h-4 w-4" />, text: "Photo de la CNI, attestation ou passeport." },
              { icon: <Home className="h-4 w-4" />, text: "Photo d'un justificatif de domicile : facture CIE / SODECI, bail, ou attestation du chef de quartier." },
              { icon: <CreditCard className="h-4 w-4" />, text: "Paiement du timbre communal via Wave, Orange Money ou MTN." },
              { icon: <ScanLine className="h-4 w-4" />, text: "Génération d'un QR code « Certificat de résidence — En attente »." },
            ]}
          />

          <StageCard
            index="Étape 2"
            title="Le traitement au guichet"
            subtitle="Mairie — Instantané"
            icon={<ScanLine className="h-5 w-5" />}
            accent="ink"
            items={[
              { icon: <ScanLine className="h-4 w-4" />, text: "L'agent scanne le QR : les données + le justificatif s'affichent en un clic." },
              { icon: <FileCheck2 className="h-4 w-4" />, text: "Vérification rapide des originaux papier présentés (CNI, facture)." },
              { icon: <AlertTriangle className="h-4 w-4" />, text: "L'OCR contrôle automatiquement que l'adresse / n° de compteur correspond." },
              { icon: <UserCheck className="h-4 w-4" />, text: "L'agent coche [x] Justificatif conforme et valide." },
            ]}
          />

          <StageCard
            index="Étape 3"
            title="Signature & délivrance hybride"
            subtitle="Officier — Maire, Adjoint, Sous-Préfet"
            icon={<Signature className="h-5 w-5" />}
            accent="green"
            items={[
              { icon: <Signature className="h-4 w-4" />, text: "Validation d'un clic sur le tableau de bord officier (signature électronique)." },
              { icon: <MessageCircle className="h-4 w-4" />, text: "📱 PDF avec QR d'authenticité envoyé par email ou WhatsApp." },
              { icon: <Printer className="h-4 w-4" />, text: "🖨️ Impression papier immédiate au guichet, à la demande." },
            ]}
          />
        </div>

        {/* Cas particulier : hébergement */}
        <div className="mt-10 overflow-hidden rounded-2xl border border-warning/40 bg-warning/5">
          <div className="grid gap-0 md:grid-cols-[auto_1fr]">
            <div className="flex items-center gap-3 bg-warning/15 px-6 py-5 md:flex-col md:items-start md:justify-center md:px-8">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-warning text-warning-foreground shadow-sm">
                <Home className="h-6 w-6" />
              </div>
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-warning-foreground/70">
                  Cas particulier
                </div>
                <div className="font-display text-base font-bold text-foreground">
                  Citoyen hébergé
                </div>
              </div>
            </div>
            <div className="px-6 py-6 md:px-8">
              <p className="text-sm text-foreground">
                Locataire, enfant vivant chez ses parents, hébergement chez un
                proche — la facture n'est pas au nom du demandeur.
                <span className="font-medium"> L'application ajoute deux champs&nbsp;:</span>
              </p>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                <li className="flex items-start gap-2 rounded-md bg-card px-3 py-2 text-sm text-foreground shadow-sm">
                  <FileCheck2 className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                  Photo de la CNI de l'hébergeant.
                </li>
                <li className="flex items-start gap-2 rounded-md bg-card px-3 py-2 text-sm text-foreground shadow-sm">
                  <Signature className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                  Attestation d'hébergement signée directement sur l'écran du téléphone.
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bénéfices chiffrés */}
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          <BenefitCard
            metric="< 3 min"
            title="Temps de traitement"
            desc="Contre 24 h à plusieurs jours aujourd'hui."
          />
          <BenefitCard
            metric="0"
            title="Faux document possible"
            desc="Le QR imprimé permet à toute banque, ambassade ou police de vérifier."
          />
          <BenefitCard
            metric="0"
            title="Ressaisie clavier"
            desc="Fin des erreurs sur les noms de rue et numéros de lot."
          />
        </div>
      </div>
    </section>
  );
}

function StageCard({
  index,
  title,
  subtitle,
  icon,
  items,
  accent,
}: {
  index: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  items: { icon: React.ReactNode; text: string }[];
  accent: "orange" | "green" | "ink";
}) {
  const accentBar =
    accent === "orange"
      ? "bg-primary"
      : accent === "green"
      ? "bg-success"
      : "bg-foreground";
  return (
    <div className="relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-institutional)]">
      <div className={`h-1 w-full ${accentBar}`} />
      <div className="flex items-start gap-3 border-b border-border p-5">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-primary">
            {index}
          </div>
          <h3 className="mt-0.5 font-display text-lg font-bold text-foreground">
            {title}
          </h3>
          <div className="text-xs text-muted-foreground">{subtitle}</div>
        </div>
      </div>
      <ul className="flex-1 space-y-3 p-5">
        {items.map((it, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm text-foreground">
            <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md bg-muted text-muted-foreground">
              {it.icon}
            </span>
            <span className="leading-snug">{it.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function BenefitCard({ metric, title, desc }: { metric: string; title: string; desc: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="font-display text-3xl font-extrabold tracking-tight text-primary">
        {metric}
      </div>
      <div className="mt-1 text-sm font-semibold text-foreground">{title}</div>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{desc}</p>
    </div>
  );
}

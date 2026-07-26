import { HelpCircle } from "lucide-react";

const faqs = [
  {
    q: "Le document numérique a-t-il la même valeur qu'un papier tamponné ?",
    a: "Oui. Le PDF/A est signé électroniquement par l'officier d'état civil et horodaté. Il a la même valeur juridique qu'un document papier, comme le prévoit la loi ivoirienne sur la signature électronique.",
  },
  {
    q: "Que se passe-t-il si le citoyen n'a pas de smartphone ?",
    a: "Les cybercafés partenaires et les guichets d'accueil de la mairie disposent d'une borne pour saisir la pré-demande. Le citoyen repart avec un QR code imprimé.",
  },
  {
    q: "Comment vérifier qu'un certificat n'est pas un faux ?",
    a: "N'importe qui — banque, ambassade, employeur, police — peut scanner le QR code du document ou saisir son numéro sur la page publique de vérification. La correspondance avec la mairie émettrice est instantanée.",
  },
  {
    q: "Le paiement Mobile Money est-il sécurisé ?",
    a: "Les paiements passent par CinetPay, agrégateur agréé BCEAO. Wave, Orange Money et MTN Money sont supportés. Le reçu est joint au dossier.",
  },
  {
    q: "Qui a accès aux données personnelles des citoyens ?",
    a: "Seuls l'agent du guichet concerné et l'officier signataire y accèdent. Les données sont chiffrées au repos, conformes RGPD. Un journal d'audit trace chaque consultation.",
  },
  {
    q: "En combien de temps une mairie peut-elle se déployer ?",
    a: "10 semaines par mairie pilote — de la formation des agents à la mise en production complète, en 5 phases progressives.",
  },
];

export function FaqSection() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-20 sm:px-6">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-primary">
          <HelpCircle className="h-4 w-4" />
          Questions fréquentes
        </div>
        <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Ce que vous nous demandez le plus.
        </h2>
      </div>
      <div className="mt-10 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-institutional)]">
        {faqs.map((f, i) => (
          <details key={i} className="group">
            <summary className="flex cursor-pointer items-start justify-between gap-4 px-5 py-4 text-left text-sm font-semibold text-foreground transition-colors hover:bg-muted/60">
              <span>{f.q}</span>
              <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary/10 text-primary transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <div className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">
              {f.a}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}

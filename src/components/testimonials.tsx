import { Quote } from "lucide-react";

const items = [
  {
    quote:
      "Avant, je perdais une matinée entière pour un certificat de résidence. Là, j'ai payé sur Wave, j'ai scanné mes papiers, et l'agent m'a remis le document en moins de trois minutes.",
    name: "Aya K.",
    role: "Étudiante, Cocody",
  },
  {
    quote:
      "Je ne ressaisis plus rien. Je scanne le QR, je vérifie les originaux, je valide. Notre file d'attente a fondu.",
    name: "M. Konan",
    role: "Agent de guichet, Mairie de Yopougon",
  },
  {
    quote:
      "Chaque document que je signe part directement au citoyen sur WhatsApp, avec un QR vérifiable. Fini les certificats douteux qui reviennent.",
    name: "Mme Diallo",
    role: "Adjointe au Maire",
  },
];

export function Testimonials() {
  return (
    <section className="bg-muted/40 py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="max-w-2xl">
          <div className="text-sm font-semibold uppercase tracking-wider text-primary">
            Retours du terrain
          </div>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Ceux qui l'utilisent en parlent.
          </h2>
          <p className="mt-3 text-muted-foreground">
            Témoignages recueillis sur les mairies pilotes du projet
            (illustrations de démonstration).
          </p>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {items.map((it) => (
            <figure
              key={it.name}
              className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-institutional)]"
            >
              <Quote className="h-6 w-6 text-primary/50" />
              <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-foreground">
                « {it.quote} »
              </blockquote>
              <figcaption className="mt-5 border-t border-border pt-4">
                <div className="font-semibold text-foreground">{it.name}</div>
                <div className="text-xs text-muted-foreground">{it.role}</div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

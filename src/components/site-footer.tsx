export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border bg-muted/40">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <div className="font-display text-lg font-bold text-foreground">
              KronoDoc <span className="text-primary">CI</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Plateforme hybride d'état civil et de mairie digitale pour la Côte d'Ivoire.
            </p>
          </div>
          <FooterCol title="Plateforme" items={["Portail Citoyen", "Guichet Agent", "Console Officier"]} />
          <FooterCol title="Documents" items={["Certificat de résidence", "Acte de naissance", "Certificat de nationalité", "Légalisation"]} />
          <FooterCol title="Institutionnel" items={["À propos", "Sécurité & RGPD", "Contact mairie", "Mentions légales"]} />
        </div>
        <div className="ci-flag-bar mt-8 h-1 w-full rounded-full" />
        <p className="mt-4 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} KronoDoc CI — République de Côte d'Ivoire
        </p>
      </div>
    </footer>
  );
}

function FooterCol({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
        {items.map((i) => (
          <li key={i}>{i}</li>
        ))}
      </ul>
    </div>
  );
}

import { useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  FileText,
  Loader2,
  Plus,
  ShieldCheck,
  LogOut,
  QrCode,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/mon-espace")({
  head: () => ({
    meta: [
      { title: "Mon espace citoyen — KronoDoc CI" },
      {
        name: "description",
        content:
          "Suivez l'état de vos demandes d'actes d'état civil et récupérez vos documents signés avec QR d'authenticité.",
      },
      { property: "og:title", content: "Mon espace citoyen — KronoDoc CI" },
      {
        property: "og:description",
        content: "Vos demandes, leur statut et vos documents signés au même endroit.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MonEspace,
});

const DOC_LABELS: Record<string, string> = {
  certificat_residence: "Certificat de résidence",
  extrait_naissance: "Extrait de naissance",
  certificat_vie: "Certificat de vie",
  certificat_celibat: "Certificat de célibat",
  legalisation: "Légalisation de document",
  attestation_hebergement: "Attestation d'hébergement",
};

const STATUS_LABELS: Record<string, string> = {
  brouillon: "Brouillon",
  en_attente_paiement: "En attente de paiement",
  en_attente_guichet: "À présenter au guichet",
  en_verification: "En vérification",
  en_attente_signature: "En attente de signature",
  signe: "Signé",
  delivre: "Délivré",
  rejete: "Rejeté",
};

function MonEspace() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return null;
      const { data } = await supabase
        .from("profiles")
        .select("first_name, last_name, phone, commune")
        .eq("id", auth.user.id)
        .maybeSingle();
      return { ...data, email: auth.user.email };
    },
  });

  const requestsQuery = useQuery({
    queryKey: ["my-requests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("document_requests")
        .select(
          "id, reference, verification_code, doc_type, status, commune, created_at, signed_at",
        )
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <main className="min-h-screen bg-muted/40">
      <div className="ci-flag-bar h-1 w-full" />
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <ShieldCheck className="h-5 w-5" strokeWidth={2.4} />
            </div>
            <div className="font-display text-base font-bold tracking-tight text-foreground">
              KronoDoc <span className="text-primary">CI</span>
            </div>
          </Link>
          <button
            onClick={handleSignOut}
            className="inline-flex h-9 items-center gap-2 rounded-md border border-input bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            <LogOut className="h-4 w-4" />
            Déconnexion
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Bonjour{profile?.first_name ? ` ${profile.first_name}` : ""}.
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {profile?.email} — suivez ici l'avancement de vos demandes.
            </p>
          </div>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Nouvelle demande
          </button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <div className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Profil</div>
            <div className="mt-2 font-display text-xl font-bold text-foreground">{profile?.first_name ?? "CITOYEN"} {profile?.last_name ?? ""}</div>
            <div className="mt-1 text-sm text-muted-foreground">CNI / NNI enregistré</div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <div className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Dossiers actifs</div>
            <div className="mt-2 font-display text-xl font-bold text-foreground">{requestsQuery.data?.length ?? 0}</div>
            <div className="mt-1 text-sm text-muted-foreground">Pré-demandes en cours</div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <div className="text-xs uppercase tracking-[0.12em] text-muted-foreground">QR</div>
            <div className="mt-2 font-display text-xl font-bold text-foreground">Toujours accessible</div>
            <div className="mt-1 text-sm text-muted-foreground">À présenter au guichet</div>
          </div>
        </div>

        {showForm && (
          <NewRequestForm
            defaultFirstName={profile?.first_name ?? ""}
            defaultLastName={profile?.last_name ?? ""}
            defaultPhone={profile?.phone ?? ""}
            onDone={() => {
              setShowForm(false);
              queryClient.invalidateQueries({ queryKey: ["my-requests"] });
            }}
          />
        )}

        <section className="mt-8">
          <h2 className="font-display text-lg font-bold text-foreground">Mes demandes</h2>
          {requestsQuery.isLoading ? (
            <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Chargement…
            </div>
          ) : requestsQuery.data && requestsQuery.data.length > 0 ? (
            <ul className="mt-4 space-y-3">
              {requestsQuery.data.map((r) => (
                <li
                  key={r.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                      <FileText className="h-5 w-5" />
                    </span>
                    <div>
                      <div className="font-semibold text-foreground">
                        {DOC_LABELS[r.doc_type] ?? r.doc_type}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Réf. {r.reference} · {r.commune} ·{" "}
                        {new Date(r.created_at).toLocaleDateString("fr-FR")}
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {r.status === "en_attente_paiement" && "Validation du paiement et des pièces en cours."}
                        {r.status === "en_verification" && "Votre dossier est vérifié au guichet. En attente de validation du maire."}
                        {r.status === "en_attente_signature" && "Le maire a approuvé le dossier. Signature numérique en cours."}
                        {(r.status === "signe" || r.status === "delivre") && "Document validé et signé. Préparez votre retrait à la mairie."}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {(r.status === "signe" || r.status === "delivre") && (
                      <span className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2 py-1 font-mono text-xs text-foreground">
                        <QrCode className="h-3.5 w-3.5" />
                        {r.verification_code}
                      </span>
                    )}
                    <StatusBadge status={r.status} />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-4 rounded-xl border border-dashed border-border bg-card p-8 text-center">
              <p className="text-sm text-muted-foreground">
                Aucune demande pour le moment. Créez votre première demande en un peu moins de
                trois minutes.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function StatusBadge({ status }: { status: string }) {
  const label = STATUS_LABELS[status] ?? status;
  const style =
    status === "signe" || status === "delivre"
      ? "bg-success/10 text-success"
      : status === "rejete"
        ? "bg-destructive/10 text-destructive"
        : "bg-warning/15 text-warning-foreground";
  const Icon =
    status === "signe" || status === "delivre"
      ? CheckCircle2
      : status === "rejete"
        ? XCircle
        : Clock;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold ${style}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </span>
  );
}

function makeSuffix(len: number) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
}

function NewRequestForm({
  defaultFirstName,
  defaultLastName,
  defaultPhone,
  onDone,
}: {
  defaultFirstName: string;
  defaultLastName: string;
  defaultPhone: string;
  onDone: () => void;
}) {
  const [docType, setDocType] = useState("certificat_residence");
  const [firstName, setFirstName] = useState(defaultFirstName);
  const [lastName, setLastName] = useState(defaultLastName);
  const [phone, setPhone] = useState(defaultPhone);
  const [commune, setCommune] = useState("Cocody");
  const [quartier, setQuartier] = useState("");
  const [secteur, setSecteur] = useState("");
  const [ilot, setIlot] = useState("");
  const [isHosted, setIsHosted] = useState(false);
  const [hostName, setHostName] = useState("");
  const [hostId, setHostId] = useState("");

  const mutation = useMutation({
    mutationFn: async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Session expirée.");
      const year = new Date().getFullYear();
      const { error } = await supabase.from("document_requests").insert({
        user_id: auth.user.id,
        doc_type: docType as never,
        status: "en_attente_paiement" as never,
        reference: `KD-${year}-${makeSuffix(6)}`,
        verification_code: `KD-${year}-${makeSuffix(8)}`,
        commune,
        applicant_first_name: firstName,
        applicant_last_name: lastName,
        applicant_phone: phone,
        address_quartier: quartier,
        address_secteur: secteur,
        address_ilot: ilot,
        is_hosted: isHosted,
        host_full_name: isHosted ? hostName : null,
        host_id_number: isHosted ? hostId : null,
      });
      if (error) throw error;
    },
    onSuccess: onDone,
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        mutation.mutate();
      }}
      className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-institutional)]"
    >
      <h2 className="font-display text-lg font-bold text-foreground">Nouvelle pré-demande</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Renseignez vos informations une fois. Elles seront relues au guichet, sans ressaisie.
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="text-sm">
          <span className="font-medium text-foreground">Type de document</span>
          <select
            value={docType}
            onChange={(e) => setDocType(e.target.value)}
            className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground"
          >
            {Object.entries(DOC_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <Input label="Commune" value={commune} onChange={setCommune} required />
        <Input label="Prénom" value={firstName} onChange={setFirstName} required />
        <Input label="Nom" value={lastName} onChange={setLastName} required />
        <Input label="Téléphone" value={phone} onChange={setPhone} />
        <Input label="Quartier" value={quartier} onChange={setQuartier} required />
        <Input label="Secteur" value={secteur} onChange={setSecteur} />
        <Input label="Îlot / lot" value={ilot} onChange={setIlot} />
      </div>

      <label className="mt-5 flex items-start gap-2 text-sm text-foreground">
        <input
          type="checkbox"
          checked={isHosted}
          onChange={(e) => setIsHosted(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-input"
        />
        Je suis hébergé(e) : le justificatif de domicile n'est pas à mon nom.
      </label>

      {isHosted && (
        <div className="mt-4 grid gap-4 rounded-xl border border-warning/40 bg-warning/5 p-4 sm:grid-cols-2">
          <Input label="Nom complet de l'hébergeant" value={hostName} onChange={setHostName} required />
          <Input label="N° CNI de l'hébergeant" value={hostId} onChange={setHostId} required />
        </div>
      )}

      {mutation.isError && (
        <p className="mt-4 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {mutation.error instanceof Error
            ? mutation.error.message
            : "Impossible d'enregistrer la demande."}
        </p>
      )}

      <div className="mt-5 flex gap-3">
        <button
          type="submit"
          disabled={mutation.isPending}
          className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
        >
          {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Enregistrer la demande
        </button>
        <button
          type="button"
          onClick={onDone}
          className="inline-flex h-10 items-center rounded-md border border-input bg-background px-4 text-sm font-medium text-foreground hover:bg-accent"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}

function Input({
  label,
  value,
  onChange,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <label className="text-sm">
      <span className="font-medium text-foreground">{label}</span>
      <input
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
      />
    </label>
  );
}

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AlertCircle, Camera, Loader2, Save, ShieldCheck, User } from "lucide-react";

export const Route = createFileRoute("/_authenticated/mon-profil")({
  component: MonProfilPage,
});

const profileQueryOptions = {
  queryKey: ["profile"],
  queryFn: async () => {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) throw new Error("Utilisateur non authentifié");
    const { data, error } = await supabase
      .from("profiles")
      .select("first_name, last_name, phone, commune, avatar_url")
      .eq("id", auth.user.id)
      .single();
    if (error) throw error;
    return { ...data, email: auth.user.email };
  },
};

function MonProfilPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const search = Route.useSearch();

  const { data: profile, isLoading } = useQuery(profileQueryOptions);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [commune, setCommune] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name ?? "");
      setLastName(profile.last_name ?? "");
      setPhone(profile.phone ?? "");
      setCommune(profile.commune ?? "");
      setAvatarUrl(profile.avatar_url ?? null);
    }
  }, [profile]);

  const updateProfileMutation = useMutation({
    mutationFn: async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Session expirée.");

      const { error } = await supabase
        .from("profiles")
        .update({
          first_name: firstName,
          last_name: lastName,
          phone,
          commune,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", auth.user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      // Redirige l'utilisateur vers la page initialement demandée ou son espace par défaut
      navigate({ to: search.redirect || "/mon-espace", replace: true });
    },
  });

  const isProfileIncomplete = !profile || !profile.first_name || !profile.last_name;

  return (
    <main className="min-h-screen bg-muted/40">
      <div className="ci-flag-bar h-1 w-full" />
      <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-12 sm:px-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ShieldCheck className="h-5 w-5" strokeWidth={2.4} />
          </div>
          <div className="font-display text-base font-bold tracking-tight text-foreground">
            KronoDoc <span className="text-primary">CI</span>
          </div>
        </div>

        <div className="mt-6 w-full rounded-2xl border border-border bg-card p-6 shadow-sm">
          {/* --- NOUVEAU COMPOSANT AVATAR --- */}
          <Avatar
            url={avatarUrl}
            onUpload={(url) => {
              setAvatarUrl(url);
            }}
          />
          <h1 className="font-display text-xl font-bold text-foreground">
            {isProfileIncomplete ? "Complétez votre profil" : "Mon Profil"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Ces informations sont nécessaires pour sécuriser votre compte et pré-remplir vos futures demandes.
          </p>

          {isProfileIncomplete && (
            <div className="mt-4 flex items-start gap-3 rounded-xl border-2 border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p>Veuillez compléter vos informations pour accéder aux fonctionnalités de KronoDoc.</p>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              updateProfileMutation.mutate();
            }}
            className="mt-5 space-y-4"
          >
            <Input label="Prénom" value={firstName} onChange={setFirstName} required />
            <Input label="Nom" value={lastName} onChange={setLastName} required />
            <Input label="Téléphone" value={phone} onChange={setPhone} />
            <Input label="Commune de résidence" value={commune} onChange={setCommune} />

            {updateProfileMutation.isError && (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {updateProfileMutation.error.message}
              </p>
            )}

            <button
              type="submit"
              disabled={updateProfileMutation.isPending || isLoading}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-60"
            >
              {updateProfileMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Enregistrer mon profil
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

function Avatar({ url, onUpload }: { url: string | null; onUpload: (url: string) => void }) {
  const [uploading, setUploading] = useState(false);

  async function uploadAvatar(event: React.ChangeEvent<HTMLInputElement>) {
    try {
      setUploading(true);
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Utilisateur non authentifié pour l'upload.");

      const file = event.target.files?.[0];
      if (!file) throw new Error("Vous devez sélectionner une image à uploader.");

      const fileExt = file.name.split(".").pop();
      const filePath = `${auth.user.id}-${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file);

      if (uploadError) throw uploadError;

      // Pour obtenir l'URL publique, il faut que le bucket "avatars" soit configuré comme "public".
      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(filePath);
      onUpload(urlData.publicUrl);

    } catch (error) {
      alert(error instanceof Error ? error.message : "Erreur lors de l'upload de l'avatar.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="-mt-20 mb-4 flex flex-col items-center">
      <div className="relative">
        {url ? (
          <img
            src={url}
            alt="Avatar"
            className="h-24 w-24 rounded-full border-4 border-card object-cover shadow-md"
          />
        ) : (
          <div className="grid h-24 w-24 place-items-center rounded-full border-4 border-card bg-muted shadow-md">
            <User className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
        <label
          htmlFor="avatar-upload"
          className="absolute -bottom-1 -right-1 grid h-8 w-8 cursor-pointer place-items-center rounded-full border-2 border-card bg-primary text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
        </label>
      </div>
      <input
        id="avatar-upload"
        type="file"
        accept="image/*"
        onChange={uploadAvatar}
        disabled={uploading}
        className="hidden"
      />
    </div>
  );
}

function Input({ label, value, onChange, required }: { label: string; value: string; onChange: (v: string) => void; required?: boolean; }) {
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
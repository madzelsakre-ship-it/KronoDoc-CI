import { useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { ShieldCheck, Loader2, Mail, Lock, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Connexion — KronoDoc CI" },
      {
        name: "description",
        content:
          "Connectez-vous ou créez votre compte KronoDoc CI pour suivre vos demandes d'actes d'état civil en ligne.",
      },
      { property: "og:title", content: "Connexion — KronoDoc CI" },
      {
        property: "og:description",
        content: "Accédez à votre espace citoyen KronoDoc CI.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [role, setRole] = useState<"citoyen" | "agent">("citoyen");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const search = Route.useSearch();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/mon-espace`,
            // On stocke le rôle demandé dans les métadonnées de l'utilisateur.
            // Le rôle par défaut sera 'AGENT_PENDING' si agent, sinon 'CITOYEN'.
            data: {
              first_name: firstName, last_name: lastName, phone,
              role: role === 'agent' ? 'AGENT_PENDING' : 'CITOYEN'
            },
          },
        });
        if (error) throw error;
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          navigate({ to: search.redirect || "/mon-espace", replace: true });
          return;
        }
        setMessage("Compte créé. Vérifiez votre boîte mail pour confirmer votre adresse.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: search.redirect || "/mon-espace", replace: true });
        return;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError(null);
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setError("Connexion Google impossible pour le moment.");
      setLoading(false);
      return;
    }
    if (result.redirected) return;
    navigate({ to: search.redirect || "/mon-espace", replace: true });
  }

  // --- Compte passe-partout pour le test ---
  async function handleTestLogin() {
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      // En production, ces identifiants seraient dans des variables d'environnement
      const { error } = await supabase.auth.signInWithPassword({
        email: "test@kronodoc.ci",
        password: "password",
      });
      if (error) throw new Error("Le compte de test n'a pas pu se connecter. Vérifiez sa configuration dans Supabase.");
      navigate({ to: search.redirect || "/citoyen", replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col bg-muted/40">
      <div className="ci-flag-bar h-1 w-full" />
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <Link to="/" className="mx-auto flex w-fit items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <ShieldCheck className="h-5 w-5" strokeWidth={2.4} />
            </div>
            <div className="leading-tight">
              <div className="font-display text-lg font-bold tracking-tight text-foreground">
                KronoDoc <span className="text-primary">CI</span>
              </div>
              <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                État civil digital
              </div>
            </div>
          </Link>

          <div className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-institutional)]">
            <h1 className="font-display text-xl font-bold text-foreground">
              {mode === "signin" ? "Connexion à votre espace" : "Créer votre compte citoyen"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {mode === "signin"
                ? "Suivez vos demandes et récupérez vos documents signés."
                : "Une seule saisie : vos informations sont réutilisées pour chaque demande."}
            </p>

            <button
              type="button"
              onClick={handleGoogle}
              disabled={loading}
              className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-input bg-background text-sm font-semibold text-foreground transition-colors hover:bg-accent disabled:opacity-60"
            >
              <GoogleMark />
              Continuer avec Google
            </button>

            <div className="my-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs uppercase tracking-wider text-muted-foreground">ou</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              {mode === "signup" && (
                <div className="border-b border-border pb-4">
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Vous êtes...</div>
                  <div className="grid grid-cols-2 gap-2">
                    <button type="button" onClick={() => setRole('citoyen')}
                      className={`flex items-center justify-center gap-2 rounded-md py-2 text-sm font-semibold border-2 transition-colors ${role === 'citoyen' ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:bg-muted'}`}>
                      <User className="h-4 w-4" />
                      Un citoyen
                    </button>
                    <button type="button" onClick={() => setRole('agent')}
                      className={`flex items-center justify-center gap-2 rounded-md py-2 text-sm font-semibold border-2 transition-colors ${role === 'agent' ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:bg-muted'}`}>
                      <Briefcase className="h-4 w-4" />
                      Un agent de l'État
                    </button>
                  </div>
                  {role === 'agent' && (
                    <div className="mt-3 rounded-md border border-amber-300 bg-amber-50 p-3 text-xs text-amber-800">
                      Un justificatif professionnel (carte, arrêté de nomination) vous sera demandé après inscription pour valider votre compte agent.
                    </div>
                  )}
                </div>
              )}

              {mode === "signup" && (
                <>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field
                      icon={<User className="h-4 w-4" />}
                      placeholder="Prénom"
                      value={firstName}
                      onChange={setFirstName}
                      required
                    />
                    <Field
                      icon={<User className="h-4 w-4" />}
                      placeholder="Nom"
                      value={lastName}
                      onChange={setLastName}
                      required
                    />
                  </div>
                  <Field
                    icon={<span className="text-xs font-semibold">+225</span>}
                    placeholder="Téléphone"
                    value={phone}
                    onChange={setPhone}
                  />
                </>
              )}
              <Field
                icon={<Mail className="h-4 w-4" />}
                type="email"
                placeholder="Adresse email"
                value={email}
                onChange={setEmail}
                required
              />
              <Field
                icon={<Lock className="h-4 w-4" />}
                type="password"
                placeholder="Mot de passe"
                value={password}
                onChange={setPassword}
                required
              />

              {error && (
                <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
              )}
              {message && (
                <p className="rounded-md bg-success/10 px-3 py-2 text-sm text-success">{message}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-60"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {mode === "signin" ? "Se connecter" : "Créer mon compte"}
              </button>
            </form>

            <p className="mt-4 text-center text-sm text-muted-foreground">
              {mode === "signin" ? "Pas encore de compte ?" : "Vous avez déjà un compte ?"}{" "}
              <button
                type="button"
                onClick={() => {
                  setMode(mode === "signin" ? "signup" : "signin");
                  setError(null);
                  setMessage(null);
                }}
                className="font-semibold text-primary hover:underline"
              >
                {mode === "signin" ? "Créer un compte" : "Se connecter"}
              </button>
            </p>
          </div>
          
          {/* --- Bouton de test "passe-partout" --- */}
          <div className="mt-4 text-center">
            <button
              onClick={handleTestLogin}
              className="text-xs text-muted-foreground hover:text-primary transition-colors">
              Connexion de test (passe-partout)
            </button>
          </div>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            Vos données sont hébergées de façon sécurisée et ne servent qu'au traitement de vos
            démarches administratives.
          </p>
        </div>
      </div>
    </main>
  );
}

function Field({
  icon,
  placeholder,
  value,
  onChange,
  type = "text",
  required,
}: {
  icon: React.ReactNode;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="flex h-11 items-center gap-2 rounded-lg border border-input bg-background px-3 focus-within:ring-2 focus-within:ring-ring">
      <span className="grid w-9 shrink-0 place-items-center text-muted-foreground">{icon}</span>
      <input
        type={type}
        required={required}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-full w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
      />
    </label>
  );
}

function GoogleMark() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.6 2.6 30.2.5 24 .5 14.6.5 6.5 5.8 2.6 13.6l7.8 6.1C12.3 13.6 17.7 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.5 24.5c0-1.6-.1-2.8-.4-4.1H24v8.3h12.8c-.3 2.1-1.7 5.3-5 7.4l7.6 5.9c4.5-4.2 7.1-10.3 7.1-17.5z"
      />
      <path
        fill="#FBBC05"
        d="M10.4 28.3A14.6 14.6 0 019.6 24c0-1.5.3-3 .8-4.3l-7.8-6.1A24 24 0 000 24c0 3.9.9 7.5 2.6 10.7l7.8-6.4z"
      />
      <path
        fill="#34A853"
        d="M24 47.5c6.5 0 11.9-2.1 15.8-5.8l-7.6-5.9c-2 1.4-4.7 2.4-8.2 2.4-6.3 0-11.7-4.1-13.6-9.9l-7.8 6.4C6.5 42.2 14.6 47.5 24 47.5z"
      />
    </svg>
  );
}

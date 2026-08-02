import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  // Cette fonction s'exécute avant le chargement de TOUTES les routes enfants.
  beforeLoad: async ({ context, location }) => {
    const { data, error } = await supabase.auth.getUser();
    // Si l'utilisateur n'est pas connecté, on le redirige vers la page de connexion.
    if (error || !data.user) {
      throw redirect({ to: "/auth", search: { redirect: location.href } });
    }

    // --- VÉRIFICATION DU PROFIL COMPLET (POUR TOUS LES RÔLES) ---
    // On vérifie si le profil est complet avant de donner accès aux autres pages.
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("first_name, last_name")
      .eq("id", data.user.id)
      .single();

    const isProfileIncomplete = !profile || !profile.first_name || !profile.last_name;

    if (isProfileIncomplete && location.pathname !== "/mon-profil") {
      throw redirect({ to: "/mon-profil", search: { redirect: location.href } });
    }

    return { ...context, user: data.user };
  },
  component: () => <Outlet />,
});

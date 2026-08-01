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
    return { ...context, user: data.user };
  },
  component: () => <Outlet />,
});

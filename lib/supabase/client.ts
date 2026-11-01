import { createBrowserClient } from "@supabase/ssr";
import { cookieSecurise, getPublicEnv, nomCookieAuth } from "@/lib/env";
import type { Database } from "./database.types";

/**
 * Client Supabase du navigateur. Clé anonyme, donc soumis à la RLS : il ne peut
 * lire que les projets publiés. Aucune écriture directe n'est possible — tout
 * passe par le serveur.
 *
 * Le nom du cookie doit être identique côté client et côté serveur, sinon la
 * bibliothèque ne retrouve pas la session et déclenche une rafraîchissement
 * inutile à chaque navigation.
 */
export function creerClientSupabaseNavigateur() {
  const { supabaseUrl, supabaseAnonKey } = getPublicEnv();
  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookieOptions: {
      name: nomCookieAuth(),
      secure: cookieSecurise(),
      sameSite: "lax",
      path: "/",
    },
  });
}

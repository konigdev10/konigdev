import { createServerClient } from "@supabase/ssr";
import { cookies, headers } from "next/headers";
import { getPublicEnv, cookieSecurise, nomCookieAuth } from "@/lib/env";
import type { Database } from "./database.types";

/**
 * Client Supabase rattaché aux cookies de la requête en cours.
 *
 * À créer UNE FOIS PAR REQUÊTE (page, action serveur, route API) : un client
 * partagé entre deux requêtes mélangerait les sessions et perdrait les
 * en-têtes anti-cache que la bibliothèque pose au premier écriture de cookie.
 *
 * Ce client utilise la clé ANONYME : il est soumis à la RLS. Un code qui a
 * besoin de contourner la RLS doit passer par lib/supabase/admin.ts.
 */
export function creerClientSupabase() {
  const { supabaseUrl, supabaseAnonKey } = getPublicEnv();
  const store = cookies();
  const hote = headers().get("host");

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookieOptions: {
      name: nomCookieAuth(hote),
      httpOnly: true,
      // Secure suit l'hôte : sur http://localhost le navigateur rejetterait
      // le cookie et aucune connexion ne serait possible.
      secure: cookieSecurise(hote),
      sameSite: "lax",
      path: "/",
    },
    cookies: {
      getAll() {
        return store.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            store.set(name, value, options);
          }
        } catch {
          // Appelé depuis un Server Component en rendu statique : les cookies
          // ne sont pas modifiables ici. Le middleware rafraîchit la session
          // avant le rendu, ce cas n'est donc pas une perte de session.
        }
      },
    },
  });
}

export type ClientSupabase = ReturnType<typeof creerClientSupabase>;

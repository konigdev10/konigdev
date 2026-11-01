import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getServerEnv } from "@/lib/env";
import type { Database } from "./database.types";

/**
 * Client « service role ». Il CONTOURNE la RLS : à n'utiliser que pour les
 * écritures que la base refuse à la clé anonyme (insertion d'une visite, d'un
 * message, lecture du journal) et pour les fonctions réservées à service_role.
 *
 * Ce module porte import "server-only" : l'importer depuis un "use client"
 * échoue au build, ce qui est la garantie demandée (test 9) — la clé ne peut
 * jamais finir dans un bundle envoyé au navigateur.
 *
 * Avant toute écriture sensible, l'appelant doit AVOIR vérifié la session admin
 * avec la clé anonyme (lib/security/guard.ts). Cette fonction ne fait pas le
 * travail d'authentification à sa place.
 */

let client: SupabaseClient<Database> | null = null;

export function creerClientAdmin(): SupabaseClient<Database> {
  const { supabaseUrl, serviceRoleKey } = getServerEnv();
  // Instance unique : ce client n'est lié à aucune requête particulière et
  // n'écrit aucun cookie. Sur Vercel, il survit entre deux invocations.
  if (client === null) {
    client = createClient<Database>(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
}

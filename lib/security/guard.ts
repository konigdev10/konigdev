import "server-only";

import { cookies } from "next/headers";
import { creerClientSupabase, type ClientSupabase } from "@/lib/supabase/server";
import { getServerEnv } from "@/lib/env";
import { NOM_COOKIE_ACTIVITE, verifierJetonActivite } from "./session";
import { motDePasseRecent } from "./validate";

export interface SessionAdmin {
  userId: string;
  email: string | null;
}

export type MotifRefusSession =
  | "config-absente"
  | "sans-jeton"
  | "utilisateur-different"
  | "aal-insuffisant"
  | "jeton-invalide";

export type VerificationSession =
  | { ok: true; session: SessionAdmin }
  | { ok: false; motif: MotifRefusSession };

export async function verifierSessionAdmin(client?: ClientSupabase): Promise<VerificationSession> {
  try {
    const { adminUserId, sessionSigningSecret } = getServerEnv();
    if (!adminUserId) return { ok: false, motif: "config-absente" };
    const supabase = client ?? creerClientSupabase();
    const { data: utilisateur, error: erreurUtilisateur } = await supabase.auth.getUser();
    if (erreurUtilisateur || !utilisateur.user) return { ok: false, motif: "sans-jeton" };
    if (utilisateur.user.id !== adminUserId) return { ok: false, motif: "utilisateur-different" };
    const { data, error } = await supabase.auth.getClaims();
    if (error || data?.claims.sub !== adminUserId) return { ok: false, motif: "sans-jeton" };
    if (data.claims.aal !== "aal2") return { ok: false, motif: "aal-insuffisant" };
    const activite = await verifierJetonActivite(
      cookies().get(NOM_COOKIE_ACTIVITE)?.value ?? null,
      adminUserId,
      sessionSigningSecret,
    );
    if (!activite.valide) return { ok: false, motif: "jeton-invalide" };
    return { ok: true, session: { userId: adminUserId, email: utilisateur.user.email ?? null } };
  } catch {
    return { ok: false, motif: "config-absente" };
  }
}

export async function sessionAdmin(client?: ClientSupabase): Promise<SessionAdmin | null> {
  const resultat = await verifierSessionAdmin(client);
  return resultat.ok ? resultat.session : null;
}

// Seul un mot de passe récent en aal1 ouvre une nouvelle session MFA.
export async function sessionMfa(client: ClientSupabase): Promise<"initiale" | "complete" | null> {
  const resultat = await verifierSessionAdmin(client);
  if (resultat.ok) return "complete";
  if (resultat.motif !== "aal-insuffisant" || cookies().has(NOM_COOKIE_ACTIVITE)) return null;
  const { data, error } = await client.auth.getClaims();
  return !error && data?.claims.aal === "aal1" && motDePasseRecent(data.claims.amr)
    ? "initiale"
    : null;
}

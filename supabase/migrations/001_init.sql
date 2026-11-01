-- ===========================================================================
-- 001_init.sql — Socle du portfolio KoniG.dev
-- Base : Supabase Postgres (15+). Exécuter dans l'ordre, une seule fois.
--
-- PRÉREQUIS MANUELS dans le tableau de bord Supabase (non réalisables en SQL) :
--   1. Authentication > Providers > Email : activer.
--   2. Authentication > Sign In / Up : désactiver « Allow new users to sign up »
--      (les inscriptions publiques doivent rester fermées en permanence).
--   3. Authentication > Multi-factor Auth : activer TOTP, puis créer le compte
--      admin et noter son UUID (Auth > Users > Identifiant).
--   4. Exécuter ce fichier.
--   5. Renseigner l'UUID admin (voir « CONFIGURATION » à la fin du fichier).
--
-- PRINCIPE : la clé anonyme n'a le droit d'écrire nulle part. Toute écriture
-- venant d'un visiteur passe par le serveur (clé service role). Toute lecture
-- sensible exige un compte admin ET le niveau d'assurance aal2 (MFA validée).
-- ===========================================================================

create extension if not exists pgcrypto with schema extensions;

-- ---------------------------------------------------------------------------
-- 1. CONFIGURATION
-- ---------------------------------------------------------------------------
-- L'UUID de l'administrateur vit dans une table, pas dans le code de la
-- migration : la migration s'exécute avant la création du compte.
-- Ce fichier n'a aucune policy : on ne peut le toucher que depuis l'éditeur
-- SQL (rôle postgres). Les policies lisent la valeur via la fonction
-- SECURITY DEFINER admin_user_id() ci-dessous.

create table if not exists public.app_config (
  key        text primary key,
  value      text not null,
  updated_at timestamptz not null default now()
);

insert into public.app_config (key, value) values
  ('admin_user_id', '00000000-0000-0000-0000-000000000000'),
  ('visites_conservation_jours', '365')
on conflict (key) do nothing;

-- ---------------------------------------------------------------------------
-- 2. TABLES
-- ---------------------------------------------------------------------------

-- 2.1 projects --------------------------------------------------------------
create table if not exists public.projects (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  slug       text not null unique,
  nom        text not null,
  categorie  text not null check (categorie in (
               'Site web', 'Application web', 'Application mobile',
               'Automatisation IA', 'Graphisme')),
  annee      text,
  statut     text not null check (statut in ('En ligne', 'En cours', 'Étude de cas')),
  role       text not null,
  resume     text not null,
  outils     text[] not null default '{}',
  resultat   text,
  image_url  text,
  lien       text,
  ordre      integer not null default 0,
  publie     boolean not null default false,
  constraint projects_slug_format check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  constraint projects_resume_taille check (char_length(resume) <= 2000),
  constraint projects_nom_taille check (char_length(nom) <= 120),
  constraint projects_outils_nombre check (coalesce(array_length(outils, 1), 0) <= 20)
);

create index if not exists projects_publie_ordre on public.projects (publie, ordre);

-- 2.2 visits ----------------------------------------------------------------
-- Un visiteur n'est JAMAIS identifié par son IP : ip_hash est un SHA-256 salé,
-- non inversable, utilisé uniquement pour compter des visiteurs uniques.
create table if not exists public.visits (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  path        text not null,
  referrer    text,
  pays        text,
  region      text,
  ville       text,
  quartier    text,
  device_type text check (device_type in ('mobile', 'tablette', 'ordinateur')),
  marque      text,
  modele      text,
  os          text,
  os_version  text,
  navigateur  text,
  langue      text,
  ecran       text,
  visitor_id  uuid,
  ip_hash     text not null,
  est_bot     boolean not null default false,
  nom         text,
  constraint visits_path_format check (path ~ '^/[A-Za-z0-9._~/?%&=#+-]{0,511}$'),
  constraint visits_hash_format check (ip_hash ~ '^[a-f0-9]{64}$'),
  constraint visits_pays_taille check (pays is null or char_length(pays) <= 60),
  constraint visits_ville_taille check (ville is null or char_length(ville) <= 60),
  constraint visits_nom_taille check (nom is null or char_length(nom) <= 120)
);

create index if not exists visits_created_at on public.visits (created_at desc);
create index if not exists visits_ip_hash on public.visits (ip_hash, created_at desc);
create index if not exists visits_path on public.visits (path);
create index if not exists visits_visitor_id on public.visits (visitor_id);

-- 2.3 messages --------------------------------------------------------------
create table if not exists public.messages (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  nom        text not null,
  contact    text not null,
  projet     text not null,
  budget     text,
  message    text not null,
  quartier   text,
  visitor_id uuid,
  lu         boolean not null default false,
  repondu    boolean not null default false,
  constraint messages_nom_taille check (char_length(nom) between 1 and 120),
  constraint messages_contact_taille check (char_length(contact) between 1 and 320),
  constraint messages_message_taille check (char_length(message) between 1 and 8000)
);

create index if not exists messages_created_at on public.messages (created_at desc);
create index if not exists messages_non_lus on public.messages (lu) where lu = false;

-- 2.4 admin_logs ------------------------------------------------------------
-- Journal d'audit en ajout seul : ce fichier ne déclare AUCUNE policy d'update
-- ni de delete. La RLS refusant tout ce qui n'est pas déclaré, une modification
-- d'une ligne existante est impossible, même pour l'admin connecté.
create table if not exists public.admin_logs (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  action     text not null,
  detail     text,
  ip_hash    text,
  reussite   boolean not null default true,
  constraint admin_logs_action_taille check (char_length(action) <= 80),
  constraint admin_logs_detail_taille check (detail is null or char_length(detail) <= 2000)
);

create index if not exists admin_logs_created_at on public.admin_logs (created_at desc);

-- 2.5 login_attempts --------------------------------------------------------
-- Vercel est sans état : le compteur de tentatives doit survivre entre deux
-- invocations, donc il vit en base.
create table if not exists public.login_attempts (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  ip_hash    text not null,
  reussite   boolean not null default false,
  constraint login_attempts_hash_format check (ip_hash ~ '^[a-f0-9]{64}$')
);

create index if not exists login_attempts_ip_time on public.login_attempts (ip_hash, created_at desc);

-- 2.6 rate_limits -----------------------------------------------------------
create table if not exists public.rate_limits (
  cle      text not null,
  fenetre  timestamptz not null,
  compteur integer not null default 1,
  primary key (cle, fenetre)
);

create index if not exists rate_limits_fenetre on public.rate_limits (fenetre);

-- ---------------------------------------------------------------------------
-- 3. FONCTIONS D'AIDE
-- ---------------------------------------------------------------------------

-- 3.1 Qui est l'admin ? -----------------------------------------------------
-- SECURITY DEFINER : cette fonction lit app_config alors que l'appelant
-- (rôle authenticated) n'y a pas accès par la RLS. Le search_path est épinglé
-- pour empêcher une évasion par schéma.
create or replace function public.admin_user_id()
returns uuid
language sql stable security definer
set search_path = public
as $$
  select nullif(
    (select value from public.app_config where key = 'admin_user_id'),
    '00000000-0000-0000-0000-000000000000'
  )::uuid;
$$;

revoke execute on function public.admin_user_id() from public, anon, authenticated;
grant execute on function public.admin_user_id() to authenticated, service_role;

-- 3.2 Session admin valide ET double authentification vérifiée --------------
-- Les deux conditions sont indissociables : sans aal2, aucune donnée.
create or replace function public.is_admin_aal2()
returns boolean
language sql stable security definer
set search_path = public
as $$
  select coalesce(
    auth.uid() is not null
    and auth.uid() = public.admin_user_id()
    and (auth.jwt() ->> 'aal') = 'aal2',
    false
  );
$$;

revoke execute on function public.is_admin_aal2() from public, anon, authenticated;
grant execute on function public.is_admin_aal2() to authenticated, service_role;

-- 3.3 Horodatage automatique ------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists projects_touch_updated_at on public.projects;
create trigger projects_touch_updated_at
  before update on public.projects
  for each row execute function public.touch_updated_at();

-- 3.4 Compteur de débit atomique -------------------------------------------
-- Un seul aller-retour, sans fenêtre de course : INSERT ... ON CONFLICT ...
-- RETURNING. La clé est verrouillée par l'upsert, donc deux requêtes
-- simultanées ne peuvent pas toutes deux passer sous le seuil.
create or replace function public.rate_limit_hit(
  p_cle      text,
  p_duree    integer,
  p_seuil    integer
)
returns table (compteur integer, autorise boolean, blocage_jusqua timestamptz)
language sql
as $$
  with fenetre as (
    select to_timestamp(
             floor(extract(epoch from now()) / p_duree) * p_duree
           ) as debut
  ),
  upsert as (
    insert into public.rate_limits as r (cle, fenetre, compteur)
    select p_cle, f.debut, 1 from fenetre f
    on conflict (cle, fenetre)
      do update set compteur = r.compteur + 1
      where r.cle = p_cle
    returning r.compteur, r.fenetre
  )
  select
    u.compteur::integer,
    u.compteur <= p_seuil,
    (u.fenetre + make_interval(secs => p_duree))::timestamptz
  from upsert u;
$$;

-- Volontairement PAS en SECURITY DEFINER : l'insertion respecte la RLS de
-- l'appelant. Seul service_role (qui la contourne) peut donc l'utiliser ; une
-- clé anonyme qui l'appellerait n'écrirait rien.
revoke execute on function public.rate_limit_hit(text, integer, integer)
  from public, anon, authenticated;
grant execute on function public.rate_limit_hit(text, integer, integer)
  to service_role;

-- 3.5 Blocage progressif de la connexion -----------------------------------
-- Retourne le nombre de secondes de blocage restant (0 = libre).
-- Paliers : 1re série -> 60 s, 2e -> 300 s, 3e et plus -> 1800 s.
create or replace function public.login_lockout_remaining(p_ip_hash text)
returns integer
language sql stable security definer
set search_path = public
as $$
  select case
    when t.echecs < 5 then 0
    when t.echecs < 10 then greatest(0, ceil(extract(epoch from
      (t.dernier + interval '1 minute') - now()))::int)
    when t.echecs < 15 then greatest(0, ceil(extract(epoch from
      (t.dernier + interval '5 minutes') - now()))::int)
    else greatest(0, ceil(extract(epoch from
      (t.dernier + interval '30 minutes') - now()))::int)
  end
  from (
    select count(*)::integer as echecs,
           max(created_at)   as dernier
    from public.login_attempts
    where ip_hash = p_ip_hash
      and reussite = false
      and created_at > now() - interval '30 minutes'
  ) t;
$$;

revoke execute on function public.login_lockout_remaining(text) from public, anon;
grant execute on function public.login_lockout_remaining(text) to service_role;

-- 3.6 Purge des visites ----------------------------------------------------
-- Supprime tout ce qui est plus ancien que N jours et renvoie le nombre de
-- lignes retirées. Appelé par la tâche planifiée, côté serveur.
create or replace function public.purge_old_visits(jours integer default 365)
returns integer
language plpgsql security definer
set search_path = public
as $$
declare
  supprimes integer;
begin
  if jours is null or jours < 1 or jours > 3650 then
    raise exception 'duree de conservation invalide';
  end if;

  delete from public.visits
  where created_at < now() - make_interval(days => jours);

  get diagnostics supprimes = row_count;
  return supprimes;
end;
$$;

revoke execute on function public.purge_old_visits(integer) from public, anon, authenticated;
grant execute on function public.purge_old_visits(integer) to service_role;

-- ---------------------------------------------------------------------------
-- 4. ROW LEVEL SECURITY
-- ---------------------------------------------------------------------------

alter table public.app_config    enable row level security;
alter table public.projects      enable row level security;
alter table public.visits        enable row level security;
alter table public.messages      enable row level security;
alter table public.admin_logs    enable row level security;
alter table public.login_attempts enable row level security;
alter table public.rate_limits   enable row level security;

-- app_config : aucune policy. Lecture et écriture réservées au rôle postgres
-- via l'éditeur SQL. La fonction admin_user_id() la lit en SECURITY DEFINER.

-- 4.1 projects -------------------------------------------------------------
-- Lecture publique des projets publiés uniquement ; brouillons invisibles.
create policy "projects lecture publique"
  on public.projects for select
  to anon, authenticated
  using (publie = true);

-- Toute opération admin exige admin + aal2.
create policy "projects lecture admin"
  on public.projects for select
  to authenticated
  using (public.is_admin_aal2());

create policy "projects insertion admin"
  on public.projects for insert
  to authenticated
  with check (public.is_admin_aal2());

create policy "projects modification admin"
  on public.projects for update
  to authenticated
  using (public.is_admin_aal2())
  with check (public.is_admin_aal2());

create policy "projects suppression admin"
  on public.projects for delete
  to authenticated
  using (public.is_admin_aal2());

-- 4.2 visits ---------------------------------------------------------------
-- Aucun accès à la clé anonyme : les écritures viennent du serveur.
create policy "visits lecture admin"
  on public.visits for select
  to authenticated
  using (public.is_admin_aal2());

create policy "visits suppression admin"
  on public.visits for delete
  to authenticated
  using (public.is_admin_aal2());

-- 4.3 messages -------------------------------------------------------------
create policy "messages lecture admin"
  on public.messages for select
  to authenticated
  using (public.is_admin_aal2());

create policy "messages modification admin"
  on public.messages for update
  to authenticated
  using (public.is_admin_aal2())
  with check (public.is_admin_aal2());

create policy "messages suppression admin"
  on public.messages for delete
  to authenticated
  using (public.is_admin_aal2());

-- 4.4 admin_logs : ajout seul ----------------------------------------------
-- Volontairement : aucune policy d'update ni de delete.
create policy "admin_logs lecture admin"
  on public.admin_logs for select
  to authenticated
  using (public.is_admin_aal2());

-- 4.5 login_attempts -------------------------------------------------------
create policy "login_attempts lecture admin"
  on public.login_attempts for select
  to authenticated
  using (public.is_admin_aal2());

create policy "login_attempts suppression admin"
  on public.login_attempts for delete
  to authenticated
  using (public.is_admin_aal2());

-- 4.6 rate_limits ----------------------------------------------------------
create policy "rate_limits lecture admin"
  on public.rate_limits for select
  to authenticated
  using (public.is_admin_aal2());

create policy "rate_limits purge admin"
  on public.rate_limits for delete
  to authenticated
  using (public.is_admin_aal2());

-- ---------------------------------------------------------------------------
-- 5. STORAGE — bucket « projets »
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('projets', 'projets', true)
on conflict (id) do update set public = true;

create policy "projets lecture publique"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'projets');

create policy "projets depot admin"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'projets' and public.is_admin_aal2());

create policy "projets remplacement admin"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'projets' and public.is_admin_aal2())
  with check (bucket_id = 'projets' and public.is_admin_aal2());

create policy "projets retrait admin"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'projets' and public.is_admin_aal2());

-- ---------------------------------------------------------------------------
-- 6. CONTRÔLE
-- ---------------------------------------------------------------------------
-- Après exécution, ces trois requêtes doivent renvoyer les valeurs attendues :
--   select count(*) from pg_policies where schemaname = 'public';      -- > 0
--   select relname, relrowsecurity from pg_class
--     where relnamespace = 'public'::regnamespace and relkind = 'r';   -- tout true
--   select public.is_admin_aal2();                                     -- false hors session
--
-- ÉTAPE OBLIGATOIRE APRÈS LA MIGRATION — renseigner l'UUID du compte admin
-- (Auth > Users > Identifiant), sinon l'administration reste inaccessible :
--
--   update public.app_config
--      set value = '<UUID-ADMIN>', updated_at = now()
--    where key = 'admin_user_id';

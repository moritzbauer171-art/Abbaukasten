-- AB-Werkstatt: Tabelle für die Online-Ablage der Arbeitsblätter
-- Eingerichtet im Supabase-Projekt der Organisation EduFire (Migration „ab_werkstatt_arbeitsblaetter“).
-- Für ein anderes Projekt: einmal im Supabase-Dashboard unter "SQL Editor" ausführen.
-- Jedes Konto sieht und ändert nur seine eigenen Blätter (Row Level Security).

create table if not exists public.ab_arbeitsblaetter (
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  id          text not null,
  klasse      text not null default 'gk',          -- gk = Grundkurs, k10 = Klasse 10, k910 = Klasse 9/10
  title       text not null default '',
  nr          text not null default '',
  data        jsonb not null,                       -- das ganze Blatt (Kopf, Bausteine, Bilder)
  suchtext    text not null default '',             -- für die Suche in „Meine Blätter“ (Migration „ab_werkstatt_suchtext“)
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  primary key (user_id, id)
);
comment on table public.ab_arbeitsblaetter is 'AB-Werkstatt: Arbeitsblätter, je Konto (RLS)';

create index if not exists ab_arbeitsblaetter_user_updated_idx on public.ab_arbeitsblaetter (user_id, updated_at desc);

alter table public.ab_arbeitsblaetter enable row level security;

drop policy if exists "AB: eigene Blätter lesen"   on public.ab_arbeitsblaetter;
drop policy if exists "AB: eigene Blätter anlegen" on public.ab_arbeitsblaetter;
drop policy if exists "AB: eigene Blätter ändern"  on public.ab_arbeitsblaetter;
drop policy if exists "AB: eigene Blätter löschen" on public.ab_arbeitsblaetter;

create policy "AB: eigene Blätter lesen"   on public.ab_arbeitsblaetter for select to authenticated using ((select auth.uid()) = user_id);
create policy "AB: eigene Blätter anlegen" on public.ab_arbeitsblaetter for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "AB: eigene Blätter ändern"  on public.ab_arbeitsblaetter for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "AB: eigene Blätter löschen" on public.ab_arbeitsblaetter for delete to authenticated using ((select auth.uid()) = user_id);

revoke all on public.ab_arbeitsblaetter from anon;
grant select, insert, update, delete on public.ab_arbeitsblaetter to authenticated;

-- Einstellungen je Konto: Ordner, Zuordnung der Blätter, eigene Reihenfolge (Migration „ab_werkstatt_einstellungen“)
create table if not exists public.ab_einstellungen (
  user_id     uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  data        jsonb not null default '{}'::jsonb,
  updated_at  timestamptz not null default now()
);
alter table public.ab_einstellungen enable row level security;
drop policy if exists "AB: eigene Einstellungen lesen"   on public.ab_einstellungen;
drop policy if exists "AB: eigene Einstellungen anlegen" on public.ab_einstellungen;
drop policy if exists "AB: eigene Einstellungen ändern"  on public.ab_einstellungen;
drop policy if exists "AB: eigene Einstellungen löschen" on public.ab_einstellungen;
create policy "AB: eigene Einstellungen lesen"   on public.ab_einstellungen for select to authenticated using ((select auth.uid()) = user_id);
create policy "AB: eigene Einstellungen anlegen" on public.ab_einstellungen for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "AB: eigene Einstellungen ändern"  on public.ab_einstellungen for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "AB: eigene Einstellungen löschen" on public.ab_einstellungen for delete to authenticated using ((select auth.uid()) = user_id);
revoke all on public.ab_einstellungen from anon;
grant select, insert, update, delete on public.ab_einstellungen to authenticated;

-- ---------- Digitale Fassungen zum Teilen per Link und QR-Code ----------
-- Lehrkräfte legen ihre eigenen Fassungen an (RLS). Schülerinnen und Schüler lesen ein Blatt nur über
-- ab_digital_get mit der ID aus dem Link; eine Auflistung aller Blätter ist für sie nicht möglich.
create table if not exists public.ab_digital (
  id          text primary key check (id ~ '^[A-Za-z0-9]{8,24}$'),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  sheet_id    text,
  title       text not null default '',
  html        text not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists ab_digital_user_idx on public.ab_digital (user_id, updated_at desc);
alter table public.ab_digital enable row level security;
drop policy if exists "AB digital: eigene lesen"   on public.ab_digital;
drop policy if exists "AB digital: eigene anlegen" on public.ab_digital;
drop policy if exists "AB digital: eigene ändern"  on public.ab_digital;
drop policy if exists "AB digital: eigene löschen" on public.ab_digital;
create policy "AB digital: eigene lesen"   on public.ab_digital for select to authenticated using ((select auth.uid()) = user_id);
create policy "AB digital: eigene anlegen" on public.ab_digital for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "AB digital: eigene ändern"  on public.ab_digital for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "AB digital: eigene löschen" on public.ab_digital for delete to authenticated using ((select auth.uid()) = user_id);
create or replace function public.ab_digital_get(p_id text)
returns text language sql stable security definer set search_path = ''
as $$ select d.html from public.ab_digital d where d.id = p_id $$;
grant execute on function public.ab_digital_get(text) to anon, authenticated;

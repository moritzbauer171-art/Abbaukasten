-- AB-Werkstatt: Tabelle für die Online-Ablage der Arbeitsblätter
-- Einmal im Supabase-Dashboard unter "SQL Editor" ausführen.
-- Jedes Konto sieht und ändert nur seine eigenen Blätter (Row Level Security).

create table if not exists public.worksheets (
  id          text primary key,
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  klasse      text not null default 'gk',          -- gk = Grundkurs, k10 = Klasse 10, k910 = Klasse 9/10
  title       text not null default '',
  nr          text not null default '',
  data        jsonb not null,                       -- das ganze Blatt (Kopf, Bausteine, Bilder)
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists worksheets_user_updated_idx on public.worksheets (user_id, updated_at desc);

alter table public.worksheets enable row level security;

drop policy if exists "Eigene Blätter lesen"   on public.worksheets;
drop policy if exists "Eigene Blätter anlegen" on public.worksheets;
drop policy if exists "Eigene Blätter ändern"  on public.worksheets;
drop policy if exists "Eigene Blätter löschen" on public.worksheets;

create policy "Eigene Blätter lesen"   on public.worksheets for select to authenticated using ((select auth.uid()) = user_id);
create policy "Eigene Blätter anlegen" on public.worksheets for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Eigene Blätter ändern"  on public.worksheets for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Eigene Blätter löschen" on public.worksheets for delete to authenticated using ((select auth.uid()) = user_id);

revoke all on public.worksheets from anon;
grant select, insert, update, delete on public.worksheets to authenticated;

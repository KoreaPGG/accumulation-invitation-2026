create table if not exists public.typeface_entries (
  id uuid primary key default gen_random_uuid(),
  sentence text not null,
  created_at timestamptz not null default now(),
  constraint typeface_entries_sentence_length
    check (char_length(btrim(sentence)) between 1 and 35)
);

alter table public.typeface_entries enable row level security;

drop policy if exists "Anyone can read typeface entries"
  on public.typeface_entries;
create policy "Anyone can read typeface entries"
  on public.typeface_entries
  for select
  to anon, authenticated
  using (true);

drop policy if exists "Anyone can add typeface entries"
  on public.typeface_entries;
create policy "Anyone can add typeface entries"
  on public.typeface_entries
  for insert
  to anon, authenticated
  with check (char_length(btrim(sentence)) between 1 and 35);

grant select, insert on public.typeface_entries to anon, authenticated;

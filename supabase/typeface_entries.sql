create table if not exists public.typeface_entries (
  id uuid primary key default gen_random_uuid(),
  sentence text not null,
  owner_token_hash text,
  created_at timestamptz not null default now(),
  constraint typeface_entries_sentence_length
    check (char_length(btrim(sentence)) between 1 and 35)
);

alter table public.typeface_entries
  add column if not exists owner_token_hash text;

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

create or replace function public.typeface_sentence_has_blocked_terms(input_sentence text)
returns boolean
language sql
immutable
as $$
  with normalized as (
    select regexp_replace(
      normalize(lower(coalesce(input_sentence, '')), NFKC),
      '[^[:alnum:]]', '', 'g'
    ) as sentence
  )
  select exists (
    select 1
    from normalized
    cross join unnest(array[
      '씨발', '시발', '씨팔', '시팔', '씹할', '씹팔', 'ㅅㅂ', 'ㅆㅂ',
      '좆', '좃', '조까', '존나', '졸라', '병신', '븅신', '빙신',
      '개새끼', '개새', '씹새끼', '씹새', '지랄', '염병',
      '개년', '개놈', '미친년', '미친놈',
      'fuck', 'fcuk', 'fuk', 'fck', 'phuck', 'fucker', 'fucking',
      'shit', 'shitty', 'bullshit', 'bitch', 'bitches', 'bitching',
      'bastard', 'asshole', 'dumbass', 'motherfucker', 'dickhead'
    ]::text[]) as blocked(term)
    where normalized.sentence like '%' || regexp_replace(
      normalize(lower(blocked.term), NFKC),
      '[^[:alnum:]]', '', 'g'
    ) || '%'
  );
$$;

create or replace function public.reject_typeface_blocked_terms()
returns trigger
language plpgsql
as $$
begin
  if public.typeface_sentence_has_blocked_terms(new.sentence) then
    raise exception using
      errcode = 'P0001',
      message = 'TYPEFACE_BLOCKED_TERM';
  end if;

  return new;
end;
$$;

drop trigger if exists typeface_entries_block_profanity
  on public.typeface_entries;
create trigger typeface_entries_block_profanity
  before insert or update on public.typeface_entries
  for each row
  execute function public.reject_typeface_blocked_terms();

create or replace function public.delete_typeface_entry(
  p_entry_id uuid,
  p_owner_token_hash text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  deleted boolean;
begin
  delete from public.typeface_entries
  where id = p_entry_id
    and owner_token_hash = p_owner_token_hash
  returning true into deleted;

  return coalesce(deleted, false);
end;
$$;

revoke all on function public.delete_typeface_entry(uuid, text) from public;
grant execute on function public.delete_typeface_entry(uuid, text) to anon, authenticated;

-- Purge existing entries that match the blocklist; this permanently deletes them.
delete from public.typeface_entries
where public.typeface_sentence_has_blocked_terms(sentence);

revoke select, delete on public.typeface_entries from anon, authenticated;
grant select (id, sentence, created_at) on public.typeface_entries to anon, authenticated;
grant insert on public.typeface_entries to anon, authenticated;

-- Safe, additive migration for existing typeface_entries installations.
-- Unlike typeface_entries.sql, this migration does not purge existing entries.

alter table public.typeface_entries
  add column if not exists owner_token_hash text;

alter table public.typeface_entries
  add column if not exists nickname text not null default '익명';

alter table public.typeface_entries
  alter column nickname set default '익명';

update public.typeface_entries
set nickname = '익명'
where nickname is null or btrim(nickname) = '';

alter table public.typeface_entries
  alter column nickname set not null;

do $$
begin
  if not exists (
    select 1
    from pg_catalog.pg_constraint
    where conrelid = 'public.typeface_entries'::regclass
      and conname = 'typeface_entries_nickname_length'
  ) then
    alter table public.typeface_entries
      add constraint typeface_entries_nickname_length
      check (char_length(btrim(nickname)) between 1 and 20);
  end if;
end;
$$;

grant select (id, sentence, nickname, created_at)
  on public.typeface_entries to anon, authenticated;
grant insert on public.typeface_entries to anon, authenticated;

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

notify pgrst, 'reload schema';

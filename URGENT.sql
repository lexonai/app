
alter table public.profiles
  add column if not exists onboarding_completed boolean default false;

alter table public.profiles
  add column if not exists lexon_id text;

update public.profiles
set lexon_id = 'LX-' || substr(md5(random()::text || id::text), 1, 8)
where lexon_id is null;

do $$
begin
  if not exists (
    select 1 from pg_indexes
    where schemaname = 'public' and indexname = 'profiles_lexon_id_key'
  ) then
    create unique index profiles_lexon_id_key on public.profiles (lexon_id);
  end if;
end $$;

insert into public.profiles (id, email, onboarding_completed)
select u.id, u.email, false
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null;

select id, email, onboarding_completed, lexon_id
from public.profiles
where onboarding_completed is null or lexon_id is null;

alter table public.profiles
  add column if not exists avatar_id int default (floor(random() * 20) + 1)::int;

update public.profiles
set avatar_id = (floor(random() * 20) + 1)::int
where avatar_id is null;

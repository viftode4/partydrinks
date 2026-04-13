create table if not exists public.party_feature_flags (
  key text primary key,
  enabled boolean not null default false,
  description text,
  updated_at timestamptz not null default timezone('utc', now())
);

insert into public.party_feature_flags (key, enabled, description)
values
  ('duels', false, 'Enables duel challenge, accept, and resolve flows.'),
  ('rivalry-callouts', true, 'Shows derived rivalry and hot-streak callouts.'),
  ('projector-chaos', false, 'Allows more aggressive projector rotations and overlays.')
on conflict (key) do update
set enabled = excluded.enabled,
    description = excluded.description,
    updated_at = timezone('utc', now());

create table if not exists public.score_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  source_type text not null check (source_type in ('drink', 'duel')),
  source_id text not null,
  delta integer not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  unique (source_type, source_id, user_id)
);

create index if not exists idx_score_events_user_created_at
  on public.score_events (user_id, created_at desc);

create table if not exists public.duels (
  id uuid primary key default gen_random_uuid(),
  challenger_id uuid not null references public.users (id) on delete cascade,
  opponent_id uuid not null references public.users (id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'active', 'completed', 'cancelled')),
  wager_points integer not null default 5 check (wager_points between 1 and 25),
  winner_id uuid references public.users (id) on delete set null,
  loser_id uuid references public.users (id) on delete set null,
  accepted_at timestamptz,
  resolved_at timestamptz,
  cancelled_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  constraint duel_participants_must_differ check (challenger_id <> opponent_id)
);

create unique index if not exists idx_duels_open_pair
  on public.duels (
    least(challenger_id::text, opponent_id::text),
    greatest(challenger_id::text, opponent_id::text)
  )
  where status in ('pending', 'active');

create index if not exists idx_duels_status_created_at
  on public.duels (status, created_at desc);

insert into public.score_events (user_id, source_type, source_id, delta, metadata, created_at)
select
  drinks.user_id,
  'drink',
  drinks.id::text,
  drinks.points,
  jsonb_build_object('drink_type', drinks.drink_type),
  drinks.created_at
from public.drinks
on conflict (source_type, source_id, user_id) do nothing;

create or replace view public.authoritative_rankings as
select
  users.id as user_id,
  users.username,
  users.profile_image_url,
  coalesce(sum(score_events.delta), 0)::int as total_points
from public.users
left join public.score_events on score_events.user_id = users.id
group by users.id, users.username, users.profile_image_url;

create or replace function public.resolve_duel(
  p_duel_id uuid,
  p_winner_id uuid,
  p_resolved_by uuid default null,
  p_note text default null
)
returns public.duels
language plpgsql
security definer
set search_path = public
as $$
declare
  duel_row public.duels;
  losing_user_id uuid;
begin
  select *
  into duel_row
  from public.duels
  where id = p_duel_id
  for update;

  if duel_row.id is null then
    raise exception 'Duel % not found', p_duel_id;
  end if;

  if duel_row.status <> 'active' then
    raise exception 'Duel % is not active', p_duel_id;
  end if;

  if p_winner_id not in (duel_row.challenger_id, duel_row.opponent_id) then
    raise exception 'Winner % is not part of duel %', p_winner_id, p_duel_id;
  end if;

  losing_user_id := case
    when p_winner_id = duel_row.challenger_id then duel_row.opponent_id
    else duel_row.challenger_id
  end;

  update public.duels
  set status = 'completed',
      winner_id = p_winner_id,
      loser_id = losing_user_id,
      resolved_at = timezone('utc', now()),
      metadata = duel_row.metadata
        || jsonb_build_object('resolved_by', p_resolved_by, 'resolution_note', p_note)
  where id = p_duel_id
  returning * into duel_row;

  insert into public.score_events (user_id, source_type, source_id, delta, metadata, created_at)
  values
    (
      p_winner_id,
      'duel',
      p_duel_id::text,
      duel_row.wager_points,
      jsonb_build_object('duel_id', p_duel_id, 'outcome', 'winner', 'wager_points', duel_row.wager_points),
      timezone('utc', now())
    ),
    (
      losing_user_id,
      'duel',
      p_duel_id::text,
      -duel_row.wager_points,
      jsonb_build_object('duel_id', p_duel_id, 'outcome', 'loser', 'wager_points', duel_row.wager_points),
      timezone('utc', now())
    )
  on conflict (source_type, source_id, user_id) do nothing;

  return duel_row;
end;
$$;

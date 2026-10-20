-- every song a user has liked
create table liked_songs (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  song_id bigint not null,
  title text not null,
  artist text not null,
  artist_id bigint not null,
  album text not null,
  cover_url text not null,
  preview_url text not null,
  liked_at timestamptz not null default now(),
  -- the same user can't like the same song twice
  unique (user_id, song_id)
);

-- one row of preferences per user, filled in on the sign up questions
create table preferences (
  user_id uuid primary key default auth.uid() references auth.users(id) on delete cascade,
  genres text[] not null default '{}',
  favorite_artists text[] not null default '{}',
  discovery_style text not null default 'close' check (discovery_style in ('close', 'surprise')),
  updated_at timestamptz not null default now()
);

-- locks both tables
alter table liked_songs enable row level security;
alter table preferences enable row level security;

-- users can only see, add, and remove their own likes
create policy "read own likes" on liked_songs
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "add own likes" on liked_songs
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "remove own likes" on liked_songs
  for delete to authenticated using ((select auth.uid()) = user_id);

-- users can only see, create, and change their own preferences
create policy "read own preferences" on preferences
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "add own preferences" on preferences
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "update own preferences" on preferences
  for update to authenticated using ((select auth.uid()) = user_id);
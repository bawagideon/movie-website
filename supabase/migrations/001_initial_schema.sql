-- Enable the pgvector extension to work with embedding vectors
create extension if not exists vector;

-- Create a table for public profiles
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  username text unique,
  avatar_url text,
  preferences jsonb default '{}'::jsonb,
  taste_vector vector(1536), -- Assuming 1536 dimensions for embeddings (e.g., text-embedding-3-small)
  updated_at timestamp with time zone,
  
  constraint username_length check (char_length(username) >= 3)
);

-- Set up Row Level Security (RLS) for profiles
alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on public.profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on public.profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on public.profiles for update
  using ( auth.uid() = id );

-- Create a trigger to automatically create a profile for new users
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create table for User Mood Sessions (The Mood Deck)
create table if not exists public.user_mood_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  session_name text,
  mood_prompt text not null,
  recommended_movie_ids integer[] default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.user_mood_sessions enable row level security;

create policy "Users can view their own mood sessions."
  on public.user_mood_sessions for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own mood sessions."
  on public.user_mood_sessions for insert
  with check ( auth.uid() = user_id );

create policy "Users can delete their own mood sessions."
  on public.user_mood_sessions for delete
  using ( auth.uid() = user_id );

-- Create table for User History (Watched movies + Ratings)
create table if not exists public.user_history (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  movie_id integer not null,
  rating integer check (rating >= 1 and rating <= 5), -- 1-5 star rating
  watched_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  unique(user_id, movie_id) -- Prevent duplicate entries for the same movie
);

alter table public.user_history enable row level security;

create policy "Users can view their own history."
  on public.user_history for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own history."
  on public.user_history for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own history."
  on public.user_history for update
  using ( auth.uid() = user_id );

create policy "Users can delete their own history."
  on public.user_history for delete
  using ( auth.uid() = user_id );

-- Create table for User Watchlists (if not already existing)
create table if not exists public.user_watchlists (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  movie_id integer not null,
  added_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  unique(user_id, movie_id)
);

alter table public.user_watchlists enable row level security;

create policy "Users can view their own watchlist."
  on public.user_watchlists for select
  using ( auth.uid() = user_id );

create policy "Users can insert into their own watchlist."
  on public.user_watchlists for insert
  with check ( auth.uid() = user_id );

create policy "Users can delete from their own watchlist."
  on public.user_watchlists for delete
  using ( auth.uid() = user_id );

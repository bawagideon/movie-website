-- Upgrade Schema for Phase 6-9 (Lifestyle Companion)

-- 1. Create user_settings table
create table if not exists public.user_settings (
  user_id uuid references public.profiles(id) on delete cascade not null primary key,
  enable_food_rec boolean default true,
  enable_calendar_sync boolean default true,
  adult_content_filter boolean default false,
  preferred_streaming_services text[] default '{}',
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.user_settings enable row level security;

create policy "Users can view their own settings."
  on public.user_settings for select
  using ( auth.uid() = user_id );

create policy "Users can update their own settings."
  on public.user_settings for update
  using ( auth.uid() = user_id );

create policy "Users can insert their own settings."
  on public.user_settings for insert
  with check ( auth.uid() = user_id );

-- 2. Update user_history table
alter table public.user_history 
add column if not exists interaction_type text default 'watched'; -- 'watched', 'stream_clicked', 'binge_planned', 'food_ordered'

-- 3. Update user_mood_sessions table to match implementation
alter table public.user_mood_sessions 
rename column mood_prompt to mood_query;

alter table public.user_mood_sessions 
add column if not exists ai_explanation text,
add column if not exists recommended_movies jsonb default '[]'::jsonb;

-- Drop the old array column if it exists (optional, but cleaner)
alter table public.user_mood_sessions 
drop column if exists recommended_movie_ids;

-- 4. Update user_watchlists table to store movie metadata (for faster loading without TMDB calls)
alter table public.user_watchlists
add column if not exists movie_title text,
add column if not exists movie_poster text,
add column if not exists movie_overview text,
add column if not exists movie_release_date text,
add column if not exists movie_rating float;

-- 5. Create a trigger to initialize user_settings
create or replace function public.handle_new_user_settings()
returns trigger as $$
begin
  insert into public.user_settings (user_id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created_settings
  after insert on auth.users
  for each row execute procedure public.handle_new_user_settings();

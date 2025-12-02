-- Add onboarding_completed column to profiles
alter table public.profiles 
add column if not exists onboarding_completed boolean default false;

-- Update existing users to have onboarding_completed = true (optional, or false if you want them to onboard)
update public.profiles set onboarding_completed = false where onboarding_completed is null;

-- Each account completes setup independently; existing accounts are invited
-- through the same setup without replacing their subjects or study records.
alter table public.profiles
 add column tawjihi_track text,
 add column tawjihi_target_date date,
 add column onboarding_completed_at timestamptz;

notify pgrst, 'reload schema';

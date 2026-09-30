-- Trigger-only profile creation must not be callable over the Data API.
revoke execute on function public.create_profile() from public, anon, authenticated;

-- PostgreSQL can evaluate the stable identity once per statement instead of
-- once for every row examined by an ownership policy.
alter policy profile_owner on public.profiles
 using (id = (select auth.uid()))
 with check (id = (select auth.uid()));

do $$
declare table_name text;
begin
 foreach table_name in array array[
  'subjects','units','topics','tasks','study_sessions','calendar_events',
  'exams','mistakes','files','inbox_items','sat_domains','sat_sessions',
  'sat_session_questions','ielts_attempts','ielts_writing_entries',
  'ielts_speaking_entries','universities','scholarships','applications',
  'application_requirements','achievements','essays','exam_files',
  'tags','file_tags','inbox_suggestions'
 ] loop
  execute format(
   'alter policy owner_access on public.%I using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()))',
   table_name
  );
 end loop;
end $$;

notify pgrst, 'reload schema';

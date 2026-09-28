-- Do not depend on project-wide default grants: new Supabase projects can
-- require explicit Data API access. Row policies still restrict every account.
do $$
declare table_name text;
begin
 foreach table_name in array array[
  'profiles','subjects','units','topics','tasks','study_sessions',
  'calendar_events','exams','mistakes','files','inbox_items','sat_domains',
  'sat_sessions','sat_session_questions','ielts_attempts',
  'ielts_writing_entries','ielts_speaking_entries','universities',
  'scholarships','applications','application_requirements','achievements',
  'essays','exam_files','tags','file_tags','inbox_suggestions'
 ] loop
  if not exists (
   select 1 from pg_class c join pg_namespace n on n.oid=c.relnamespace
   where n.nspname='public' and c.relname=table_name and c.relrowsecurity
  ) then
   raise exception 'StudyOS table public.% is missing or RLS is disabled. Apply the initial migration before granting API access.',table_name;
  end if;
 end loop;
end $$;

grant usage on schema public to authenticated;
grant select,insert,update,delete on table
 public.profiles,public.subjects,public.units,public.topics,public.tasks,
 public.study_sessions,public.calendar_events,public.exams,public.mistakes,
 public.files,public.inbox_items,public.sat_domains,public.sat_sessions,
 public.sat_session_questions,public.ielts_attempts,public.ielts_writing_entries,
 public.ielts_speaking_entries,public.universities,public.scholarships,
 public.applications,public.application_requirements,public.achievements,
 public.essays,public.exam_files,public.tags,public.file_tags,public.inbox_suggestions
to authenticated;

notify pgrst,'reload schema';

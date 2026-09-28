-- Read-only: every returned row must be ready before publishing StudyOS.
-- This inspects metadata only; it does not read students' study records.
with required(table_name) as (
 values ('profiles'),('subjects'),('units'),('topics'),('tasks'),
 ('study_sessions'),('calendar_events'),('exams'),('mistakes'),('files'),
 ('inbox_items'),('sat_domains'),('sat_sessions'),('sat_session_questions'),
 ('ielts_attempts'),('ielts_writing_entries'),('ielts_speaking_entries'),
 ('universities'),('scholarships'),('applications'),('application_requirements'),
 ('achievements'),('essays'),('exam_files'),('tags'),('file_tags'),('inbox_suggestions')
), audit as (
 select r.table_name,c.oid is not null as table_exists,
  coalesce(c.relrowsecurity,false) as rls_enabled,
  coalesce(has_table_privilege('authenticated',c.oid,'SELECT'),false) as can_select,
  coalesce(has_table_privilege('authenticated',c.oid,'INSERT'),false) as can_insert,
  coalesce(has_table_privilege('authenticated',c.oid,'UPDATE'),false) as can_update,
  coalesce(has_table_privilege('authenticated',c.oid,'DELETE'),false) as can_delete,
  p.policyname is not null as owner_policy_exists,p.qual,p.with_check
 from required r
 left join pg_namespace n on n.nspname='public'
 left join pg_class c on c.relnamespace=n.oid and c.relname=r.table_name and c.relkind='r'
 left join pg_policies p on p.schemaname='public' and p.tablename=r.table_name
  and p.policyname=case when r.table_name='profiles' then 'profile_owner' else 'owner_access' end
)
select *,table_exists and rls_enabled and can_select and can_insert and can_update
 and can_delete and owner_policy_exists as ready
from audit order by table_name;

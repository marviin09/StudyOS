export type Area = 'Tawjihi' | 'SAT' | 'IELTS' | 'Applications';
export type Value = string | number | boolean | null | string[];
export interface Row { id: string; user_id: string; created_at: string; updated_at: string; [key: string]: Value }
export type Table = 'subjects'|'units'|'topics'|'tasks'|'study_sessions'|'calendar_events'|'exams'|'mistakes'|'files'|'inbox_items'|'sat_domains'|'sat_sessions'|'sat_session_questions'|'ielts_attempts'|'ielts_writing_entries'|'ielts_speaking_entries'|'universities'|'scholarships'|'applications'|'application_requirements'|'achievements'|'essays';
export const tables: Table[] = ['subjects','units','topics','tasks','study_sessions','calendar_events','exams','mistakes','files','inbox_items','sat_domains','sat_sessions','sat_session_questions','ielts_attempts','ielts_writing_entries','ielts_speaking_entries','universities','scholarships','applications','application_requirements','achievements','essays'];
export const areas: Area[] = ['Tawjihi','SAT','IELTS','Applications'];
export type Records = Record<Table,Row[]>;
export const emptyRecords = (): Records => Object.fromEntries(tables.map(t=>[t,[] as Row[]])) as Records;
export interface Profile { id: string; display_name: string; timezone: string; locale: string; daily_study_capacity_minutes: number; daily_score_threshold: number; preserve_rest_days: boolean; rest_days: number[]; review_intervals: number[]; sat_target_date: string|null; sat_target_score:number|null; ielts_target_date:string|null; ielts_target_band:number|null }
export const defaultProfile: Profile = { id:'',display_name:'Student', timezone:Intl.DateTimeFormat().resolvedOptions().timeZone,locale:'en',daily_study_capacity_minutes:180,daily_score_threshold:70,preserve_rest_days:true,rest_days:[5],review_intervals:[1,3,7,14],sat_target_date:null,sat_target_score:null,ielts_target_date:null,ielts_target_band:null };
export const str=(v:Value|undefined)=>v==null?'':String(v);
export const num=(v:Value|undefined)=>Number(v)||0;

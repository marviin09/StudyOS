import { describe,it,expect } from 'vitest';
import { grade,parseIds,satStats,duplicateAttempts,examPercentage,dailyScore,streak,nextReview,readiness,elapsed,shiftDay } from './logic';
import {type Row} from './model';
const row=(x:Partial<Row>):Row=>({id:'1',user_id:'u',created_at:'',updated_at:'',...x});
describe('SAT companion sheet',()=>{
 it('grades letters, preserves symbolic distinctions, leaves blanks ungraded',()=>{expect(grade(' b ','B')).toBe('correct');expect(grade('3/5','0.6')).toBe('incorrect');expect(grade('','B')).toBe('ungraded');expect(grade('C','')).toBe('ungraded');expect(grade('√2','√2')).toBe('correct')});
 it('parses bulk IDs without dropping deliberate repetitions',()=>expect(parseIds(' ab, cd\nef  ab')).toEqual(['ab','cd','ef','ab']));
 it('uses only graded rows for accuracy and actual rows for mean time',()=>{expect(satStats([row({my_answer_raw:'A',correct_answer_raw:'A',question_identifier:'x'}),row({my_answer_raw:'B',correct_answer_raw:'C',question_identifier:'y'}),row({question_identifier:'x'})],90)).toEqual({correct:1,wrong:1,ungraded:1,accuracy:50,average:30,unique:2})});
 it('detects previous attempts without blocking retries',()=>expect(duplicateAttempts(' x ',[row({session_id:'old',question_identifier:'x'}),row({session_id:'new',question_identifier:'x'})],'new')).toHaveLength(1));
 it('recovers active elapsed time without counting paused time',()=>{expect(elapsed(row({elapsed_seconds:30,running_since:'2026-09-23T00:00:00Z'}),Date.parse('2026-09-23T00:01:00Z'))).toBe(90);expect(elapsed(row({elapsed_seconds:30}))).toBe(30)});
});
describe('productivity and integrity',()=>{
 it('does not reward simply opening the app',()=>expect(dailyScore([],0,180)).toBe(0));
 it('weights completion, time, reviews and commitments',()=>expect(dailyScore([row({status:'completed',source:'mistake_review',priority:'high'})],90,180)).toBe(90));
 it('preserves configured rest days without incrementing streak',()=>expect(streak({'2026-09-17':80,'2026-09-19':75},'2026-09-19',70,[5],true).current).toBe(2));
 it('breaks on missed days, but allows today to remain in progress',()=>{expect(streak({'2026-09-17':80,'2026-09-19':75},'2026-09-19').current).toBe(1);expect(streak({'2026-09-19':75},'2026-09-20').current).toBe(1)});
 it('rejects impossible scores and computes exam percentage',()=>{expect(examPercentage(42,50)).toBe(84);expect(()=>examPercentage(10,0)).toThrow();expect(()=>examPercentage(51,50)).toThrow()});
 it('schedules calendar days across month boundaries',()=>{expect(nextReview('2026-09-30',1)).toBe('2026-10-03');expect(shiftDay('2026-12-31',1)).toBe('2027-01-01')});
 it('derives readiness from checklists',()=>{expect(readiness([])).toBe(0);expect(readiness([row({status:'completed'}),row({status:'planned'})])).toBe(50)});
});

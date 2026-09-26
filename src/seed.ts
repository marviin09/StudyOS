import {emptyRecords,type Records,type Row} from './model';
import {dateKey,shiftDay} from './logic';
export function demoRecords():Records {
 const db=emptyRecords(),today=dateKey();
 let count=0;
 const add=(table:keyof Records,data:Record<string,Row[string]>)=>{const row={id:`demo-${++count}`,user_id:'demo',created_at:new Date().toISOString(),updated_at:new Date().toISOString(),...data} as Row;db[table].push(row);return row.id};
 const math=add('subjects',{name:'Mathematics',color:'#7829ed',sort_order:0});
 const physics=add('subjects',{name:'Physics',color:'#ee9d31',sort_order:1});
 add('subjects',{name:'Arabic',color:'#ec729c',sort_order:2});add('subjects',{name:'English',color:'#48a691',sort_order:3});
 const unit=add('units',{title:'Derivatives',subject_id:math,sort_order:0});
 for(const [i,title] of ['Average rate of change','The derivative','Differentiation rules','Tangent lines'].entries())add('topics',{title,subject_id:math,unit_id:unit,status:['mastered','good','learning','needs_practice'][i],sort_order:i});
 const pu=add('units',{title:'Mechanics',subject_id:physics,sort_order:0});add('topics',{title:'Collision in two dimensions',subject_id:physics,unit_id:pu,status:'needs_practice',sort_order:0});
 const tasks=[['Math worksheet','Tawjihi',45,math,'completed'],['Physics exam preparation','Tawjihi',60,physics,'planned'],['Advanced Math — 10 questions','SAT',20,null,'planned'],['Reading practice log','IELTS',25,null,'planned'],['Update activities list','Applications',20,null,'planned']];
 tasks.forEach(([title,area,minutes,subject,status],i)=>add('tasks',{title,area,planned_minutes:minutes,subject_id:subject,status,due_date:today,priority:i===1?'high':'normal',source:'manual',sort_order:i,completed_at:status==='completed'?new Date().toISOString():null}));
 for(let i=1;i<=8;i++){const day=shiftDay(today,-i);add('tasks',{title:'Daily review',area:'Tawjihi',planned_minutes:60,status:i===4?'planned':'completed',due_date:day,priority:'normal',source:'manual',sort_order:0});add('study_sessions',{title:'Focused study',area:'Tawjihi',subject_id:math,status:'completed',elapsed_seconds:(45+i*6)*60,completed_at:day+'T14:00:00Z',created_at:day+'T13:00:00Z'});}
 add('study_sessions',{title:'Mathematics worksheet',area:'Tawjihi',subject_id:math,status:'completed',elapsed_seconds:2700,completed_at:new Date().toISOString()});
 add('calendar_events',{title:'Physics monthly exam',event_date:shiftDay(today,1),event_type:'Tawjihi exam',area:'Tawjihi',subject_id:physics});add('calendar_events',{title:'English assignment',event_date:shiftDay(today,3),event_type:'assignment deadline',area:'Tawjihi'});
 const exam=add('exams',{title:'Physics monthly exam',subject_id:physics,exam_date:shiftDay(today,-3),score:42,maximum_score:50,exam_type:'monthly',teacher:'',notes:''});
 add('mistakes',{title:'Momentum components',area:'Tawjihi',subject_id:physics,exam_id:exam,category:'concept',question_number:'3',explanation:'Resolve momentum into both axes before substituting.',correct_approach:'Write separate x and y conservation equations.',status:'review_due',review_date:today,review_count:0});
 const domain=add('sat_domains',{name:'Advanced Math',section:'Math'});add('sat_domains',{name:'Algebra',section:'Math'});add('sat_domains',{name:'Geometry & Trigonometry',section:'Math'});add('sat_domains',{name:'Problem Solving & Data Analysis',section:'Math'});add('sat_domains',{name:'Craft and Structure',section:'Reading & Writing'});
 for(let i=0;i<4;i++){const sid=add('sat_sessions',{title:'Advanced Math',section:'Math',domain_id:domain,difficulty:'hard',planned_question_count:10,status:'completed',elapsed_seconds:960-i*50,completed_at:shiftDay(today,-(4-i))+'T17:00:00Z'});for(let q=0;q<10;q++)add('sat_session_questions',{session_id:sid,row_order:q,question_identifier:String(1700+i*8+q),my_answer_raw:q<6+i?'B':'C',correct_answer_raw:'B'});}
 add('ielts_attempts',{title:'Reading practice 1',skill:'Reading',attempt_date:shiftDay(today,-5),correct:28,elapsed_seconds:3600,question_type:'mixed',notes:''});add('ielts_attempts',{title:'Reading practice 2',skill:'Reading',attempt_date:today,correct:32,elapsed_seconds:3500,question_type:'mixed',notes:''});add('ielts_attempts',{title:'Listening practice',skill:'Listening',attempt_date:shiftDay(today,-2),correct:30,elapsed_seconds:1800,question_type:'mixed',notes:''});
 add('ielts_writing_entries',{title:'Technology and education',task_type:'Task 2',attempt_date:today,prompt:'Discuss the role of technology in education.',response:'Technology can make learning more accessible. Students can revisit explanations and practise at their own pace.',elapsed_seconds:2400,feedback:'Development sample: expand the examples and conclusion.'});
 const uni=add('universities',{name:'Example University',country:'United States',program:'Computer Science',status:'researching',deadline:shiftDay(today,90),notes:'Development example — replace with your research.'});
 add('scholarships',{title:'Example merit scholarship',provider:'Example University',university_id:uni,status:'researching',coverage:'Research funding requirements',deadline:shiftDay(today,80)});
 ['CV','Activities list','Honors','Personal statement','Recommendations','Transcript'].forEach((title,i)=>add('application_requirements',{title,category:'Common App',status:i<2?'completed':'planned'}));
 add('achievements',{title:'Science fair project',kind:'Research',organization:'School science fair',role:'Researcher',description:'Development example',impact:'Presented a working prototype',common_app_candidate:true,cv_candidate:true});
 add('inbox_items',{title:'Physics revision reminder',body:'Please prepare the collision in two dimensions lesson for our next class.',status:'needs_review',area:'Tawjihi',subject_id:physics,suggested_date:shiftDay(today,1),suggestion_title:'Review collision in two dimensions',source:'manual'});
 return db;
}

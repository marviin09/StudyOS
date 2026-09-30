import {useState,type FormEvent} from 'react';
import {useNavigate} from 'react-router-dom';
import {ArrowLeft,ArrowRight,BookOpen,CalendarDays,Check,Clock3,GraduationCap,LogOut,Plus,Target,X} from 'lucide-react';
import {useStore} from './store';
import {errorMessage} from './ui';

const suggestions=['Mathematics','Physics','Arabic','English','Chemistry','Biology','Computer Science'];
const colors=['#7829ed','#f49b39','#3478e9','#22a78a','#b353d9','#d77087'];
const weekdays=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const steps=[
 {title:'Your study routine',caption:'Make your daily plan fit your actual time.',Icon:Clock3},
 {title:'Tawjihi',caption:'Add the subjects you really study.',Icon:BookOpen},
 {title:'SAT & IELTS',caption:'Set the targets you know today.',Icon:Target},
];

export function Onboarding(){
 const {profile,db,session,save,saveProfile,signOut}=useStore();
 const navigate=useNavigate();
 const [step,setStep]=useState(0);
 const [name,setName]=useState(profile.display_name==='Student'?String(session?.user.user_metadata?.full_name??''):profile.display_name);
 const [timezone,setTimezone]=useState(profile.timezone==='UTC'&&!profile.onboarding_completed_at?Intl.DateTimeFormat().resolvedOptions().timeZone:profile.timezone);
 const [minutes,setMinutes]=useState(profile.daily_study_capacity_minutes);
 const [restDays,setRestDays]=useState<number[]>(profile.rest_days);
 const [tawjihi,setTawjihi]=useState(!profile.onboarding_completed_at||!!profile.tawjihi_target_date||db.subjects.length>0);
 const [track,setTrack]=useState(profile.tawjihi_track??'');
 const [tawjihiDate,setTawjihiDate]=useState(profile.tawjihi_target_date??'');
 const [subjectDraft,setSubjectDraft]=useState('');
 const [subjects,setSubjects]=useState<string[]>([]);
 const [sat,setSat]=useState(!profile.onboarding_completed_at||!!profile.sat_target_date||profile.sat_target_score!=null);
 const [satDate,setSatDate]=useState(profile.sat_target_date??'');
 const [satScore,setSatScore]=useState(profile.sat_target_score?.toString()??'');
 const [ielts,setIelts]=useState(!profile.onboarding_completed_at||!!profile.ielts_target_date||profile.ielts_target_band!=null);
 const [ieltsDate,setIeltsDate]=useState(profile.ielts_target_date??'');
 const [ieltsBand,setIeltsBand]=useState(profile.ielts_target_band?.toString()??'');
 const [saving,setSaving]=useState(false);
 const [error,setError]=useState('');
 const existingNames=db.subjects.map(subject=>String(subject.name));
 const knownNames=[...existingNames,...subjects].map(subject=>subject.toLocaleLowerCase());

 const addSubject=(value:string)=>{
  const subject=value.trim();
  if(!subject)return;
  if(subject.length>80){setError('Subject names must be 80 characters or less.');return}
  if(knownNames.includes(subject.toLocaleLowerCase())){setSubjectDraft('');return}
  setSubjects(current=>[...current,subject]);
  setSubjectDraft('');
  setError('');
 };
 const validate=(index:number):string=>{
  if(index===0){
   if(!name.trim())return 'Enter your name.';
   if(name.trim().length>80)return 'Your name must be 80 characters or less.';
   if(!Number.isInteger(minutes)||minutes<1||minutes>1440)return 'Enter a daily study target between 1 and 1440 minutes.';
   try{Intl.DateTimeFormat('en',{timeZone:timezone}).format()}catch{return 'Enter a valid time zone, such as Asia/Hebron.'}
  }
  if(index===1&&tawjihi&&existingNames.length+subjects.length===0)return 'Add at least one Tawjihi subject, or turn off Tawjihi setup for now.';
  if(index===2){
   if(sat&&satScore&&(Number(satScore)<400||Number(satScore)>1600||!Number.isInteger(Number(satScore))))return 'Enter a SAT target from 400 to 1600.';
   if(ielts&&ieltsBand&&(Number(ieltsBand)<0||Number(ieltsBand)>9||Number(ieltsBand)*2%1!==0))return 'Enter an IELTS target from 0 to 9 in half-band steps.';
  }
  return '';
 };
 const submit=async(event:FormEvent)=>{
  event.preventDefault();
  if(saving)return;
  if(step<2){
   const issue=validate(step);
   if(issue){setError(issue);return}
   setError('');setStep(current=>current+1);return;
  }
  for(let index=0;index<3;index++){
   const issue=validate(index);
   if(issue){setStep(index);setError(issue);return}
  }
  setSaving(true);setError('');
  try{
   // Save the completion marker last. If a write fails, the setup is offered
   // again and the already-created subjects are recognized on the next try.
   if(tawjihi){
    for(const [index,subject] of subjects.entries()){
     if(!existingNames.some(name=>name.toLocaleLowerCase()===subject.toLocaleLowerCase())){
      await save('subjects',{name:subject,color:colors[(existingNames.length+index)%colors.length]});
     }
    }
   }
   await saveProfile({
    display_name:name.trim(),timezone,daily_study_capacity_minutes:minutes,
    rest_days:[...restDays].sort((a,b)=>a-b),
    tawjihi_track:tawjihi?track.trim()||null:null,
    tawjihi_target_date:tawjihi?tawjihiDate||null:null,
    sat_target_date:sat?satDate||null:null,
    sat_target_score:sat&&satScore?Number(satScore):null,
    ielts_target_date:ielts?ieltsDate||null:null,
    ielts_target_band:ielts&&ieltsBand?Number(ieltsBand):null,
    onboarding_completed_at:profile.onboarding_completed_at??new Date().toISOString(),
   });
   navigate('/',{replace:true});
  }catch(issue){setError(errorMessage(issue))}finally{setSaving(false)}
 };
 const skip=async()=>{
  if(profile.onboarding_completed_at){navigate('/settings',{replace:true});return}
  setSaving(true);setError('');
  try{
   await saveProfile({onboarding_completed_at:new Date().toISOString()});
   navigate('/',{replace:true});
  }catch(issue){setError(errorMessage(issue))}finally{setSaving(false)}
 };

 return <div className="setup-page">
  <header className="setup-header">
   <div className="setup-brand"><span className="brand-icon"><GraduationCap size={24}/></span><strong>StudyOS</strong></div>
   <button type="button" className="setup-signout" onClick={()=>signOut()} disabled={saving}><LogOut size={17}/> Sign out</button>
  </header>
  <div className="setup-layout">
   <aside className="setup-aside">
    <span className="eyebrow">PERSONAL WORKSPACE</span>
    <h1>Set up your study space</h1>
    <p>Add the subjects, dates and targets that matter to you. You can change them later.</p>
    <ol className="setup-steps">{steps.map(({title,Icon},index)=><li key={title} className={index===step?'current':index<step?'done':''}><span className="setup-step-icon">{index<step?<Check size={18}/>:<Icon size={18}/>}</span><span><small>STEP {index+1}</small><strong>{title}</strong></span></li>)}</ol>
   </aside>
   <form className="setup-card panel" onSubmit={submit}>
    <span className="eyebrow">STEP {step+1} OF 3</span>
    <h2>{steps[step].title}</h2>
    <p className="setup-caption">{steps[step].caption}</p>
    <div className="setup-progress" role="progressbar" aria-valuenow={step+1} aria-valuemin={1} aria-valuemax={3} aria-label="Account setup progress"><span style={{width:String((step+1)/3*100)+'%'}}/></div>

    {step===0&&<div className="setup-fields">
     <label>Your name<input value={name} onChange={event=>setName(event.target.value)} maxLength={80} autoComplete="name" required/></label>
     <div className="setup-two">
      <label>Daily study capacity (minutes)<input type="number" min={1} max={1440} value={minutes} onChange={event=>setMinutes(Number(event.target.value))} required/></label>
      <label>Time zone<input value={timezone} onChange={event=>setTimezone(event.target.value)} required/><small>Detected from your device. Change it if needed.</small></label>
     </div>
     <fieldset className="setup-days"><legend>Usual rest days</legend><div>{weekdays.map((day,index)=><label key={day} className={restDays.includes(index)?'selected':''}><input type="checkbox" checked={restDays.includes(index)} onChange={event=>setRestDays(current=>event.target.checked?[...current,index]:current.filter(value=>value!==index))}/>{day}</label>)}</div></fieldset>
     <p className="setup-note">Your study time is a planning limit, not a daily obligation.</p>
    </div>}

    {step===1&&<div className="setup-fields">
     <label className="setup-switch"><input type="checkbox" checked={tawjihi} onChange={event=>setTawjihi(event.target.checked)}/><span><strong>Set up Tawjihi</strong><small>Choose your subjects and target date.</small></span></label>
     {tawjihi&&<>
      <div className="setup-two">
       <label>Your Tawjihi track / branch<input value={track} onChange={event=>setTrack(event.target.value)} maxLength={80} placeholder="e.g. Industrial or Scientific"/></label>
       <label>Tawjihi target exam date<input type="date" value={tawjihiDate} onChange={event=>setTawjihiDate(event.target.value)}/><small>Leave blank if the date is not known yet.</small></label>
      </div>
      <div className="setup-subjects"><strong>Your subjects</strong><p>Add only the subjects you take. You can add lessons and exams later.</p>
       {existingNames.length>0&&<div className="setup-chips">{existingNames.map((subject,index)=><span className="setup-chip existing" key={index}>{subject}</span>)}</div>}
       {subjects.length>0&&<div className="setup-chips">{subjects.map(subject=><span className="setup-chip" key={subject}>{subject}<button type="button" aria-label={'Remove '+subject} onClick={()=>setSubjects(current=>current.filter(value=>value!==subject))}><X size={14}/></button></span>)}</div>}
       <div className="setup-add"><input aria-label="New subject name" value={subjectDraft} onChange={event=>setSubjectDraft(event.target.value)} onKeyDown={event=>{if(event.key==='Enter'){event.preventDefault();addSubject(subjectDraft)}}} maxLength={80} placeholder="Type a subject name"/><button type="button" className="button secondary" onClick={()=>addSubject(subjectDraft)}><Plus size={16}/> Add</button></div>
       <small>Quick add</small><div className="setup-suggestions">{suggestions.filter(subject=>!knownNames.includes(subject.toLocaleLowerCase())).map(subject=><button type="button" key={subject} onClick={()=>addSubject(subject)}>+ {subject}</button>)}</div>
      </div>
     </>}
     {!tawjihi&&<p className="setup-note">{existingNames.length?'Your existing subjects stay in your workspace. Edit them on the Tawjihi page.':'You can add Tawjihi subjects later from the Tawjihi page.'}</p>}
    </div>}

    {step===2&&<div className="setup-fields">
     <div className="setup-goal"><label className="setup-switch"><input type="checkbox" checked={sat} onChange={event=>setSat(event.target.checked)}/><span><strong>SAT target</strong><small>StudyOS tracks practice IDs, answers, timing and mistakes.</small></span></label>{sat&&<div className="setup-two"><label><CalendarDays size={15}/> Target date<input type="date" value={satDate} onChange={event=>setSatDate(event.target.value)}/></label><label><Target size={15}/> Target score<input type="number" min={400} max={1600} step={10} value={satScore} onChange={event=>setSatScore(event.target.value)} placeholder="400–1600"/></label></div>}</div>
     <div className="setup-goal"><label className="setup-switch"><input type="checkbox" checked={ielts} onChange={event=>setIelts(event.target.checked)}/><span><strong>IELTS target</strong><small>Keep Reading, Listening, Writing and Speaking evidence together.</small></span></label>{ielts&&<div className="setup-two"><label><CalendarDays size={15}/> Target date<input type="date" value={ieltsDate} onChange={event=>setIeltsDate(event.target.value)}/></label><label><Target size={15}/> Target band<input type="number" min={0} max={9} step={0.5} value={ieltsBand} onChange={event=>setIeltsBand(event.target.value)} placeholder="0–9"/></label></div>}</div>
     <p className="setup-note">You can leave dates empty until your exams are scheduled. StudyOS never supplies SAT questions; its practice sheet records your answers to question IDs you enter.</p>
    </div>}
    {error&&<p className="auth-message" role="alert">{error}</p>}
    <div className="setup-actions"><div>{step>0&&<button type="button" className="button secondary" disabled={saving} onClick={()=>{setStep(current=>current-1);setError('')}}><ArrowLeft size={16}/> Back</button>}</div><button type="submit" className="button" disabled={saving}>{saving?'Saving…':step===2?profile.onboarding_completed_at?'Save changes':'Open my workspace':'Continue'}{!saving&&step<2&&<ArrowRight size={16}/>}</button></div>
    <button type="button" className="setup-skip" onClick={skip} disabled={saving}>{profile.onboarding_completed_at?'Cancel and return to Settings':'Skip for now — set this up later'}</button>
   </form>
  </div>
 </div>;
}

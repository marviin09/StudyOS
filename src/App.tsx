import {useState,type FormEvent} from 'react';
import {NavLink,Link,Routes,Route,Navigate,useLocation} from 'react-router-dom';
import {GraduationCap,LayoutDashboard,BookOpen,FileSpreadsheet,AudioLines,BriefcaseBusiness,Inbox as InboxIcon,Settings as SettingsIcon,LogOut,Menu,House,ChevronRight,BarChart3} from 'lucide-react';
import {useStore} from './store';
import {Dashboard,FocusTimer,Calendar,TaskList} from './Dashboard';
import {Tawjihi,Subject,Exam,Mistakes} from './Tawjihi';
import {SAT,SATSetup,SATSheet} from './SAT';
import {IELTS} from './IELTS';
import {Applications} from './Applications';
import {Inbox} from './Inbox';
import {Progress} from './Progress';
import {Settings} from './Settings';
import {Onboarding} from './Onboarding';
import {Modal,Empty,errorMessage} from './ui';
const nav=[{path:'/',name:'Dashboard',Icon:LayoutDashboard},{path:'/tawjihi',name:'Tawjihi',Icon:BookOpen},{path:'/sat',name:'SAT',Icon:FileSpreadsheet},{path:'/ielts',name:'IELTS',Icon:AudioLines},{path:'/applications',name:'Applications',Icon:BriefcaseBusiness},{path:'/inbox',name:'Inbox',Icon:InboxIcon}];
function Auth(){
 const {client,setDemo,recovery,finishRecovery,signOut}=useStore();
 const [view,setView]=useState<'signin'|'signup'|'reset'>('signin');
 const [email,setEmail]=useState(''),[password,setPassword]=useState(''),[confirmPassword,setConfirmPassword]=useState('');
 const [busy,setBusy]=useState(false),[message,setMessage]=useState<{text:string;kind:'error'|'success'}|null>(()=>{
  const description=new URLSearchParams(window.location.search).get('error_description')??new URLSearchParams(window.location.hash.slice(1)).get('error_description');
  return description?{text:description,kind:'error'}:null;
 });
 const mode=recovery?'update':view;
 const switchView=(next:typeof view)=>{setView(next);setMessage(null);setPassword('');setConfirmPassword('')};
 const submit=async(e:FormEvent)=>{
  e.preventDefault();if(!client)return;
  if((mode==='signup'||mode==='update')&&password!==confirmPassword){setMessage({text:'Passwords do not match.',kind:'error'});return}
  setBusy(true);setMessage(null);
  try{
   if(mode==='signup'){
    const {data,error}=await client.auth.signUp({email:email.trim(),password,options:{emailRedirectTo:window.location.origin+'/'}});
    if(error)throw error;
    if(!data.session)setMessage({text:'Check your email to confirm your account, then sign in.',kind:'success'});
   }else if(mode==='reset'){
    const {error}=await client.auth.resetPasswordForEmail(email.trim(),{redirectTo:window.location.origin+'/'});
    if(error)throw error;
    setMessage({text:'If an account exists for this email, you will receive a password reset link.',kind:'success'});
   }else if(mode==='update'){
    const {error}=await client.auth.updateUser({password});
    if(error)throw error;
    setPassword('');setConfirmPassword('');finishRecovery();
   }else{
    const {error}=await client.auth.signInWithPassword({email:email.trim(),password});
    if(error)throw error;
   }
  }catch(err){setMessage({text:errorMessage(err),kind:'error'})}finally{setBusy(false)}
 };
 return <div className="auth-page">
  <div className="auth-brand"><span className="brand-icon"><GraduationCap/></span><span>StudyOS</span></div>
  <section className="auth-card panel">
   <span className="eyebrow">YOUR STUDY WORKSPACE</span>
   <h1>{!client?'StudyOS setup in progress':mode==='signup'?'Create your account':mode==='reset'?'Reset your password':mode==='update'?'Choose a new password':'Welcome back'}</h1>
   {client?<>
    <p className="auth-intro">{mode==='signup'?'Your private workspace starts empty. Confirm your email if asked.':mode==='reset'?'Enter your account email and we will send a reset link.':mode==='update'?'Enter a new password to finish resetting your account.':'Sign in to access your private study workspace.'}</p>
    <form className="form auth-email-form" onSubmit={submit}>
     {mode!=='update'&&<label>Email<input required type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)}/></label>}
     {mode!=='reset'&&<label>{mode==='update'?'New password':'Password'}<input required minLength={8} type="password" autoComplete={mode==='signin'?'current-password':'new-password'} value={password} onChange={e=>setPassword(e.target.value)}/></label>}
     {(mode==='signup'||mode==='update')&&<label>Confirm password<input required minLength={8} type="password" autoComplete="new-password" value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)}/></label>}
     <button className="button full-width" disabled={busy}>{busy?'Please wait…':mode==='signup'?'Create account':mode==='reset'?'Send reset link':mode==='update'?'Save new password':'Sign in'}</button>
    </form>
    {mode==='signin'&&<div className="auth-links"><button type="button" className="text-link" disabled={busy} onClick={()=>switchView('signup')}>Create an account</button><button type="button" className="text-link" disabled={busy} onClick={()=>switchView('reset')}>Forgot password?</button></div>}
    {mode==='signup'&&<button type="button" className="text-link auth-back" disabled={busy} onClick={()=>switchView('signin')}>Already have an account? Sign in</button>}
    {mode==='reset'&&<button type="button" className="text-link auth-back" disabled={busy} onClick={()=>switchView('signin')}>Back to sign in</button>}
    {mode==='update'&&<button type="button" className="text-link auth-back" disabled={busy} onClick={()=>signOut()}>Cancel and sign out</button>}
   </>:<p className="auth-intro">Account sign-in will be available when the database is connected.</p>}
   {message&&<p className={`auth-message ${message.kind}`} role={message.kind==='error'?'alert':'status'}>{message.text}</p>}
   {import.meta.env.DEV&&!recovery&&<button type="button" className="button secondary full-width auth-preview" onClick={()=>setDemo(true)}>Explore local development preview <ChevronRight size={17}/></button>}
  </section>
 </div>;
}
function WorkspaceError({error,code,refresh,signOut}:{error:string;code:string;refresh:()=>Promise<void>;signOut:()=>Promise<void>}){
 const missingTables=code==='PGRST205'||code==='42P01';
 return <section className="panel error-box">
  <h1>{missingTables?'Workspace setup is incomplete':'Could not load your workspace'}</h1>
  <p>{missingTables?'You are signed in, but the StudyOS database tables are not available yet. The project administrator needs to apply the database migrations before you can save work.':error}</p>
  {missingTables&&<details><summary>Technical detail</summary><p>{error}</p></details>}
  <div className="workspace-error-actions"><button className="button" onClick={()=>refresh()}>Retry</button><button className="button secondary" onClick={()=>signOut()}>Sign out</button></div>
 </section>;
}
export default function App(){const {ready,session,demo,recovery,loading,error,errorCode,refresh,db,profile,signOut}=useStore();const [mobileMenu,setMobileMenu]=useState<'study'|'more'|null>(null);const {pathname}=useLocation();if(!ready)return <div className="loading-screen">Opening StudyOS…</div>;if((!session&&!demo)||recovery)return <Auth/>;if(!loading&&!error&&profile.id&&((!demo&&!profile.onboarding_completed_at)||pathname==='/setup'))return <Onboarding/>;const inboxCount=db.inbox_items.filter(i=>i.status==='needs_review').length;return <div className="app-shell"><aside className="sidebar"><Link className="brand" to="/"><span className="brand-icon"><GraduationCap/></span>StudyOS</Link><nav>{nav.map(({path,name,Icon})=><NavLink key={path} to={path} end={path==='/'}><Icon size={21}/><span>{name}</span>{name==='Inbox'&&inboxCount>0&&<span className="nav-count">{inboxCount}</span>}</NavLink>)}</nav><div className="sidebar-bottom"><NavLink to="/settings"><SettingsIcon size={21}/>Settings</NavLink><button onClick={()=>signOut()}><LogOut size={19}/>{demo?'Exit preview':'Sign out'}</button></div></aside><div className="app-main"><header className="topbar"><Link className="mobile-brand" to="/"><span className="brand-icon"><GraduationCap size={21}/></span>StudyOS</Link><span className="desktop-only workspace-label">Personal study workspace</span><div className="actions"><Link className="icon-button" aria-label="View progress" to="/progress"><BarChart3 size={20}/></Link><Link className="avatar" aria-label="Open settings" to="/settings">{(profile.display_name!=='Student'?profile.display_name:session?.user.user_metadata?.full_name??'Student').trim().charAt(0).toUpperCase()}</Link></div></header>{demo&&<div className="demo-banner"><strong>Development preview</strong><span>Sample data · changes reset on refresh · uploads require Supabase</span></div>}<main id="main-content">{loading?<div className="loading-screen" role="status">Loading your workspace…</div>:error?<WorkspaceError error={error} code={errorCode} refresh={refresh} signOut={signOut}/>:<Routes><Route path="/" element={<Dashboard/>}/><Route path="/dashboard" element={<Navigate to="/" replace/>}/><Route path="/tasks" element={<TaskList all/>}/><Route path="/calendar" element={<Calendar/>}/><Route path="/tawjihi" element={<Tawjihi/>}/><Route path="/tawjihi/subjects" element={<Tawjihi/>}/><Route path="/tawjihi/subjects/:subjectId/*" element={<Subject/>}/><Route path="/tawjihi/exams/:examId" element={<Exam/>}/><Route path="/sat/practice/new" element={<SATSetup/>}/><Route path="/sat/practice/:sessionId" element={<SATSheet/>}/><Route path="/sat/*" element={<SAT/>}/><Route path="/ielts/*" element={<IELTS/>}/><Route path="/applications/*" element={<Applications/>}/><Route path="/inbox" element={<Inbox/>}/><Route path="/progress" element={<Progress/>}/><Route path="/mistakes" element={<Mistakes/>}/><Route path="/settings" element={<Settings/>}/><Route path="/login" element={<Navigate to="/" replace/>}/><Route path="*" element={<Empty title="Page not found"><Link className="button" to="/">Return to Dashboard</Link></Empty>}/></Routes>}</main></div><FocusTimer/><nav className="mobile-nav"><Link className={pathname==='/'?'active':''} to="/"><House size={22}/><span>Home</span></Link><button className={['/tawjihi','/sat','/ielts'].some(p=>pathname.startsWith(p))?'active':''} onClick={()=>setMobileMenu('study')}><BookOpen size={22}/><span>Study</span></button><Link className={pathname==='/inbox'?'active':''} to="/inbox"><InboxIcon size={22}/><span>Inbox</span></Link><button onClick={()=>setMobileMenu('more')}><Menu size={22}/><span>More</span></button></nav><Modal open={!!mobileMenu} onClose={()=>setMobileMenu(null)} title={mobileMenu==='study'?'Study':'More'}><div className="mobile-menu-links">{(mobileMenu==='study'?nav.slice(1,4):[{path:'/applications',name:'Applications',Icon:BriefcaseBusiness},{path:'/progress',name:'Progress',Icon:BarChart3},{path:'/calendar',name:'Calendar',Icon:LayoutDashboard},{path:'/settings',name:'Settings',Icon:SettingsIcon}]).map(({path,name,Icon})=><Link key={path} to={path} onClick={()=>setMobileMenu(null)}><Icon size={22}/>{name}<ChevronRight size={17}/></Link>)}</div></Modal></div>}

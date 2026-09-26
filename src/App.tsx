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
import {Modal,Empty,errorMessage} from './ui';
const nav=[{path:'/',name:'Dashboard',Icon:LayoutDashboard},{path:'/tawjihi',name:'Tawjihi',Icon:BookOpen},{path:'/sat',name:'SAT',Icon:FileSpreadsheet},{path:'/ielts',name:'IELTS',Icon:AudioLines},{path:'/applications',name:'Applications',Icon:BriefcaseBusiness},{path:'/inbox',name:'Inbox',Icon:InboxIcon}];
function Auth(){
 const {client,setDemo}=useStore();
 const [signup,setSignup]=useState(false),[showEmail,setShowEmail]=useState(false);
 const [email,setEmail]=useState(''),[password,setPassword]=useState('');
 const [busy,setBusy]=useState(false),[message,setMessage]=useState(()=>new URLSearchParams(window.location.search).get('error_description')??'');
 const google=async()=>{
  if(!client)return;
  setBusy(true);setMessage('');
  try{
   const {error}=await client.auth.signInWithOAuth({provider:'google',options:{redirectTo:window.location.origin+'/'}});
   if(error)throw error;
  }catch(err){setMessage(errorMessage(err));setBusy(false)}
 };
 const submit=async(e:FormEvent)=>{
  e.preventDefault();if(!client)return;
  setBusy(true);setMessage('');
  try{
   const {error}=signup?await client.auth.signUp({email,password}):await client.auth.signInWithPassword({email,password});
   if(error)throw error;
   if(signup)setMessage('Account created. Check your email if confirmation is required.');
  }catch(err){setMessage(errorMessage(err))}finally{setBusy(false)}
 };
 return <div className="auth-page">
  <div className="auth-brand"><span className="brand-icon"><GraduationCap/></span><span>StudyOS</span></div>
  <section className="auth-card panel">
   <span className="eyebrow">YOUR STUDY WORKSPACE</span>
   <h1>{client?'Your own space to study':'StudyOS setup in progress'}</h1>
   {client?<>
    <p className="auth-intro">Sign in with Google to create or open your private workspace. New accounts start empty.</p>
    <button type="button" className="button google-button full-width" disabled={busy} onClick={google}>
     <span aria-hidden="true" className="google-monogram">G</span>
     {busy?'Opening Google…':'Continue with Google'}
    </button>
    <button type="button" className="text-link auth-email-toggle" onClick={()=>setShowEmail(!showEmail)}>{showEmail?'Hide email sign-in':'Use email and password'}</button>
    {showEmail&&<form className="form auth-email-form" onSubmit={submit}>
     <label>Email<input required type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)}/></label>
     <label>Password<input required minLength={8} type="password" autoComplete={signup?'new-password':'current-password'} value={password} onChange={e=>setPassword(e.target.value)}/></label>
     <button className="button" disabled={busy}>{busy?'Please wait…':signup?'Create account':'Sign in with email'}</button>
     <button type="button" className="text-link" onClick={()=>setSignup(!signup)}>{signup?'Already have an account? Sign in':'Create an email account'}</button>
    </form>}
   </>:<p className="auth-intro">Account sign-in will be available when the database is connected.</p>}
   {message&&<p className="auth-message" role="alert">{message}</p>}
   {import.meta.env.DEV&&<button type="button" className="button secondary full-width auth-preview" onClick={()=>setDemo(true)}>Explore local development preview <ChevronRight size={17}/></button>}
  </section>
 </div>;
}
export default function App(){const {ready,session,demo,loading,error,refresh,db,profile,signOut}=useStore();const [mobileMenu,setMobileMenu]=useState<'study'|'more'|null>(null);const {pathname}=useLocation();if(!ready)return <div className="loading-screen">Opening StudyOS…</div>;if(!session&&!demo)return <Auth/>;const inboxCount=db.inbox_items.filter(i=>i.status==='needs_review').length;return <div className="app-shell"><aside className="sidebar"><Link className="brand" to="/"><span className="brand-icon"><GraduationCap/></span>StudyOS</Link><nav>{nav.map(({path,name,Icon})=><NavLink key={path} to={path} end={path==='/'}><Icon size={21}/><span>{name}</span>{name==='Inbox'&&inboxCount>0&&<span className="nav-count">{inboxCount}</span>}</NavLink>)}</nav><div className="sidebar-bottom"><NavLink to="/settings"><SettingsIcon size={21}/>Settings</NavLink><button onClick={()=>signOut()}><LogOut size={19}/>{demo?'Exit preview':'Sign out'}</button></div></aside><div className="app-main"><header className="topbar"><Link className="mobile-brand" to="/"><span className="brand-icon"><GraduationCap size={21}/></span>StudyOS</Link><span className="desktop-only workspace-label">Personal study workspace</span><div className="actions"><Link className="icon-button" aria-label="View progress" to="/progress"><BarChart3 size={20}/></Link><Link className="avatar" aria-label="Open settings" to="/settings">{(profile.display_name!=='Student'?profile.display_name:session?.user.user_metadata?.full_name??'Student').trim().charAt(0).toUpperCase()}</Link></div></header>{demo&&<div className="demo-banner"><strong>Development preview</strong><span>Sample data · changes reset on refresh · uploads require Supabase</span></div>}<main id="main-content">{loading?<div className="loading-screen" role="status">Loading your workspace…</div>:error?<section className="panel error-box"><h1>Could not load your workspace</h1><p>{error}</p><button className="button" onClick={()=>refresh()}>Retry</button></section>:<Routes><Route path="/" element={<Dashboard/>}/><Route path="/dashboard" element={<Navigate to="/" replace/>}/><Route path="/tasks" element={<TaskList all/>}/><Route path="/calendar" element={<Calendar/>}/><Route path="/tawjihi" element={<Tawjihi/>}/><Route path="/tawjihi/subjects" element={<Tawjihi/>}/><Route path="/tawjihi/subjects/:subjectId/*" element={<Subject/>}/><Route path="/tawjihi/exams/:examId" element={<Exam/>}/><Route path="/sat/practice/new" element={<SATSetup/>}/><Route path="/sat/practice/:sessionId" element={<SATSheet/>}/><Route path="/sat/*" element={<SAT/>}/><Route path="/ielts/*" element={<IELTS/>}/><Route path="/applications/*" element={<Applications/>}/><Route path="/inbox" element={<Inbox/>}/><Route path="/progress" element={<Progress/>}/><Route path="/mistakes" element={<Mistakes/>}/><Route path="/settings" element={<Settings/>}/><Route path="/login" element={<Navigate to="/" replace/>}/><Route path="*" element={<Empty title="Page not found"><Link className="button" to="/">Return to Dashboard</Link></Empty>}/></Routes>}</main></div><FocusTimer/><nav className="mobile-nav"><Link className={pathname==='/'?'active':''} to="/"><House size={22}/><span>Home</span></Link><button className={['/tawjihi','/sat','/ielts'].some(p=>pathname.startsWith(p))?'active':''} onClick={()=>setMobileMenu('study')}><BookOpen size={22}/><span>Study</span></button><Link className={pathname==='/inbox'?'active':''} to="/inbox"><InboxIcon size={22}/><span>Inbox</span></Link><button onClick={()=>setMobileMenu('more')}><Menu size={22}/><span>More</span></button></nav><Modal open={!!mobileMenu} onClose={()=>setMobileMenu(null)} title={mobileMenu==='study'?'Study':'More'}><div className="mobile-menu-links">{(mobileMenu==='study'?nav.slice(1,4):[{path:'/applications',name:'Applications',Icon:BriefcaseBusiness},{path:'/progress',name:'Progress',Icon:BarChart3},{path:'/calendar',name:'Calendar',Icon:LayoutDashboard},{path:'/settings',name:'Settings',Icon:SettingsIcon}]).map(({path,name,Icon})=><Link key={path} to={path} onClick={()=>setMobileMenu(null)}><Icon size={22}/>{name}<ChevronRight size={17}/></Link>)}</div></Modal></div>}

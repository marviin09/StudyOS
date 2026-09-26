import {createContext,useContext,useState,useEffect,useRef,type ReactNode} from 'react';
import {createClient,type SupabaseClient,type Session} from '@supabase/supabase-js';
import {useQuery,useQueryClient} from '@tanstack/react-query';
import {type Records,type Table,type Row,type Profile,defaultProfile,tables,emptyRecords} from './model';
import {demoRecords} from './seed';
const url=import.meta.env.VITE_SUPABASE_URL;const key=import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
export const client:SupabaseClient|null=url&&key?createClient(url,key):null;
interface Store { db:Records; profile:Profile; session:Session|null; demo:boolean; ready:boolean; loading:boolean; error:string; save:(table:Table,data:Partial<Row>)=>Promise<Row>; remove:(table:Table,id:string)=>Promise<void>; saveProfile:(data:Partial<Profile>)=>Promise<void>; refresh:()=>Promise<void>; setDemo:(v:boolean)=>void; signOut:()=>Promise<void>; client:SupabaseClient|null; upload:(file:File,meta:Partial<Row>,onProgress?:(n:number)=>void)=>Promise<Row>; openFile:(row:Row)=>Promise<void>; notify:(message:string)=>void; rpc:(name:string,args:Record<string,unknown>)=>Promise<unknown>; }
function newId(){const b=crypto.getRandomValues(new Uint8Array(16));b[6]=(b[6]&15)|64;b[8]=(b[8]&63)|128;const h=Array.from(b,x=>x.toString(16).padStart(2,'0')).join('');return `${h.slice(0,8)}-${h.slice(8,12)}-${h.slice(12,16)}-${h.slice(16,20)}-${h.slice(20)}`;}
const developmentRecords=()=>import.meta.env.DEV?demoRecords():emptyRecords();
const Context=createContext<Store|null>(null);
export const useStore=()=>{const c=useContext(Context);if(!c)throw new Error('Missing provider');return c};
export function StoreProvider({children}:{children:ReactNode}){
 const qc=useQueryClient();const [session,setSession]=useState<Session|null>(null),[ready,setReady]=useState(!client),[demo,setDemo]=useState(false),[memory,setMemory]=useState(developmentRecords),[demoProfile,setDemoProfile]=useState<Profile>({...defaultProfile,id:'demo'}),[toast,setToast]=useState('');
 const memoryRef=useRef(memory),lastUser=useRef<string|null>(null);
 useEffect(()=>{if(!client)return;const {data}=client.auth.onAuthStateChange((_event,next)=>{const userId=next?.user.id??null;if(lastUser.current!==userId){qc.clear();lastUser.current=userId}setSession(next);setReady(true)});return()=>data.subscription.unsubscribe()},[qc]);
 useEffect(()=>{if(!toast)return;const t=setTimeout(()=>setToast(''),5000);return()=>clearTimeout(t)},[toast]);
 const query=useQuery({queryKey:['records',session?.user.id],enabled:!!session&&!demo,queryFn:async()=>{const result=emptyRecords();await Promise.all(tables.map(async t=>{let offset=0;while(true){const {data,error}=await client!.from(t).select('*').eq('user_id',session!.user.id).order('created_at',{ascending:false}).range(offset,offset+999);if(error)throw new Error(`${t}: ${error.message}`);result[t].push(...data as Row[]);if(data.length<1000)break;offset+=1000}}));return result}});
 const profileQuery=useQuery({queryKey:['profile',session?.user.id],enabled:!!session&&!demo,queryFn:async()=>{const {data,error}=await client!.from('profiles').select('*').eq('id',session!.user.id).single();if(error)throw error;return data as Profile}});
 const notify=(s:string)=>setToast(s);
 const refresh=async()=>{await qc.invalidateQueries({queryKey:['records',session?.user.id]})};
 const save=async(table:Table,input:Partial<Row>):Promise<Row>=>{
  const now=new Date().toISOString();
  input=Object.fromEntries(Object.entries(input).map(([k,v])=>[k,k.endsWith("_id")&&v===""?null:v]));
  if(table==="exams"&&input.score!=null&&input.maximum_score!=null&&Number(input.score)>Number(input.maximum_score))throw new Error("Score cannot exceed the maximum score.");
  if(table==="tasks"&&input.status==="completed"&&!input.completed_at)input.completed_at=now;
  if(table==="tasks"&&input.status&&input.status!=="completed")input.completed_at=null;
  if(demo){const existing=input.id?memoryRef.current[table].find(r=>r.id===input.id):undefined;const row={...existing,...input,id:input.id??newId(),user_id:'demo',created_at:existing?.created_at??now,updated_at:now} as Row;memoryRef.current={...memoryRef.current,[table]:input.id?memoryRef.current[table].map(r=>r.id===input.id?row:r):[row,...memoryRef.current[table]]};setMemory(memoryRef.current);return row;}
  if(!client||!session)throw new Error('Sign in to save records.');
  const {id,created_at:_created,updated_at:_updated,user_id:_owner,...fields}=input;
  const request=id?client.from(table).update(fields).eq('id',id).eq('user_id',session.user.id):client.from(table).insert({...fields,user_id:session.user.id});
  const {data,error}=await request.select().single();if(error)throw error;
  qc.setQueryData<Records>(['records',session.user.id],old=>old?{...old,[table]:id?old[table].map(r=>r.id===id?data:r):[data,...old[table]]}:old);return data as Row;
 };
 const remove=async(table:Table,id:string)=>{if(demo){memoryRef.current={...memoryRef.current,[table]:memoryRef.current[table].filter(r=>r.id!==id)};setMemory(memoryRef.current);return}const {error}=await client!.from(table).delete().eq('id',id).eq('user_id',session!.user.id);if(error)throw error;await refresh()};
 const saveProfile=async(data:Partial<Profile>)=>{if(demo){setDemoProfile(p=>({...p,...data}));return}const {error}=await client!.from('profiles').update(data).eq('id',session!.user.id);if(error)throw error;await qc.invalidateQueries({queryKey:['profile']})};
 const upload=async(file:File,meta:Partial<Row>,progress?:(n:number)=>void)=>{
  if(!['application/pdf','image/jpeg','image/png','image/webp'].includes(file.type))throw new Error('Choose a PDF, JPEG, PNG or WebP file.');if(file.size>20*1024*1024)throw new Error('Each file must be 20 MB or smaller.');
  if(demo)throw new Error('File uploads require a connected Supabase project and a signed-in account.');
  const path=`${session!.user.id}/${newId()}/${file.name.replace(/[^a-zA-Z0-9._-]/g,'_')}`;progress?.(10);const {error}=await client!.storage.from('academic-files').upload(path,file,{contentType:file.type});if(error)throw error;progress?.(85);
  try{const saved=await save('files',{...meta,filename:file.name,mime_type:file.type,size_bytes:file.size,storage_path:path});progress?.(100);return saved}catch(e){await client!.storage.from('academic-files').remove([path]);throw e}
 };
 const openFile=async(row:Row)=>{if(demo)throw new Error('Example files do not contain uploaded documents.');const {data,error}=await client!.storage.from('academic-files').createSignedUrl(String(row.storage_path),60);if(error)throw error;window.open(data.signedUrl,'_blank','noopener,noreferrer')};
 const rpc=async(name:string,args:Record<string,unknown>)=>{if(demo)throw new Error('This operation requires Supabase.');const {data,error}=await client!.rpc(name,args);if(error)throw error;await refresh();return data};
 return <Context.Provider value={{db:demo?memory:query.data??emptyRecords(),profile:demo?demoProfile:profileQuery.data??defaultProfile,session,demo,ready,loading:!demo&&(query.isLoading||profileQuery.isLoading),error:query.error?.message??profileQuery.error?.message??'',save,remove,saveProfile,refresh,setDemo:(value:boolean)=>{if(import.meta.env.DEV)setDemo(value)},signOut:async()=>{if(demo){setDemo(false);memoryRef.current=developmentRecords();setMemory(memoryRef.current);return}await client?.auth.signOut();qc.clear()},client,upload,openFile,notify,rpc}}>{children}{toast&&<div role="status" className="toast" onClick={()=>setToast('')}>{toast}</div>}</Context.Provider>
}

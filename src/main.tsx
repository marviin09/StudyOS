import {StrictMode,Component,type ReactNode,type ErrorInfo} from 'react';
import {createRoot} from 'react-dom/client';
import {BrowserRouter} from 'react-router-dom';
import {QueryClient,QueryClientProvider} from '@tanstack/react-query';
import {StoreProvider} from './store';
import App from './App';
import './styles.css';
class ErrorBoundary extends Component<{children:ReactNode},{error:boolean}>{state={error:false};static getDerivedStateFromError(){return {error:true}}componentDidCatch(error:Error,_info:ErrorInfo){console.error(error)}render(){return this.state.error?<main className="auth-page"><h1>StudyOS could not display this page</h1><p>Your saved records are unchanged.</p><button className="button" onClick={()=>location.assign('/')}>Return to dashboard</button></main>:this.props.children}}
const query=new QueryClient({defaultOptions:{queries:{staleTime:30000,retry:1,refetchOnWindowFocus:false}}});
createRoot(document.getElementById('root')!).render(<StrictMode><ErrorBoundary><QueryClientProvider client={query}><BrowserRouter><StoreProvider><App/></StoreProvider></BrowserRouter></QueryClientProvider></ErrorBoundary></StrictMode>);

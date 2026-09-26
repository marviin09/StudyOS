import {execFileSync} from 'node:child_process';

// Publish a new GitHub root commit from this list. The Site repository history
// also holds user-provided reference material that must stay outside GitHub.
const rootFiles=new Set([
 '.env.example','.gitignore','README.md','eslint.config.js','index.html',
 'package-lock.json','package.json','tsconfig.json','vite.config.ts',
 'docs/VERIFICATION.md',
]);
const directories=['.github/workflows/','public/','scripts/','src/','supabase/migrations/'];
const tracked=execFileSync('git',['ls-files','-z'],{encoding:'utf8'}).split('\0').filter(Boolean);
const publish=tracked.filter(path=>rootFiles.has(path)||directories.some(dir=>path.startsWith(dir)));
if(publish.length===0||!publish.includes('supabase/migrations/202609230001_initial.sql')){
 throw new Error('Expected application files or the database migration are missing.');
}
console.log(JSON.stringify(publish,null,2));

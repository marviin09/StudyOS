import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import {VitePWA} from 'vite-plugin-pwa';
export default defineConfig({server:{host:'0.0.0.0',allowedHosts:['terminal.local']},build:{rollupOptions:{output:{manualChunks:{charts:['recharts'],supabase:['@supabase/supabase-js']}}}},plugins:[react(),tailwindcss(),VitePWA({registerType:'autoUpdate',manifest:{name:'StudyOS',short_name:'StudyOS',description:'Your personal study workspace',theme_color:'#6d20ed',background_color:'#f5f4fb',display:'standalone',start_url:'/',icons:[{src:'/icon-192.png',sizes:'192x192',type:'image/png'},{src:'/icon-512.png',sizes:'512x512',type:'image/png',purpose:'any'}]},workbox:{navigateFallback:'index.html',globPatterns:['**/*.{js,css,html,png,svg,woff2}'],maximumFileSizeToCacheInBytes:4000000}})]});

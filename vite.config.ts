import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import {VitePWA} from 'vite-plugin-pwa';
export default defineConfig({server:{host:'0.0.0.0',allowedHosts:['terminal.local']},build:{rollupOptions:{output:{manualChunks:{charts:['recharts'],supabase:['@supabase/supabase-js']}}}},plugins:[react(),tailwindcss(),VitePWA({registerType:'autoUpdate',manifest:{name:'Nibria',short_name:'Nibria',description:'Your focused study space for Tawjihi, SAT, IELTS and applications',theme_color:'#2d2a68',background_color:'#f5f7fb',display:'standalone',start_url:'/',icons:[{src:'/mark.svg',sizes:'any',type:'image/svg+xml',purpose:'any maskable'},{src:'/icon-192.png',sizes:'192x192',type:'image/png'},{src:'/icon-512.png',sizes:'512x512',type:'image/png',purpose:'any'}]},workbox:{navigateFallback:'index.html',globPatterns:['**/*.{js,css,html,png,svg,woff2}'],maximumFileSizeToCacheInBytes:4000000}})]});

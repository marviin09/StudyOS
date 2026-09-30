import type {SVGProps} from 'react';

export function BrandMark(props:SVGProps<SVGSVGElement>){
 return <svg viewBox="0 0 64 64" fill="none" aria-hidden="true" className={['brand-mark',props.className].filter(Boolean).join(' ')} {...props}>
  <defs><linearGradient id="nibria-iris" x1="4" y1="4" x2="60" y2="62" gradientUnits="userSpaceOnUse"><stop stopColor="#8277EC"/><stop offset=".55" stopColor="#6556D7"/><stop offset="1" stopColor="#333478"/></linearGradient></defs>
  <rect width="64" height="64" rx="19" fill="url(#nibria-iris)"/>
  <path d="M12.5 23.5c7.4-3.8 14.7-2.5 19.5 2.6v24.1c-4.8-5.1-12.1-6.4-19.5-2.6V23.5Z" fill="white"/>
  <path d="M51.5 23.5c-7.4-3.8-14.7-2.5-19.5 2.6v24.1c4.8-5.1 12.1-6.4 19.5-2.6V23.5Z" fill="#D7F6EE"/>
  <path d="M32 26.1v24.1" stroke="#8981EA" strokeWidth="2.5" strokeLinecap="round"/>
  <path d="M46 11.5 47.8 17l5.6 1.8-5.6 1.8-1.8 5.6-1.8-5.6-5.6-1.8 5.6-1.8 1.8-5.5Z" fill="#FFC993"/>
 </svg>;
}

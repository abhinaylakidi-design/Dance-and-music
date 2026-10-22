document.addEventListener('DOMContentLoaded', () => {
  'use strict';
  const root=document.documentElement, $=id=>document.getElementById(id);
  const theme=$('themeToggle'), direction=$('directionToggle'), menu=$('menuToggle'), nav=$('navigation'), home=$('homeToggle'), dropdown=$('homeDropdown');
  const read=k=>{try{return localStorage.getItem('little-rhythm-'+k)}catch{return null}};
  const write=(k,v)=>{try{localStorage.setItem('little-rhythm-'+k,v)}catch{}};
  const icon=(b,n)=>b?.querySelector('use')?.setAttribute('href','#'+n);
  const preference=matchMedia('(prefers-color-scheme: dark)');
  function applyTheme(t){root.dataset.theme=t;const label=`Switch to ${t==='dark'?'light':'dark'} mode`;theme?.setAttribute('aria-label',label);theme?.setAttribute('title',label);icon(theme,t==='dark'?'sun':'moon')}
  applyTheme(['light','dark'].includes(read('theme'))?read('theme'):preference.matches?'dark':'light');
  theme?.addEventListener('click',()=>{const t=root.dataset.theme==='dark'?'light':'dark';applyTheme(t);write('theme',t)});
  preference.addEventListener('change',e=>{if(!['light','dark'].includes(read('theme')))applyTheme(e.matches?'dark':'light')});
  function applyDir(v){root.dir=v;direction?.setAttribute('aria-pressed',String(v==='rtl'));const label=v==='rtl'?'Switch to left-to-right layout':'Switch to right-to-left layout';direction?.setAttribute('aria-label',label);direction?.setAttribute('title',label)}
  applyDir(read('direction')==='rtl'?'rtl':'ltr');direction?.addEventListener('click',()=>{const v=root.dir==='rtl'?'ltr':'rtl';applyDir(v);write('direction',v)});
  function setDropdown(open,focus=false){home?.setAttribute('aria-expanded',String(open));home?.setAttribute('aria-label',open?'Hide home pages':'Show home pages');if(dropdown)dropdown.hidden=!open;if(focus)home?.focus()}
  function setMenu(open,focus=false){nav?.classList.toggle('is-open',open);document.body.classList.toggle('menu-open',open);menu?.setAttribute('aria-expanded',String(open));menu?.setAttribute('aria-label',open?'Close navigation':'Open navigation');icon(menu,open?'close':'menu');if(open)nav?.querySelector('a')?.focus();else{setDropdown(false);if(focus)menu?.focus()}}
  setDropdown(false);setMenu(false);
  home?.addEventListener('click',()=>setDropdown(home.getAttribute('aria-expanded')!=='true'));
  home?.addEventListener('keydown',e=>{if(e.key==='ArrowDown'){e.preventDefault();setDropdown(true);dropdown?.querySelector('a')?.focus()}});
  document.addEventListener('click',e=>{if(!e.target.closest('.home-group'))setDropdown(false)});
  document.querySelector('.home-group')?.addEventListener('focusout',e=>{if(!e.currentTarget.contains(e.relatedTarget))setDropdown(false)});
  menu?.addEventListener('click',()=>setMenu(menu.getAttribute('aria-expanded')!=='true'));
  nav?.addEventListener('click',e=>{if(e.target.closest('a'))setMenu(false)});
  matchMedia('(min-width:1251px)').addEventListener('change',e=>{if(e.matches)setMenu(false)});
  document.addEventListener('keydown',e=>{const opened=menu?.getAttribute('aria-expanded')==='true';if(e.key==='Escape'){if(home?.getAttribute('aria-expanded')==='true')setDropdown(false,true);else if(opened)setMenu(false,true)}if(e.key==='Tab'&&opened){const list=[...document.querySelectorAll('.header-inner a,.header-inner button')].filter(x=>x.getClientRects().length&&!x.disabled);const first=list[0],last=list.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus()}}});
  nav?.querySelectorAll('a').forEach(a=>{const active=a.getAttribute('href')==='service.html';a.classList.toggle('active',active);if(active)a.setAttribute('aria-current',document.getElementById('serviceContent')?'location':'page');else a.removeAttribute('aria-current')});
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  if('IntersectionObserver' in window&&!motion.matches){const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');observer.unobserve(e.target)}}),{threshold:.08});root.classList.add('reveal-enabled');document.querySelectorAll('.reveal').forEach(x=>observer.observe(x));motion.addEventListener('change',e=>{if(e.matches){root.classList.remove('reveal-enabled');observer.disconnect()}})}
  const fallback='data:image/svg+xml;charset=utf-8,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><rect width="800" height="600" fill="#f0ebf8"/><text x="400" y="340" text-anchor="middle" fill="#7350b5" font-size="150">♫</text></svg>');
  document.querySelectorAll('img[data-fallback]').forEach(img=>{let replaced=false;function replace(){if(replaced)return;replaced=true;if(img.closest('.brand-mark')){img.outerHTML='<svg class="logo-fallback" viewBox="0 0 60 60" aria-hidden="true"><circle cx="30" cy="30" r="27" fill="none" stroke="currentColor" stroke-width="2"/><path d="M26 42V19l19-4v22M26 24l19-4" fill="none" stroke="currentColor" stroke-width="3"/><ellipse cx="20" cy="42" rx="6" ry="5" fill="currentColor"/><ellipse cx="39" cy="37" rx="6" ry="5" fill="currentColor"/></svg>';return}img.removeAttribute('srcset');img.src=fallback;img.classList.add('asset-fallback')}img.addEventListener('error',replace,{once:true});if(img.complete&&!img.naturalWidth)replace()});
  if($('year'))$('year').textContent=new Date().getFullYear();
});

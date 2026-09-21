/* Native document scrolling: no wheel interception or scroll lock. */
(()=>{
 const section=document.querySelector('.showcase');
 if(!section)return;
 const tabs=[...section.querySelectorAll('[role=tab]')];
 const isBroadcast=section.id==='create';
 const isVoice=section.id==='workflow';
 const selectTab=tab=>(isBroadcast||isVoice)?section.dispatchEvent(new CustomEvent('tourselect',{detail:tabs.indexOf(tab)})):select(tab);
 const panel=section.querySelector('.wrap');
 const media=matchMedia('(min-width: 1000px) and (min-height: 720px) and (prefers-reduced-motion: no-preference)');
 let enabled=false,step=0,raf=0;
 function update(){raf=0;if(!enabled)return;
  const offset=parseFloat(section.style.getPropertyValue('--tour-top'));
  const distance=offset-section.getBoundingClientRect().top;
  const index=Math.max(0,Math.min(tabs.length-1,Math.floor(Math.max(0,distance)/step)));
  if(tabs[index].getAttribute('aria-selected')!=='true')selectTab(tabs[index]);
  section.querySelector('.feature-count').textContent=String(index+1).padStart(2,'0')+(isBroadcast?' / BROADCAST HQ':isVoice?' / BUNYA VOICE':' / COMMAND CENTRE');
 }
 function setup(){
  enabled=media.matches;
  section.classList.toggle('scroll-tour',enabled);
  if(!enabled){section.style.removeProperty('height');return;}
  const top=Math.ceil(document.querySelector('header.nav')?.getBoundingClientRect().height||96);
  step=Math.round(innerHeight*.65);
  section.style.setProperty('--tour-top',top+'px');
  section.style.height=(innerHeight-top+step*tabs.length)+'px';
  update();
 }
 tabs.forEach((tab,index)=>tab.addEventListener('click',()=>{
  if(enabled)window.scrollTo({top:window.scrollY+section.getBoundingClientRect().top-parseFloat(section.style.getPropertyValue('--tour-top'))+index*step+step*.2,behavior:'instant'});
 }));
 // Keep keyboard selection aligned with the scroll position too.
 section.querySelector('[role=tablist]').addEventListener('keydown',e=>{
  if(enabled&&['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){
   const index=tabs.findIndex(t=>t.getAttribute('aria-selected')==='true');
   window.scrollTo({top:window.scrollY+section.getBoundingClientRect().top-parseFloat(section.style.getPropertyValue('--tour-top'))+index*step+step*.2,behavior:'instant'});
  }
 });
 window.addEventListener('scroll',()=>{if(!raf)raf=requestAnimationFrame(update)},{passive:true});
 window.addEventListener('resize',setup);media.addEventListener('change',setup);
 setup();window.addEventListener('load',setup,{once:true});
})();


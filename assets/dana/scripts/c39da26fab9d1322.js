/* Brand motion: header hairline, card rise, one pathway flow. Honours reduced motion. */
(()=>{
 const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const hdr=()=>document.querySelector('header.nav');
 const onScroll=()=>{const h=hdr();if(h)h.classList.toggle('is-scrolled',scrollY>8)};
 addEventListener('scroll',onScroll,{passive:true});addEventListener('load',onScroll);
 const hw=document.querySelector('.cc-window');
 if(hw){const end=()=>hw.classList.toggle('at-end',hw.scrollTop+hw.clientHeight>=hw.scrollHeight-4);hw.addEventListener('scroll',end,{passive:true});end();}
 if(reduce||!('IntersectionObserver' in window))return;
 document.documentElement.classList.add('js-rise');
 document.querySelectorAll('.benefits,.extensions,.delivery-grid').forEach(g=>{
  g.querySelectorAll('.rise').forEach((c,i)=>c.style.setProperty('--rd',(i*70)+'ms'));
 });
 const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{rootMargin:'0px 0px -8% 0px'});
 document.querySelectorAll('.rise').forEach(c=>io.observe(c));
 const canvas=document.querySelector('.eco-canvas'),svg=canvas&&canvas.querySelector('.eco-connections');
 if(svg){
  [...svg.querySelectorAll('path')].forEach((p,i)=>{p.setAttribute('pathLength','1');const f=p.cloneNode();f.classList.add('flow');f.style.setProperty('--d',(i*90)+'ms');svg.appendChild(f)});
  const eo=new IntersectionObserver(es=>{if(es[0].isIntersecting){canvas.classList.add('is-live');eo.disconnect()}},{threshold:.45});
  eo.observe(canvas);
 }
})();

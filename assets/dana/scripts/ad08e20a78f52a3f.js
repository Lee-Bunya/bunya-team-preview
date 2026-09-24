/* Header hairline + case-study path: highlights the section in view. */
(()=>{const hdr=()=>document.querySelector('header.nav');const on=()=>{const h=hdr();if(h)h.classList.toggle('is-scrolled',scrollY>8)};addEventListener('scroll',on,{passive:true});addEventListener('load',on);
const links=[...document.querySelectorAll('.cs-path a')];if(!links.length||!('IntersectionObserver' in window))return;
const map=new Map(links.map(a=>[a.getAttribute('href').slice(1),a]));
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){links.forEach(l=>l.classList.remove('on'));const a=map.get(e.target.id);if(a)a.classList.add('on')}}),{rootMargin:'-40% 0px -55% 0px'});
map.forEach((a,id)=>{const el=document.getElementById(id);if(el)io.observe(el)})})();
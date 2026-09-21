(()=>{
const scene=new URLSearchParams(location.search).get('scene')||'day';let paused=true,phase=0,timer,ready=false,camera={x:0,y:0,s:1};const root=()=>document.getElementById('root');const emit=(type,more={})=>parent.postMessage({type,scene,...more},location.origin);
const cursor=document.createElement('div');cursor.className='film-cursor';cursor.innerHTML='<svg viewBox="0 0 30 40"><path d="M3 2 L24 24 L14 24 L9 35 Z" fill="white" stroke="#040F1D" stroke-width="1.5"/></svg>';document.body.append(cursor);cursor.style.transform='translate(1050px,660px)';
function find(text,selector='button,[role=button],tr'){const all=[...document.querySelectorAll(selector)].filter(e=>e.getBoundingClientRect().width&&e.getBoundingClientRect().height);return all.find(e=>e.textContent.trim()===text)||all.find(e=>e.textContent.includes(text))}
function zoom(x,y,s){camera={x,y,s};root().style.transform=`translate(${x}px,${y}px) scale(${s})`}
function point(el){const r=el.getBoundingClientRect();cursor.style.transform=`translate(${r.left+Math.min(r.width*.6,140)}px,${r.top+Math.min(r.height/2,45)}px)`}
function click(el){cursor.classList.remove('click');void cursor.offsetWidth;cursor.classList.add('click');el.click()}
const config={day:{nav:'Reviews',target:'Fenton Family',end:'Review record and next steps'},enquiry:{nav:'Leads',target:'Ryan',end:'Lead details and client context'},onboarding:{nav:'Accounts',target:'McNamara',end:'Client context beside the agent feed'},advice:{nav:'Advice Pipeline',target:'McNamara',end:'Advice stages and assigned work'},implementation:{nav:'Advice Pipeline',target:'Harper',end:'Implementation detail on the matter'},review:{nav:'Reviews',target:'Fenton Family',end:'Review preparation on the client record'},reporting:{nav:'Reports (Power BI)',target:'Kane',end:'Filtered practice reporting'}}[scene];
function schedule(ms=1700){clearTimeout(timer);if(!paused)timer=setTimeout(tick,ms)}
function tick(){if(paused||!ready)return;let el;
if(phase===0){zoom(0,0,1);el=find(config.nav,'.mda-nav-item');if(el)point(el);emit('film-caption',{text:'Open '+config.nav.toLowerCase()});}
if(phase===1){el=find(config.nav,'.mda-nav-item');if(el)click(el);}
if(phase===2){zoom(-180,-38,1.25);emit('film-caption',{text:scene==='reporting'?'Focus the view by adviser':'Select the relevant client or matter'});}
if(phase===3){el=scene==='reporting'?document.querySelector('[data-tour-id="pbi-slicer-kane"]'):find(config.target,'.board-card,tr,button,[role=button]');if(el)point(el);else emit('film-missing',{target:config.target});}
if(phase===4){el=scene==='reporting'?document.querySelector('[data-tour-id="pbi-slicer-kane"]'):find(config.target,'.board-card,tr,button,[role=button]');if(el)click(el);}
if(phase===5){zoom(-240,-58,1.3);emit('film-caption',{text:config.end});if(scene==='onboarding'){el=find('Agent feed','.mda-nav-item');if(el){zoom(0,0,1);point(el)}}}
if(phase===6){if(scene==='onboarding'){el=find('Agent feed','.mda-nav-item');if(el)click(el);zoom(-430,-50,1.35)}else if(scene==='reporting'){el=find('Outstanding');if(el)point(el)}else{const detail=document.querySelector('[data-tour-id="advice-checklist"]');if(detail){zoom(-220,-60,1.3)}}}
if(phase===7){if(scene==='reporting'){el=find('Outstanding');if(el)click(el)}cursor.style.opacity='0';}
if(phase===8){paused=true;emit('film-end');return}
phase++;schedule(phase===8?2600:1700);}
function reset(){clearTimeout(timer);phase=0;cursor.style.opacity='1';zoom(0,0,1);const close=find('Command Centre','.mda-nav-item');if(close)close.click();}
addEventListener('message',e=>{if(e.origin!==location.origin||!ready)return;if(e.data?.type==='film-play'){if(phase>=8)reset();paused=false;tick()}if(e.data?.type==='film-pause'){paused=true;clearTimeout(timer)}});
const init=setInterval(()=>{if(!document.querySelector('.mda-nav'))return;find('Skip the tour — free roam')?.click();ready=true;clearInterval(init);emit('film-ready')},100);setTimeout(()=>clearInterval(init),15000);
})();


/* Cookie consent (Dana's design). Injects the panel, then runs the consent logic.
 * GA_ID / CLARITY_ID stay empty here, so nothing third-party loads in this local build. */
(function(){
  var markup = "<section class=\"bunya-consent\" id=\"bunya-consent\" role=\"region\" aria-label=\"Cookie and analytics preferences\" hidden> <div class=\"bunya-consent-body\"> <span class=\"bunya-consent-eyebrow\">Privacy choices</span> <strong class=\"bunya-consent-title\">A little insight helps us improve.</strong> <p>With your permission, Google Analytics and Microsoft Clarity help us understand visits, clicks and scrolling, including masked session recordings. Forms work whether you accept or decline. <a href=\"https://bunya.ai/privacy/\">Privacy policy</a></p> <div class=\"bunya-consent-prefs\" id=\"bunya-consent-prefs\" hidden> <label class=\"bunya-consent-option\"><input type=\"checkbox\" checked disabled> <span><b>Essential</b>Required for the site to work. Always on.</span></label> <label class=\"bunya-consent-option\"><input type=\"checkbox\" id=\"bunya-consent-analytics\"> <span><b>Analytics</b>Google Analytics and Microsoft Clarity, loaded only if you allow them.</span></label> </div> </div> <div class=\"bunya-consent-actions\"> <button type=\"button\" class=\"bunya-consent-btn bunya-consent-btn--text\" data-consent=\"manage\" aria-expanded=\"false\" aria-controls=\"bunya-consent-prefs\">Manage preferences</button> <button type=\"button\" class=\"bunya-consent-btn bunya-consent-btn--outline\" data-consent=\"declined\">Decline analytics</button> <button type=\"button\" class=\"bunya-consent-btn bunya-consent-btn--solid\" data-consent=\"accepted\">Accept analytics</button> <button type=\"button\" class=\"bunya-consent-btn bunya-consent-btn--solid\" data-consent=\"save\" hidden>Save preferences</button> </div> </section> <button type=\"button\" class=\"bunya-consent-reopen\" id=\"bunya-consent-reopen\" hidden>Privacy choices</button>";
  document.body.insertAdjacentHTML('beforeend', markup);
})();
/* Cookie consent (Bunya). Stores the visitor's choice; analytics only load after an explicit accept.
   Set GA_ID / CLARITY_ID below to enable each tag. While empty, nothing third-party loads at all.
   Reset from the console with bunyaConsent.reset(). */
(function(){
  var KEY='bunya-consent', VERSION=1, MAX_AGE=15552000; /* 180 days */
  var GA_ID='', CLARITY_ID='';
  var panel=document.getElementById('bunya-consent'); if(!panel) return;
  var reopen=document.getElementById('bunya-consent-reopen'),
      prefs=document.getElementById('bunya-consent-prefs'),
      analyticsBox=document.getElementById('bunya-consent-analytics'),
      btn=function(n){return panel.querySelector('[data-consent="'+n+'"]')},
      manageBtn=btn('manage'), declineBtn=btn('declined'), acceptBtn=btn('accepted'), saveBtn=btn('save');
  var loaded=false;

  function read(){
    try{var raw=localStorage.getItem(KEY); if(raw){var v=JSON.parse(raw); if(v&&v.v===VERSION) return v;}}catch(e){}
    try{var m=document.cookie.match(/(?:^|; )bunya-consent=([^;]*)/); if(m){var c=JSON.parse(decodeURIComponent(m[1])); if(c&&c.v===VERSION) return c;}}catch(e){}
    return null;
  }
  function write(analytics){
    var v={v:VERSION,analytics:!!analytics,ts:Date.now()}, s=JSON.stringify(v);
    try{localStorage.setItem(KEY,s)}catch(e){}
    try{document.cookie=KEY+'='+encodeURIComponent(s)+'; max-age='+MAX_AGE+'; path=/; SameSite=Lax'}catch(e){}
    return v;
  }
  function clear(){
    try{localStorage.removeItem(KEY)}catch(e){}
    try{document.cookie=KEY+'=; max-age=0; path=/; SameSite=Lax'}catch(e){}
  }
  function loadAnalytics(){
    if(loaded) return; loaded=true;
    if(GA_ID){
      window.dataLayer=window.dataLayer||[];
      window.gtag=window.gtag||function(){window.dataLayer.push(arguments)};
      window.gtag('js',new Date()); window.gtag('config',GA_ID,{anonymize_ip:true});
      var g=document.createElement('script'); g.async=true;
      g.src='https://www.googletagmanager.com/gtag/js?id='+encodeURIComponent(GA_ID); document.head.appendChild(g);
    }
    if(CLARITY_ID){
      window.clarity=window.clarity||function(){(window.clarity.q=window.clarity.q||[]).push(arguments)};
      var c=document.createElement('script'); c.async=true;
      c.src='https://www.clarity.ms/tag/'+encodeURIComponent(CLARITY_ID); document.head.appendChild(c);
    }
  }
  function apply(v){
    var on=!!(v&&v.analytics);
    if(on) loadAnalytics();
    try{document.dispatchEvent(new CustomEvent('bunya:consent',{detail:{analytics:on}}))}catch(e){}
  }
  function setManage(open){
    prefs.hidden=!open; saveBtn.hidden=!open; declineBtn.hidden=open; acceptBtn.hidden=open;
    manageBtn.setAttribute('aria-expanded',open?'true':'false');
  }
  function show(focus){
    var v=read(); analyticsBox.checked=!!(v&&v.analytics);
    setManage(false); panel.hidden=false; reopen.hidden=true;
    if(focus) acceptBtn.focus();
  }
  function hide(focus){
    panel.hidden=true; reopen.hidden=false;
    if(focus) reopen.focus();
  }
  function decide(analytics){
    var was=loaded, v=write(analytics);
    apply(v); hide(true);
    if(was && !analytics) location.reload(); /* already-loaded tags can only be removed by reloading */
  }

  panel.addEventListener('click',function(e){
    var t=e.target.closest('[data-consent]'); if(!t) return;
    var a=t.getAttribute('data-consent');
    if(a==='accepted') decide(true);
    else if(a==='declined') decide(false);
    else if(a==='save') decide(analyticsBox.checked);
    else if(a==='manage'){ setManage(prefs.hidden); (prefs.hidden?manageBtn:analyticsBox).focus(); }
  });
  reopen.addEventListener('click',function(){ show(true); });
  document.addEventListener('keydown',function(e){
    if(e.key==='Escape' && !panel.hidden && read()) hide(true);
  });

  var stored=read();
  if(stored){ apply(stored); hide(false); } else { show(false); }

  window.bunyaConsent={
    get:read,
    accept:function(){decide(true)},
    decline:function(){decide(false)},
    reset:function(){clear(); show(true);}
  };
})();

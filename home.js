/* Homepage product tour. All panels remain readable when JavaScript is disabled. */
document.addEventListener('DOMContentLoaded', function () {
  'use strict';
  // Supplied vector artwork: no recolouring, redrawing or wordmark retyping.
  document.querySelectorAll('header.nav .logo-img, footer.site .logo-img').forEach(function (logo) {
    logo.src = 'assets/brand/bunya-primary.svg';
  });
  var mobileLogo = document.querySelector('.m-overlay .logo-img');
  if (mobileLogo) mobileLogo.src = 'assets/brand/bunya-reversed.svg';
  var tablist = document.querySelector('.hp-product-tabs');
  if (!tablist) return;
  var tabs = Array.from(tablist.querySelectorAll('[role="tab"]'));
  function selectTab(tab, focus) {
    tabs.forEach(function (item) {
      var selected = item === tab;
      item.setAttribute('aria-selected', String(selected));
      item.tabIndex = selected ? 0 : -1;
      document.getElementById(item.getAttribute('aria-controls')).hidden = !selected;
    });
    if (focus) tab.focus();
  }
  tabs.forEach(function (tab, index) {
    tab.addEventListener('click', function () { selectTab(tab, false); });
    tab.addEventListener('keydown', function (event) {
      var next;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next === undefined) return;
      event.preventDefault();
      selectTab(tabs[next], true);
    });
  });
  // Improve the shared navigation's keyboard behaviour on this homepage only.
  document.querySelectorAll('.nav-item').forEach(function (item) {
    var trigger = item.querySelector(':scope > a');
    var dropdown = item.querySelector('.dropdown');
    if (!trigger || !dropdown) return;
    trigger.setAttribute('role', 'button');
    trigger.tabIndex = 0;
    trigger.setAttribute('aria-expanded', 'false');
    function setOpen(open) {
      trigger.setAttribute('aria-expanded', String(open));
      item.classList.toggle('hp-nav-open', open);
    }
    trigger.addEventListener('click', function () {
      setOpen(trigger.getAttribute('aria-expanded') !== 'true');
    });
    trigger.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        setOpen(trigger.getAttribute('aria-expanded') !== 'true');
      }
    });
    item.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') { event.preventDefault(); setOpen(false); trigger.focus(); }
    });
    item.addEventListener('pointerenter', function () { setOpen(true); });
    item.addEventListener('pointerleave', function () {
      if (!item.contains(document.activeElement)) setOpen(false);
    });
    item.addEventListener('focusout', function (event) {
      if (!item.contains(event.relatedTarget)) setOpen(false);
    });
    document.addEventListener('click', function (event) {
      if (!item.contains(event.target)) setOpen(false);
    });
  });
});

// Scale the real demo viewport without changing the product's desktop layout.
document.addEventListener('DOMContentLoaded',()=>{
 const frames=[...document.querySelectorAll('.hp-screen-window iframe')];
 function fit(){frames.forEach(f=>{const width=f.parentElement.clientWidth;if(!width)return;const scale=width/1280;f.style.transform=`scale(${scale})`;f.parentElement.style.height=`${800*scale}px`;});}
 new ResizeObserver(fit).observe(document.querySelector('main'));document.querySelectorAll('[role="tab"]').forEach(b=>b.addEventListener('click',()=>requestAnimationFrame(fit)));fit();
 const button=document.querySelector('#hp-motion'),hero=document.querySelector('.hp-screen-hero iframe'),label=document.querySelector('#hp-scene-label');
 const scenes=[['home','01 / Your practice at a glance'],['reviews','02 / Review work in view'],['pipeline','03 / Advice moving through the practice']];let timer=null,index=0;
 function stop(){clearInterval(timer);timer=null;button.textContent='Play preview';button.setAttribute('aria-pressed','false');}
 button.addEventListener('click',()=>{if(timer){stop();return;}button.textContent='Pause preview';button.setAttribute('aria-pressed','true');timer=setInterval(()=>{index=(index+1)%scenes.length;hero.contentWindow.postMessage({type:'bunya-screen',screen:scenes[index][0]},location.origin);label.textContent=scenes[index][1];},3500);});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stop()});new IntersectionObserver(entries=>{if(!entries[0].isIntersecting)stop()}).observe(hero);
 matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',stop);
});

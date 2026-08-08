import { img, wix, raw } from '../content/media.mjs';
import { ICONS } from './icons.mjs';

const e = (s) => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const pad = (n) => String(n).padStart(2,'0');

/** d = prefisso verso la radice del sito (es. '../'), home = link al sito pubblico */
export default function renderArgos(t, cfg, d, home) {
  return `<!doctype html>
<html lang="${t.lang}" class="no-js">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${e(t.gate.title)} — Wildblood Saga</title>
<meta name="description" content="${e(t.gate.intro)}">
<meta name="robots" content="noindex,nofollow">
<meta name="theme-color" content="#050406">
<link rel="icon" href="${d}favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="${d}assets/css/argos.css">
<script>document.documentElement.className='js'</script>
</head>
<body class="lock">

<!-- SCHERMATA DI ACCESSO -->
<div class="boot" id="gate">
  <div class="boot__in">
    <div class="boot__l on"><b>&gt;</b> ${e(t.boot.sys)} // <s>${e(t.gate.title).toUpperCase()}</s></div>
    <div class="boot__l on" style="color:var(--ash)">${e(t.gate.codeHint)}</div>
    <form class="form" id="gateForm" style="margin-top:18px;justify-content:flex-start">
      <label class="sr" for="code">${e(t.gate.codeLabel)}</label>
      <input id="code" type="text" inputmode="text" autocomplete="off" spellcheck="false"
             placeholder="${e(t.gate.codeLabel)}" style="flex:1 1 220px">
      <button class="btn" type="submit">${e(t.gate.enter)}${ICONS.arrow}</button>
    </form>
    <div class="boot__bar"><i></i></div>
    <div class="boot__pct"><span id="gateMsg"></span><a href="${home}" style="color:var(--ash)">${e(t.gate.back)}</a></div>
  </div>
</div>

<div class="hud" aria-hidden="true">
  <div class="hud__b hud__b--t"></div><div class="hud__b hud__b--b"></div>
  <div class="hud__b hud__b--l"></div><div class="hud__b hud__b--r"></div>
  <span class="hud__c hud__c--tl"></span><span class="hud__c hud__c--tr"></span>
  <span class="hud__c hud__c--bl"></span><span class="hud__c hud__c--br"></span>
  <span class="hud__tag hud__tag--l">${e(t.hud.left)} — <b data-hud-sec></b></span>
  <span class="hud__tag hud__tag--r"><b>●</b> ${e(t.hud.right)} — <span data-clock></span> — <b data-hud-pct>000</b>%</span>
  <div class="hud__scan"></div>
</div>
<div class="scanlines" aria-hidden="true"></div><div class="grain" aria-hidden="true"></div><div class="vig" aria-hidden="true"></div>

<header class="nav stuck">
  <div class="nav__in">
    <a class="brand" href="${home}">
      <img src="${wix('argosLogo',52)}" data-fallback="${raw('argosLogo')}" width="26" height="26" alt="">
      <span>${e(t.gate.title)}</span>
    </a>
    <nav class="links" aria-label="${e(t.nav.menu)}">
      <a href="#files" data-n="01">${e(t.archive.label)}</a>
      <a href="#subjects" data-n="02">${e(t.cast.label)}</a>
      <a href="#factions" data-n="03">${e(t.world.label)}</a>
      <a href="${home}" data-n="04">${e(t.gate.back)}</a>
    </nav>
    <div class="nav__r">
      <button class="burger" type="button" aria-label="${e(t.nav.menu)}" aria-expanded="false"><i></i><i></i></button>
    </div>
  </div>
</header>

<main id="main">
<section class="sec arch" id="files" data-name="${e(t.archive.label)}" data-decl-scope>
  <div class="arch__bg" aria-hidden="true">${img('archiveBg',{w:1800,alt:''})}</div>
  <div class="wrap arch__in">
    <header class="sh" data-r>
      <div>
        <div class="sh__idx"><span class="n">[ 01 / 03 ]</span><span class="r"></span></div>
        <p class="lab">${e(t.archive.label)}</p>
        <h1 class="d d2" data-dec>${e(t.archive.title)}</h1>
      </div>
      <p class="lede">${e(t.archive.intro)}</p>
    </header>
    <p data-r style="margin-bottom:26px">
      <button class="btn btn--g btn--s" type="button" data-decl aria-pressed="false"
        data-on="${e(t.archive.declassifyOn)}" data-off="${e(t.archive.declassifyOff)}">
        <span data-decl-l>${e(t.archive.declassifyOff)}</span></button>
    </p>
    <div class="files">
      ${t.archive.items.map((f,i)=>{
        const docs = f.docs || [];
        const dis  = docs.length ? '' : ' disabled';
        return `
      <button type="button" class="file${docs.length?'':' file--lk'}" data-open="${i}"${dis} data-r style="--d:${i*55}ms">
        <div class="file__i">${img(f.key,{w:560,h:385,alt:f.name})}
          <span class="file__sc"></span><span class="file__sw"></span>
          <span class="file__lk">${docs.length ? docs.length+' '+e(t.archive.viewer.count) : e(t.archive.locked)}</span></div>
        <div class="file__bd">
          <span class="file__c">${e(f.code)}-<span class="rd">${pad(i+1)}</span></span>
          <h3 class="file__n">${e(f.name)}</h3>
          <p class="file__d">${e(f.desc)}</p>
          <span class="file__go">${docs.length ? e(t.archive.viewer.open) : e(t.archive.viewer.empty)}${docs.length?ICONS.arrow:''}</span>
        </div>
      </button>`;}).join('')}
    </div>
  </div>
</section>

<section class="sec" id="subjects" data-name="${e(t.cast.label)}">
  <div class="wrap">
    <header class="sh" data-r>
      <div><div class="sh__idx"><span class="n">[ 02 / 03 ]</span><span class="r"></span></div>
        <p class="lab">${e(t.cast.label)}</p><h2 class="d d2" data-dec>${e(t.cast.title)}</h2></div>
      <p class="lede">${e(t.cast.intro)}</p>
    </header>
    <div class="cast">
      ${t.cast.items.map((c,i)=>`
      <article class="dos" style="--d:${i*55}ms">
        <div class="dos__i">
          <img src="${d}assets/img/${c.key}.svg" width="900" height="1200" loading="lazy" decoding="async" alt="${e(c.name)}">
          <span class="dos__tag">${e(t.cast.pending)}</span>
        </div>
        <div class="dos__bd">
          <span class="dos__r">${e(c.role)}</span>
          <h3 class="dos__n">${e(c.name)}</h3>
          <p class="dos__x">${e(c.line)}</p>
          <div class="dos__m"><span class="lb"><span>INDEX</span><span>${c.meter}%</span></span>
            <span class="bar"><i style="--m:${c.meter}%"></i></span></div>
        </div>
      </article>`).join('')}
    </div>
  </div>
</section>

<section class="sec" id="factions" data-name="${e(t.world.label)}">
  <div class="wrap">
    <header class="sh" data-r>
      <div><div class="sh__idx"><span class="n">[ 03 / 03 ]</span><span class="r"></span></div>
        <p class="lab">${e(t.world.label)}</p><h2 class="d d2" data-dec>${e(t.world.title)}</h2></div>
      <p class="lede">${e(t.world.intro)}</p>
    </header>
    <div class="facs">
      ${t.world.items.map((f,i)=>`
      <article class="fac" data-r style="--d:${i*70}ms">
        <p class="fac__id">${e(f.id)}</p><h3 class="fac__n">${e(f.name)}</h3>
        <p class="fac__d">${e(f.desc)}</p>
        <div class="tags">${f.tags.map((x)=>`<span class="tag">${e(x)}</span>`).join('')}</div>
      </article>`).join('')}
    </div>
    <p style="margin-top:44px"><a class="btn btn--g" href="${home}">${e(t.gate.back)}${ICONS.arrow}</a></p>
  </div>
</section>
</main>

<!-- VISORE FASCICOLI -->
<div class="vw" id="viewer" hidden>
  <div class="vw__bar">
    <span class="vw__code" data-vw-code></span>
    <span class="vw__title" data-vw-title></span>
    <span class="vw__n" data-vw-n></span>
    <a class="vw__dl" data-vw-dl target="_blank" rel="noopener" title="${e(t.archive.viewer.zoom)}">${ICONS.ext}</a>
    <button class="vw__x" type="button" data-vw-close aria-label="${e(t.archive.viewer.close)}">
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M2 2l12 12M14 2L2 14" stroke-linecap="round"/></svg>
    </button>
  </div>
  <button class="vw__nav vw__nav--p" type="button" data-vw-prev aria-label="${e(t.archive.viewer.prev)}">
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M10 2L4 8l6 6" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
  <button class="vw__nav vw__nav--n" type="button" data-vw-next aria-label="${e(t.archive.viewer.next)}">
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M6 2l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
  <div class="vw__stage" data-vw-stage><img alt="" data-vw-img></div>
  <div class="vw__strip" data-vw-strip></div>
</div>

<script type="application/json" id="argos-docs">${JSON.stringify(
  t.archive.items.map((f)=>({
    name:f.name, code:f.code,
    docs:(f.docs||[]).map((x)=>({c:x.c,t:x.t,u:wix(x.k,1800),th:wix(x.k,220,150),raw:raw(x.k)})),
  }))
)}</script>

<script>
(function(){
  var CODE=${JSON.stringify(String(cfg.argosCode).toUpperCase())};
  var KEY='wb-argos';
  var gate=document.getElementById('gate'),f=document.getElementById('gateForm'),
      msg=document.getElementById('gateMsg'),inp=document.getElementById('code');
  function open(){gate.classList.add('done');document.body.classList.remove('lock');}
  try{ if(sessionStorage.getItem(KEY)==='1') open(); }catch(err){}
  f.addEventListener('submit',function(ev){
    ev.preventDefault();
    var v=(inp.value||'').trim().toUpperCase().replace(/\\s+/g,'');
    if(v===CODE.replace(/\\s+/g,'')){
      msg.textContent=${JSON.stringify(t.gate.granted)};
      try{sessionStorage.setItem(KEY,'1')}catch(err){}
      setTimeout(open,450);
    } else { msg.textContent=${JSON.stringify(t.gate.denied)}; inp.value=''; }
  });
})();
</script>
<script src="${d}assets/js/argos.js" defer></script>
</body>
</html>`;
}

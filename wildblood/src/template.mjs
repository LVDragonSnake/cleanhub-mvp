import { img, wix, raw } from '../content/media.mjs';
import { ICONS } from './icons.mjs';

const e = (s) => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const P = (d, s) => (d ? d + s : s);
const local = (d, f) => `${d}assets/img/${f}`;
const pad = (n) => String(n).padStart(2, '0');

/* intestazione di sezione con indice progressivo */
const head = (n, total, lab, title, intro) => `
  <header class="sh" data-r>
    <div>
      <div class="sh__idx"><span class="n">[ ${pad(n)} / ${pad(total)} ]</span><span class="r"></span></div>
      <p class="lab">${e(lab)}</p>
      <h2 class="d d2" data-dec>${e(title)}</h2>
    </div>
    ${intro ? `<p class="lede">${e(intro)}</p>` : '<div></div>'}
  </header>`;

const ticker = (items, rev) => `
  <div class="tick ${rev ? 'tick--r' : ''}" aria-hidden="true">
    ${[0, 1].map(() => `<div class="tick__t">${items.map((x) => `<span>${e(x)}</span>`).join('')}</div>`).join('')}
  </div>`;

const statusTag = (t, st) => {
  const m = { out:[t.saga.statusOut,'tag--live'], soon:[t.saga.statusSoon,''],
              writing:[t.saga.statusWriting,''], dev:[t.saga.statusDev,''] };
  const [x, c] = m[st] || m.dev;
  return `<span class="tag ${c}">${e(x)}</span>`;
};

export default function render(t, cfg) {
  const d = t.dir;
  const buyUrl = t.lang === 'it' ? cfg.buy.it : cfg.buy.en;
  const NAV = [
    ['#books', t.nav.books], ['#saga', t.nav.saga], ['#archive', t.nav.archive],
    ['#map', t.nav.places], ['#world', t.nav.world], ['#cast', t.nav.cast],
    ['#author', t.nav.author], ['#join', t.nav.join],
  ];
  const N = 9;

  const jsonld = JSON.stringify({
    '@context':'https://schema.org','@type':'Book',
    name:'Wildblood: Savage Heart', bookEdition:'Volume 1', inLanguage:t.lang,
    description:t.meta.desc, image:wix('coverSH',800),
    author:{'@type':'Person',name:cfg.author,url:cfg.domain},
    isPartOf:{'@type':'BookSeries',name:'Wildblood Saga',numberOfBooks:5},
    genre:['Dark Fantasy','Adventure','Psychological Thriller'],
    offers:{'@type':'Offer',url:buyUrl,availability:'https://schema.org/InStock'},
  });

  return `<!doctype html>
<html lang="${t.lang}" class="no-js">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${e(t.meta.title)}</title>
<meta name="description" content="${e(t.meta.desc)}">
<meta name="author" content="${e(cfg.author)}">
<meta name="theme-color" content="#050406">
<link rel="canonical" href="${cfg.domain}/${t.lang==='it'?'':'en/'}">
<link rel="alternate" hreflang="it" href="${cfg.domain}/">
<link rel="alternate" hreflang="en" href="${cfg.domain}/en/">
<link rel="alternate" hreflang="x-default" href="${cfg.domain}/">
<link rel="icon" href="${P(d,'favicon.svg')}" type="image/svg+xml">
<meta property="og:type" content="book"><meta property="og:site_name" content="Wildblood Saga">
<meta property="og:locale" content="${t.locale}">
<meta property="og:title" content="${e(t.meta.title)}">
<meta property="og:description" content="${e(t.meta.desc)}">
<meta property="og:image" content="${wix('heroWide',1200,630)}">
<meta property="og:image:alt" content="${e(t.meta.ogAlt)}">
<meta name="twitter:card" content="summary_large_image">
<link rel="preconnect" href="https://static.wixstatic.com" crossorigin>
<link rel="stylesheet" href="${P(d,'assets/css/site.css')}">
<script type="application/ld+json">${jsonld}</script>
<script>document.documentElement.className='js'</script>
</head>
<body class="lock">

<a class="skip" href="#main">${e(t.skip)}</a>

<!-- BOOT -->
<div class="boot" role="status" aria-label="${e(t.boot.sys)}">
  <div class="boot__in">
    ${t.boot.lines.map((l) => `<div class="boot__l">${l}</div>`).join('\n    ')}
    <div class="boot__bar"><i></i></div>
    <div class="boot__pct"><span>${e(t.boot.sys)}</span><span data-pct>000%</span></div>
  </div>
</div>

<!-- HUD -->
<div class="hud" aria-hidden="true">
  <div class="hud__b hud__b--t"></div><div class="hud__b hud__b--b"></div>
  <div class="hud__b hud__b--l"></div><div class="hud__b hud__b--r"></div>
  <span class="hud__c hud__c--tl"></span><span class="hud__c hud__c--tr"></span>
  <span class="hud__c hud__c--bl"></span><span class="hud__c hud__c--br"></span>
  <span class="hud__rail hud__rail--l"></span><span class="hud__rail hud__rail--r"></span>
  <span class="hud__tag hud__tag--l">${e(t.hud.left)} — <b data-hud-sec></b></span>
  <span class="hud__tag hud__tag--r"><b>●</b> ${e(t.hud.right)} — <span data-clock></span> — <b data-hud-pct>000</b>%</span>
  <div class="hud__scan"></div>
</div>
<div class="scanlines" aria-hidden="true"></div>
<div class="grain" aria-hidden="true"></div>
<div class="vig" aria-hidden="true"></div>

<!-- NAV -->
<header class="nav">
  <div class="nav__in">
    <a class="brand" href="#top" aria-label="Wildblood Saga">
      <img src="${wix('argosLogo',52)}" data-fallback="${raw('argosLogo')}" width="26" height="26" alt="">
      <span>Wildblood</span>
    </a>
    <nav class="links" aria-label="${e(t.nav.menu)}">
      ${NAV.map(([h,l],i)=>`<a href="${h}" data-n="${pad(i+1)}">${e(l)}</a>`).join('\n      ')}
    </nav>
    <div class="nav__r">
      <div class="lang">
        <a href="${t.lang==='it'?t.selfHref:t.altHref}" class="${t.lang==='it'?'on':''}" hreflang="it">IT</a>
        <a href="${t.lang==='en'?t.selfHref:t.altHref}" class="${t.lang==='en'?'on':''}" hreflang="en">EN</a>
      </div>
      <button class="burger" type="button" aria-label="${e(t.nav.menu)}" aria-expanded="false"><i></i><i></i></button>
    </div>
  </div>
</header>

<main id="main">

<!-- ===== HERO ===== -->
<section class="hero" id="top" data-name="${e(t.hero.title)}">
  <div class="hero__ph">${img('heroWide',{w:1920,alt:t.meta.ogAlt,lazy:false,sizes:'100vw'})}</div>
  <div class="hero__ab hero__ab--r" aria-hidden="true">${img('heroWide',{w:1400,alt:''})}</div>
  <div class="hero__ab hero__ab--c" aria-hidden="true">${img('heroWide',{w:1400,alt:''})}</div>
  <div class="hero__lens" aria-hidden="true">${img('heroWide',{w:1600,alt:''})}</div>
  <div class="hero__veil" aria-hidden="true"></div>
  <div class="hero__em" aria-hidden="true"></div>
  <svg class="pulse" viewBox="0 0 1200 54" preserveAspectRatio="none" aria-hidden="true"><path d=""/></svg>

  <div class="wrap hero__in">
    <div class="eyeb" data-r>
      <span class="dot"></span>
      <span class="m m--hot">${e(t.hero.eyebrow)}</span>
    </div>
    <div class="wm" data-r style="--d:60ms"><h1>${e(t.hero.title)}</h1></div>
    <div class="wm__sub" data-r style="--d:130ms">
      <span class="lab">${e(t.hero.tagline)}</span>
      <span class="m">${e(t.hero.stat)}</span>
    </div>
    <p class="hero__pitch lede" data-r style="--d:200ms">${t.hero.pitch}</p>
    <div class="btns" data-r style="--d:270ms">
      <a class="btn" href="${buyUrl}" target="_blank" rel="noopener">${e(t.hero.ctaPrimary)}${ICONS.ext}</a>
      <a class="btn btn--g" href="#archive">${e(t.hero.ctaSecondary)}${ICONS.arrow}</a>
    </div>
    <div class="hero__foot" data-r style="--d:340ms">
      <div class="sdown"><span class="bar"></span><span class="m">${e(t.hero.scroll)}</span></div>
      <span class="m">${e(cfg.author)}</span>
    </div>
  </div>
</section>

${ticker(t.ticker)}

<!-- ===== STATS ===== -->
<div class="wrap"><div class="stats" data-r>
  ${t.stats.map((s)=>`<div class="stat">
    <p class="stat__n"><span data-count="${s.n}">0</span>${s.unit?`<em>${e(s.unit)}</em>`:''}</p>
    <p class="stat__l">${e(s.label)}</p>
  </div>`).join('')}
</div></div>

<!-- ===== SPOTLIGHT ===== -->
<section class="sec spot" id="books" data-name="${e(t.nav.books)}">
  <div class="spot__bg" aria-hidden="true">${img('beast',{w:1500,alt:''})}</div>
  <div class="wrap spot__in">
    <div class="spot__art" data-tilt data-r>
      <span class="gl" aria-hidden="true"></span>
      <span class="brk"></span><span class="brk"></span><span class="brk"></span><span class="brk"></span>
      <figure>${img('coverSH',{w:600,alt:'Wildblood — Savage Heart'})}</figure>
    </div>
    <div>
      <div class="sh__idx" data-r><span class="n">[ 01 / ${pad(N)} ]</span><span class="r"></span></div>
      <p class="lab" data-r>${e(t.spot.label)}</p>
      <h2 class="d d2" data-r style="--d:60ms" data-dec>${e(t.spot.title)}</h2>
      <p class="m" data-r style="--d:100ms;margin:10px 0 18px">${e(t.spot.sub)}</p>
      <p class="lede" data-r style="--d:150ms">${e(t.spot.pitch)}</p>
      <ul class="facts" data-r style="--d:210ms">${t.spot.facts.map((f)=>`<li>${e(f)}</li>`).join('')}</ul>
      <div class="btns" data-r style="--d:260ms">
        <a class="btn" href="${buyUrl}" target="_blank" rel="noopener">${e(t.spot.buy)}${ICONS.ext}</a>
        <a class="btn btn--g" href="${cfg.buy.kindle}" target="_blank" rel="noopener">${e(t.spot.preview)}${ICONS.ext}</a>
      </div>
    </div>
  </div>
</section>

<!-- ===== SAGA — RAIL ORIZZONTALE ===== -->
<section class="rail" id="saga" data-name="${e(t.nav.saga)}">
  <div class="rail__stick">
    <div class="rail__hd">
      <div class="wrap">
        <div>
          <div class="sh__idx in"><span class="n">[ 02 / ${pad(N)} ]</span><span class="r" style="width:60px;flex:none"></span></div>
          <p class="lab" style="margin-top:10px">${e(t.saga.label)}</p>
          <h2 class="d d3" style="margin-top:8px">${e(t.saga.title)}</h2>
        </div>
        <span class="m">${e(t.rail.hint)}</span>
      </div>
    </div>

    <div class="rail__track">
      ${t.saga.items.map((v)=>`
      <article class="vol ${(v.status==='out'||v.status==='soon')?'':'vol--tba'}">
        <div class="vol__top">
          <span class="vol__n">${v.n}</span>
          ${statusTag(t,v.status)}
        </div>
        <div class="vol__img">${img(v.key,{w:520,h:753,alt:v.title})}</div>
        <div class="vol__bd">
          <h3 class="vol__t">${e(v.title)}</h3>
          <div class="tags">${v.tags.map((x)=>`<span class="tag">${e(x)}</span>`).join('')}</div>
          <p class="vol__x">${v.text.replace(/<\/p>\s*<p>/g,' ').replace(/<\/?p>/g,'')}</p>
          ${v.status==='out'?`<a class="btn btn--s" href="${buyUrl}" target="_blank" rel="noopener" style="align-self:flex-start;margin-top:auto">${e(t.saga.buy)}${ICONS.ext}</a>`:''}
        </div>
      </article>`).join('')}
    </div>

    <span class="m rail__cnt" data-rail-n>01 / 05</span>
    <div class="rail__prog"><i></i></div>
  </div>
</section>

${ticker(t.ticker,true)}

<!-- ===== ARCHIVIO ===== -->
<section class="sec arch" id="archive" data-name="${e(t.nav.archive)}" data-decl-scope>
  <div class="arch__bg" aria-hidden="true">${img('archiveBg',{w:1800,alt:''})}</div>
  <div class="wrap arch__in">
    ${head(3,N,t.archive.label,t.archive.title,t.archive.intro)}
    <p data-r style="margin-bottom:26px">
      <button class="btn btn--g btn--s" type="button" data-decl aria-pressed="false"
        data-on="${e(t.archive.declassifyOn)}" data-off="${e(t.archive.declassifyOff)}">
        <span data-decl-l>${e(t.archive.declassifyOff)}</span>
      </button>
    </p>
    <div class="files">
      ${t.archive.items.map((f,i)=>`
      <article class="file ${f.locked?'file--lk':''}" data-r style="--d:${i*55}ms">
        <div class="file__i">
          ${img(f.key,{w:560,h:385,alt:f.name})}
          <span class="file__sc"></span><span class="file__sw"></span>
          ${f.locked?`<span class="file__lk">${e(t.archive.locked)}</span>`:''}
        </div>
        <div class="file__bd">
          <span class="file__c">${e(f.code)}-<span class="rd">${pad(i+1)}</span></span>
          <h3 class="file__n">${e(f.name)}</h3>
          <p class="file__d">${e(f.desc)}</p>
        </div>
      </article>`).join('')}
    </div>
  </div>
</section>

<!-- ===== MAPPA ANOMALIE ===== -->
<section class="sec grid" id="map" data-name="${e(t.nav.places)}">
  <div class="wrap">
    ${head(4,N,t.map.label,t.map.title,t.map.intro)}
    <div class="grid__in">
      <div class="map" data-r data-clip>
        ${img('gridMap',{w:900,alt:t.map.hudL})}
        <div class="map__ov" aria-hidden="true">
          <span class="map__g"></span>
          ${t.places.items.map((p)=>`<span class="pin" style="left:${p.pin[0]}%;top:${p.pin[1]}%"><b></b><i></i><span>${e(p.name)}</span></span>`).join('')}
        </div>
        <div class="map__hud"><span>${e(t.map.hudL)}</span><span class="m--hot">● ${e(t.map.hudR)}</span></div>
      </div>
      <div class="locs" data-r style="--d:90ms">
        ${t.places.items.map((p)=>`
        <article class="loc">
          <h3 class="loc__n">${e(p.name)}</h3>
          <span class="loc__c">${e(p.coord)}</span>
          <p class="loc__d">${e(p.desc)} <span class="m">— ${e(p.vol)}</span></p>
        </article>`).join('')}
      </div>
    </div>
  </div>
</section>

<!-- ===== FAZIONI ===== -->
<section class="sec" id="world" data-name="${e(t.nav.world)}">
  <div class="wrap">
    ${head(5,N,t.world.label,t.world.title,t.world.intro)}
    <div class="facs">
      ${t.world.items.map((f,i)=>`
      <article class="fac" data-r style="--d:${i*70}ms">
        <p class="fac__id">${e(f.id)}</p>
        <h3 class="fac__n">${e(f.name)}</h3>
        <p class="fac__d">${e(f.desc)}</p>
        <div class="tags">${f.tags.map((x)=>`<span class="tag">${e(x)}</span>`).join('')}</div>
      </article>`).join('')}
    </div>
  </div>
</section>

<!-- ===== DOSSIER ===== -->
<section class="sec" id="cast" data-name="${e(t.nav.cast)}">
  <div class="wrap">
    ${head(6,N,t.cast.label,t.cast.title,t.cast.intro)}
    <div class="cast">
      ${t.cast.items.map((c,i)=>`
      <article class="dos" style="--d:${i*55}ms">
        <div class="dos__i">
          <img src="${local(d,c.key+'.svg')}" width="900" height="1200" loading="lazy" decoding="async" alt="${e(c.name)}">
          <span class="dos__tag">${e(t.cast.pending)}</span>
        </div>
        <div class="dos__bd">
          <span class="dos__r">${e(c.role)}</span>
          <h3 class="dos__n">${e(c.name)}</h3>
          <p class="dos__x">${e(c.line)}</p>
          <div class="dos__m">
            <span class="lb"><span>INDICE MUT.</span><span>${c.meter}%</span></span>
            <span class="bar"><i style="--m:${c.meter}%"></i></span>
          </div>
        </div>
      </article>`).join('')}
    </div>
  </div>
</section>

<!-- ===== AUTORE ===== -->
<section class="sec auth" id="author" data-name="${e(t.nav.author)}">
  <div class="wrap auth__in">
    <div class="auth__p" data-r data-clip>
      <span class="brk"></span><span class="brk"></span>
      <img src="${local(d,'author.svg')}" width="1200" height="1200" loading="lazy" decoding="async" alt="${e(cfg.author)}">
    </div>
    <div>
      <div class="sh__idx" data-r><span class="n">[ 07 / ${pad(N)} ]</span><span class="r"></span></div>
      <p class="lab" data-r>${e(t.author.label)}</p>
      <h2 class="d d2" data-r style="--d:60ms" data-dec>${e(t.author.title)}</h2>
      <div class="lede" data-r style="--d:130ms">${t.author.bio.map((b)=>`<p>${e(b)}</p>`).join('')}</div>
      <p class="auth__sig" data-r style="--d:190ms">${e(cfg.author)}</p>
      <p class="m" data-r style="--d:210ms">${e(t.author.role)}</p>
      <div class="btns" data-r style="--d:260ms">
        <a class="btn btn--g" href="#press">${e(t.author.cta)}${ICONS.arrow}</a>
        <a class="btn btn--g" href="mailto:${cfg.email}">${e(t.author.ctaAlt)}${ICONS.arrow}</a>
      </div>
    </div>
  </div>
</section>

<!-- ===== PRESS ===== -->
<section class="sec" id="press" data-name="${e(t.press.label)}">
  <div class="wrap">
    ${head(8,N,t.press.label,t.press.title,t.press.intro)}
    <div class="press" data-r>
      ${t.press.items.map((p)=>`
      <div class="press__r">
        <div><h4>${e(p.name)}</h4><p>${e(p.desc)}</p></div>
        <a class="btn btn--g btn--s" href="mailto:${cfg.email}?subject=${encodeURIComponent('Press kit — '+p.name)}">${e(t.press.request)}</a>
      </div>`).join('')}
    </div>
  </div>
</section>

<!-- ===== NEWSLETTER ===== -->
<section class="sec join" id="join" data-name="${e(t.nav.join)}">
  <div class="wrap join__in">
    <div class="sh__idx" data-r style="justify-content:center"><span class="n">[ 09 / ${pad(N)} ]</span></div>
    <p class="lab" data-r>${e(t.join.label)}</p>
    <h2 class="d d2" data-r style="--d:60ms" data-dec>${e(t.join.title)}</h2>
    <p class="lede" data-r style="--d:130ms">${e(t.join.intro)}</p>
    <form class="form" data-r style="--d:190ms"${cfg.newsletterAction?` action="${cfg.newsletterAction}" method="post" target="_blank"`:''}
          data-mailto="${cfg.email}" data-subject="${e(t.join.subject)}" data-ok="${e(t.join.ok)}">
      <label class="sr" for="nl-${t.lang}">${e(t.join.placeholder)}</label>
      <input id="nl-${t.lang}" type="email" name="EMAIL" required placeholder="${e(t.join.placeholder)}" autocomplete="email">
      <button class="btn" type="submit">${e(t.join.cta)}${ICONS.arrow}</button>
    </form>
    <p class="form__msg" role="status"></p>
    <p class="form__note">${e(t.join.note)}</p>
  </div>
</section>

</main>

<footer class="foot">
  <div class="wrap">
    <p class="foot__mk" aria-hidden="true">Wildblood</p>
    <div class="foot__g">
      <div><h5>${e(t.foot.colNav)}</h5><ul>${NAV.slice(0,5).map(([h,l])=>`<li><a href="${h}">${e(l)}</a></li>`).join('')}</ul></div>
      <div><h5>${e(t.foot.colBooks)}</h5><ul>${t.saga.items.map((v)=>`<li><a href="#saga">${e(v.n)} · ${e(v.title)}</a></li>`).join('')}</ul></div>
      <div><h5>${e(t.foot.colInfo)}</h5><ul>
        <li><a href="#author">${e(t.nav.author)}</a></li>
        <li><a href="#press">${e(t.press.label)}</a></li>
        <li><a href="mailto:${cfg.email}">${e(t.foot.contact)}</a></li>
        <li><a href="${cfg.domain}/blog" target="_blank" rel="noopener">${e(t.foot.blog)}</a></li>
      </ul></div>
      <div>
        <h5>${e(t.foot.tagline)}</h5>
        <div class="soc">${cfg.socials.map((s)=>`<a href="${s.url}" target="_blank" rel="noopener" aria-label="${e(s.name)}">${ICONS[s.icon]}</a>`).join('')}</div>
        <p class="m" style="margin-top:16px">${e(t.foot.langNote)}</p>
      </div>
    </div>
    <div class="foot__b">
      <p class="m">© <span data-year></span> ${e(cfg.author)}. ${e(t.foot.rights)}</p>
      <p class="m">${e(t.hud.left)}</p>
    </div>
    <p class="m" style="margin-top:16px;max-width:82ch;line-height:1.8;text-transform:none;letter-spacing:.03em">${e(t.foot.legal)}</p>
  </div>
</footer>

<div class="buy">
  <div class="buy__in">
    <div class="buy__l">
      <img src="${wix('coverSH',60,87)}" data-fallback="${raw('coverSH')}" width="30" height="43" alt="" loading="lazy">
      <div class="buy__t"><strong>${e(t.buybar.title)}</strong><span>${e(t.buybar.sub)}</span></div>
    </div>
    <a class="btn btn--s" href="${buyUrl}" target="_blank" rel="noopener">${e(t.buybar.cta)}${ICONS.ext}</a>
  </div>
</div>

<script src="${P(d,'assets/js/site.js')}" defer></script>
</body>
</html>`;
}

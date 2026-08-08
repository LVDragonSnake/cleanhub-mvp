import { img, wix, raw } from '../content/media.mjs';
import { ICONS } from './icons.mjs';

const e = (s) => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const P = (d, s) => (d ? d + s : s);
const local = (d, f) => `${d}assets/img/${f}`;

export default function render(t, cfg) {
  const d = t.dir;
  const buyUrl = t.lang === 'it' ? cfg.buy.it : cfg.buy.en;
  const NAV = [['#libri', t.nav.books], ['#saga', t.nav.saga], ['#argos', t.nav.archive],
               ['#autore', t.nav.author], ['#join', t.nav.join]];
  const B = t.film.beats;

  const jsonld = JSON.stringify({
    '@context':'https://schema.org','@type':'Book',name:'Wildblood: Savage Heart',
    bookEdition:'Volume 1',inLanguage:t.lang,description:t.meta.desc,image:wix('coverSH',800),
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
<meta name="theme-color" content="#070505">
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
<meta name="twitter:card" content="summary_large_image">
<link rel="preconnect" href="https://static.wixstatic.com" crossorigin>
<link rel="stylesheet" href="${P(d,'assets/css/site.css')}">
<script type="application/ld+json">${jsonld}</script>
<script>document.documentElement.className='js'</script>
</head>
<body>
<a class="skip" href="#libri">${e(t.skip)}</a>
<div class="grain" aria-hidden="true"></div>

<header class="nav">
  <div class="wrap nav__in">
    <a class="brand" href="#top" aria-label="Wildblood Saga">
      <img src="${wix('argosLogo',52)}" data-fallback="${raw('argosLogo')}" width="26" height="26" alt="">
      <span>Wildblood</span>
    </a>
    <nav class="links" aria-label="${e(t.nav.menu)}">
      ${NAV.map(([h,l])=>`<a href="${h}">${e(l)}</a>`).join('\n      ')}
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

<main>
<!-- ============ IL FILM ============ -->
<section class="film" id="top" style="height:calc(${B.length} * 82svh)">
  <div class="film__stage">
    ${B.map((b,i)=>`<div class="frame"${i===0?' style="opacity:1"':''}>
      ${img(b.key,{w:1920,h:1080,alt:b.title,lazy:false,sizes:'100vw'})}
      <span class="frame__grade"></span><span class="frame__vig"></span>
    </div>`).join('\n    ')}
    <span class="flash" aria-hidden="true"></span>

    <div class="beats">
      ${B.map((b,i)=>`<article class="beat ${b.hero?'beat--hero':''}"${i===0?' style="opacity:1"':''}>
        <div class="wrap beat__in">
          <p class="kick">${e(b.kicker)}</p>
          <h${b.hero?'1':'2'} class="beat__t">${e(b.title)}</h${b.hero?'1':'2'}>
          <p class="beat__x">${e(b.text)}</p>
        </div>
      </article>`).join('\n      ')}
    </div>

    <a class="film__skip" href="#libri">${e(t.film.skip)}</a>
    <div class="scrollcue" aria-hidden="true"><span class="bar"></span><span>${e(t.hero.scroll)}</span></div>
    <div class="film__hud" aria-hidden="true">
      <span class="film__n" data-film-n>01 / ${String(B.length).padStart(2,'0')}</span>
      <span class="film__ticks">${B.map(()=>'<i></i>').join('')}</span>
    </div>
  </div>
</section>

<!-- ============ IL LIBRO ============ -->
<section class="full" id="libri">
  <div class="full__bg" data-para="0.08" aria-hidden="true">${img('beast',{w:1800,alt:''})}</div>
  <div class="wrap full__in">
    <div class="book">
      <div class="book__art" data-tilt data-r>
        <span class="gl" aria-hidden="true"></span>
        <figure>${img('coverSH',{w:620,alt:'Wildblood — Savage Heart'})}</figure>
      </div>
      <div>
        <p class="kick" data-r>${e(t.spot.label)} · ${e(t.spot.sub)}</p>
        <h2 class="book__t" data-r style="--d:70ms">${e(t.spot.title)}</h2>
        <p class="lede" data-r style="--d:130ms">${e(t.spot.pitch)}</p>
        <p class="mono" data-r style="--d:180ms">${e(t.spot.price)}</p>
        <div class="btns" data-r style="--d:230ms">
          <a class="btn" href="${buyUrl}" target="_blank" rel="noopener">${e(t.spot.buy)}${ICONS.ext}</a>
          <a class="btn btn--g" href="${cfg.buy.kindle}" target="_blank" rel="noopener">${e(t.spot.preview)}${ICONS.ext}</a>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ============ I VOLUMI ============ -->
<section class="full full--r" id="saga">
  <div class="full__bg" data-para="0.06" aria-hidden="true">${img('archiveBg',{w:1800,alt:''})}</div>
  <div class="wrap full__in">
    <p class="kick" data-r>${e(t.saga.label)}</p>
    <h2 class="book__t" data-r style="--d:70ms">${e(t.saga.title)}</h2>
    <p class="lede" data-r style="--d:130ms">${e(t.saga.intro)}</p>
    <div class="vols" data-r style="--d:190ms">
      ${t.saga.items.map((v,i)=>{
        const live = v.status==='out';
        const lbl = {out:t.saga.statusOut,soon:t.saga.statusSoon,writing:t.saga.statusWriting,dev:t.saga.statusDev}[v.status];
        const tag = live ? `<a class="vol" href="${buyUrl}" target="_blank" rel="noopener">` : `<div class="vol ${v.status==='soon'?'':'vol--tba'}">`;
        return `${tag}
        ${img(v.key,{w:420,h:630,alt:v.title})}
        <span class="vol__n">${v.n}</span>
        <div class="vol__b"><h3 class="vol__t">${e(v.title)}</h3><span class="vol__s ${live?'live':''}">${e(lbl)}</span></div>
      ${live?'</a>':'</div>'}`;}).join('\n      ')}
    </div>
  </div>
</section>

<!-- ============ PORTA ARGOS ============ -->
<section class="gate" id="argos">
  <div class="gate__bg" aria-hidden="true">${img('arcClassified',{w:1600,alt:''})}</div>
  <span class="gate__scan" aria-hidden="true"></span>
  <div class="wrap gate__in">
    <p class="kick" data-r>${e(t.gate.label)}</p>
    <h2 class="gate__t" data-r style="--d:70ms">${e(t.gate.title)}</h2>
    <p class="lede" data-r style="--d:130ms">${e(t.gate.intro)}</p>
    <div class="btns" data-r style="--d:200ms">
      <a class="btn" href="${P(d,'argos/')}">${e(t.gate.cta)}${ICONS.arrow}</a>
      <a class="btn btn--g" href="#join">${e(t.join.label)}${ICONS.arrow}</a>
    </div>
  </div>
</section>

<!-- ============ AUTORE ============ -->
<section class="full" id="autore">
  <div class="full__bg" data-para="0.07" aria-hidden="true">${img('warriors',{w:1800,alt:''})}</div>
  <div class="wrap full__in auth__in">
    <div class="auth__p" data-r>
      <img src="${local(d,'author.svg')}" width="1200" height="1500" loading="lazy" decoding="async" alt="${e(cfg.author)}">
    </div>
    <div>
      <p class="kick" data-r>${e(t.author.label)}</p>
      <h2 class="book__t" data-r style="--d:70ms">${e(t.author.title)}</h2>
      <div class="lede" data-r style="--d:130ms">${t.author.bio.map((b)=>`<p>${e(b)}</p>`).join('')}</div>
      <p class="auth__sig" data-r style="--d:190ms">${e(cfg.author)}</p>
      <p class="mono" data-r style="--d:210ms">${e(t.author.role)}</p>
      <div class="btns" data-r style="--d:260ms">
        <a class="btn btn--g" href="mailto:${cfg.email}">${e(t.author.ctaAlt)}${ICONS.arrow}</a>
      </div>
    </div>
  </div>
</section>

<!-- ============ NEWSLETTER ============ -->
<section class="join" id="join">
  <div class="wrap join__in">
    <p class="kick" data-r>${e(t.join.label)}</p>
    <h2 class="join__t" data-r style="--d:70ms">${e(t.join.title)}</h2>
    <p class="lede" data-r style="--d:130ms">${e(t.join.intro)}</p>
    <form class="form" data-r style="--d:190ms"${cfg.newsletterAction?` action="${cfg.newsletterAction}" method="post" target="_blank"`:''}
          data-mailto="${cfg.email}" data-subject="${e(t.join.subject)}" data-ok="${e(t.join.ok)}">
      <label class="sr" for="nl">${e(t.join.placeholder)}</label>
      <input id="nl" type="email" name="EMAIL" required placeholder="${e(t.join.placeholder)}" autocomplete="email">
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
      <div><h5>${e(t.foot.colNav)}</h5><ul>${NAV.map(([h,l])=>`<li><a href="${h}">${e(l)}</a></li>`).join('')}</ul></div>
      <div><h5>${e(t.foot.colBooks)}</h5><ul>${t.saga.items.map((v)=>`<li><a href="#saga">${e(v.n)} · ${e(v.title)}</a></li>`).join('')}</ul></div>
      <div><h5>${e(t.foot.colInfo)}</h5><ul>
        <li><a href="${P(d,'argos/')}">${e(t.gate.title)}</a></li>
        <li><a href="mailto:${cfg.email}">${e(t.foot.contact)}</a></li>
        <li><a href="${cfg.domain}/blog" target="_blank" rel="noopener">${e(t.foot.blog)}</a></li>
      </ul></div>
      <div><h5>${e(t.foot.tagline)}</h5>
        <div class="soc">${cfg.socials.map((s)=>`<a href="${s.url}" target="_blank" rel="noopener" aria-label="${e(s.name)}">${ICONS[s.icon]}</a>`).join('')}</div>
        <p class="mono" style="margin-top:16px">${e(t.foot.langNote)}</p>
      </div>
    </div>
    <div class="foot__b">
      <p class="mono">© <span data-year></span> ${e(cfg.author)}. ${e(t.foot.rights)}</p>
      <p class="mono">Wildblood Saga</p>
    </div>
    <p class="mono" style="margin-top:16px;max-width:82ch;line-height:1.8;text-transform:none;letter-spacing:.03em">${e(t.foot.legal)}</p>
  </div>
</footer>
<script src="${P(d,'assets/js/site.js')}" defer></script>
</body>
</html>`;
}

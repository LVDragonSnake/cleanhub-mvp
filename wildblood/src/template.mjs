import { img, wix, raw } from '../content/media.mjs';
import { ICONS } from './icons.mjs';

const e = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const P = (d, s) => (d ? d + s : s);           // path prefix per la sottocartella /en/
const local = (d, f) => `${d}assets/img/${f}`;

const slashes = () => `<svg class="slashes" viewBox="0 0 230 56" aria-hidden="true">
  <path d="M14 4C26 16 30 30 24 52"/><path d="M52 2C64 14 68 28 62 50"/><path d="M90 6C102 18 106 32 100 54"/></svg>`;

const statusPill = (t, st) => {
  const map = { out: [t.saga.statusOut, 'pill--live'], soon: [t.saga.statusSoon, ''],
    writing: [t.saga.statusWriting, ''], dev: [t.saga.statusDev, ''] };
  const [txt, cls] = map[st] || map.dev;
  return `<span class="pill ${cls}">${e(txt)}</span>`;
};

export default function render(t, cfg) {
  const d = t.dir;
  const buyUrl = t.lang === 'it' ? cfg.buy.it : cfg.buy.en;
  const nav = [
    ['#saga', t.nav.saga], ['#books', t.nav.books], ['#archive', t.nav.archive],
    ['#world', t.nav.world], ['#cast', t.nav.cast], ['#places', t.nav.places],
    ['#author', t.nav.author], ['#join', t.nav.join],
  ];

  const jsonld = JSON.stringify({
    '@context': 'https://schema.org', '@type': 'Book',
    name: 'Wildblood: Savage Heart', bookEdition: 'Volume 1',
    inLanguage: t.lang, description: t.meta.desc,
    image: wix('coverSH', 800),
    author: { '@type': 'Person', name: cfg.author, url: cfg.domain },
    isPartOf: { '@type': 'BookSeries', name: 'Wildblood Saga', numberOfBooks: 5 },
    genre: ['Dark Fantasy', 'Adventure', 'Psychological Thriller'],
    offers: { '@type': 'Offer', url: buyUrl, availability: 'https://schema.org/InStock' },
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
<link rel="canonical" href="${cfg.domain}/${t.lang === 'it' ? '' : 'en/'}">
<link rel="alternate" hreflang="it" href="${cfg.domain}/">
<link rel="alternate" hreflang="en" href="${cfg.domain}/en/">
<link rel="alternate" hreflang="x-default" href="${cfg.domain}/">
<link rel="icon" href="${P(d, 'favicon.svg')}" type="image/svg+xml">
<meta property="og:type" content="book">
<meta property="og:site_name" content="Wildblood Saga">
<meta property="og:locale" content="${t.locale}">
<meta property="og:title" content="${e(t.meta.title)}">
<meta property="og:description" content="${e(t.meta.desc)}">
<meta property="og:image" content="${wix('heroWide', 1200, 630)}">
<meta property="og:image:alt" content="${e(t.meta.ogAlt)}">
<meta name="twitter:card" content="summary_large_image">
<link rel="preconnect" href="https://static.wixstatic.com" crossorigin>
<link rel="preload" as="style" href="${P(d, 'assets/css/site.css')}">
<link rel="stylesheet" href="${P(d, 'assets/css/site.css')}">
<script type="application/ld+json">${jsonld}</script>
<script>document.documentElement.className=document.documentElement.className.replace('no-js','js')</script>
</head>
<body class="is-locked">

<a class="skip" href="#main">${e(t.skip)}</a>

<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
  <linearGradient id="slashGrad" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#E5462A" stop-opacity="0"/>
    <stop offset="45%" stop-color="#E5462A"/>
    <stop offset="100%" stop-color="#C0281A" stop-opacity="0"/>
  </linearGradient></defs></svg>

<div class="preload" role="status" aria-label="Loading">
  <div class="preload__inner">
    <div class="preload__word">Wildblood</div>
    <svg class="preload__ecg" viewBox="0 0 300 44" preserveAspectRatio="none" aria-hidden="true">
      <path d="M0 22h96l8-16 9 32 8-24 7 8h34l8-14 9 28 8-22 7 8h99"/>
    </svg>
    <div class="preload__bar"><i></i></div>
  </div>
</div>

<div class="grain" aria-hidden="true"></div>
<div class="vignette" aria-hidden="true"></div>
<div class="progress" aria-hidden="true"><div class="progress__fill"><span class="progress__drip"></span></div></div>

<header class="nav">
  <div class="wrap nav__in">
    <a class="nav__brand" href="#top" aria-label="Wildblood Saga">
      <img src="${wix('argosLogo', 60)}" data-fallback="${raw('argosLogo')}" width="30" height="30" alt="">
      <span>Wildblood</span>
    </a>
    <nav class="nav__links" aria-label="${e(t.nav.menu)}">
      ${nav.map(([h, l]) => `<a href="${h}">${e(l)}</a>`).join('\n      ')}
    </nav>
    <div class="nav__side">
      <div class="lang">
        <a href="${t.lang === 'it' ? t.selfHref : t.altHref}" class="${t.lang === 'it' ? 'is-on' : ''}" hreflang="it">IT</a>
        <a href="${t.lang === 'en' ? t.selfHref : t.altHref}" class="${t.lang === 'en' ? 'is-on' : ''}" hreflang="en">EN</a>
      </div>
      <button class="burger" type="button" aria-label="${e(t.nav.menu)}" aria-expanded="false"><i></i><i></i></button>
    </div>
  </div>
</header>

<main id="main">

<!-- ============ HERO ============ -->
<section class="hero" id="top">
  <div class="hero__bg" data-para="0.10">
    ${img('heroWide', { w: 1920, alt: t.meta.ogAlt, lazy: false, sizes: '100vw' })}
  </div>
  <div class="hero__veil" aria-hidden="true"></div>
  <div class="hero__embers" aria-hidden="true"></div>
  <svg class="pulse" viewBox="0 0 1200 60" preserveAspectRatio="none" aria-hidden="true"><path d=""/></svg>

  <div class="wrap hero__in">
    <div class="hero__eyebrow" data-rise>
      <span class="rule"></span><span class="label">${e(t.hero.eyebrow)}</span>
    </div>
    <div class="wordmark" data-echo="${e(t.hero.title)}" data-rise style="--d:80ms">
      <h1>${e(t.hero.title)}</h1>
    </div>
    <p class="hero__tag" data-rise style="--d:160ms">${e(t.hero.tagline)}</p>
    <p class="hero__pitch lede" data-rise style="--d:220ms">${t.hero.pitch}</p>
    <div class="btn-row" data-rise style="--d:300ms">
      <a class="btn" href="${buyUrl}" target="_blank" rel="noopener">${e(t.hero.ctaPrimary)}${ICONS.ext}</a>
      <a class="btn btn--ghost" href="#archive">${e(t.hero.ctaSecondary)}${ICONS.arrow}</a>
    </div>
    <div class="hero__foot" data-rise style="--d:380ms">
      <div class="hero__scroll"><span class="bar"></span><span class="mono">${e(t.hero.scroll)}</span></div>
      <span class="mono">${e(t.hero.stat)}</span>
    </div>
  </div>
</section>

<!-- ============ QUOTE ============ -->
<section class="quote">
  <div class="wrap">
    <div data-rise>${slashes()}</div>
    <blockquote data-rise style="--d:120ms">
      ${e(t.quote.line1)} ${e(t.quote.line2)}
      <span class="accent">${e(t.quote.line3)} ${e(t.quote.line4)}</span>
    </blockquote>
    <cite data-rise style="--d:220ms">${e(t.quote.cite)}</cite>
  </div>
</section>

<!-- ============ SPOTLIGHT ============ -->
<section class="section spot" id="books">
  <div class="spot__bg" aria-hidden="true">${img('beast', { w: 1600, alt: '' })}</div>
  <div class="wrap spot__in">
    <div class="spot__art" data-tilt data-rise>
      <span class="glow" aria-hidden="true"></span>
      <figure>${img('coverSH', { w: 560, alt: 'Wildblood — Savage Heart' })}</figure>
    </div>
    <div>
      <p class="label" data-rise>${e(t.spot.label)}</p>
      <h2 class="display h2" data-rise style="--d:80ms">${e(t.spot.title)}</h2>
      <p class="spot__price" data-rise style="--d:120ms"><span class="mono">${e(t.spot.sub)}</span></p>
      <p class="lede" data-rise style="--d:160ms">${e(t.spot.pitch)}</p>
      <ul class="facts" data-rise style="--d:220ms">
        ${t.spot.facts.map((f) => `<li>${e(f)}</li>`).join('\n        ')}
      </ul>
      <p class="mono" data-rise style="--d:260ms">${e(t.spot.price)}</p>
      <div class="btn-row" data-rise style="--d:300ms">
        <a class="btn" href="${buyUrl}" target="_blank" rel="noopener">${e(t.spot.buy)}${ICONS.ext}</a>
        <a class="btn btn--ghost" href="${cfg.buy.kindle}" target="_blank" rel="noopener">${e(t.spot.preview)}${ICONS.ext}</a>
      </div>
    </div>
  </div>
</section>

<!-- ============ SAGA ============ -->
<section class="section saga" id="saga">
  <div class="wrap">
    <header class="section__head">
      <p class="label" data-rise>${e(t.saga.label)}</p>
      <h2 class="display h2" data-rise style="--d:60ms" data-split>${e(t.saga.title)}</h2>
      <p class="lede" data-rise style="--d:140ms">${e(t.saga.intro)}</p>
    </header>
    <div class="saga__grid">
      ${t.saga.items.map((v, i) => `
      <article class="vol ${(i < 2 || i === t.saga.items.length - 1) ? "vol--wide" : ""}" data-rise style="--d:${i * 70}ms">
        <div class="vol__cover ${v.status === 'out' || v.status === 'soon' ? '' : 'vol__cover--tba'}">
          <figure>${img(v.key, { w: 340, h: 492, alt: `${v.title} — ${t.saga.label}` })}</figure>
        </div>
        <div>
          <p class="vol__num">${v.n}</p>
          <h3 class="vol__title">${e(v.title)}</h3>
          <div class="vol__meta">
            ${statusPill(t, v.status)}
            ${v.tags.map((x) => `<span class="pill">${e(x)}</span>`).join('')}
          </div>
          <div class="vol__text">${v.text}</div>
          ${v.status === 'out' ? `<a class="btn btn--sm" href="${buyUrl}" target="_blank" rel="noopener">${e(t.saga.buy)}${ICONS.ext}</a>` : ''}
        </div>
      </article>`).join('')}
    </div>
  </div>
</section>

<!-- ============ ARGOS ARCHIVE ============ -->
<section class="section archive" id="archive" data-declassify-scope>
  <div class="archive__bg" aria-hidden="true">${img('archiveBg', { w: 1800, alt: '' })}</div>
  <div class="wrap archive__in">
    <header class="section__head">
      <p class="label" data-rise>${e(t.archive.label)}</p>
      <h2 class="display h2" data-rise style="--d:60ms">${e(t.archive.title)}</h2>
      <p class="lede" data-rise style="--d:140ms">${e(t.archive.intro)}</p>
      <p data-rise style="--d:200ms">
        <button class="btn btn--ghost btn--sm" type="button" data-declassify aria-pressed="false"
          data-label-on="${e(t.archive.declassifyOn)}" data-label-off="${e(t.archive.declassifyOff)}">
          <span data-declassify-label>${e(t.archive.declassifyOff)}</span>
        </button>
      </p>
    </header>
    <div class="files">
      ${t.archive.items.map((f, i) => `
      <article class="file ${f.locked ? 'file--locked' : ''}" data-rise style="--d:${i * 60}ms">
        <div class="file__img">
          ${img(f.key, { w: 520, h: 520, alt: f.name })}
          <span class="file__scan" aria-hidden="true"></span>
          ${f.locked ? `<span class="file__lock">${e(t.archive.locked)}</span>` : ''}
        </div>
        <div class="file__body">
          <span class="file__code">${e(f.code)}-<span class="redact">${String(i + 1).padStart(2, '0')}</span></span>
          <h3 class="file__name">${e(f.name)}</h3>
          <p class="file__desc">${e(f.desc)}</p>
        </div>
      </article>`).join('')}
    </div>
  </div>
</section>

<!-- ============ WORLD ============ -->
<section class="section" id="world">
  <div class="wrap">
    <header class="section__head">
      <p class="label" data-rise>${e(t.world.label)}</p>
      <h2 class="display h2" data-rise style="--d:60ms">${e(t.world.title)}</h2>
      <p class="lede" data-rise style="--d:140ms">${e(t.world.intro)}</p>
    </header>
    <div class="factions">
      ${t.world.items.map((f, i) => `
      <article class="faction" data-rise style="--d:${i * 70}ms">
        <p class="faction__id">${e(f.id)}</p>
        <h3 class="faction__name">${e(f.name)}</h3>
        <p class="faction__desc">${e(f.desc)}</p>
        <div class="faction__tags">${f.tags.map((x) => `<span class="pill">${e(x)}</span>`).join('')}</div>
      </article>`).join('')}
    </div>
  </div>
</section>

<!-- ============ CAST ============ -->
<section class="section section--tight" id="cast">
  <div class="wrap">
    <header class="section__head">
      <p class="label" data-rise>${e(t.cast.label)}</p>
      <h2 class="display h2" data-rise style="--d:60ms">${e(t.cast.title)}</h2>
      <p class="lede" data-rise style="--d:140ms">${e(t.cast.intro)}</p>
    </header>
    <div class="cast">
      ${t.cast.items.map((c, i) => `
      <article class="char" data-rise style="--d:${i * 60}ms">
        <div class="char__img">
          <img src="${local(d, c.key + '.svg')}" width="900" height="1350" loading="lazy" decoding="async" alt="${e(c.name)}">
          <span class="file__lock">${e(t.cast.pending)}</span>
        </div>
        <div class="char__body">
          <span class="char__role">${e(c.role)}</span>
          <h3 class="char__name">${e(c.name)}</h3>
          <p class="char__line">${e(c.line)}</p>
          <div class="char__meter" aria-hidden="true"><i style="--m:${c.meter}%"></i></div>
        </div>
      </article>`).join('')}
    </div>
  </div>
</section>

<!-- ============ PLACES ============ -->
<section id="places">
  <div class="wrap section--tight section" style="padding-bottom:0">
    <header class="section__head" style="margin-bottom:0">
      <p class="label" data-rise>${e(t.places.label)}</p>
      <h2 class="display h2" data-rise style="--d:60ms">${e(t.places.title)}</h2>
    </header>
  </div>
  ${t.places.items.map((p) => `
  <article class="loc">
    <div class="loc__bg" data-para="0.09">${img(p.key, { w: 1600, alt: p.name })}</div>
    <div class="loc__veil" aria-hidden="true"></div>
    <div class="wrap loc__in">
      <p class="loc__coord" data-rise><span class="dot"></span>${e(p.coord)}</p>
      <h3 class="loc__name" data-rise style="--d:80ms">${e(p.name)}</h3>
      <p class="loc__desc" data-rise style="--d:150ms">${e(p.desc)}</p>
      <p class="loc__vol" data-rise style="--d:210ms">${e(p.vol)}</p>
    </div>
  </article>`).join('')}
</section>

<!-- ============ AUTHOR ============ -->
<section class="section author" id="author">
  <div class="wrap author__in">
    <div class="author__portrait" data-rise data-wipe>
      <img src="${local(d, 'author.svg')}" width="1200" height="1200" loading="lazy" decoding="async" alt="${e(cfg.author)}">
    </div>
    <div>
      <p class="label" data-rise>${e(t.author.label)}</p>
      <h2 class="display h2" data-rise style="--d:60ms">${e(t.author.title)}</h2>
      <div class="lede" data-rise style="--d:130ms">
        ${t.author.bio.map((b) => `<p>${e(b)}</p>`).join('\n        ')}
      </div>
      <p class="author__sig" data-rise style="--d:200ms">${e(cfg.author)}</p>
      <p class="author__role" data-rise style="--d:230ms">${e(t.author.role)}</p>
      <div class="btn-row" data-rise style="--d:280ms" role="group">
        <a class="btn btn--ghost" href="#press">${e(t.author.cta)}${ICONS.arrow}</a>
        <a class="btn btn--ghost" href="mailto:${cfg.email}">${e(t.author.ctaAlt)}${ICONS.arrow}</a>
      </div>
    </div>
  </div>
</section>

<!-- ============ PRESS ============ -->
<section class="section section--tight" id="press">
  <div class="wrap">
    <header class="section__head">
      <p class="label" data-rise>${e(t.press.label)}</p>
      <h2 class="display h3" data-rise style="--d:60ms">${e(t.press.title)}</h2>
      <p class="lede" data-rise style="--d:130ms">${e(t.press.intro)}</p>
    </header>
    <div class="press" data-rise>
      ${t.press.items.map((p) => `
      <div class="press__row">
        <div><h4>${e(p.name)}</h4><p>${e(p.desc)}</p></div>
        <a class="btn btn--ghost btn--sm" href="mailto:${cfg.email}?subject=${encodeURIComponent('Press kit — ' + p.name)}">${e(t.press.request)}</a>
      </div>`).join('')}
    </div>
  </div>
</section>

<!-- ============ JOIN ============ -->
<section class="section join" id="join">
  <div class="wrap join__in">
    <p class="label" data-rise>${e(t.join.label)}</p>
    <h2 class="display h2" data-rise style="--d:60ms">${e(t.join.title)}</h2>
    <p class="lede" data-rise style="--d:130ms">${e(t.join.intro)}</p>
    <form class="form" data-rise style="--d:200ms"${cfg.newsletterAction ? ` action="${cfg.newsletterAction}" method="post" target="_blank"` : ''}
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

<!-- ============ FOOTER ============ -->
<footer class="foot">
  <div class="wrap">
    <p class="foot__mark" aria-hidden="true">Wildblood</p>
    <div class="foot__grid">
      <div class="foot__col">
        <h5>${e(t.foot.colNav)}</h5>
        <ul>${nav.slice(0, 5).map(([h, l]) => `<li><a href="${h}">${e(l)}</a></li>`).join('')}</ul>
      </div>
      <div class="foot__col">
        <h5>${e(t.foot.colBooks)}</h5>
        <ul>${t.saga.items.map((v) => `<li><a href="#saga">${e(v.n)} · ${e(v.title)}</a></li>`).join('')}</ul>
      </div>
      <div class="foot__col">
        <h5>${e(t.foot.colInfo)}</h5>
        <ul>
          <li><a href="#author">${e(t.nav.author)}</a></li>
          <li><a href="#press">${e(t.press.label)}</a></li>
          <li><a href="mailto:${cfg.email}">${e(t.foot.contact)}</a></li>
          <li><a href="${cfg.domain}/blog" target="_blank" rel="noopener">${e(t.foot.blog)}</a></li>
        </ul>
      </div>
      <div class="foot__col">
        <h5>${e(t.foot.tagline)}</h5>
        <div class="socials">
          ${cfg.socials.map((s) => `<a href="${s.url}" target="_blank" rel="noopener" aria-label="${e(s.name)}">${ICONS[s.icon]}</a>`).join('')}
        </div>
        <p class="mono" style="margin-top:18px">${e(t.foot.langNote)}</p>
      </div>
    </div>
    <div class="foot__bot">
      <p class="mono">© <span data-year></span> ${e(cfg.author)}. ${e(t.foot.rights)}</p>
      <p class="mono">${e(t.meta.title.split('—')[0].trim())}</p>
    </div>
    <p class="mono" style="margin-top:18px;max-width:80ch;line-height:1.7;text-transform:none;letter-spacing:.02em">${e(t.foot.legal)}</p>
  </div>
</footer>

<div class="buybar">
  <div class="wrap buybar__in">
    <div class="buybar__l">
      <img src="${wix('coverSH', 68, 98)}" data-fallback="${raw('coverSH')}" width="34" height="49" alt="" loading="lazy">
      <div class="buybar__t"><strong>${e(t.buybar.title)}</strong><span>${e(t.buybar.sub)}</span></div>
    </div>
    <a class="btn btn--sm" href="${buyUrl}" target="_blank" rel="noopener">${e(t.buybar.cta)}${ICONS.ext}</a>
  </div>
</div>

<script src="${P(d, 'assets/js/site.js')}" defer></script>
</body>
</html>`;
}

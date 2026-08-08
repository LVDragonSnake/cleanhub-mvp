/* ------------------------------------------------------------------
   Immagini reali del sito attuale (Wix Media Manager di wildbloodsaga.com).
   Le URL sono pubbliche: il browser le carica direttamente dal CDN di Wix.
   Per self-hostarle: scaricale e sostituisci `wix(...)` con './assets/img/...'.
   ------------------------------------------------------------------ */

const BASE = 'https://static.wixstatic.com/media/82d24b_';

/** id, larghezza, altezza, nome-file leggibile (usato solo nell'URL trasformata) */
export const MEDIA = {
  heroWide:     ['88c5a1d9b0494a589d0386aa21f5d107~mv2.jpg', 3000, 2121, 'hero-saga'],
  heroAlt:      ['5d5927da6fb2477ea5b9e240b01e13b3~mv2.jpg', 1536, 1024, 'hero-saga-alt'],

  coverSH:      ['32a0bf1f1395482ea660d4367725f9e7~mv2.png', 1042, 1509, 'savage-heart'],
  coverROB:     ['b14107500d3b4dd19955a325ad6ce729~mv2.png', 1048, 1501, 'rise-of-the-beast'],
  coverAbyss:   ['e74d0a24ef0743e5957f2ac0af1ec1ef~mv2.jpg',  700,  985, 'abyss'],
  coverMeta:    ['efdebee61bb242c08afc2b2eb9d71cda~mv2.jpg',  700,  985, 'metamorphosis'],
  coverLegacy:  ['11b42d5a30b848189de98ef1f622d663~mv2.jpg',  700,  985, 'wild-legacy'],
  bookMockup:   ['0e07953304b8427f930ec7b997927b1c~mv2.png',  612,  970, 'savage-heart-book'],

  argosLogo:    ['e31c129abbf344ed82523822a23878ad~mv2.png', 2357, 2357, 'argos'],
  argosLogoInv: ['37e2474d096e4251ac398ace0651ac36~mv2.png', 2357, 2357, 'argos-inv'],
  stamp:        ['e93893d8b57746c897898528fb9f6e06~mv2.png', 1052,  402, 'classified-stamp'],
  profile:      ['a72317aab7244783a17ca405d2a82b70~mv2.png',  975,  948, 'wildblood-mark'],

  archiveBg:    ['e5d4669b8bc84548afe23844bf15436d~mv2.jpg', 3000, 2745, 'argos-archive-bg'],
  arcDossier:   ['022eda4bb43a4b91afd948d2d54bd8be~mv2.png', 2000, 2000, 'argos-dossier'],
  arcAuthor:    ['22d756a8fe6145e699e9ce29d13a5297~mv2.png', 2000, 2000, 'author-archive'],
  arcClassified:['08f3b818f3c648fc97c2481cc2972a7e~mv2.png', 2026, 2000, 'classified-files'],
  arcField:     ['0ffa488bcaed44dfa8ce6082e3ae4c23~mv2.png', 2000, 2000, 'field-logs'],
  arcIncident:  ['13afe57c6d804c24b6153ecf0d26ca79~mv2.png', 2000, 2000, 'incident-reports'],
  arcVisual:    ['3c69ee4c420a4f688b75efcef0c55a11~mv2.png', 2000, 2000, 'visual-records'],

  kenya:        ['c181f3b3032e483cab5df0223700fbd3~mv2.png', 1024, 1365, 'kenya'],
  kenya2:       ['1ae5b3958d214f58b615c295357096a3~mv2.png', 1024, 1365, 'kenya-2'],
  beast:        ['98a3c4aa1fa0476887f3b68f5031e473~mv2.png', 1536, 1024, 'the-beast'],
  jungle:       ['dbf388fc295342abb0824f34f2db27c2~mv2.png', 1536, 1024, 'jungle'],
  sea:          ['04af726605c847fc8a041d450ce95e09~mv2.png', 1536, 1024, 'sea'],
  predators:    ['aee5b86c10af4be8bf5efe4a7bd9460e~mv2.png', 1536, 1024, 'predators'],
  warriors:     ['a472624ad541455f9da0cf146b77f00a~mv2.png', 1536, 1024, 'warriors'],
  city:         ['9ea4f7c1aa87470db7d4be160e7a60a1~mv2.png', 1536, 1024, 'places'],
  ruins:        ['cb0bc7dd5b5142c69327ef353e9f6308~mv2.png', 1536, 1024, 'ruins'],
  fire:         ['360e7b137e7c441ba8858fc389c2a070~mv2.png', 1536, 1024, 'fire'],
  amulet:       ['f71ad3a41afa4278b78c84555ca9bfe6~mv2.png',  776,  775, 'amulet'],
  emblem:       ['ab648d5fb299498298b3c6fd49184cc4~mv2.png', 1536, 1024, 'emblem'],

  // ---- Documenti ARGOS reali (libreria Wix del sito attuale) ----
  docN01:    ['d27c9759b64c4ed0a64dd4d9a42a9119~mv2.png', 1024, 1536, 'arg-n01-nereus3'],
  docA17:    ['d4de7b39f19b48d28d96288e78eb4176~mv2.png', 1024, 1536, 'arg-a17-china'],
  docINT07:  ['2d416229fb964631986ce08244bf1eba~mv2.png', 1536, 1024, 'arg-int07-transcript'],
  docINT07D: ['b54e1302e9d0471d98148ec4277ddcdb~mv2.png', 1122, 1402, 'arg-int07-dossier'],

  docCLF12:  ['2c6c1078ff374012872e2fadbbddde56~mv2.png', 1536, 1024, 'arg-clf12-nightfall'],
  docMAIL02: ['59b9793c05d842f09ad72060e2a95908~mv2.png', 1024, 1536, 'arg-mail02-containment'],
  docMAIL06: ['b9b8aad67dc145658a6471c05aa5e472~mv2.png', 1024, 1536, 'arg-mail06-protocol'],
  docMAIL17: ['8bae203a5bfc4d14846cc07f1c4606c1~mv2.png', 1024, 1536, 'arg-mail17-failure'],

  docFL09:   ['a1e70072aeb54606bed88608cc6ebd5d~mv2.png', 3000, 2000, 'arg-fl09-cavern'],
  docFL09D:  ['afb3156e977342d9b1caabf583baddf5~mv2.png', 2401, 3000, 'arg-fl09-dossier'],
  docFL12:   ['49924743fdcd4f3e9d37cf5ae2597377~mv2.png', 3000, 2000, 'arg-fl12-subglacial'],
  docFL12D:  ['612b0b594ea344f8af24ef71bc40e7d3~mv2.png', 2401, 3000, 'arg-fl12-dossier'],
  docFL14:   ['7475f14d2d504b8c855e4900309db8a1~mv2.png', 3000, 2000, 'arg-fl14-forest'],
  docFL14D:  ['bdd2a8d85db84e2dadc457fba5a960d5~mv2.png', 2401, 3000, 'arg-fl14-dossier'],
  docFL18:   ['b8e1461834d747e0ac61886396b22d69~mv2.png', 3000, 2000, 'arg-fl18-karakorum'],
  docFL18D:  ['a25ad619e3f447aeb3086559b55b71a0~mv2.png', 3000, 2000, 'arg-fl18-dossier'],

  docIR03:   ['5f314fed93ce494b994c5ae4e4bcbc10~mv2.png', 1024, 1536, 'arg-ir03-maldives'],
  docIR07:   ['d667cdd7915a47f9912449387530036b~mv2.png', 2000, 3000, 'arg-ir07-socotra'],
  docIR12:   ['6b4823d53ad645feb669c3323e7ed65b~mv2.png', 1536, 1024, 'arg-ir12-karakorum'],

  docNET02:  ['9b429622a4544a36ab3142de308783f7~mv2.png', 1672,  941, 'arg-net02-grid'],
  docSAT01:  ['308c44f681154ff9b4d06009f5beb742~mv2.png', 1672,  941, 'arg-sat01-satellite'],
  docSYS03:  ['29ea772d68f64221ba70488693781fd0~mv2.png', 1536, 1024, 'arg-sys03-access'],

  dossierInterrogation: ['b54e1302e9d0471d98148ec4277ddcdb~mv2.png', 1122, 1402, 'interrogation'],
  dossierMaldives:      ['5f314fed93ce494b994c5ae4e4bcbc10~mv2.png', 1024, 1536, 'maldives'],
  dossierNereus:        ['d27c9759b64c4ed0a64dd4d9a42a9119~mv2.png', 1024, 1536, 'nereus-3'],
  dossierSocotra:       ['d667cdd7915a47f9912449387530036b~mv2.png', 2000, 3000, 'socotra'],
  gridMap:              ['9b429622a4544a36ab3142de308783f7~mv2.png', 1672,  941, 'anomaly-grid'],
  satellite:            ['308c44f681154ff9b4d06009f5beb742~mv2.png', 1672,  941, 'satellite'],
  sysAlert:             ['29ea772d68f64221ba70488693781fd0~mv2.png', 1536, 1024, 'unauthorized-access'],
};

/** URL originale (nessuna trasformazione) — usata come fallback runtime */
export function raw(key) {
  const m = MEDIA[key];
  if (!m) throw new Error('Media mancante: ' + key);
  return BASE + m[0];
}

/** URL trasformata dal CDN Wix: ritagliata, compressa, servita nella misura giusta */
export function wix(key, w, h, fit = 'fill') {
  const m = MEDIA[key];
  if (!m) throw new Error('Media mancante: ' + key);
  const [id, ow, oh, name] = m;
  const ext = id.slice(id.lastIndexOf('.') + 1);
  const W = Math.min(Math.round(w), ow);
  const H = Math.min(Math.round(h || (w * oh) / ow), oh);
  return `${BASE}${id}/v1/${fit}/w_${W},h_${H},al_c,q_82,usm_0.66_1.00_0.01,enc_auto/${name}.${ext}`;
}

export function dims(key) {
  const m = MEDIA[key];
  return { w: m[1], h: m[2] };
}

/** <img> completa di srcset 1x/2x e fallback all'originale */
export function img(key, { w, h, alt = '', cls = '', lazy = true, fit = 'fill', sizes = '' } = {}) {
  const d = dims(key);
  const H = h || Math.round((w * d.h) / d.w);
  const a = [
    `src="${wix(key, w, H, fit)}"`,
    `srcset="${wix(key, w, H, fit)} 1x, ${wix(key, w * 2, H * 2, fit)} 2x"`,
    sizes ? `sizes="${sizes}"` : '',
    `width="${w}" height="${H}"`,
    `alt="${alt.replace(/"/g, '&quot;')}"`,
    cls ? `class="${cls}"` : '',
    lazy ? 'loading="lazy" decoding="async"' : 'fetchpriority="high" decoding="async"',
    `data-fallback="${raw(key)}"`,
  ].filter(Boolean).join(' ');
  return `<img ${a}>`;
}

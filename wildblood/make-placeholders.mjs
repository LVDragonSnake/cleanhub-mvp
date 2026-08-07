import fs from 'node:fs/promises';

const SLOTS = [
  ['hero',            2400, 1350, 'HERO — Leonardo di spalle nella savana al crepuscolo / il felino che emerge'],
  ['hero-mobile',     1200, 1600, 'HERO MOBILE — verticale'],
  ['book-01',         1200, 1800, 'COVER Vol. 01 — Savage Heart'],
  ['book-02',         1200, 1800, 'COVER Vol. 02 — Rise of the Beast'],
  ['book-03',         1200, 1800, 'COVER Vol. 03 — Abyss'],
  ['book-04',         1200, 1800, 'COVER Vol. 04 — Metamorphosis'],
  ['book-05',         1200, 1800, 'COVER Vol. 05 — Wild Legacy'],
  ['char-leonardo',    900, 1350, 'PERSONAGGIO — Leonardo'],
  ['char-maya',        900, 1350, 'PERSONAGGIO — Maya'],
  ['char-nohea',       900, 1350, 'PERSONAGGIO — Nohea'],
  ['char-ginevra',     900, 1350, 'PERSONAGGIO — Ginevra'],
  ['char-noah',        900, 1350, 'PERSONAGGIO — Noah'],
  ['loc-kenya',       2000, 1250, 'LUOGO — Savana del Kenya'],
  ['loc-italia',      2000, 1250, 'LUOGO — Lecco / Milano'],
  ['loc-cairo',       2000, 1250, 'LUOGO — Il Cairo e la piramide'],
  ['loc-pulauapi',    2000, 1250, 'LUOGO — Pulau Api, Indonesia'],
  ['loc-maldive',     2000, 1250, 'LUOGO — Maldive'],
  ['faction-argos',   1200,  800, 'FAZIONE — ARGOS'],
  ['faction-culto',   1200,  800, 'FAZIONE — Il Culto'],
  ['faction-antichi', 1200,  800, 'FAZIONE — Gli Antichi'],
  ['faction-ibridi',  1200,  800, 'FAZIONE — Gli Ibridi'],
  ['artifact-amkhra', 1200, 1200, 'ARTEFATTO — Amkh-Ra'],
  ['author',          1200, 1500, 'AUTORE — Alexander Lawrence'],
  ['og',              1200,  630, 'OPEN GRAPH — anteprima social'],
];

const esc = s => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

function svg(name, w, h, label) {
  const d = Math.max(w, h);
  const fs1 = Math.round(d * 0.026);
  const fs2 = Math.round(d * 0.018);
  const pad = Math.round(d * 0.035);
  const cx = w / 2, cy = h / 2;
  // three claw slashes, scaled to the box
  const s = d * 0.13;
  const claw = [0, 1, 2].map(i => {
    const off = (i - 1) * s * 0.42;
    return `<path d="M ${cx + off - s * 0.30} ${cy - s} C ${cx + off - s * 0.05} ${cy - s * 0.30}, ${cx + off + s * 0.05} ${cy + s * 0.30}, ${cx + off + s * 0.30} ${cy + s}"
      fill="none" stroke="url(#slash)" stroke-width="${d * 0.006}" stroke-linecap="round" opacity="${0.85 - i * 0.12}"/>`;
  }).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${esc(label)}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#120909"/><stop offset="0.55" stop-color="#0A0606"/><stop offset="1" stop-color="#060404"/>
    </linearGradient>
    <linearGradient id="slash" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#E03A22" stop-opacity="0"/><stop offset="0.45" stop-color="#E03A22" stop-opacity="0.9"/><stop offset="1" stop-color="#A81A12" stop-opacity="0"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="46%" r="58%">
      <stop offset="0" stop-color="#A81A12" stop-opacity="0.28"/><stop offset="1" stop-color="#A81A12" stop-opacity="0"/>
    </radialGradient>
    <pattern id="hatch" width="${d*0.02}" height="${d*0.02}" patternTransform="rotate(28)" patternUnits="userSpaceOnUse">
      <line x1="0" y1="0" x2="0" y2="${d*0.02}" stroke="#D9CFC2" stroke-opacity="0.045" stroke-width="1"/>
    </pattern>
    <filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3"/><feColorMatrix type="saturate" values="0"/></filter>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#bg)"/>
  <rect width="${w}" height="${h}" fill="url(#hatch)"/>
  <rect width="${w}" height="${h}" fill="url(#glow)"/>
  <rect width="${w}" height="${h}" filter="url(#n)" opacity="0.05"/>
  ${claw}
  <rect x="${pad}" y="${pad}" width="${w-pad*2}" height="${h-pad*2}" fill="none" stroke="#D9CFC2" stroke-opacity="0.14" stroke-width="1"/>
  <line x1="${pad}" y1="${pad}" x2="${pad+d*0.05}" y2="${pad}" stroke="#E03A22" stroke-width="${d*0.004}"/>
  <line x1="${pad}" y1="${pad}" x2="${pad}" y2="${pad+d*0.05}" stroke="#E03A22" stroke-width="${d*0.004}"/>
  <line x1="${w-pad}" y1="${h-pad}" x2="${w-pad-d*0.05}" y2="${h-pad}" stroke="#E03A22" stroke-width="${d*0.004}"/>
  <line x1="${w-pad}" y1="${h-pad}" x2="${w-pad}" y2="${h-pad-d*0.05}" stroke="#E03A22" stroke-width="${d*0.004}"/>
  <text x="${cx}" y="${pad*3.1}" text-anchor="middle" font-family="Helvetica,Arial,sans-serif" font-size="${fs1}" font-weight="700" letter-spacing="${fs1*0.14}" fill="#D9CFC2" fill-opacity="0.82">${esc(label.toUpperCase())}</text>
  <text x="${cx}" y="${pad*4.5}" text-anchor="middle" font-family="Courier New,monospace" font-size="${fs2}" letter-spacing="${fs2*0.24}" fill="#E03A22" fill-opacity="0.7">${w} × ${h}  ·  SEGNAPOSTO</text>
</svg>`;
}

let n = 0;
for (const [name, w, h, label] of SLOTS) {
  await fs.writeFile(`site/assets/img/${name}.svg`, svg(name, w, h, label));
  n++;
}

// favicon / logo mark: a stylised claw-slash "W"
const mark = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#E03A22"/><stop offset="1" stop-color="#A81A12"/></linearGradient></defs>
  <rect width="64" height="64" rx="10" fill="#060404"/>
  <path d="M12 14 L20 46 L28 26 L32 38 L36 26 L44 46 L52 14" fill="none" stroke="url(#g)" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;
await fs.writeFile('site/assets/img/mark.svg', mark);
await fs.writeFile('site/favicon.svg', mark);
console.log(`${n} segnaposto + mark generati`);

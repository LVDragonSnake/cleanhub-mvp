import fs from 'node:fs/promises';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36';
const FAMS = [
  { q: 'Anton', name: 'Anton', slug: 'anton' },
  { q: 'Bebas+Neue', name: 'Bebas Neue', slug: 'bebas' },
  { q: 'Inter:wght@300..800', name: 'Inter', slug: 'inter' },
  { q: 'JetBrains+Mono:wght@400;500', name: 'JetBrains Mono', slug: 'jbmono' },
];
let out = '/* Wildblood — self-hosted webfonts (Google Fonts, OFL) */\n';
for (const f of FAMS) {
  const url = `https://fonts.googleapis.com/css2?family=${f.q}&display=swap`;
  const css = await (await fetch(url, { headers: { 'User-Agent': UA } })).text();
  const blocks = css.split('@font-face').slice(1);
  let i = 0;
  for (const b of blocks) {
    const comment = css.slice(0, css.indexOf(b)).match(/\/\* ([a-z\-]+) \*\/\s*@font-face\s*$/);
    const src = b.match(/url\((https:\/\/fonts\.gstatic\.com[^)]+)\)/);
    const range = b.match(/unicode-range:\s*([^;]+);/);
    const weight = b.match(/font-weight:\s*([^;]+);/);
    if (!src) continue;
    // keep only latin + latin-ext subsets
    const r = range ? range[1] : '';
    const isLatin = r.includes('U+0000-00FF') || r.includes('U+0100-02BA');
    if (!isLatin) continue;
    const file = `${f.slug}-${i++}.woff2`;
    const buf = Buffer.from(await (await fetch(src[1])).arrayBuffer());
    await fs.writeFile(`site/assets/fonts/${file}`, buf);
    out += `@font-face{font-family:'${f.name}';font-style:normal;font-weight:${weight ? weight[1].trim() : 400};font-display:swap;src:url('${file}') format('woff2');unicode-range:${r.trim()}}\n`;
    console.log(file, buf.length, 'bytes', weight ? weight[1].trim() : 400);
  }
}
await fs.writeFile('site/assets/fonts/fonts.css', out);
console.log('\n--- fonts.css written ---');

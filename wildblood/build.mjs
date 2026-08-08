import fs from 'node:fs/promises';
import path from 'node:path';
import render from './src/template.mjs';
import renderArgos from './src/argos.mjs';
import cfg from './content/site.mjs';
import it from './content/it.mjs';
import en from './content/en.mjs';

const OUT = 'site';
async function write(rel, html) {
  const p = path.join(OUT, rel);
  await fs.mkdir(path.dirname(p), { recursive: true });
  await fs.writeFile(p, html);
  console.log(`  ${rel.padEnd(22)} ${(Buffer.byteLength(html)/1024).toFixed(1)} KB`);
}

console.log('Wildblood Saga — build');
await write('index.html', render(it, cfg));
await write('en/index.html', render(en, cfg));
await write('argos/index.html', renderArgos(it, cfg, '../', '../'));
await write('en/argos/index.html', renderArgos(en, cfg, '../../', '../'));

await write('404.html', `<!doctype html><html lang="it"><head><meta charset="utf-8">
<title>404 — Wildblood Saga</title><meta name="viewport" content="width=device-width,initial-scale=1">
<link rel="icon" href="favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="assets/css/site.css">
</head><body style="display:grid;place-items:center;min-height:100vh;text-align:center">
<div class="wrap"><p class="kick">Errore 404</p>
<h1 class="d" style="font-size:clamp(2.4rem,8vw,6rem);margin:20px 0">Fascicolo<br>non trovato</h1>
<p class="lede" style="margin-inline:auto">Questa pagina non esiste, oppure e' stata rimossa dall'archivio.</p>
<p style="margin-top:30px"><a class="btn" href="./">Torna in superficie</a></p></div>
<div class="grain"></div></body></html>`);

await fs.writeFile(path.join(OUT, '.nojekyll'), '');
const base = cfg.domain;
await write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url><loc>${base}/</loc>
    <xhtml:link rel="alternate" hreflang="it" href="${base}/"/>
    <xhtml:link rel="alternate" hreflang="en" href="${base}/en/"/></url>
  <url><loc>${base}/en/</loc>
    <xhtml:link rel="alternate" hreflang="it" href="${base}/"/>
    <xhtml:link rel="alternate" hreflang="en" href="${base}/en/"/></url>
</urlset>`);
await write('robots.txt', `User-agent: *\nAllow: /\nDisallow: /argos/\nDisallow: /en/argos/\n\nSitemap: ${base}/sitemap.xml\n`);
console.log('done.');

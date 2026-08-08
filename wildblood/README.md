# Wildblood Saga — sito

Sito statico bilingue (IT ufficiale / EN tradotto) per la saga **Wildblood** di
Alexander Lawrence. Nessun framework, nessuna dipendenza a runtime: HTML, CSS e
un file JS. Font self-hostati. Si apre anche con doppio click.

```
wildblood/
├── content/
│   ├── it.mjs        ← TUTTI i testi italiani (versione ufficiale)
│   ├── en.mjs        ← TUTTI i testi inglesi
│   ├── media.mjs     ← mappa delle immagini
│   └── site.mjs      ← link d'acquisto, social, email, newsletter
├── src/
│   ├── template.mjs  ← sito pubblico (il trailer)
│   ├── argos.mjs     ← area riservata ARGOS
│   └── icons.mjs
├── build.mjs         ← genera site/ da content/ + src/
└── site/             ← OUTPUT: è questo che va online
    ├── index.html        IT pubblico
    ├── en/index.html     EN pubblico
    ├── argos/            IT area riservata
    └── en/argos/         EN area riservata
```

## Le due facce del sito

**Pubblico** (`index.html`) — un trailer interattivo: una sequenza di otto
fotogrammi a tutto schermo guidata dallo scroll, che si dissolvono l'uno
nell'altro con una spinta in avanti continua. Poi il libro, i volumi, la porta
dell'archivio, l'autore, la newsletter.

**Area riservata** (`argos/`) — l'ARGOS Archive: registro da terminale
classificato, protetto da un codice. Il codice sta in `content/site.mjs`
(`argosCode`).

> ⚠︎ Il controllo del codice avviene **nel browser**: è scenografico, non è una
> protezione reale. Chiunque guardi il sorgente lo trova. Per un accesso davvero
> protetto serve l'area membri di Wix o un server.

## Comandi

```bash
npm run build     # rigenera site/index.html e site/en/index.html
npm run serve     # anteprima su http://localhost:4173
npm run fonts     # riscarica i font da Google Fonts e li self-hosta
```

`site/` è committato nel repo: per pubblicare non serve build in CI.

## Modificare i testi

Tutto il copy sta in `content/it.mjs` e `content/en.mjs`. Le due strutture sono
identiche: se aggiungi una voce in una, aggiungila anche nell'altra. Poi `npm run build`.

## Le immagini

Le immagini del sito attuale sono servite **direttamente dal CDN di Wix**, con
ritaglio e compressione applicati via URL (`/v1/fill/w_...,h_...`). Nessun file
pesante nel repo, nessun upload da rifare.

- `content/media.mjs` è la mappa: `chiave → [id Wix, larghezza, altezza, nome]`.
- Se una URL trasformata non risponde, il JS ricade automaticamente sull'originale
  (`data-fallback`), quindi l'immagine si vede comunque.
- Per self-hostare: scarica i file, mettili in `site/assets/img/` e sostituisci
  `img('chiave', …)` con un tag `<img>` normale in `src/template.mjs`.

Gli slot ancora da riempire (5 ritratti personaggi + foto autore) usano segnaposto
SVG. I prompt pronti all'uso sono in **[IMAGE-PROMPTS.md](IMAGE-PROMPTS.md)**.

## Pubblicazione

### GitHub Pages (già configurato)
`.github/workflows/wildblood-pages.yml` pubblica `wildblood/site/` a ogni push.
Va abilitato una volta sola: **Settings → Pages → Source: GitHub Actions**.

### Qualsiasi altro hosting
`site/` è una cartella statica autosufficiente: trascinala su
[Netlify Drop](https://app.netlify.com/drop), caricala via FTP, mettila su Altervista.
Non serve build né Node sul server.

### Dominio definitivo
Quando il sito è pronto per sostituire quello Wix: punta `wildbloodsaga.com`
all'hosting scelto e aggiungi il file `site/CNAME` con dentro `www.wildbloodsaga.com`.

## Da confermare prima della messa online

Sono segnati `TODO` in `content/site.mjs`:

- **Link d'acquisto** — gli ASIN Amazon sono stati dedotti dalle schede esistenti.
- **Social** — gli URL Instagram e TikTok sono ipotizzati.
- **Newsletter** — il form usa `mailto:` come ripiego. Incollando in
  `newsletterAction` l'endpoint di Mailchimp / Brevo / Substack il form invia lì.
- **Stato di "Rise of the Beast"** — impostato su *In arrivo*. Se è già in vendita,
  in `content/it.mjs` e `content/en.mjs` cambia `status: 'soon'` → `status: 'out'`.

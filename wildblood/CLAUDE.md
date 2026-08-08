# Wildblood Saga — sito

Sito statico bilingue per la saga **Wildblood** di Alexander Lawrence.
Nessun framework, nessuna dipendenza a runtime. `node build.mjs` genera `site/`.

Questo file esiste perché il progetto è nato in una sessione remota: serve a non
far ripartire da zero (e a non rifare gli stessi errori) chi lo riprende.

## Comandi

```bash
node build.mjs     # rigenera site/ da content/ + src/
npm run serve      # anteprima su http://localhost:4173
npm run fonts      # riscarica e self-hosta i font
```

## Struttura

```
content/it.mjs     TUTTI i testi italiani (versione ufficiale)
content/en.mjs     TUTTI i testi inglesi — stessa struttura di chiavi
content/media.mjs  mappa immagini → id Wix + helper URL
content/site.mjs   link acquisto, social, email, codice ARGOS, heroVideo
src/template.mjs   sito pubblico
src/argos.mjs      area riservata
site/              OUTPUT (committato; è ciò che va online)
```

## Le due facce

**Pubblico** — base **chiara** (carta/sabbia, testo scuro). Il nero è solo
hero, pannelli luoghi, porta archivio e footer. Hero cinematografico animato:
carrellata continua, velo d'aria calda (feTurbulence + feDisplacementMap),
fasci di luce, bagliore, riflesso, pulviscolo e braci su canvas, lampo sul
titolo, parallasse col puntatore.

**Area riservata** `argos/` — registro da terminale, codice in
`content/site.mjs` (`argosCode`). Le schede aprono un visore con i documenti
ARGOS veri e il download dei PDF.

> ⚠︎ Il codice si controlla nel browser: è scenografico, non è una protezione.
> Per un accesso davvero protetto serve l'area membri di Wix o un server.

## Storico del design — LEGGERE PRIMA DI RIDISEGNARE

Quattro tentativi sul sito pubblico, tre bocciati. Le ragioni:

1. **Editoriale scuro** — "non è per nulla grafico". Fondo nero, testo,
   immagini piccole dentro riquadri: le immagini facevano da decorazione.
2. **ARGOS Terminal** (HUD, telemetria, decrittazione) — bocciato *per il sito
   pubblico*, ma **piaciuto** e riusato per l'area riservata.
3. **Trailer a fotogrammi** (sequenza sticky guidata dallo scroll) — "troppo
   scuro, troppo poco wow".
4. **Attuale** — base chiara + hero animato. In attesa di giudizio.

Indicazioni esplicite dell'autore, valide finché non dice altro:
- più **luce**, non tutto nero
- vuole **movimento vero**: video o animazione cinematografica
- l'ARGOS Dossier è **area riservata**, non pubblica
- le schede d'archivio devono **aprirsi e scaricare i file veri**

## Da confermare prima della messa online

Marcati `TODO` in `content/site.mjs`:
- **Link Amazon** — ASIN dedotti dalle schede esistenti, non verificati.
- **Social** — URL Instagram e TikTok ipotizzati.
- **Newsletter** — il form usa `mailto:`. Incollando in `newsletterAction`
  l'endpoint di Mailchimp/Brevo/Substack invia lì.
- **Rise of the Beast** — impostato *In arrivo*. Se è in vendita, in
  `content/it.mjs` e `en.mjs` cambia `status: 'soon'` → `'out'`.
- **Testo italiano ufficiale** — riscritto dalla sinossi: le pagine
  dell'Editor Wix non sono leggibili via API. Se serve il copy esatto del
  sito attuale va copiato a mano.
- **PDF mancanti** — 22 copertine ma solo 7 PDF. Gli altri dicono "solo
  anteprima". I PDF stanno su `usrfiles.com`, mappati in `content/*.mjs`.

## Immagini

Servite dal CDN Wix con ritaglio via URL (`/v1/fill/w_...`). Se una URL
trasformata non risponde, il JS ricade sull'originale (`data-fallback`).
Slot ancora vuoti: 5 ritratti personaggi + foto autore → segnaposto SVG,
prompt pronti in `IMAGE-PROMPTS.md`.

**Nota per chi lavora in locale:** la sessione remota aveva il CDN Wix
bloccato dal proxy, quindi il sito è stato impaginato *senza mai vedere le
immagini vere*. In locale non è così: apri il sito, guarda come cadono
davvero ritagli e luci, e aggiusta.

## Pubblicazione

Pages è attivo sul branch **`gh-pages`** del repo `cleanhub-mvp`.
`.github/workflows/wildblood-pages.yml` costruisce e ci pubblica dentro
`wildblood/site` a ogni push sul branch di sviluppo.

Online: https://lvdragonsnake.github.io/cleanhub-mvp/

`actions/deploy-pages` non è utilizzabile: l'app GitHub dell'integrazione non
ha il permesso di creare il sito Pages.

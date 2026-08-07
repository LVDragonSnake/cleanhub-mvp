# Wildblood Saga — Prompt immagini da generare

Il sito riusa già **tutte** le immagini presenti su wildbloodsaga.com (cover, hero,
logo ARGOS, timbro CLASSIFIED, le 6 card d'archivio, i dossier, i luoghi).
Restano da generare solo gli slot elencati qui sotto — al momento riempiti da
segnaposto SVG in `site/assets/img/`.

## Come sostituire un'immagine

1. Genera il file e salvalo in `site/assets/img/` con **lo stesso nome** del segnaposto
   (cambiando solo l'estensione: `char-leonardo.svg` → `char-leonardo.jpg`).
2. Apri `src/template.mjs`, cerca `c.key + '.svg'` e `'author.svg'`, cambia l'estensione.
3. `npm run build`.

---

## Stile comune — incollalo in coda a OGNI prompt

> Cinematic dark fantasy, near-monochrome palette of deep black (#070505), dried
> blood red (#C0281A) and warm ember orange (#E5462A), with bone-white (#E4DDD1)
> highlights. Single hard key light from one side, deep falloff into pure black,
> heavy negative space. 35mm film grain, subtle halation, slight desaturation,
> high micro-contrast on skin and texture. No text, no logo, no watermark, no
> border. Photographic realism, not illustration.

---

## 1. Ritratti personaggi — 5 immagini

Formato: **verticale 3:4, 900×1200 px minimo** (meglio 1200×1600).
Inquadratura: mezzo busto, sguardo in camera o appena fuori, sfondo scurissimo.
Vanno letti come **foto di sorveglianza / scheda soggetto ARGOS**, non come poster.

### `char-leonardo.jpg`
> Portrait of a 19-year-old Italian young man, dark tousled hair, sharp jaw, pale
> skin with faint healed scars across the left cheekbone and neck. His eyes catch
> the light like a predator's — a faint amber-gold retinal glow, unmistakable but
> not cartoonish. Tense jaw, exhausted, holding something back. Plain dark jacket.
> Shot half-body, three-quarter angle, hard rim light from the right carving him
> out of near-total darkness.

### `char-maya.jpg`
> Portrait of a young woman in her early twenties of Indonesian descent, long dark
> hair, warm brown eyes, calm and steady gaze — the only warmth in a cold frame.
> Simple dark top, small pendant at the throat. Soft key light from a window on
> the left, cool shadow fill, urban night behind her thrown far out of focus.

### `char-nohea.jpg`
> Portrait of a young man in his late teens of Maldivian descent, close-cropped
> dark hair, sun-weathered skin, salt still on him. Fine branching scars run from
> his collarbone up the side of his neck like dried lightning. Guarded, hollowed
> out, recently held somewhere he did not choose. Damp clothing. Cold blue-grey
> key light from above, red emergency glow bleeding in from behind.

### `char-ginevra.jpg`
> Portrait of a young woman in her twenties, athletic, shaved side-cut dark hair,
> a thin scar through one eyebrow, defiant chin-up stare. Worn hoodie, urban
> outskirts at night behind her — sodium streetlight far out of focus. Half her
> face in total shadow. Something not-quite-human in the set of her pupils.

### `char-noah.jpg`
> Portrait of a young man, gaunt, shorn hair growing back unevenly, surgical scars
> at the temple and inside the forearm, a faded subject-number tattooed on the
> neck. Hospital-pale skin, thousand-yard stare. Institutional clothing. Flat
> clinical overhead light, sickly and green-tinged, deep black around him.

---

## 2. Ritratto autore — `author.jpg`

Formato: **quadrato 1:1, 1200×1200 px** (viene ritagliato al centro-alto).

> Editorial author portrait of a man in his forties, dark clothing, seated or
> standing against a near-black background. Confident but withdrawn, looking
> slightly off-camera. Single soft key from the side, strong falloff, hands
> visible. Books or paper barely suggested in the darkness behind him. Timeless,
> serious, literary — not corporate.

*(Se hai già una foto tua che ti piace: meglio quella. Serve solo che sia scura,
con una sola fonte di luce e molto spazio nero attorno — il resto lo fa il sito.)*

---

## 3. Sostituzioni consigliate (opzionali ma utili)

Due pannelli "Luoghi" stanno usando immagini d'archivio non perfettamente
pertinenti. Funzionano, ma queste sarebbero meglio:

### `loc-cairo.jpg` — formato **16:10, 2000×1250**
> Cairo at dusk seen from a rooftop: dense sand-coloured city, minarets, dust haze,
> and the silhouette of a pyramid on the far horizon. Low sun, long shadows,
> heat shimmer. Foreground in deep shadow. Cinematic anamorphic wide shot.

### `loc-milano.jpg` — formato **16:10, 2000×1250**
> Milan at night in the rain: an empty peripheral street, tram tracks glistening,
> sodium and cold LED light mixing, condensation, a single lit window high above.
> Wet asphalt reflections. Nobody in frame. Melancholic, urban, cinematic.

### `og.jpg` — formato **1.91:1, 1200×630** (anteprima social)
> Wide cinematic key art: the silhouette of a young man from behind, facing a
> savannah horizon at dusk, and the barely-visible shape of a massive pale feline
> in the haze ahead of him. Vast negative space on the left for a title.

Poi in `content/media.mjs` aggiungi la voce e in `src/template.mjs` sostituisci
`ruins` → la nuova chiave (Cairo) e `city` → la nuova chiave (Milano).

---

## 4. Se in futuro servissero le cover dei volumi 3-5

Oggi il sito usa le thumb già esistenti (`Thumb abyss`, `Thumb vol 3`, `Thumb vol 4`),
volutamente desaturate perché i volumi non sono ancora usciti. Quando saranno pronte
le cover definitive basta aggiornare `coverAbyss`, `coverMeta`, `coverLegacy`
in `content/media.mjs`.

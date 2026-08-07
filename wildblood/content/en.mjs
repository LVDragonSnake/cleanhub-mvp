/* ENGLISH — translation of the official Italian version */
export default {
  lang: 'en', locale: 'en_US', altLang: 'it', altHref: '../', selfHref: './',
  dir: '../',

  meta: {
    title: 'Wildblood Saga — Dark fantasy by Alexander Lawrence',
    desc: 'Wildblood: the dark fantasy saga by Alexander Lawrence. Transformation, ancient relics and the predator growing under the skin. Savage Heart is only the beginning.',
    ogAlt: 'Wildblood Saga — Alexander Lawrence',
  },

  nav: {
    saga: 'The saga', books: 'Books', archive: 'Archive', world: 'World',
    cast: 'Characters', places: 'Locations', author: 'Author', join: 'Newsletter',
    menu: 'Menu', buy: 'Buy',
  },

  hero: {
    eyebrow: 'The saga · Alexander Lawrence',
    title: 'Wildblood',
    tagline: 'Dark fantasy · Mutation · Relics',
    pitch: 'Seventeen years old. A safari in Kenya. The attack of an impossible beast: a massive feline, its coat shimmering white and gold, its amber eyes burning like fire. <em>Leonardo survives.</em> But something inside him has awakened.',
    ctaPrimary: 'Buy Savage Heart',
    ctaSecondary: 'Enter the Archive',
    scroll: 'Scroll',
    stat: '5 volumes · Vol. 1 available',
  },

  quote: {
    line1: 'The question is no longer',
    line2: 'whether he will change.',
    line3: 'It is what will be left',
    line4: 'when he is done.',
    cite: 'Wildblood — Book One',
  },

  saga: {
    label: 'The saga',
    title: 'Five volumes. One descent.',
    intro: 'Wildblood is a five-volume dark fantasy saga spanning continents, buried ruins and ancestral memory. The line between human and beast is only the beginning.',
    statusOut: 'Available', statusSoon: 'Coming soon',
    statusWriting: 'In progress', statusDev: 'In development',
    buy: 'Buy', more: 'Read more',
    items: [
      { n: '01', key: 'coverSH', title: 'Savage Heart', status: 'out',
        tags: ['Kenya', 'The mutation', 'ARGOS'],
        text: '<p>A trip meant to break the routine becomes the end of every normality. After the attack in the savannah, Leonardo comes home carrying something that isn’t his: blackouts, waking at night covered in blood that isn’t his own, senses that never switch off again.</p><p>As he tries to understand what he is becoming, he comes into contact with an ancient artifact that triggers visions. He isn’t the only one who wants it. A shadowy government organisation, <strong>ARGOS</strong>, has been collecting them for decades.</p><p>When his mother is kidnapped and his friend Amir disappears, Leonardo is forced to flee, to hide, and finally to fight. He will save what is left of his family. Not everything else.</p>' },
      { n: '02', key: 'coverROB', title: 'Rise of the Beast', status: 'soon',
        tags: ['Milan', 'Cairo', 'Pulau Api'],
        text: '<p>Two years later, Leonardo tries to rebuild a life in Milan, beside Maya. It is an illusion: the mutation never stopped — it only learned to wait.</p><p>A new lead takes him to Cairo, on the trail of a second artifact. Beneath a forgotten pyramid he finds the <strong>Amkh-Ra</strong> — an amulet of blood and amber that speaks to the mind — and the last of the Ancients, who entrusts him with a mission.</p><p>Hunted and framed with false accusations, he runs as far as the jungles of Pulau Api. There he will lose everything he thought he could protect. And discover that running is no longer enough.</p>' },
      { n: '03', key: 'coverAbyss', title: 'Abyss', status: 'writing',
        tags: ['Nohea', 'Maldives', 'The Cult'],
        text: '<p>Nohea, a boy of Maldivian origin, survives a catastrophic event and carries a mutation he cannot decipher. In Italy he is pulled into a vortex of organised crime and human trafficking, until ARGOS captures him and begins using him as a test subject.</p><p>Meanwhile, in the shadows, a clandestine cult takes shape: fanatics convinced that hybrids are aberrations to be eradicated. Dark and tense, between psychological thriller and spy story.</p>' },
      { n: '04', key: 'coverMeta', title: 'Metamorphosis', status: 'dev',
        tags: ['Ginevra', 'Noah', 'The blue predator'],
        text: '<p>Ginevra is a shapeshifter living on the fringes, an urban legend in the forgotten outskirts. Meeting Noah — escaped from ARGOS, scarred by the experiments — changes everything.</p><p>Together they follow the trail of a hybrid who has become a myth: Leonardo. But the Cult steps into the open and turns the world into a manhunt. In a world that wants to destroy them, the hardest battle will be to remain human.</p>' },
      { n: '05', key: 'coverLegacy', title: 'Wild Legacy', status: 'dev',
        tags: ['Three bloodlines', 'The reckoning'],
        text: '<p>Leonardo, Nohea and Ginevra join forces. The hunt for the artifacts enters its final phase as the world around them begins to collapse: ARGOS and the Cult clash with brutal intensity, and hybrids risk becoming sacrificial victims in a war they never chose.</p><p>The truth about the origin of the mutations will change everything. The epic conclusion of a saga where the boundary between human and beast was only the starting point.</p>' },
    ],
  },

  spot: {
    label: 'Book one',
    title: 'Savage Heart',
    sub: 'Wildblood · Volume 1',
    pitch: 'A powerful organisation known as ARGOS is after ancient relics that should never have been unearthed — buried in sunken temples, beneath the pyramids, in volcanic caves lost to the seas of Indonesia. Each one is a key. Each one is a threat.',
    facts: [
      'Dark fantasy, adventure and psychological thriller',
      'Young Adult / New Adult',
      'Cinematic narrative, rising tension',
      'Available in English and Italian',
    ],
    price: 'Available in paperback and ebook',
    buy: 'Buy on Amazon',
    preview: 'Read a preview',
  },

  archive: {
    label: 'ARGOS Archive',
    title: 'Archive access',
    intro: 'Restricted files, incident reports, field logs. Material produced by the organisation hunting the artifacts — and everyone who touches them.',
    declassifyOn: 'Reclassify', declassifyOff: 'Declassify',
    locked: 'Locked', open: 'Open file',
    items: [
      { key: 'arcDossier',    code: 'ARG-DSR', name: 'ARGOS Dossier',    desc: 'Subject records, surveillance profiles and risk assessments on identified hybrids.' },
      { key: 'arcClassified', code: 'ARG-CLF', name: 'Classified Files', desc: 'Limited-distribution documents. Unacknowledged operations, redacted sites, erased names.' },
      { key: 'arcField',      code: 'ARG-FL',  name: 'Field Logs',       desc: 'Readings from the field: cavern expeditions, subglacial structures, artifact recoveries.' },
      { key: 'arcIncident',   code: 'ARG-IR',  name: 'Incident Reports', desc: 'What went wrong. Failed containments, unidentified survivors, compromised sectors.' },
      { key: 'arcVisual',     code: 'ARG-VR',  name: 'Visual Records',   desc: 'Satellite imagery, surveillance stills, recovered visual material.', locked: true },
      { key: 'arcAuthor',     code: 'AUT-ARC', name: 'Author Archive',   desc: 'Author’s notes, worldbuilding material and behind-the-scenes of the saga.' },
    ],
  },

  world: {
    label: 'The world',
    title: 'Who pulls the strings',
    intro: 'Four forces fighting over the same buried truth. None of them wants you to know it.',
    items: [
      { id: 'FACTION 01', name: 'ARGOS', tags: ['Government', 'Shadow', 'Global'],
        desc: 'A shadowy government organisation. It tracks the artifacts, studies them, seizes them. To ARGOS they are the key to a forgotten past. Anyone who gets in the way becomes an open file.' },
      { id: 'FACTION 02', name: 'The Cult', tags: ['Fanatics', 'Armed', 'Clandestine'],
        desc: 'Founded by a former ARGOS scientist consumed by fanaticism. It preaches that hybrids are satanic aberrations to be eradicated. Armed, organised, expanding.' },
      { id: 'FACTION 03', name: 'The Ancients', tags: ['Near extinct', 'Keepers'],
        desc: 'Witnesses of an era when humans and hybrid creatures walked side by side. Very little remains: a lineage, a body of knowledge, and a mission to hand over before it vanishes for good.' },
      { id: 'FACTION 04', name: 'The Hybrids', tags: ['Hunted', 'Mutating'],
        desc: 'Those who carry the change in their blood. Not a power: an inheritance that cannot be given back. Some learn to live with it. Others are devoured from the inside.' },
    ],
  },

  cast: {
    label: 'Characters',
    title: 'Those who carry the blood',
    intro: 'Three bloodlines, five volumes, one question: how much can you lose before you stop being yourself.',
    pending: 'No visual on record',
    items: [
      { key: 'char-leonardo', name: 'Leonardo', role: 'Subject 01 · The first', meter: 92,
        line: 'Seventeen, from Lecco. Survivor of the attack in the savannah. The feline mutation never stopped — and over the years it stopped feeling like an illness.' },
      { key: 'char-maya', name: 'Maya', role: 'Milan · The anchor', meter: 34,
        line: 'Of Indonesian descent. The only human thing left in Leonardo’s life. Without knowing it, she keeps a childhood legend worth more than any artifact.' },
      { key: 'char-nohea', name: 'Nohea', role: 'Subject 02 · Maldives', meter: 76,
        line: 'Survivor of a catastrophic event, marked by a mutation he does not understand. Captured by ARGOS and used as a test subject for a new generation of experiments.' },
      { key: 'char-ginevra', name: 'Ginevra', role: 'Subject 03 · Shapeshifter', meter: 84,
        line: 'She lives on the fringes and defends those who cannot defend themselves. In the forgotten outskirts they call her an urban legend. She doesn’t know where her abilities come from — and she needs to.' },
      { key: 'char-noah', name: 'Noah', role: 'Escapee · ARGOS', meter: 68,
        line: 'He carries the scars of the experiments he endured. He got out of the facility alive. Not alone, and not whole.' },
    ],
  },

  places: {
    label: 'Locations',
    title: 'Where the earth remembers',
    items: [
      { key: 'kenya',  name: 'Kenya',     coord: '01°29′S 35°08′E · Savannah',     vol: 'Volume 01',
        desc: 'Where it all begins. A holiday meant to break the routine, the attack of an impossible creature, and a life that will never go back to what it was.' },
      { key: 'city',   name: 'Milan',     coord: '45°28′N 09°11′E · Italy',        vol: 'Volume 01–02',
        desc: 'The impossible homecoming. A part-time job, a girl, a façade of normality. Inside, the sharpened senses never fade and the nightmares keep getting more real.' },
      { key: 'ruins',  name: 'Cairo',     coord: '30°02′N 31°14′E · Egypt',        vol: 'Volume 02',
        desc: 'Under the merciless sun, through dusty markets and crowded alleyways, the hunt for a stolen artifact. And, beyond collapsed corridors, a chamber sealed for millennia.' },
      { key: 'jungle', name: 'Pulau Api', coord: '03°12′S 127°45′E · Indonesia',   vol: 'Volume 02',
        desc: 'Ancient ruins and new dangers. In the wild heart of the island, death, transformation and betrayal sever Leonardo’s bond with the human world.' },
      { key: 'sea',    name: 'Maldives',  coord: '03°12′N 73°13′E · Indian Ocean', vol: 'Volume 03',
        desc: 'The abyss. A catastrophic event, a single survivor, and a sector ARGOS would rather never have opened.' },
    ],
  },

  author: {
    label: 'The author',
    title: 'Alexander Lawrence',
    role: 'Author · Wildblood Saga',
    bio: [
      'Alexander Lawrence writes stories where myth collides with reality — and something darker emerges.',
      'His work explores transformation, identity, and the thin line between human and something more. His novels blend dark fantasy, adventure and psychological tension, taking readers from remote landscapes to hidden worlds beneath the surface — places where ancient forces still move unseen.',
      'Wildblood is his five-volume saga: roughly 170,000 words, a cinematic narrative built on tension and immersive settings.',
    ],
    cta: 'Download the press kit',
    ctaAlt: 'Email the author',
  },

  press: {
    label: 'Press kit',
    title: 'For press, booksellers and publishers',
    intro: 'Ready-to-use materials for reviews, product pages and features. For specific requests, contact the author directly.',
    request: 'Request',
    items: [
      { name: 'High-resolution covers', desc: 'Savage Heart and Rise of the Beast — PNG/JPG for print and web' },
      { name: 'Official synopsis', desc: 'Short, long and per-volume synopsis — English and Italian' },
      { name: 'Author biography', desc: 'Short (50 words) and long (200 words) bio + portrait' },
      { name: 'Fact sheet', desc: 'ISBN, formats, pricing, distribution, publishing data' },
    ],
  },

  join: {
    label: 'Join the pack',
    title: 'The next volume reaches insiders first',
    intro: 'Chapter previews, unreleased ARGOS dossiers, release dates and material reserved for subscribers. No spam: only when there is something real to say.',
    placeholder: 'Your email',
    cta: 'Join',
    note: 'Unsubscribe any time. Your email is never shared with anyone.',
    ok: 'Thank you — check your inbox.',
    subject: 'Wildblood newsletter signup',
  },

  foot: {
    tagline: 'Dark fantasy · Alexander Lawrence',
    colNav: 'Navigate', colBooks: 'Books', colInfo: 'Information',
    contact: 'Contact', privacy: 'Privacy', terms: 'Legal', blog: 'Blog',
    rights: 'All rights reserved.',
    legal: 'Wildblood and all associated content are protected under international copyright laws. No part of this work may be copied, reproduced, distributed or transmitted in any form without prior written permission from the author.',
    langNote: 'Translated from the official Italian version',
  },

  buybar: { title: 'Savage Heart', sub: 'Wildblood · Volume 1', cta: 'Buy' },
  skip: 'Skip to content',
};

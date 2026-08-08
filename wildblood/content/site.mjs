/* Configurazione condivisa fra le due lingue.
   ⚠︎ I valori marcati TODO vanno confermati prima della messa online. */
export default {
  domain: 'https://www.wildbloodsaga.com',
  author: 'Alexander Lawrence',
  email: 'alexander@wildbloodsaga.com',

  // Link d'acquisto. ASIN trovati nelle schede Amazon esistenti — TODO: conferma.
  buy: {
    it: 'https://www.amazon.it/dp/B0GZC1NTQV',        // Savage Heart — edizione italiana
    en: 'https://www.amazon.com/dp/B0GQW5MKMQ',       // Savage Heart — English paperback
    kindle: 'https://www.amazon.com/dp/B0GZ7GK5FT',   // Kindle
  },

  socials: [
    { name: 'Instagram', url: 'https://www.instagram.com/wildbloodsaga', icon: 'ig' },     // TODO
    { name: 'TikTok',    url: 'https://www.tiktok.com/@wildbloodsaga',   icon: 'tt' },     // TODO
    { name: 'Amazon',    url: 'https://www.amazon.com/stores/author/B008PHABYK', icon: 'az' },
    { name: 'Email',     url: 'mailto:alexander@wildbloodsaga.com',      icon: 'ml' },
  ],

  // Endpoint del form newsletter. Vuoto = fallback mailto.
  // Incollando qui l'action di Mailchimp/Brevo/Substack il form invia lì direttamente.
  newsletterAction: '',

  // Codice dell'area riservata ARGOS.
  // NB: il controllo avviene nel browser — e' scenografico, non e' una protezione
  // reale. Per un accesso davvero protetto serve l'area membri di Wix o un server.
  argosCode: 'AMKH-RA',

  // Video dell'hero. Appena hai un trailer (mp4, muto, 8-15s, in loop),
  // metti qui la URL e prende il posto dell'immagine animata.
  heroVideo: '',
};

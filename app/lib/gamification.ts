/**************** CONFIG ****************/
const FOLDER_ID = '190oTrRR3nIpz3Coo3zu97-ysmhoTde-C';
const TEMPLATE_ID = '1ZL-jzac4B7c3L_KIcBaitk_uJTbomb5eB1SSFBakkpw';
const DEBUG_LOG = true;

/**************** MANUTENZIONE ****************/
const ZG_MANUTENZIONE_MODE = true;   // true = BLOCCATO | false = operativo
const ZG_MANUTENZIONE_MSG = "MODIFICHE IN CORSO\n\nIl configuratore è temporaneamente disabilitato.\nRiprova più tardi.";

/**************** MENU ******************/
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  const ss = SpreadsheetApp.getActive();

  // Menu sempre disponibile
    const menu = ui.createMenu('ZeroGuasti')
    .addItem('Genera Polizza (PDF)', 'generaPolizza')
    .addSeparator()
    .addItem('Azzera valori configuratore', 'azzeraValoriConfiguratore')
    .addSeparator();

  if (ZG_MANUTENZIONE_MODE) {
  ui.alert(ZG_MANUTENZIONE_MSG);
  menu.addSeparator().addItem('Modalità modifiche attiva', 'zgBloccato_');

  // salva colori/testi originali solo la prima volta
  try { saveInputFormatting_(); } catch (e) {}

  // evidenza visiva: tutto rosso
  try {
    const sh = ss.getSheetByName('INPUT');
    if (sh) {
      sh.getRange('A1:Z200')
        .setBackground('#b00000')
        .setFontColor('#ffffff');
      sh.getRange('C5').setValue('MODIFICHE IN CORSO');
      sh.getRange('C6').setValue('SI PREGA DI RIPROVARE PIÙ TARDI');
    }
  } catch (e) {}
} else {
  // ripristina colori/testi originali
  try { restoreInputFormatting_(); } catch (e) {}
}

  menu.addToUi();
}

function zgBloccato_() {
  SpreadsheetApp.getUi().alert(ZG_MANUTENZIONE_MSG);
}

/**************** ENTRY *****************/
function generaPolizza() {
  generaPolizzaZeroGuasti_();
}

/**************** RESET CONFIGURATORE ******************/
function azzeraValoriConfiguratore() {
  const ss = SpreadsheetApp.getActive();
  const shInput = ss.getSheetByName('INPUT');
  const shMac = ss.getSheetByName('MACCHINE');

  if (!shInput) throw new Error('Foglio INPUT non trovato');
  if (!shMac) throw new Error('Foglio MACCHINE non trovato');

  // INPUT: colonna B
  const lastRowInput = Math.max(shInput.getLastRow(), 2);
  shInput.getRange(1, 2, lastRowInput, 1).clearContent(); // B1:B

  // INPUT: C2, D2, E2
  shInput.getRange('C2:E2').clearContent();

  // MACCHINE: intervallo B2:K11
  shMac.getRange('B2:K11').clearContent();

}

/**************** MAIN ******************/
function generaPolizzaZeroGuasti_() {
  const ss = SpreadsheetApp.getActive();
  const shInput = ss.getSheetByName('INPUT');
  const shMac = ss.getSheetByName('MACCHINE');
  const shOut = ss.getSheetByName('OUTPUT');
  const shLog = ss.getSheetByName('LOG');

  if (!shInput) throw new Error('Foglio INPUT non trovato');
  if (!shMac) throw new Error('Foglio MACCHINE non trovato');
  if (!shOut) throw new Error('Foglio OUTPUT non trovato');

  const folder = DriveApp.getFolderById(FOLDER_ID);
  const templateFile = DriveApp.getFileById(TEMPLATE_ID);

  // Lettura "robusta": preferisce displayValue per evitare perdita zeri iniziali
const v = (a1) => shInput.getRange(a1).getValue();
const vDisp = (a1) => shInput.getRange(a1).getDisplayValue();
const vd = vDisp;  // alias: display value
const vVal = v;    // alias: value (numeri)

  const pacchetto = safeStr_(vDisp('B14'));

  const prezzoOverridePrimoAnno = vVal('B21');
  const prezzoOverrideRinnovo = vVal('B22');

  const prezzoPrimoAnno = isNum_(prezzoOverridePrimoAnno)
    ? Number(prezzoOverridePrimoAnno)
    : Number(shOut.getRange('B3').getValue() || 0);

  const prezzoRinnovo = isNum_(prezzoOverrideRinnovo)
    ? Number(prezzoOverrideRinnovo)
    : Number(shOut.getRange('B2').getValue() || 0);

  // Modalita pagamento (qui resta B26 come nel tuo codice)
  const modalitaPagamento = safeStr_(vDisp('B26'));

  const data = {
  RAGIONE_SOCIALE: safeStr_(v('B1')),

// SEDE LEGALE (nuovo: B2+C2+D2+E2)
INDIRIZZO_LEGALE: safeStr_(vd('B2')),
COMUNE_LEGALE: safeStr_(vd('C2')),
CAP_LEGALE: normalizeCap_(vd('D2')),
PROVINCIA_LEGALE: safeStr_(vd('E2')),

SEDE_LEGALE: [
  safeStr_(vd('B2')),
  safeStr_(vd('C2')),
  safeStr_(vd('D2')),
  safeStr_(vd('E2'))
].filter(Boolean).join(', '),

  TELEFONO: safeStr_(vd('B3')),
  CODICE_FISCALE: safeStr_(vd('B4')),
  CELLULARE: safeStr_(vd('B5')),
  PARTITA_IVA: safeStr_(vd('B6')),
  EMAIL: safeStr_(v('B7')),
  CODICE_SDI: safeStr_(vd('B8')),
  NOME_INCARICATO: safeStr_(vd('B9')),
  COGNOME_INCARICATO: safeStr_(vd('B10')),
  TELEFONO_INCARICATO: safeStr_(vd('B11')),
  IBAN_RID: safeStr_(vd('B12')),

  DATA_STIPULA: formatDate_(v('B13')),
  DATA_STIPULA_ISO: formatDateISO_(v('B13')),
  FREQUENZA_VISITE: safeStr_(v('B19')),
  DURATA_ANNI: safeStr_(shOut.getRange('B5').getDisplayValue()),
  NUMERO_MACCHINE: safeStr_(shOut.getRange('B1').getDisplayValue()),
  TOTALE_PRIMO_ANNO: euro_(prezzoPrimoAnno),
  PREZZO_ANNUO_RINNOVO: euro_(prezzoRinnovo),
  PACCHETTO: String(v('B14') || '').trim(),
  FIRMATARIO: safeStr_(v('B23')),
  MODALITA_PAGAMENTO: modalitaPagamento
};
data.INCARICATO = [data.NOME_INCARICATO, data.COGNOME_INCARICATO].filter(Boolean).join(' ').trim();

const tacitoRinnovo = safeStr_(shOut.getRange('B7').getDisplayValue()) || 'SI';
data.TACITO_RINNOVO = tacitoRinnovo;
data.SEZIONE_3_DURATA_RINNOVO_DISDETTA = buildSezione3_(tacitoRinnovo);
data.RIGA_PREZZO_RINNOVO = buildRigaPrezzoRinnovo_(tacitoRinnovo, prezzoRinnovo);

  const timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd_HHmmss');
  const tmpName = 'Polizza_ZeroGuasti_TMP_' + timestamp;

  const docCopy = templateFile.makeCopy(tmpName, folder);
  const doc = DocumentApp.openById(docCopy.getId());
const body = doc.getBody();

// 0) Genera blocco riepilogo (tabella + pagamento) al posto del placeholder
insertRiepilogoContratto_(body, data, tacitoRinnovo, prezzoRinnovo);

// 1) Placeholder semplici
replaceAllPlaceholders_(body, data);

  // 2) Tabella macchine
  const machines = readMachines_(shMac, data);
  insertMacchineBlock_(body, machines);

  // 3) Dettaglio pacchetto
  insertDettaglioPacchetto_(body, pacchetto);

  // 4) Materiali di consumo
  insertMaterialiConsumo_(body, pacchetto, machines);

  doc.saveAndClose();

  // 5) PDF
  const pdfBlob = DriveApp.getFileById(doc.getId())
    .getAs(MimeType.PDF)
    .setName('Polizza_ZeroGuasti_' + safeFileName_(data.RAGIONE_SOCIALE) + '_' + timestamp + '.pdf');

  const pdfFile = folder.createFile(pdfBlob);

// 5bis) Push GHL (contatto + tag + opportunity + custom objects + relazioni)
let ghlRes = null;

try {
  ghlRes = pushToGHL_ZeroGuasti_Full_({
    data,
    pdfUrl: pdfFile.getUrl(),
    machines,
    logSheet: shLog
  });
} catch (e) {
  // Non blocco la generazione PDF se GHL fallisce
  Logger.log('GHL PUSH FAIL: ' + (e && e.message ? e.message : String(e)));
}

  // Elimina il doc temporaneo
  DriveApp.getFileById(doc.getId()).setTrashed(true);

  // 6) Log
  if (shLog) {
    const now = new Date();
    shLog.appendRow([
      Utilities.formatDate(now, Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm:ss'),
      data.RAGIONE_SOCIALE,
      pacchetto,
      data.DURATA_ANNI,
      prezzoPrimoAnno,
      prezzoRinnovo,
      data.MODALITA_PAGAMENTO,
      pdfFile.getUrl()
    ]);
  }
if (ghlRes && ghlRes.pendingDecision) {
  SpreadsheetApp.getUi().alert('PDF generato. Prima scegli cosa fare con la polizza già esistente.');
  return;
}
  SpreadsheetApp.getUi().alert('PDF GENERATO\n\n' + pdfFile.getUrl());
}

/********************* MACHINES *********************/
function readMachines_(shMac, data) {
  const lastRow = shMac.getLastRow();
  if (lastRow < 2) return [];

  // Ora leggiamo A-L (12 colonne)
  const range = shMac.getRange(2, 1, lastRow - 1, 12);
  const disp = range.getDisplayValues();

  const out = [];
  for (let i = 0; i < disp.length; i++) {
    const d = disp[i];

    const marca = safeStr_(d[1]);        // B
    const modello = safeStr_(d[2]);      // C
    const matricola = safeStr_(d[3]);    // D
    const tipologia = safeStr_(d[4]);    // E
    const alimentazione = safeStr_(d[6]); // G

    const ubicIntestazione = safeStr_(d[7]); // H
    const ubicVia = safeStr_(d[8]);          // I
    const ubicCitta = safeStr_(d[9]);        // J
    const ubicCap = normalizeCap_(d[10]);    // K
    const ubicProvincia = safeStr_(d[11]);   // L

    // Riga vuota
    if (!marca && !modello && !matricola && !tipologia && !alimentazione &&
        !ubicIntestazione && !ubicVia && !ubicCitta && !ubicCap && !ubicProvincia) continue;

    // Coerenza minima per considerarla una macchina valida
    if (!marca || !modello) continue;

    // Fallback ubicazione su sede legale se TUTTI i campi ubicazione sono vuoti
    const allUbicEmpty = !ubicIntestazione && !ubicVia && !ubicCitta && !ubicCap && !ubicProvincia;

    const finalUbic = allUbicEmpty ? {
      intestazione: safeStr_(data.RAGIONE_SOCIALE),
      via: safeStr_(data.INDIRIZZO_LEGALE),
      citta: safeStr_(data.COMUNE_LEGALE),
      cap: normalizeCap_(data.CAP_LEGALE),
      provincia: safeStr_(data.PROVINCIA_LEGALE)
    } : {
      intestazione: ubicIntestazione,
      via: ubicVia,
      citta: ubicCitta,
      cap: ubicCap,
      provincia: ubicProvincia
    };

    out.push({
      n: String(out.length + 1),
      marca,
      modello,
      matricola,
      tipologia,
      alimentazione,
      ubic_intestazione: finalUbic.intestazione,
      ubic_indirizzo_via: finalUbic.via,
      ubic_citta: finalUbic.citta,
      ubic_cap: finalUbic.cap,
      ubic_provincia: finalUbic.provincia
    });
  }

  return out;
}

function insertMacchineBlock_(body, machines) {
  const placeholder = findFirst_(body, '{{TABELLA_MACCHINE}}');
  if (!placeholder) return;

  const phEl = placeholder.getElement().asText();
  phEl.setText(phEl.getText().replace('{{TABELLA_MACCHINE}}', ''));

  const anchorPar = placeholder.getElement().getParent();
  const anchorIdx = body.getChildIndex(anchorPar);

  const title = body.insertParagraph(anchorIdx + 1, 'Dettaglio parco macchine cliente:');
  title.setBold(true);
  title.setSpacingAfter(6);

  const rows = [['N', 'Marca', 'Modello', 'Matricola', 'Tipologia']];
  machines.forEach(m => rows.push([m.n, m.marca, m.modello, m.matricola, m.tipologia]));

  const table = body.insertTable(anchorIdx + 2, rows);
  table.getRow(0).editAsText().setBold(false);

  for (let r = 0; r < table.getNumRows(); r++) {
    const row = table.getRow(r);
    for (let c = 0; c < row.getNumCells(); c++) {
      row.getCell(c).setPaddingTop(4).setPaddingBottom(4).setPaddingLeft(6).setPaddingRight(6);
    }
  }

  const after = body.insertParagraph(anchorIdx + 3, '');
  after.setSpacingBefore(4);
  after.setSpacingAfter(4);
}

/********************* PACKAGE DETAILS *********************/
function insertDettaglioPacchetto_(body, pacchetto) {
  const placeholder = findFirst_(body, '{{DETTAGLIO_PACCHETTO}}');
  if (!placeholder) return;

  const anchorPar = placeholder.getElement().getParent();
  const anchorIdx = body.getChildIndex(anchorPar);

  const phEl = placeholder.getElement().asText();
  phEl.setText(phEl.getText().replace('{{DETTAGLIO_PACCHETTO}}', ''));

  const details = getPacchettoDetails_(pacchetto);

  const h = body.insertParagraph(anchorIdx + 1, 'Cosa prevede il pacchetto ZeroGuasti ' + safeStr_(pacchetto) + ':');
  h.setBold(false);
  h.setSpacingAfter(6);

  details.forEach((item, i) => {
    const p = body.insertParagraph(anchorIdx + 2 + i, (i + 1) + '. ' + item);
    p.setBold(false);
    p.setSpacingAfter(2);
  });

  const spacer = body.insertParagraph(anchorIdx + 2 + details.length, '');
  spacer.setSpacingBefore(6);
  spacer.setSpacingAfter(6);
}

function getPacchettoDetails_(pacchetto) {
  const p = safeStr_(pacchetto).toUpperCase();

  if (p === 'LITE') {
    return [
      'Tagliando della macchina (manutenzione ordinaria e check up)',
      'Mano d’opera per le attività sopra descritte',
      'Diritto fisso di chiamata (uscita e tempo di viaggio)'
    ];
  }

  if (p === 'RELAX') {
    return [
      'Manutenzione ordinaria delle macchine',
      'Diritto fisso di chiamata',
      'Mano d’opera',
      'Sostituzione del materiale di consumo (come da elenco allegato)'
    ];
  }

  if (p === 'ALL_INCLUSIVE' || p === 'ALL INCLUSIVE') {
    return [
      'Manutenzione ordinaria delle macchine',
      'Diritto fisso di chiamata',
      'Mano d’opera',
      'Sostituzione del materiale di consumo (come da elenco allegato)',
      'Sostituzione o ripristino di qualsiasi pezzo danneggiato (batterie e carica batterie inclusi)',
      'Eventuali visite extra non programmate per interventi di assistenza',
      'Macchina sostitutiva in caso di fermo superiore a 3 giorni'
    ];
  }

  return [
    'Manutenzione ordinaria delle macchine',
    'Diritto fisso di chiamata',
    'Mano d’opera'
  ];
}

function manutenzioneNoteByPacchetto_(pacchetto) {
  const p = String(pacchetto || '').trim().toUpperCase();

  if (p === 'LITE') {
    return [
      'Pacchetto LITE',
      '- Tagliando (manutenzione ordinaria e check up)',
      '- Mano d’opera',
      '- Diritto fisso di chiamata (uscita e tempo viaggio)'
    ].join('\n');
  }

  if (p === 'RELAX') {
    return [
      'Pacchetto RELAX',
      '- Manutenzione ordinaria',
      '- Diritto fisso di chiamata',
      '- Mano d’opera',
      '- Materiale di consumo incluso (come da elenco allegato)'
    ].join('\n');
  }

  if (p === 'ALL_INCLUSIVE' || p === 'ALL INCLUSIVE') {
    return [
      'Pacchetto ALL INCLUSIVE',
      '- Manutenzione ordinaria',
      '- Diritto fisso di chiamata',
      '- Mano d’opera',
      '- Materiale di consumo incluso (come da elenco allegato)',
      '- Parti di ricambio incluse (batterie e caricabatterie inclusi)',
      '- Visite extra per assistenza incluse',
      '- Macchina sostitutiva se fermo > 3 giorni'
    ].join('\n');
  }

  // fallback
  return 'Manutenzione programmata ZeroGuasti';
}

/********************* MATERIALI CONSUMO *********************/
function insertMaterialiConsumo_(body, pacchetto, machines) {
  const placeholder = findFirst_(body, '{{MATERIALI_CONSUMO}}');
  if (!placeholder) return;

  const anchorPar = placeholder.getElement().getParent();
  const anchorIdx = body.getChildIndex(anchorPar);

  const phEl = placeholder.getElement().asText();
  phEl.setText(phEl.getText().replace('{{MATERIALI_CONSUMO}}', ''));

  const p = safeStr_(pacchetto).toUpperCase();
  if (p === 'LITE') return;

  const typesUsed = unique_(machines.map(m => safeStr_(m.tipologia)).filter(Boolean));
  const materialsByType = getMaterialsMap_();

  const title = body.insertParagraph(anchorIdx + 1, 'Lista del materiale di consumo incluso nel contratto:');
  title.setBold(false);
  title.setSpacingAfter(6);

  let cursor = anchorIdx + 2;

  typesUsed.forEach(tp => {
    const key = normalizeType_(tp);
    const spec = materialsByType[key];
    if (!spec) return;

    const tableData = buildCategoryTableData_(spec.title, spec.rows);
    const table = body.insertTable(cursor, tableData);

    const headerCell = table.getRow(0).getCell(0);
    headerCell.setBackgroundColor('#ECEAF8');
    headerCell.editAsText().setBold(true);
    headerCell.setVerticalAlignment(DocumentApp.VerticalAlignment.MIDDLE);
    headerCell.getParentRow().setMinimumHeight(28);
    headerCell.getChild(0).asParagraph().setAlignment(DocumentApp.HorizontalAlignment.CENTER);

    for (let r = 0; r < table.getNumRows(); r++) {
      const row = table.getRow(r);
      for (let c = 0; c < row.getNumCells(); c++) {
        const cell = row.getCell(c);
        cell.setPaddingTop(6).setPaddingBottom(6).setPaddingLeft(10).setPaddingRight(10);
        cell.editAsText().setBold(false);
        if (r === 0) continue;
        cell.getChild(0).asParagraph().setAlignment(DocumentApp.HorizontalAlignment.CENTER);
      }
    }

    const spacer = body.insertParagraph(cursor + 1, '');
    spacer.setSpacingBefore(10);
    spacer.setSpacingAfter(10);

    cursor += 2;
  });
}

function getMaterialsMap_() {
  return {
    LAVAPAVIMENTI: {
      title: 'Macchinari lavapavimenti',
      rows: [
        ['Gomme tergipavimenti', 'Spazzole nylon', 'Gomme paraspruzzi'],
        ['Tubo di scarico acqua sporca', 'Filtro acqua', 'Tubo di aspirazione']
      ]
    },
    MOTOSCOPA: {
      title: 'Motoscope / Spazzatrici',
      rows: [
        ['Spazzole laterali', 'Gomma flap', 'Rullo centrale'],
        ['Cinghie', 'Filtro gasolio', 'Filtri aspirazione']
      ]
    },
    ASPIRATORE: {
      title: 'Aspiratori industriali',
      rows: [
        ['Filtro polvere classico', 'Tubo flessibile completo', 'Bocchette e attacchi vari'],
        ['Ruote', 'Tubo rigido, prolunghe', 'Accessori vari (pennello, lancia...)']
      ]
    },
    IDROPULITRICE: {
      title: 'Idropulitrici',
      rows: [
        ['Filtro gasolio', 'Ugello (non rotante)', 'Pistola (impugnatura)', 'Kit valvoline (guarnizioni)']
      ]
    }
  };
}

function buildCategoryTableData_(title, rows) {
  const out = [];
  out.push([title]);
  rows.forEach(r => out.push(r));
  return out;
}

function normalizeType_(tp) {
  const t = safeStr_(tp).toUpperCase();
  if (t.includes('LAVAPAV')) return 'LAVAPAVIMENTI';
  if (t.includes('MOTOSCOP')) return 'MOTOSCOPA';
  if (t.includes('SPAZZ')) return 'MOTOSCOPA';
  if (t.includes('ASPIR')) return 'ASPIRATORE';
  if (t.includes('IDROP')) return 'IDROPULITRICE';
  return t.replace(/\s+/g, '');
}

/********************* PLACEHOLDERS *********************/
function replaceAllPlaceholders_(body, data) {
  Object.keys(data).forEach(k => {
    const val = data[k] === null || data[k] === undefined ? '' : String(data[k]);
    body.replaceText(escapeForReplaceText_('{{' + k + '}}'), val);
  });
}

function findFirst_(body, needle) {
  try {
    return body.findText(escapeForFindText_(needle));
  } catch (e) {
    try {
      return body.findText(needle);
    } catch (e2) {
      return null;
    }
  }
}

function escapeForFindText_(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function escapeForReplaceText_(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/********************* UTILS *********************/
function safeStr_(x) {
  if (x === null || x === undefined) return '';
  return String(x).trim();
}

function safeFileName_(s) {
  const x = safeStr_(s) || 'Cliente';
  return x.replace(/[\\/:*?"<>|]/g, '_').trim();
}

function normalizeCap_(x) {
  if (x === null || x === undefined) return '';
  // rimuove virgolette e tutto ciò che non è cifra
  const s = String(x).replace(/"/g, '').replace(/[^\d]/g, '').trim();
  return s;
}

function formatDate_(d) {
  if (!d) return '';
  try {
    return Utilities.formatDate(new Date(d), Session.getScriptTimeZone(), 'dd/MM/yyyy');
  } catch (e) {
    return safeStr_(d);
  }
}

function euro_(n) {
  if (!isNum_(n)) return '';
  return '€ ' + Number(n).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function isNum_(x) {
  if (x === '' || x === null || x === undefined) return false;
  return !isNaN(Number(x));
}

function unique_(arr) {
  const seen = {};
  const out = [];
  arr.forEach(x => {
    const k = String(x);
    if (!seen[k]) {
      seen[k] = true;
      out.push(x);
    }
  });
  return out;
}
function buildSezione3_(tacitoRinnovo) {
  const si = String(tacitoRinnovo || '').trim().toUpperCase() === 'SI';

  if (si) {
    return [
      'Il contratto ha durata pari a quanto indicato nella sezione riepilogativa ed ha decorrenza dalla data di sottoscrizione.',
      '',
      'Alla scadenza, il contratto si rinnova automaticamente e tacitamente per un periodo di pari durata, alle condizioni economiche vigenti al momento del rinnovo, salvo disdetta formale.',
      '',
      'In mancanza di disdetta nei termini indicati, il rinnovo si intende accettato senza riserve.'
    ].join('\n');
  }

return [
  'Il contratto ha durata pari a quanto indicato nella sezione riepilogativa ed ha decorrenza dalla data di sottoscrizione.',
  '',
  'Alla scadenza, il contratto cessa automaticamente senza rinnovo tacito.',
  '',
  'Eventuali proroghe o rinnovi dovranno essere concordati espressamente tra le parti e formalizzati per iscritto prima della scadenza.',
  '',
  'In caso di rinnovo o proroga, le condizioni economiche del servizio saranno oggetto di nuova valutazione in base alla situazione esistente al momento del rinnovo, tenendo conto di eventuali variazioni dei costi, del mercato e delle condizioni operative. Pertanto, non e garantito il mantenimento delle condizioni economiche precedentemente applicate.',
  '',
  'Resta ferma la possibilita di comunicare eventuali variazioni o richieste esclusivamente in forma scritta mediante PEC oppure raccomandata A/R.'
].join('\n');
}
function buildRigaPrezzoRinnovo_(tacitoRinnovo, prezzoRinnovoNumero) {
  const si = String(tacitoRinnovo || '').trim().toUpperCase() === 'SI';
  if (!si) return '';

  // Qui decidi tu il testo esatto, io ti metto quello che hai detto
  return 'Prezzo di rinnovo dall’anno successivo: ' + euro_(prezzoRinnovoNumero) + ' + iva';
}
function insertRiepilogoContratto_(body, data, tacitoRinnovo, prezzoRinnovoNumero) {
  const ph = findFirst_(body, '{{RIEPILOGO_CONTRATTO}}');
  if (!ph) return;

  const si = String(tacitoRinnovo || '').trim().toUpperCase() === 'SI';

  // Rimuove placeholder
  const phText = ph.getElement().asText();
  phText.setText(phText.getText().replace('{{RIEPILOGO_CONTRATTO}}', ''));

  const anchorPar = ph.getElement().getParent();
  const anchorIdx = body.getChildIndex(anchorPar);

  // Titolo
  const title = body.insertParagraph(anchorIdx + 1, 'Riepilogo dati contratto:');
  title.setBold(true);
  title.setSpacingAfter(8);

  // Tabella 3 righe x 2 colonne (sempre piena, niente vuoti)
  const row1Left = 'Prezzo totale per il primo anno di servizio:\n' + safeStr_(data.TOTALE_PRIMO_ANNO);
const row1Right = si
  ? ('Prezzo di rinnovo dall’anno successivo:\n' + euro_(prezzoRinnovoNumero) + ' + iva')
  : '';

  const row2Left = 'Numero complessivo di macchine a contratto:\n' + safeStr_(data.NUMERO_MACCHINE);
  const row2Right = 'Frequenza visite programmate:\n' + safeStr_(data.FREQUENZA_VISITE);

  const row3Left = 'Durata del contratto: ' + safeStr_(data.DURATA_ANNI) + ' anni';
  const row3Right = 'Data di stipula: ' + safeStr_(data.DATA_STIPULA) +
    '\nDecorrenza del contratto: dalla data di stipula';

  const rows = [
    [row1Left, row1Right],
    [row2Left, row2Right],
    [row3Left, row3Right]
  ];

  const tbl = body.insertTable(anchorIdx + 2, rows);
  styleRiepilogoTable_(tbl);

  // Box pagamento sotto
  const pagamentoText = 'Modalità di pagamento: ' + safeStr_(data.MODALITA_PAGAMENTO);
  const payTable = body.insertTable(anchorIdx + 3, [[pagamentoText]]);
  styleBoxSingleCell_(payTable);

  body.insertParagraph(anchorIdx + 4, '').setSpacingBefore(4).setSpacingAfter(4);
}

function styleBoxSingleCell_(table) {
  try { table.setBorderWidth(1); } catch (e) {}

  const cell = table.getRow(0).getCell(0);
  cell.setPaddingTop(8).setPaddingBottom(8).setPaddingLeft(10).setPaddingRight(10);
  cell.editAsText().setBold(false);

  try {
    cell.getChild(0).asParagraph().setAlignment(DocumentApp.HorizontalAlignment.LEFT);
  } catch (e) {}
}

function styleRiepilogoTable_(table) {
  try { table.setBorderWidth(1); } catch (e) {}

  // Stile celle
  for (var r = 0; r < table.getNumRows(); r++) {
    const row = table.getRow(r);
    for (var c = 0; c < row.getNumCells(); c++) {
      const cell = row.getCell(c);
      cell.setPaddingTop(14).setPaddingBottom(14).setPaddingLeft(12).setPaddingRight(12);

      const t = cell.editAsText();
      t.setBold(false);

      try {
        cell.getChild(0).asParagraph().setAlignment(DocumentApp.HorizontalAlignment.LEFT);
      } catch (e) {}
    }
  }

  // Corsivo solo sulla seconda riga della cella "Data stipula" (ultima riga, colonna destra)
  try {
    const lastRow = table.getRow(table.getNumRows() - 1);
    const rightCellText = lastRow.getCell(1).editAsText();
    const full = rightCellText.getText();
    const idx = full.indexOf('\n');
    if (idx !== -1) {
      rightCellText.setItalic(idx + 1, full.length - 1, true);
    }
  } catch (e) {}
}










/******************* NUOVO CODICE DI COMUNICAZIONE CON GO HIGH LEVEL ***********************/










/******************* GHL INTEGRAZIONE (BLOCCO UNICO) *******************/

/*************** GHL CONFIG **************/
const GHL_API_BASE = 'https://services.leadconnectorhq.com';
// Custom Objects schemaKey (da icona </> in Settings > Objects)
const GHL_OBJECT_SCHEMA_POLIZZA = 'custom_objects.polizze_zeroguasti';
const GHL_OBJECT_SCHEMA_MACCHINA = 'custom_objects.macchine';
// IMPORTANT: qui serve lo schemaKey (da icona </> nell’oggetto Manutenzioni), non l’ID numerico in URL
const GHL_OBJECT_SCHEMA_MANUTENZIONE = 'custom_objects.manutenzioni';

// Associazioni: le recuperiamo via API e poi le cacheiamo
let GHL_ASSOC_CACHE = null;
const GHL_LOCATION_ID = '1bGiZVWGmBXC547iyprs';
const ASSOC_CONTACT_POLIZZA = '696909e3aed8590cd46529ba';
const ASSOC_POLIZZA_MACCHINA = '6969102208b96eedd8bef538';
const ASSOC_CONTACT_MACCHINA = '696920265e23b2b683ba17b2';
const ASSOC_POLIZZA_MANUTENZIONE = '6980a0c11ae8b1941e4b44b1';
const ASSOC_MANUTENZIONE_MACCHINA = '6980a03d1ae8b158e54b3570';
const ASSOC_CONTACT_MANUTENZIONE = '6989de298d7400f676d5fce5';
const GHL_CONTACT_TAG = 'zeroguasti';

/*************** PUSH MAIN **************/
function pushToGHL_ZeroGuasti_({ data, pdfUrl, shLog }) {
  const stamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm:ss');

  const logLine = (msg) => {
    if (DEBUG_LOG) Logger.log(msg);
    // non scrive piu sul foglio LOG
  };

  try {
    logLine('START');

     if (!GHL_API_BASE) throw new Error('Manca GHL_API_BASE');
  const apiKey = getGhlApiKey_();
  if (!apiKey) throw new Error('GHL API key non disponibile (Script Properties).');
  if (!GHL_LOCATION_ID) throw new Error('Manca GHL_LOCATION_ID');

    // 1) Upsert contatto (NO locationId nel body)
    logLine('Upsert contact');
    const contactId = ghlUpsertContact_({
  companyName: safeStr_(data.RAGIONE_SOCIALE),
  email: safeStr_(data.EMAIL),
  phone: safeStr_(data.CELLULARE || data.TELEFONO),
  firstName: extractFirstName_(data.FIRMATARIO) || safeStr_(data.RAGIONE_SOCIALE),
  lastName: extractLastName_(data.FIRMATARIO),

  // meglio mettere nello standard address1 solo la via
  address1: safeStr_(data.INDIRIZZO_LEGALE),

  // custom fields (quelli che ti servono)
  partitaIva: safeStr_(data.PARTITA_IVA),
  codiceFiscale: safeStr_(data.CODICE_FISCALE),

  indirizzoLegale: safeStr_(data.INDIRIZZO_LEGALE),
  capLegale: safeStr_(data.CAP_LEGALE),
  comuneLegale: safeStr_(data.COMUNE_LEGALE),      // mi hai detto: contact.comune_legale
  provinciaLegale: safeStr_(data.PROVINCIA_LEGALE)
});
    logLine('Contact OK: ' + contactId);

    // 1b) Tag automatico
    if (GHL_CONTACT_TAG) {
      logLine('Apply tag: ' + GHL_CONTACT_TAG);
      const tagRes = ghlApplyTagSafe_({ contactId, tag: GHL_CONTACT_TAG, logLine });
      if (tagRes === 'SKIPPED') logLine('Tag SKIPPED (endpoint non disponibile)');
      else logLine('Tag OK');
    }

    // non usiamo piu pipeline/opportunity

logLine('DONE');
return { contactId };

  } catch (e) {
    logLine('ERROR: ' + (e && e.message ? e.message : String(e)));
    throw e;
  }
}

/********************* CONTACT HELPERS *********************/
function ghlUpsertContact_({
  companyName, email, phone, firstName, lastName, address1,
  partitaIva, codiceFiscale,
  indirizzoLegale, capLegale, comuneLegale, provinciaLegale
}) {

  // Mappa ID reali custom fields GHL
  const GHL_CF_ID = {
    'contact.provincia_legale': '3gERycYrAkwXM1QOOT4f',
    'contact.indirizzo_legale': 'VXylcqAcTxiNvKXm0zZK',
    'contact.cap_legale': 'X78txebixmNgD6ZYq23W',
    'contact.comune_legale': 'jMyCd2JztffmGzzFhogz',
    'contact.partita_iva': 'yKrCtTLiEEgmqPrWlWns',
    'contact.codice_fiscale': 'zgC0URRmDrQgkf1G9s0m'
  };

  let existing = null;

  if (email) existing = ghlFindContact_({ query: email, email });
  if (!existing && phone) existing = ghlFindContact_({ query: phone, phone });
  if (!existing && partitaIva) {
    existing = ghlFindContactByCustomField_({
      query: String(partitaIva),
      fieldId: GHL_CF_ID['contact.partita_iva'],
      value: String(partitaIva).trim()
    });
  }

// Il create contatto richiede locationId nel body (nel tuo account)
const payload = cleanPayload_({
  name: companyName,
  companyName,
  email,
  phone,
  firstName,
  lastName,
  address1,

  // Opzione B (customFields con ID)
  customFields: [
    { id: GHL_CF_ID['contact.partita_iva'], key: 'contact.partita_iva', field_value: String(partitaIva || '').trim() },
    { id: GHL_CF_ID['contact.codice_fiscale'], key: 'contact.codice_fiscale', field_value: String(codiceFiscale || '').trim() },

    { id: GHL_CF_ID['contact.indirizzo_legale'], key: 'contact.indirizzo_legale', field_value: String(indirizzoLegale || '').trim() },
    { id: GHL_CF_ID['contact.cap_legale'], key: 'contact.cap_legale', field_value: String(capLegale || '').trim() },
    { id: GHL_CF_ID['contact.comune_legale'], key: 'contact.comune_legale', field_value: String(comuneLegale || '').trim() },
    { id: GHL_CF_ID['contact.provincia_legale'], key: 'contact.provincia_legale', field_value: String(provinciaLegale || '').trim() }
  ].filter(x => x.field_value !== '')
});

  if (existing && existing.id) {
    const updated = ghlRequest_({
      method: 'put',
      path: '/contacts/' + encodeURIComponent(existing.id),
      payload
    });
    return (updated && updated.contact && updated.contact.id) ? updated.contact.id : existing.id;
  }

  const created = ghlRequest_({
  method: 'post',
  path: '/contacts/',
  payload: Object.assign({}, payload, { locationId: String(GHL_LOCATION_ID) })
});

  if (!created || !created.contact || !created.contact.id) {
    throw new Error('Creazione contatto fallita: ' + JSON.stringify(created));
  }
  return created.contact.id;
}

function ghlFindContact_({ query, email, phone }) {
  const res = ghlRequest_({
    method: 'get',
    path: '/contacts/?query=' + encodeURIComponent(query)
  });

  const contacts = (res && res.contacts) ? res.contacts : (Array.isArray(res) ? res : []);
  if (!Array.isArray(contacts) || !contacts.length) return null;

  if (email) {
    const hit = contacts.find(c => String(c.email || '').toLowerCase() === String(email).toLowerCase());
    if (hit) return hit;
  }

  if (phone) {
    const pNorm = normalizePhone_(phone);
    const hit = contacts.find(c => normalizePhone_(c.phone) === pNorm);
    if (hit) return hit;
  }

  return contacts[0] || null;
}

function ghlFindContactByCustomField_({ query, fieldId, value }) {
  const res = ghlRequest_({
    method: 'get',
    path: '/contacts/?query=' + encodeURIComponent(String(query || ''))
  });

  const contacts = (res && res.contacts) ? res.contacts : (Array.isArray(res) ? res : []);
  if (!Array.isArray(contacts) || !contacts.length) return null;

  const target = String(value || '').trim();

  // molti payload GHL riportano i customFields come array {id, value} o {id, field_value}
  const hit = contacts.find(c => {
    const arr = c.customFields || c.customField || c.custom_fields || [];
    if (!Array.isArray(arr)) return false;
    const f = arr.find(x => String(x.id || x.customFieldId || '') === String(fieldId));
    if (!f) return false;
    const v = String(f.value || f.field_value || '').trim();
    return v === target;
  });

  return hit || null;
}

/********************* TAG HELPERS (SAFE) *********************/
function ghlApplyTagSafe_({ contactId, tag, logLine }) {
  const payloadA = cleanPayload_({ tags: [String(tag)] });

  try {
    ghlRequest_({
      method: 'post',
      path: '/contacts/' + encodeURIComponent(contactId) + '/tags',
      payload: payloadA
    });
    return 'OK';
  } catch (e1) {
    const msg1 = (e1 && e1.message) ? String(e1.message) : String(e1);

    try {
      ghlRequest_({
        method: 'post',
        path: '/tags/apply',
        payload: cleanPayload_({
          contactId: String(contactId),
          tags: [String(tag)]
        })
      });
      return 'OK';
    } catch (e2) {
      const msg2 = (e2 && e2.message) ? String(e2.message) : String(e2);
      if (logLine) logLine('Tag WARN: ' + msg1 + ' | ' + msg2);
      return 'SKIPPED';
    }
  }
}

/********************* PIPELINE / STAGE *********************/
function ghlGetFirstStageId_({ pipelineId }) {
  const res = ghlRequest_({
    method: 'get',
    path: '/opportunities/pipelines/'
  });

  const pipelines = res && (res.pipelines || res.data || res);
  if (!pipelines || !Array.isArray(pipelines)) {
    throw new Error('Non trovo pipelines via API: ' + JSON.stringify(res));
  }

  const p = pipelines.find(x => String(x.id) === String(pipelineId));
  if (!p) throw new Error('Pipeline ID non trovata: ' + pipelineId);

  const stages = p.stages || [];
  if (!stages.length) throw new Error('La pipeline non ha stages');
  return stages[0].id;
}

/********************* OPPORTUNITY (UPSERT, NO DUPLICATI + RETRY locationId) *********************/
/*
  Alcuni account GHL vogliono locationId nel BODY per /opportunities/upsert (e ignorano query/header).
  Altri invece lo rifiutano nel body.

  Strategia:
  1) Provo UPSERT senza locationId nel body
  2) Se ricevo 422 "locationId can't be undefined", ritento aggiungendo locationId nel body
  3) Se ricevo 422 "property locationId should not exist", torno senza locationId
*/

function ghlUpsertOpportunity_({ pipelineId, stageId, contactId, name, monetaryValue, source }) {
  const money = isFinite(monetaryValue) ? monetaryValue : 0;

  const base = cleanPayload_({
    pipelineId: String(pipelineId),
    pipelineStageId: String(stageId),
    contactId: String(contactId),
    name: String(name || ''),
    status: 'open',
    monetaryValue: money,
    source: source || ''
  });

  // 1) primo tentativo senza locationId nel body
  try {
    const res = ghlRequest_({
      method: 'post',
      path: '/opportunities/upsert',
      payload: base
    });
    return extractOppIdFromRes_(res);
  } catch (e1) {
    const msg1 = (e1 && e1.message) ? String(e1.message) : String(e1);

    // 2) se manca locationId, ritento con locationId nel body
    if (msg1.indexOf("locationId can't be undefined") !== -1) {
      try {
        const withLoc = cleanPayload_(Object.assign({}, base, { locationId: String(GHL_LOCATION_ID) }));
        const res2 = ghlRequest_({
          method: 'post',
          path: '/opportunities/upsert',
          payload: withLoc
        });
        return extractOppIdFromRes_(res2);
      } catch (e2) {
        const msg2 = (e2 && e2.message) ? String(e2.message) : String(e2);

        // 3) se questo endpoint in questo account NON vuole locationId nel body, riprovo senza
        if (msg2.indexOf('property locationId should not exist') !== -1) {
          const res3 = ghlRequest_({
            method: 'post',
            path: '/opportunities/upsert',
            payload: base
          });
          return extractOppIdFromRes_(res3);
        }

        throw e2;
      }
    }

    // se e un altro errore, rilancio
    throw e1;
  }
}

function extractOppIdFromRes_(res) {
  const oppId =
    (res && res.opportunity && res.opportunity.id) ? res.opportunity.id :
    (res && res.opportunity && res.opportunity._id) ? res.opportunity._id :
    (res && res.opportunityId) ? res.opportunityId :
    (res && res.id) ? res.id :
    null;

  if (!oppId) throw new Error('Upsert opportunita fallito: ' + JSON.stringify(res));
  return oppId;
}

function extractConflictingRecordIdFromError_(msg) {
  const s = String(msg || '');

  // 1) regex diretta
  let m = s.match(/"conflictingRecordId"\s*:\s*"([^"]+)"/i);
  if (m && m[1]) return String(m[1]);

  // 2) se nel messaggio c’è un JSON finale, provo a parsarlo
  const m2 = s.match(/\{[\s\S]*\}$/);
  if (m2 && m2[0]) {
    try {
      const j = JSON.parse(m2[0]);
      if (j && j.conflictingRecordId) return String(j.conflictingRecordId);
      if (j && j.errors && j.errors[0] && j.errors[0].conflictingRecordId) return String(j.errors[0].conflictingRecordId);
    } catch (e) {}
  }

  // 3) alcune risposte hanno errors array dentro
  try {
    const j2 = JSON.parse(s);
    if (j2 && j2.errors && j2.errors[0] && j2.errors[0].conflictingRecordId) return String(j2.errors[0].conflictingRecordId);
  } catch (e) {}

  return '';
}

function ghlResolveFieldKeyFull_(schemaKey, fieldKeyMaybeShortOrFull) {
  const schema = ghlGetObjectSchema_(schemaKey);
  const by = schema && schema.byFieldKey ? schema.byFieldKey : {};

  const raw = String(fieldKeyMaybeShortOrFull || '').trim();
  if (!raw) return '';

  const prefix = String(schemaKey) + '.';

  // Se mi arriva già full, provo a usarla
  if (raw.indexOf(prefix) === 0) return raw;

  // Provo a cercare nel byFieldKey sia short che full
  const shortKey = raw.indexOf(prefix) === 0 ? raw.substring(prefix.length) : raw;

  // Se esiste un campo mappato su shortKey, recupero la sua fieldKey full
  const f = by[shortKey] || by[prefix + shortKey];
  if (f && (f.fieldKey || f.key)) return String(f.fieldKey || f.key);

  // fallback
  return prefix + shortKey;
}

/********************* END OPPORTUNITY *********************/

/********************* NOTE (SAFE) *********************/
function ghlCreateNoteOnOpportunitySafe_({ opportunityId, body, logLine }) {
  try {
    ghlRequest_({
      method: 'post',
      path: '/opportunities/' + encodeURIComponent(opportunityId) + '/notes',
      payload: cleanPayload_({ body })
    });
    return 'OK';
  } catch (e1) {
    const msg1 = (e1 && e1.message) ? String(e1.message) : String(e1);
    if (msg1.indexOf(' 401') !== -1 || msg1.toLowerCase().indexOf('not authorized') !== -1) {
      return 'SKIPPED_401';
    }

    try {
      ghlRequest_({
        method: 'post',
        path: '/notes/',
        payload: cleanPayload_({
          body,
          association: { type: 'opportunity', id: opportunityId }
        })
      });
      return 'OK';
    } catch (e2) {
      const msg2 = (e2 && e2.message) ? String(e2.message) : String(e2);
      if (msg2.indexOf(' 401') !== -1 || msg2.toLowerCase().indexOf('not authorized') !== -1) {
        return 'SKIPPED_401';
      }
      if (logLine) logLine('Note ERROR: ' + msg2);
      throw e2;
    }
  }
}

function ghlRequest_({ method, path, payload }) {
  if (!GHL_API_BASE) throw new Error('Manca GHL_API_BASE');
  if (!GHL_LOCATION_ID) throw new Error('Manca GHL_LOCATION_ID');

  const apiKey = getGhlApiKey_();

  const m = String(method || 'GET').toUpperCase();
  const p0 = String(path || '');

  const headers = {
    Authorization: 'Bearer ' + apiKey,
    Version: '2021-07-28',
    locationId: String(GHL_LOCATION_ID),
    'Content-Type': 'application/json',
    Accept: 'application/json'
  };

  const doFetch = (url, options) => {
    const resp = UrlFetchApp.fetch(url, options);
    const code = resp.getResponseCode();
    const text = resp.getContentText();
    let json;
    try { json = text ? JSON.parse(text) : {}; } catch (e) { json = { raw: text }; }
    return { code, text, json };
  };

  const baseOptions = {
    method: m,
    muteHttpExceptions: true,
    headers,
    contentType: 'application/json'
  };

  const isWrite = !!(payload && (m === 'POST' || m === 'PUT' || m === 'PATCH'));

  const isObjectsCreate =
    isWrite &&
    p0.indexOf('/objects/') === 0 &&
    p0.indexOf('/records') !== -1;

  const isAssociationsRelationsCreate =
    isWrite &&
    p0.indexOf('/associations/relations') === 0;

  const finalPath = addLocationIdToPathOnlyWhenNeeded_(p0, GHL_LOCATION_ID, m);
  const urlA = GHL_API_BASE + finalPath;

  // Tentativo A: header locationId
  const optA = Object.assign({}, baseOptions);
  if (isWrite) optA.payload = JSON.stringify(Object.assign({}, payload || {}));

  const rA = doFetch(urlA, optA);
  if (rA.code >= 200 && rA.code < 300) return rA.json;

  const msgA = rA.text || '';

  const locationMustNotExist =
    msgA.toLowerCase().indexOf('property locationid should not exist') !== -1;

  // Se rifiuta locationId nel body, riprovo togliendolo dal payload (solo per objects create e relations create)
  if ((isObjectsCreate || isAssociationsRelationsCreate) && locationMustNotExist && isWrite) {
    const payloadNoLoc = Object.assign({}, payload || {});
    delete payloadNoLoc.locationId;

    const optNoLoc = Object.assign({}, baseOptions, { payload: JSON.stringify(payloadNoLoc) });
    const rNoLoc = doFetch(urlA, optNoLoc);
    if (rNoLoc.code >= 200 && rNoLoc.code < 300) return rNoLoc.json;

    throw new Error('GHL API error ' + rNoLoc.code + ' | ' + m + ' ' + urlA + ' | ' + rNoLoc.text);
  }

  const wantsLocation =
    msgA.indexOf('LocationId is not specified') !== -1 ||
    msgA.indexOf('locationId is not specified') !== -1 ||
    msgA.toLowerCase().indexOf('locationid should not be empty') !== -1 ||
    msgA.toLowerCase().indexOf('locationid must be a string') !== -1 ||
    msgA.toLowerCase().indexOf("locationid can't be undefined") !== -1;

  // Tentativo B: se dice che manca locationId, lo aggiungo nel body (solo per objects create e relations create)
  if ((isObjectsCreate || isAssociationsRelationsCreate) && wantsLocation && isWrite) {
    const payloadB = Object.assign({ locationId: String(GHL_LOCATION_ID) }, payload || {});
    const optB = Object.assign({}, baseOptions, { payload: JSON.stringify(payloadB) });
    const rB = doFetch(urlA, optB);
    if (rB.code >= 200 && rB.code < 300) return rB.json;

    throw new Error('GHL API error ' + rB.code + ' | ' + m + ' ' + urlA + ' | ' + rB.text);
  }

  // Errore non gestito dai retry
  throw new Error('GHL API error ' + rA.code + ' | ' + m + ' ' + urlA + ' | ' + rA.text);
}


function addLocationIdToPathOnlyWhenNeeded_(path, locationId, method) {
  const raw = String(path || '');
  const p = raw.startsWith('/') ? raw : ('/' + raw);
  const m = String(method || 'GET').toUpperCase();

  // OBJECTS: locationId in query per GET + PUT + PATCH (alcuni account lo pretendono)
  // POST resta senza query (in genere si gestisce via header o body)
  if (p.indexOf('/objects/') === 0) {
    if (m === 'GET' || m === 'PUT' || m === 'PATCH') return addLocationIdToPath_(p, locationId);
    return p;
  }

  // ASSOCIATIONS
  if (p.indexOf('/associations') === 0) {
    if (m === 'GET') return addLocationIdToPath_(p, locationId);
    return p;
  }

  // CONTACTS
  if (p.indexOf('/contacts') === 0) {
    if (m === 'GET') return addLocationIdToPath_(p, locationId);
    return p;
  }

  if (p.indexOf('/opportunities/pipelines') === 0 && m === 'GET') {
    return addLocationIdToPath_(p, locationId);
  }

  return p;
}

function addLocationIdToPath_(path, locationId) {
  const p = String(path || '');
  const loc = encodeURIComponent(String(locationId || '').trim());
  if (!loc) return p;

  if (/\blocationId=/.test(p)) return p;
  if (p.indexOf('?') === -1) return p + '?locationId=' + loc;
  return p + '&locationId=' + loc;
}

function getRecProp_(record, schemaKey, fieldShortOrFull) {
  const r = record || {};
  const props = r.properties || (r.record && r.record.properties) || {};
  if (!props) return '';

  const shortKey = ghlResolveFieldKeyShort_(schemaKey, fieldShortOrFull);
  const fullKey = String(schemaKey) + '.' + shortKey;

  // prova: short
  if (props.hasOwnProperty(shortKey)) return props[shortKey];

  // prova: full
  if (props.hasOwnProperty(fullKey)) return props[fullKey];

  // fallback: alcuni payload ritornano direttamente flat
  if (r.hasOwnProperty(shortKey)) return r[shortKey];
  if (r.hasOwnProperty(fullKey)) return r[fullKey];

  return '';
}

/********************* UTILS *********************/
function cleanPayload_(obj) {
  const out = {};
  Object.keys(obj || {}).forEach(k => {
    const v = obj[k];
    if (v === null || v === undefined) return;
    if (typeof v === 'string' && v.trim() === '') return;
    out[k] = v;
  });
  return out;
}

function normalizePhone_(p) {
  if (!p) return '';
  return String(p).replace(/[^\d+]/g, '');
}

function normalizePhoneE164_(raw, defaultCountryCode) {
  const s = safeStr_(raw);
  if (!s) return '';

  let p = s.replace(/[^\d+]/g, '');

  if (p.startsWith('00')) p = '+' + p.substring(2);

  if (p.startsWith('+')) {
    p = '+' + p.substring(1).replace(/[^\d]/g, '');
    return p.length > 1 ? p : '';
  }

  const cc = String(defaultCountryCode || '39').replace(/[^\d]/g, '') || '39';
  p = p.replace(/[^\d]/g, '');
  if (!p) return '';

  return '+' + cc + p;
}

function extractFirstName_(full) {
  const s = safeStr_(full);
  if (!s) return '';
  const parts = s.split(/\s+/).filter(Boolean);
  return parts[0] || '';
}

function extractLastName_(full) {
  const s = safeStr_(full);
  if (!s) return '';
  const parts = s.split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return '';
  return parts.slice(1).join(' ');
}

function parseEuroToNumber_(value) {
  if (value === null || value === undefined) return 0;
  const s = String(value);
  const cleaned = s.replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.');
  const n = Number(cleaned);
  return isNaN(n) ? 0 : n;
}

function formatDateISO_(d) {
  if (!d) return '';

  // Caso: Date object vero
  if (Object.prototype.toString.call(d) === '[object Date]' && !isNaN(d.getTime())) {
    return Utilities.formatDate(d, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }

  const s = String(d).trim();
  if (!s) return '';

  // Caso: già ISO yyyy-mm-dd (o yyyy-mm-ddThh:mm:ss)
  const isoMatch = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) return isoMatch[0];

  // Caso: dd/MM/yyyy oppure dd-MM-yyyy
  const m = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (m) {
    const dd = String(m[1]).padStart(2, '0');
    const mm = String(m[2]).padStart(2, '0');
    const yyyy = String(m[3]);
    return `${yyyy}-${mm}-${dd}`;
  }

  // Fallback: provo Date parsing, ma senza fidarmi troppo
  try {
    const dt = new Date(s);
    if (!isNaN(dt.getTime())) {
      return Utilities.formatDate(dt, Session.getScriptTimeZone(), 'yyyy-MM-dd');
    }
  } catch (e) {}

  return '';
}

function freqToMonths_(freqLabel) {
  const f = String(freqLabel || '').trim().toLowerCase();

  if (f.includes('mens')) return 1;
  if (f.includes('bimes')) return 2;
  if (f.includes('trimes')) return 3;
  if (f.includes('quadrimes')) return 4;
  if (f.includes('semes')) return 6;
  if (f.includes('ann')) return 12;

  // fallback prudente
  return 12;
}

function firstOfMonthIso_(dateObj) {
  const d = new Date(dateObj.getTime());
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return Utilities.formatDate(d, Session.getScriptTimeZone(), 'yyyy-MM-dd');
}

function addMonths_(dateObj, months) {
  const d = new Date(dateObj.getTime());
  const day = d.getDate();

  d.setMonth(d.getMonth() + Number(months || 0));

  // protezione fine mese
  if (d.getDate() !== day) d.setDate(0);
  return d;
}

/*
  Genera tutte le date previste (ISO) al giorno 1 del mese,
  a partire dal primo slot successivo alla stipula.
  Esempio: stipula 2026-01-15, trimestrale -> 2026-04-01, 2026-07-01, 2026-10-01, ...
*/
function computeMaintenanceDates_(startIso, freqMonths, durataAnni, firstOffsetMonths) {
  const start = new Date(String(startIso || '').trim());
  if (isNaN(start.getTime())) return [];

  const months = Number(freqMonths || 12);
  const years = Number(durataAnni || 1);
  const offset = Number(firstOffsetMonths || 1);

  if (!isFinite(months) || months <= 0) return [];
  if (!isFinite(years) || years <= 0) return [];
  if (!isFinite(offset) || offset < 0) return [];

  const totalMonths = years * 12;
  const totalVisits = Math.floor(totalMonths / months);

  // Base: primo giorno del mese della stipula
  let cursor = new Date(start.getTime());
  cursor.setDate(1);
  cursor.setHours(0, 0, 0, 0);

  // Prima manutenzione: offset personalizzato
  cursor = addMonths_(cursor, offset);
  cursor.setDate(1);
  cursor.setHours(0, 0, 0, 0);

  const out = [];
  for (let i = 0; i < totalVisits; i++) {
    out.push(Utilities.formatDate(cursor, Session.getScriptTimeZone(), 'yyyy-MM-dd'));
    cursor = addMonths_(cursor, months);
    cursor.setDate(1);
    cursor.setHours(0, 0, 0, 0);
  }

  return out;
}

function setIfFound_(out, schemaKey, containsArr, value) {
  const fk = ghlFindFieldKeyByContains_(schemaKey, containsArr);
  if (!fk) return;

  if (value === null || value === undefined) return;

  // Se è numero valido, NON convertirlo in stringa
  if (typeof value === 'number' && isFinite(value)) {
    out[fk] = value;
    return;
  }

  // Se è booleano, idem
  if (typeof value === 'boolean') {
    out[fk] = value;
    return;
  }

  // Altrimenti stringa
  const v = String(value).trim();
  if (v) out[fk] = v;
}

function pushToGHL_ZeroGuasti_Full_({ data, pdfUrl, machines, logSheet }) {
  const stamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm:ss');
    const logLine = (msg) => {
    if (DEBUG_LOG) Logger.log(msg);
    // non scrive piu sul foglio LOG
  };

  if (!GHL_OBJECT_SCHEMA_POLIZZA || String(GHL_OBJECT_SCHEMA_POLIZZA).indexOf('INCOLLA_') === 0) {
    throw new Error('Manca GHL_OBJECT_SCHEMA_POLIZZA (schemaKey oggetto Polizze ZeroGuasti)');
  }
  if (!GHL_OBJECT_SCHEMA_MACCHINA || String(GHL_OBJECT_SCHEMA_MACCHINA).indexOf('INCOLLA_') === 0) {
    throw new Error('Manca GHL_OBJECT_SCHEMA_MACCHINA (schemaKey oggetto Macchine)');
  }
  if (!GHL_OBJECT_SCHEMA_MANUTENZIONE || String(GHL_OBJECT_SCHEMA_MANUTENZIONE).indexOf('INCOLLA_') === 0) {
  throw new Error('Manca GHL_OBJECT_SCHEMA_MANUTENZIONE (schemaKey oggetto Manutenzioni)');
}

  logLine('START FULL');

  // 1) Contatto + tag
  const base = pushToGHL_ZeroGuasti_({ data, pdfUrl, shLog: logSheet });
const contactId = base.contactId;

  // 2) Crea record POLIZZA
  logLine('Create POLIZZA record');


const polPayload = buildPolizzaPayload_(data, pdfUrl, contactId);

const fkCodiceUnivoco =
  ghlFindFieldKeyByLabelContains_(GHL_OBJECT_SCHEMA_POLIZZA, ['codice', 'univoco']) ||
  'codice_univoco_polizza';

// Creo la POLIZZA. Se c'è conflitto (già esistente) apro la decisione.
let polizzaRecordId = '';

try {
  polizzaRecordId = ghlCreateObjectRecord_({
    schemaKey: GHL_OBJECT_SCHEMA_POLIZZA,
    payload: polPayload
  });
} catch (e) {
  const msg = String(e && e.message ? e.message : e);
  const conflictingId = extractConflictingRecordIdFromError_(msg);

  const isConflict =
    msg.indexOf('primary_property_conflict') !== -1 ||
    msg.indexOf('duplicate_record') !== -1 ||
    !!conflictingId;

  if (isConflict && conflictingId) {
    setPendingPolizza_({
      data: data,
      pdfUrl: pdfUrl,
      machines: machines,
      contactId: contactId,
      polPayload: polPayload,
      fkCodiceUnivoco: fkCodiceUnivoco,
      existingPolizzaId: conflictingId
    });

    openPolizzaDecisionDialog_();
    logLine('STOP: in attesa decisione utente su polizza esistente');
    return { pendingDecision: true };
  }

  throw e;
}

logLine('POLIZZA OK: ' + polizzaRecordId);

  // 3) Crea record MACCHINE
  logLine('Create MACCHINE records: ' + (machines ? machines.length : 0));
  const macchinaIds = [];
  (machines || []).forEach((m, idx) => {
    const recId = ghlUpsertObjectRecord_({
  schemaKey: GHL_OBJECT_SCHEMA_MACCHINA,
  payload: buildMacchinaPayload_(m, data, idx)
});
    macchinaIds.push(recId);
  });
  logLine('MACCHINE OK: ' + macchinaIds.length);

  // 4) Relazioni (solo dopo che ho TUTTI gli ID)
logLine('Link CONTACT <-> POLIZZA');
const rel1 = ghlCreateRelationTryBoth_({
  associationId: ASSOC_CONTACT_POLIZZA,
  a: contactId,
  b: polizzaRecordId
});
logLine('REL contact-polizza RES: ' + JSON.stringify(rel1));

logLine('Link POLIZZA -> MACCHINE');
macchinaIds.forEach(mid => {
  ghlCreateRelation_({
    associationId: ASSOC_POLIZZA_MACCHINA,
    firstRecordId: mid,
    secondRecordId: polizzaRecordId
  });
});

logLine('Link CONTACT -> MACCHINE');
macchinaIds.forEach(mid => {
  const r = ghlCreateRelation_({
    associationId: ASSOC_CONTACT_MACCHINA,
    firstRecordId: contactId,
    secondRecordId: mid
  });
  logLine('REL contact-macchina RES: ' + JSON.stringify(r));
});

// Prima di ricreare: pulizia manutenzioni future "Da programmare" (idempotente)
try {
  deleteFutureManutenzioniDaProgrammareByCodicePolizza_({ data, logLine });
} catch (e) {
  logLine('WARN deleteFutureManutenzioni failed: ' + String(e && e.message ? e.message : e));
}

// 5) Crea manutenzioni programmate (tutte subito) e collegale a polizza + macchine + contatto
logLine('Create MANUTENZIONI programmate');
const manutIds = createManutenzioniForPolizza_({
  data,
  polizzaRecordId,
  macchinaIds,
  contactId,
  logLine
});
logLine('MANUTENZIONI OK: ' + (manutIds ? manutIds.length : 0));
return { pendingDecision: false };

} // FINE pushToGHL_ZeroGuasti_Full_

function resumeGhlAfterDecision_(pending, action) {
  const logLine = (msg) => { if (DEBUG_LOG) Logger.log(msg); };

  const data = pending.data;
  const pdfUrl = pending.pdfUrl;
  const machines = pending.machines || [];
  const contactId = pending.contactId;

  let polPayload = pending.polPayload;
  const fkCodiceUnivoco = pending.fkCodiceUnivoco;
  const existingPolizzaId = pending.existingPolizzaId;

  let polizzaRecordId = '';

  // 1) Decidi polizzaRecordId in base alla scelta
  if (action === 'update') {
    const body = buildObjectCreateBody_(GHL_OBJECT_SCHEMA_POLIZZA, polPayload, { mode: 'short' });
    const props = Object.assign({}, body.properties);

    const res = ghlRequest_({
      method: 'PUT',
      path: '/objects/' + encodeURIComponent(String(GHL_OBJECT_SCHEMA_POLIZZA)) + '/records/' + encodeURIComponent(existingPolizzaId),
      payload: { properties: props }
    });

    polizzaRecordId =
      (res && res.record && (res.record.id || res.record._id)) ? (res.record.id || res.record._id) :
      existingPolizzaId;

    logLine('Polizza aggiornata: ' + polizzaRecordId);
  }

  if (action === 'new') {
    const newCode = String(polPayload[fkCodiceUnivoco] || '') + '_' + Date.now();
    polPayload = Object.assign({}, polPayload);
    polPayload[fkCodiceUnivoco] = newCode;

    polizzaRecordId = ghlUpsertObjectRecordByUniqueProperty_({
      schemaKey: GHL_OBJECT_SCHEMA_POLIZZA,
      payload: polPayload,
      uniqueKey: fkCodiceUnivoco
    });

    logLine('Polizza nuova creata: ' + polizzaRecordId);
  }

  if (!polizzaRecordId) {
    throw new Error('polizzaRecordId vuoto dopo decisione: ' + action);
  }

  // 2) MACCHINE: crea/upsert e ottieni ids
  logLine('Create/Upsert MACCHINE after decision: ' + machines.length);
  const macchinaIds = [];
  machines.forEach((m, idx) => {
    const recId = ghlUpsertObjectRecord_({
      schemaKey: GHL_OBJECT_SCHEMA_MACCHINA,
      payload: buildMacchinaPayload_(m, data, idx)
    });
    macchinaIds.push(recId);
  });
  logLine('MACCHINE OK: ' + macchinaIds.length);

  // 3) RELAZIONI
  logLine('Link CONTACT <-> POLIZZA');
ghlCreateRelationTryBoth_({
  associationId: ASSOC_CONTACT_POLIZZA,
  a: contactId,
  b: polizzaRecordId
});

  logLine('Link POLIZZA -> MACCHINE');
  macchinaIds.forEach(mid => {
    ghlCreateRelation_({
      associationId: ASSOC_POLIZZA_MACCHINA,
      firstRecordId: mid,
      secondRecordId: polizzaRecordId
    });
  });

  logLine('Link CONTACT -> MACCHINE');
  macchinaIds.forEach(mid => {
    ghlCreateRelation_({
      associationId: ASSOC_CONTACT_MACCHINA,
      firstRecordId: contactId,
      secondRecordId: mid
    });
  });

  // 4) DELETE manutenzioni future "Da programmare" (idempotente)
  try {
    deleteFutureManutenzioniDaProgrammareByCodicePolizza_({ data, logLine });
  } catch (e) {
    logLine('WARN deleteFutureManutenzioni failed: ' + String(e && e.message ? e.message : e));
  }

  // 5) CREA manutenzioni + relazioni (POLIZZA<->MANUT, MANUT<->MAC)
  logLine('Create MANUTENZIONI programmate after decision');
  const manutIds = createManutenzioniForPolizza_({
    data,
    polizzaRecordId,
    macchinaIds,
    contactId,
    logLine
  });
  logLine('MANUTENZIONI OK: ' + (manutIds ? manutIds.length : 0));

  SpreadsheetApp.getActive().toast('Operazione completata su GHL. Polizza ID: ' + polizzaRecordId, 'ZeroGuasti', 8);
}


function ensureFullObjectProperties_(schemaKey, props) {
  const out = {};
  const prefix = String(schemaKey) + '.';

  Object.keys(props || {}).forEach(k => {
    const v = props[k];
    const ks = String(k);

    // gia full
    if (ks.indexOf(prefix) === 0) {
      out[ks] = v;
      return;
    }

    // se e' una short key (niente punti), la trasformo in full
    if (ks.indexOf('.') === -1) {
      out[prefix + ks] = v;
      return;
    }

    // altro con punti, lascio com'e'
    out[ks] = v;
  });

  return out;
}

function ghlCreateObjectRecord_({ schemaKey, payload }) {
  // costruisco sempre short keys
  const body = buildObjectCreateBody_(schemaKey, payload, { mode: 'short' });

  // copio props così posso eliminare solo quelle invalide
  let props = Object.assign({}, body.properties);

  for (let attempt = 0; attempt < 8; attempt++) {
   const tryBody = {
  properties: props
};

    try {
      Logger.log('CREATE OBJECT body (short): ' + JSON.stringify(tryBody, null, 2));

      const res = ghlRequest_({
        method: 'POST',
        path: '/objects/' + encodeURIComponent(schemaKey) + '/records',
        payload: tryBody
      });

      const id =
        (res && res.record && (res.record.id || res.record._id)) ? (res.record.id || res.record._id) :
        (res && (res.id || res._id)) ? (res.id || res._id) :
        null;

      if (!id) throw new Error('Create object record fallito: ' + JSON.stringify(res));
      return id;

    } catch (e) {
      const msg = String(e && e.message ? e.message : e);

      // estrae la key invalida dal messaggio GHL
      const m = msg.match(/Invalid key in properties\s+([a-zA-Z0-9_.-]+)/i);
      if (m && m[1]) {
        const badKey = String(m[1]).trim();

        // NON eliminare mai il required
        if (badKey === 'zeroguasti') throw e;

        if (props.hasOwnProperty(badKey)) {
          Logger.log('REMOVE invalid property key: ' + badKey);
          delete props[badKey];
          continue;
        }
      }

      throw e;
    }
  }

  throw new Error('Create object record fallito dopo retry: ' + JSON.stringify(body));
}

function ghlUpsertObjectRecord_({ schemaKey, payload }) {
  // properties short
  const body = buildObjectCreateBody_(schemaKey, payload, { mode: 'short' });
  const props = Object.assign({}, body.properties);

  // 1) Provo CREATE sempre
  try {
    return ghlCreateObjectRecord_({ schemaKey, payload });
  } catch (e) {
    const msg = String(e && e.message ? e.message : e);

    // 2) Fallback: qualunque conflitto che espone conflictingRecordId -> UPDATE
    const conflictingId = extractConflictingRecordIdFromError_(msg);

    const isConflict =
      msg.indexOf('primary_property_conflict') !== -1 ||
      msg.indexOf('duplicate_record') !== -1 ||
      !!conflictingId;

    if (isConflict) {
      const existingId = conflictingId;
      if (!existingId) {
        throw new Error('Conflitto record ma non trovo conflictingRecordId: ' + msg);
      }

      if (DEBUG_LOG) Logger.log('UPSERT: conflitto record, aggiorno -> ' + existingId);

      const res = ghlRequest_({
        method: 'PUT',
        path: '/objects/' + encodeURIComponent(String(schemaKey)) + '/records/' + encodeURIComponent(existingId),
        payload: { properties: props }
      });

      const id =
        (res && res.record && (res.record.id || res.record._id)) ? (res.record.id || res.record._id) :
        (res && (res.id || res._id)) ? (res.id || res._id) :
        existingId;

      return String(id);
    }

    // altro errore: rilancio
    throw e;
  }
}

function ghlUpsertObjectRecordByUniqueProperty_({ schemaKey, payload, uniqueKey }) {
  const uniqKey = String(uniqueKey || '').trim();
  const uniqVal = payload ? payload[uniqKey] : '';
  const propsBody = buildObjectCreateBody_(schemaKey, payload, { mode: 'short' });
  const props = Object.assign({}, propsBody.properties);

  // Se ho una chiave unica valorizzata, cerco prima
  if (uniqKey && uniqVal) {
    const existingId = ghlFindObjectRecordIdByProperty_(schemaKey, uniqKey, uniqVal);
    if (existingId) {
      if (DEBUG_LOG) Logger.log('UPSERT VERO: trovato record esistente per ' + uniqKey + '=' + uniqVal + ' -> ' + existingId);

      const res = ghlRequest_({
        method: 'PUT',
        path: '/objects/' + encodeURIComponent(String(schemaKey)) + '/records/' + encodeURIComponent(existingId),
        payload: { properties: props }
      });

      const id =
        (res && res.record && (res.record.id || res.record._id)) ? (res.record.id || res.record._id) :
        (res && (res.id || res._id)) ? (res.id || res._id) :
        existingId;

      return String(id);
    }
  }

  // Altrimenti fallback al tuo comportamento attuale
  return ghlUpsertObjectRecord_({ schemaKey, payload });
}

function firstOfCurrentMonthIso_() {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return Utilities.formatDate(d, Session.getScriptTimeZone(), 'yyyy-MM-dd');
}

function ghlDeleteObjectRecord_({ schemaKey, recordId }) {
  return ghlRequest_({
    method: 'delete',
    path: '/objects/' + encodeURIComponent(String(schemaKey)) + '/records/' + encodeURIComponent(String(recordId))
  });
}

function ghlSearchObjectRecords_({ schemaKey, fieldFullKey, operator, value, pageLimit }) {
  const path = '/objects/' + encodeURIComponent(String(schemaKey)) + '/records/search';

  const raw = String(fieldFullKey || '').trim();
  if (!raw) return [];

  const prefix = String(schemaKey) + '.';

  // preparo sia short che full
  const fieldShort = raw.indexOf(prefix) === 0 ? raw.substring(prefix.length) : raw;
  const fieldFull = raw.indexOf(prefix) === 0 ? raw : (prefix + raw);

  const doSearch = (fieldName) => {
    const payload = {
      page: 1,
      pageLimit: pageLimit || 100,
      filters: [{ field: String(fieldName), operator: String(operator), value: String(value) }]
    };

    const res = ghlRequest_({ method: 'post', path, payload });

    return (res && Array.isArray(res.records)) ? res.records :
           (res && res.data && Array.isArray(res.data.records)) ? res.data.records :
           (res && res.data && Array.isArray(res.data.items)) ? res.data.items :
           (res && Array.isArray(res.items)) ? res.items :
           [];
  };

  // Tentativo 1: short
  try {
    return doSearch(fieldShort);
  } catch (e1) {
    const msg = String(e1 && e1.message ? e1.message : e1).toLowerCase();

    // Se GHL dice invalid field, ritento col FULL
    if (msg.includes('invalid field')) {
      try {
        return doSearch(fieldFull);
      } catch (e2) {
        if (DEBUG_LOG) Logger.log('WARN search failed (short+full): ' + String(e2 && e2.message ? e2.message : e2));
        return [];
      }
    }

    throw e1;
  }
}

/**
 * Cancella SOLO le manutenzioni con stato "Da programmare" per la polizza corrente.
 * Non filtra per data, non tocca nessun altro stato.
 */
function deleteFutureManutenzioniDaProgrammareByCodicePolizza_({ data, logLine }) {
  const schemaKey = GHL_OBJECT_SCHEMA_MANUTENZIONE;

  let fkCodiceUniv =
    ghlFindFieldKeyByLabelContains_(schemaKey, ['codice', 'univoco']) ||
    ghlFindFieldKeyByContains_(schemaKey, ['codice', 'univoco']) ||
    '';

  let fkStato =
    ghlFindFieldKeyByLabelContains_(schemaKey, ['stato']) ||
    ghlFindFieldKeyByContains_(schemaKey, ['stato']) ||
    '';

  fkCodiceUniv = ghlResolveFieldKeyShort_(schemaKey, fkCodiceUniv);
  fkStato = ghlResolveFieldKeyShort_(schemaKey, fkStato);

  if (!fkCodiceUniv || !fkStato) {
    if (logLine) logLine('WARN: key manutenzioni non risolte (codice/stato). Skip delete.');
    return 0;
  }

  const codicePol = makeCodiceUnivocoPolizza_(data);
  const prefix = String(codicePol) + '|';

  const statoDaProgKey = ghlOptionKeyFromLabel_(schemaKey, fkStato, 'Da programmare');

  // 1) LIST + FILTER (niente search)
  const all = ghlListAllObjectRecordsSafe_({ schemaKey, pageLimit: 100, maxPages: 20 }); // fino a 2000 record
  const records = ghlFilterRecordsByPrefix_(all, schemaKey, fkCodiceUniv, prefix);

  if (logLine) logLine('DELETE scan manutenzioni match prefix=' + prefix + ' found=' + records.length);

  let deleted = 0;

  (records || []).forEach(r => {
    const id = String(r.id || r._id || (r.record && (r.record.id || r.record._id)) || '');
    if (!id) return;

    const statoValRaw = getRecProp_(r, schemaKey, fkStato);

    let statoVal = '';
    if (statoValRaw && typeof statoValRaw === 'object') {
      statoVal = String(statoValRaw.key || statoValRaw.value || statoValRaw.label || '').trim();
    } else {
      statoVal = String(statoValRaw || '').trim();
    }

    const statoLow = statoVal.toLowerCase();

    const isDaProgrammare =
      (statoDaProgKey && statoVal === String(statoDaProgKey)) ||
      (statoLow === 'da programmare') ||
      (statoLow.includes('da programmare'));

    if (!isDaProgrammare) return;

    try {
      if (logLine) logLine('DELETE manutenzione id=' + id + ' stato=' + statoVal);
      ghlDeleteObjectRecord_({ schemaKey, recordId: id });
      deleted++;
    } catch (e) {
      if (logLine) logLine('WARN delete manutenzione fail id=' + id + ' err=' + String(e && e.message ? e.message : e));
    }
  });

  if (logLine) logLine('DELETE done deleted=' + deleted);
  return deleted;
}

function ghlListObjectRecords_({ schemaKey, pageLimit, maxPages }) {
  const out = [];
  const limit = Number(pageLimit || 100);
  const pages = Number(maxPages || 10);

  for (let page = 1; page <= pages; page++) {
    const path =
      '/objects/' + encodeURIComponent(String(schemaKey)) +
      '/records/search';

    // alcuni account accettano filters vuoto, altri vogliono almeno un array
    const payload = {
      page: page,
      pageLimit: limit,
      filters: []
    };

    const res = ghlRequest_({ method: 'post', path, payload });

    const records =
      (res && Array.isArray(res.records)) ? res.records :
      (res && res.data && Array.isArray(res.data.records)) ? res.data.records :
      (res && res.data && Array.isArray(res.data.items)) ? res.data.items :
      (res && Array.isArray(res.items)) ? res.items :
      [];

    if (!records.length) break;

    out.push.apply(out, records);

    if (records.length < limit) break;
  }

  return out;
}

/************ POLIZZA: FIND + UPDATE (NO DUPLICATI) ************/

function normalizeCmp_(x) {
  return String(x || '').trim().toLowerCase();
}

/*
  Cerca un record in un Custom Object in base a una property (short key).
  Esempio: schemaKey=custom_objects.polizze_zeroguasti, propKeyShort=zeroguasti, value="CBS SRL|2026-01-01|LITE"
  Ritorna recordId oppure ''.
*/
function ghlFindObjectRecordIdByProperty_(schemaKey, propKeyShort, value) {
  const target = String(value || '').trim();
  if (!target) return '';

  let short = ghlResolveFieldKeyShort_(schemaKey, propKeyShort) || String(propKeyShort || '').trim();
if (short && short.indexOf('.') !== -1) short = short.split('.').pop(); // prende solo l'ultima parte
if (!short) {
  if (DEBUG_LOG) Logger.log('WARN search skipped: field not found in schema -> ' + propKeyShort);
  return '';
}

  const full = String(schemaKey) + '.' + short;
  const path = '/objects/' + encodeURIComponent(String(schemaKey)) + '/records/search';

  const trySearch = (fieldName) => {
    const payload = {
      page: 1,
      pageLimit: 100,
      filters: [{ field: String(fieldName), operator: 'eq', value: target }]
    };
    if (DEBUG_LOG) Logger.log('SEARCH ' + schemaKey + ' field=' + fieldName + ' value=' + target);
    const res = ghlRequest_({ method: 'post', path, payload });

    const records =
      (res && Array.isArray(res.records)) ? res.records :
      (res && res.data && Array.isArray(res.data.records)) ? res.data.records :
      (res && res.data && Array.isArray(res.data.items)) ? res.data.items :
      (res && Array.isArray(res.items)) ? res.items :
      [];

    if (!records.length) return '';
    const r = records[0] || {};
    return String(r.id || r._id || (r.record && (r.record.id || r.record._id)) || '');
  };

  try {
    // Tentativo 1: short
    return trySearch(short);
  } catch (e1) {
    const msg = String(e1 && e1.message ? e1.message : e1);

    // Se GHL dice invalid field, riprovo col FULL
    if (msg.toLowerCase().includes('invalid field')) {
      try {
        return trySearch(full);
      } catch (e2) {
        if (DEBUG_LOG) Logger.log('WARN search failed (short+full): ' + String(e2 && e2.message ? e2.message : e2));
        return '';
      }
    }

    if (DEBUG_LOG) Logger.log('WARN search records failed: ' + msg);
    return '';
  }
}

function buildObjectCreateBody_(schemaKey, payload, { mode }) {
  const schemaPrefix = String(schemaKey) + '.';
  const props = {};

  Object.keys(payload || {}).forEach(k => {
    const v = payload[k];
    if (v === null || v === undefined) return;

    const ks = String(k).trim();
    if (!ks) return;

    if (mode === 'full') {
      const fullKey = (ks.indexOf(schemaPrefix) === 0) ? ks : (schemaPrefix + ks);
      props[fullKey] = v;
    } else {
      const shortKey = (ks.indexOf(schemaPrefix) === 0) ? ks.substring(schemaPrefix.length) : ks;
      props[shortKey] = v;
    }
  });

  return {
  properties: props
};
}

function ghlCreateRelation_({ associationId, firstRecordId, secondRecordId }) {
  try {
    return ghlRequest_({
      method: 'post',
      path: '/associations/relations',
      payload: {
        associationId: String(associationId),
        firstRecordId: String(firstRecordId),
        secondRecordId: String(secondRecordId)
      }
    });
  } catch (e) {
    const msg = String(e && e.message ? e.message : e).toLowerCase();

    // duplicate relation -> lo considero successo
    if (msg.includes('duplicate relation')) {
      if (DEBUG_LOG) Logger.log('RELATION already exists, skip: assoc=' + associationId);
      return { skipped: true, reason: 'duplicate_relation' };
    }

    throw e;
  }
}

function ghlCreateRelationTryBoth_({ associationId, a, b }) {
  try {
    return ghlCreateRelation_({
      associationId: associationId,
      firstRecordId: a,
      secondRecordId: b
    });
  } catch (e1) {
    const msg1 = String(e1 && e1.message ? e1.message : e1).toLowerCase();

    // provo invertito
    try {
      return ghlCreateRelation_({
        associationId: associationId,
        firstRecordId: b,
        secondRecordId: a
      });
    } catch (e2) {
      const msg2 = String(e2 && e2.message ? e2.message : e2).toLowerCase();

      // se uno dei due era "duplicate relation", consideriamo ok
      if (msg1.includes('duplicate relation') || msg2.includes('duplicate relation')) {
        return { skipped: true, reason: 'duplicate_relation' };
      }
      throw e2;
    }
  }
}

function ghlGetAssociationsCached_() {
  if (GHL_ASSOC_CACHE) return GHL_ASSOC_CACHE;

  let res = null;

  // provo prima con slash finale
  try {
    res = ghlRequest_({ method: 'get', path: '/associations/' });
  } catch (e1) {
    const msg1 = String(e1 && e1.message ? e1.message : e1);
    // se per qualunque motivo non va, riprovo senza slash
    res = ghlRequest_({ method: 'get', path: '/associations' });
  }

  const list =
    (res && Array.isArray(res.associations)) ? res.associations :
    (res && Array.isArray(res.data)) ? res.data :
    (Array.isArray(res)) ? res :
    null;

  if (!list) throw new Error('Formato associations inatteso: ' + JSON.stringify(res));
  GHL_ASSOC_CACHE = list;
  return list;
}

/*
  Questa funzione prova a trovare l’associazione anche se i campi cambiano nome.
  Matcha per:
  - objectKey testuale (contact / custom_objects.xxx)
  - oppure schemaKey (quello lungo) se GHL lo riporta come firstObjectId/secondObjectId
*/
function ghlFindAssociationIdSmart_(associations, a, b) {
  const A = String(a);
  const B = String(b);

  const hit = (associations || []).find(x => {
    const fKey = String(x.firstObjectKey || x.firstObject || x.firstObjectType || '');
    const sKey = String(x.secondObjectKey || x.secondObject || x.secondObjectType || '');
    const fId = String(x.firstObjectId || x.firstObjectSchemaKey || '');
    const sId = String(x.secondObjectId || x.secondObjectSchemaKey || '');

    const matchKey =
      (fKey === A && sKey === B) || (fKey === B && sKey === A);

    const matchId =
      (fId === A && sId === B) || (fId === B && sId === A);

    return matchKey || matchId;
  });

  return hit ? (hit.id || hit._id || null) : null;
}

function buildPolizzaPayload_(data, pdfUrl, contactId) {
  const schemaKey = GHL_OBJECT_SCHEMA_POLIZZA;
  const out = {};

  // 1) Codice univoco deterministico (sempre uguale se i campi base sono uguali)
  const codiceUnivoco = makeCodiceUnivocoPolizza_(data);

  // Questo è il tuo nuovo campo unique/primary in GHL
  out['codice_univoco_polizza'] = codiceUnivoco;

  // 2) Se vuoi che "il nome" della polizza sia solo il cliente (come dicevi)
  // Mantengo anche il campo zeroguasti con la ragione sociale (se esiste nello schema)
  out['zeroguasti'] = safeStr_(data.RAGIONE_SOCIALE);

  // 3) Se hai un campo dedicato tipo "Identificativo polizza", puoi duplicare lo stesso valore
  const fkIdentPol =
    ghlFindFieldKeyByContains_(schemaKey, ['codice', 'univ']) ||
    ghlFindFieldKeyByLabelContains_(schemaKey, ['codice', 'univoco']);

  if (fkIdentPol) out[fkIdentPol] = codiceUnivoco;

  // Referente assistenze (2 campi singoli)
  const nomeRef = safeStr_(data.NOME_INCARICATO || '');
  const cognomeRef = safeStr_(data.COGNOME_INCARICATO || '');

  const fkNomeRef =
    ghlFindFieldKeyByContains_(schemaKey, ['nome', 'refer', 'assist']) ||
    ghlFindFieldKeyByContains_(schemaKey, ['nome', 'refer']) ||
    'nome_referente_assistenze';

  const fkCognomeRef =
    ghlFindFieldKeyByContains_(schemaKey, ['cognome', 'refer', 'assist']) ||
    ghlFindFieldKeyByContains_(schemaKey, ['cognome', 'refer']) ||
    'cognome_referente_assistenze';

  if (nomeRef) out[fkNomeRef] = nomeRef;
  if (cognomeRef) out[fkCognomeRef] = cognomeRef;

  // Recapito referente assistenze
  const telRef = normalizePhoneE164_(data.TELEFONO_INCARICATO, '39');
  setIfFound_(out, schemaKey, ['recap', 'refer'], telRef);
  setIfFound_(out, schemaKey, ['numero', 'refer'], telRef);

  // CODICE UNIVOCO (single line)
  const fkCodiceUnivoco =
    ghlFindFieldKeyByLabelContains_(schemaKey, ['codice', 'univoco']) ||
    'codice_univoco_polizza';

  out[fkCodiceUnivoco] = codiceUnivoco;

  // POLIZZA ZEROGUASTI (select)
  const fkPolizzaZG =
    ghlFindFieldKeyByLabelContains_(schemaKey, ['polizza', 'zeroguasti']) ||
    ghlFindFieldKeyByContains_(schemaKey, ['polizza_zeroguasti']) ||
    'polizza_zeroguasti';

  const labelPacchetto = safeStr_(data.PACCHETTO);
  const polizzaKey = ghlOptionKeyFromLabel_(schemaKey, fkPolizzaZG, labelPacchetto);
  if (polizzaKey) out[fkPolizzaZG] = polizzaKey;

  // Data inizio contratto (date)
  setIfFound_(out, schemaKey, ['data', 'inizio'], safeStr_(data.DATA_STIPULA_ISO));

  // Durata contratto (anni) (numero)
  const durataRaw = String(data.DURATA_ANNI || '').replace(/"/g, '').trim();
  const durata = Number(durataRaw.replace(',', '.'));
  if (!isNaN(durata) && durata > 0) {
    setIfFound_(out, schemaKey, ['durata', 'anni'], durata);
    setIfFound_(out, schemaKey, ['durata', 'contr'], durata);
  }

  // Frequenza intervento (select)
  const fkFreq = ghlFindFieldKeyByContains_(schemaKey, ['frequenz']);
  if (fkFreq) {
    const freqLabel = safeStr_(data.FREQUENZA_VISITE);
    const freqKey = ghlOptionKeyFromLabel_(schemaKey, fkFreq, freqLabel);
    if (freqKey) out[fkFreq] = freqKey;
  }

  // Tacito rinnovo (dropdown single: option key si / no)
  const fkTacito =
    ghlFindFieldKeyByContains_(schemaKey, ['tacito', 'rinn']) ||
    'tacito_rinnovo';

  const tac = String(data.TACITO_RINNOVO || '').trim().toLowerCase();
  if (tac === 'si' || tac === 'sì' || tac === 'yes' || tac === 'true' || tac === '1') out[fkTacito] = 'si';
  if (tac === 'no' || tac === 'false' || tac === '0') out[fkTacito] = 'no';

  return cleanPayload_(out);
}

/*
  Crea un codice alfanumerico stabile (deterministico) basato su:
  - ragione sociale
  - data stipula ISO
  - pacchetto normalizzato
  - numero macchine
  - durata anni
  Se questi valori sono uguali, il codice sarà uguale.
*/
function makeCodiceUnivocoPolizza_(data) {
  const base = [
    safeStr_(data.RAGIONE_SOCIALE).toUpperCase(),
    safeStr_(data.DATA_STIPULA_ISO),
    normalizePacchettoKey_(data.PACCHETTO),
    safeStr_(data.NUMERO_MACCHINE),
    safeStr_(data.DURATA_ANNI)
  ].join('|');

  const hex = digestHex_(base);           // 64 chars
  const short = hex.substring(0, 12).toUpperCase(); // 12 chars
  return 'ZG' + short;                    // esempio: ZG3F9A12BC44D0
}

function digestHex_(str) {
  const bytes = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    str,
    Utilities.Charset.UTF_8
  );

  let hex = '';
  for (var i = 0; i < bytes.length; i++) {
    var b = bytes[i];
    if (b < 0) b += 256;
    var h = b.toString(16);
    if (h.length === 1) h = '0' + h;
    hex += h;
  }
  return hex;
}

function splitNomeCognome_(full) {
  const s = safeStr_(full);
  if (!s) return { nome: '', cognome: '' };

  const parts = s.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return { nome: parts[0], cognome: '' };

  return {
    nome: parts[0],
    cognome: parts.slice(1).join(' ')
  };
}

function normalizePacchettoKey_(p) {
  const x = String(p || '').trim().toUpperCase();
  if (x === 'ALL INCLUSIVE') return 'ALL_INCLUSIVE';
  if (x === 'ALL_INCLUSIVE') return 'ALL_INCLUSIVE';
  if (x === 'RELAX') return 'RELAX';
  if (x === 'LITE') return 'LITE';
  // fallback
  return x || 'LITE';
}

function buildMacchinaPayload_(m, data, idx) {
  const schemaKey = GHL_OBJECT_SCHEMA_MACCHINA;
  const out = {};

  // Identificativo macchina
  const identBase = [m.marca, m.modello, m.matricola || ('ROW' + (idx + 1))]
    .map(x => String(x || '').trim())
    .filter(Boolean)
    .join(' | ');
  const ident = identBase || ('MAC-' + Date.now() + '-' + (idx + 1));

  const fkIdent =
    ghlFindFieldKeyByContains_(schemaKey, ['ident', 'mac']) ||
    'identificativo_macchina';

  out[fkIdent] = ident;

  // Campi singoli dati macchina
  const fkMarca =
    ghlFindFieldKeyByContains_(schemaKey, ['marca']) ||
    'marca';

  const fkModello =
    ghlFindFieldKeyByContains_(schemaKey, ['modello']) ||
    'modello';

  const fkMatricola =
    ghlFindFieldKeyByContains_(schemaKey, ['matricola']) ||
    'matricola';

  if (m.marca) out[fkMarca] = safeStr_(m.marca);
  if (m.modello) out[fkModello] = safeStr_(m.modello);
  if (m.matricola) out[fkMatricola] = safeStr_(m.matricola);

  // Tipologia (dropdown)
  const fkTipologia =
    ghlFindFieldKeyByContains_(schemaKey, ['tipolog']) ||
    'tipologia_di_macchina';

  if (m.tipologia) {
    const optionKey =
      ghlOptionKeyFromLabel_(schemaKey, fkTipologia, m.tipologia) ||
      mapTipologiaToOptionKey_(m.tipologia);
    out[fkTipologia] = optionKey;
  }

  // Alimentazione (dropdown)
  const fkAlim =
    ghlFindFieldKeyByContains_(schemaKey, ['alimentaz']) ||
    'alimentazione';

  if (m.alimentazione) {
    const alimKey =
      ghlOptionKeyFromLabel_(schemaKey, fkAlim, m.alimentazione) ||
      safeStr_(m.alimentazione);
    out[fkAlim] = alimKey;
  }

  // Ubicazione macchina (campi separati)
  const fkUbicInt =
    ghlFindFieldKeyByContains_(schemaKey, ['ubicazione', 'intest']) ||
    'ubicazione_macchina_intestazione_indirizzo';

  const fkVia =
    ghlFindFieldKeyByContains_(schemaKey, ['indirizzo', 'via']) ||
    'indirizzo_via';

  const fkCitta =
    ghlFindFieldKeyByContains_(schemaKey, ['citt']) ||
    'citta';

  const fkCap =
    ghlFindFieldKeyByContains_(schemaKey, ['cap']) ||
    'cap';

  const fkProv =
    ghlFindFieldKeyByContains_(schemaKey, ['provincia']) ||
    'provincia';

  const ubicInt = safeStr_(m.ubic_intestazione);
  const via = safeStr_(m.ubic_indirizzo_via);
  const citta = safeStr_(m.ubic_citta);

const capStr = normalizeCap_(m.ubic_cap);
const capNum = capStr ? Number(capStr) : null;

if (DEBUG_LOG) Logger.log('DEBUG CAP raw=' + JSON.stringify(m.ubic_cap) + ' norm=' + JSON.stringify(capStr) + ' num=' + JSON.stringify(capNum));

const prov = safeStr_(m.ubic_provincia);

if (ubicInt) out[fkUbicInt] = ubicInt;
if (via) out[fkVia] = via;
if (citta) out[fkCitta] = citta;

// QUI cambia: mando un numero, non una stringa
if (capNum !== null && isFinite(capNum)) out[fkCap] = capNum;
if (DEBUG_LOG) Logger.log('DEBUG payload cap typeof=' + typeof out[fkCap] + ' value=' + out[fkCap]);

if (prov) out[fkProv] = prov;

if (DEBUG_LOG) Logger.log(
  'DEBUG MACCHINA keys -> ident=' + fkIdent +
  ' marca=' + fkMarca +
  ' modello=' + fkModello +
  ' matricola=' + fkMatricola +
  ' tip=' + fkTipologia +
  ' alim=' + fkAlim +
  ' ubicInt=' + fkUbicInt +
  ' via=' + fkVia +
  ' citta=' + fkCitta +
  ' cap=' + fkCap +
  ' prov=' + fkProv
);

  return cleanPayload_(out);
}

function buildManutenzionePayload_(data, polizzaRecordId, mesePrevistoIso) {
  const schemaKey = GHL_OBJECT_SCHEMA_MANUTENZIONE;
  const out = {};

  // Campo principale "Cliente" (nel tuo oggetto è Primary Display Field Name)
  // Mettiamo ragione sociale e mese, così è leggibile in lista
  const cliente = safeStr_(data.RAGIONE_SOCIALE);
   const label = cliente || 'Manutenzione';

  // Provo a trovare la key del primary field (nel tuo caso è "Cliente")
  // Se non la trova, uso 'cliente' come fallback
  const fkCliente =
    ghlFindFieldKeyByLabelContains_(schemaKey, ['cliente']) ||
    ghlFindFieldKeyByContains_(schemaKey, ['cliente']) ||
    'cliente';

  out[fkCliente] = label;

  // Stato = "Da programmare" (dropdown)
  const fkStato =
    ghlFindFieldKeyByLabelContains_(schemaKey, ['stato']) ||
    ghlFindFieldKeyByContains_(schemaKey, ['stato']) ||
    'stato';

  const statoKey = ghlOptionKeyFromLabel_(schemaKey, fkStato, 'Da programmare');
  if (statoKey) out[fkStato] = statoKey;

  // Mese previsto (date)
  const fkMesePrev =
    ghlFindFieldKeyByLabelContains_(schemaKey, ['mese', 'prev']) ||
    ghlFindFieldKeyByContains_(schemaKey, ['mese', 'prev']) ||
    'mese_previsto';

  out[fkMesePrev] = String(mesePrevistoIso);

  // Se esiste un campo "Codice univoco" sulla manutenzione, lo valorizziamo per evitare duplicati
  let fkCodiceUniv =
  ghlFindFieldKeyByLabelContains_(schemaKey, ['codice', 'univoco']) ||
  ghlFindFieldKeyByContains_(schemaKey, ['codice', 'univoco']) ||
  '';

fkCodiceUniv = ghlResolveFieldKeyShort_(schemaKey, fkCodiceUniv);

if (fkCodiceUniv) {
  out[fkCodiceUniv] = String(makeCodiceUnivocoPolizza_(data) + '|' + mesePrevistoIso);
} else {
  // se manca, meglio loggare e accettare duplicati temporaneamente
  if (DEBUG_LOG) Logger.log('WARN: fkCodiceUniv manutenzione non trovato, codice univoco non settato');
}
// NOTE manutenzione (riepilogo pacchetto)
const noteTxt = manutenzioneNoteByPacchetto_(data.PACCHETTO);

// prova a trovare un campo note (es: note_per_il_tecnico)
const fkNote =
  ghlFindFieldKeyByLabelContains_(schemaKey, ['note']) ||
  ghlFindFieldKeyByContains_(schemaKey, ['note']) ||
  ghlFindFieldKeyByContains_(schemaKey, ['note', 'tecnic']);

if (fkNote && noteTxt) out[fkNote] = noteTxt;
  return cleanPayload_(out);
}

function createManutenzioniForPolizza_({ data, polizzaRecordId, macchinaIds, contactId, logLine }) {
  const startIso = safeStr_(data.DATA_STIPULA_ISO);
if (!startIso) throw new Error('DATA_STIPULA_ISO vuota o non valida. Controlla INPUT!B13 e formatDateISO_.');
  const freqMonths = freqToMonths_(data.FREQUENZA_VISITE);

  const durataRaw = String(data.DURATA_ANNI || '').replace(/"/g, '').trim();
  const durata = Number(durataRaw.replace(',', '.')) || 1;
if (logLine) logLine('DEBUG startIso=' + startIso + ' freqMonths=' + freqMonths + ' durata=' + durata);
if (logLine) logLine('DEBUG freqLabel=' + String(data.FREQUENZA_VISITE || ''));
  const firstOffset = firstOffsetMonthsByFreqLabel_(data.FREQUENZA_VISITE);
const dateList = computeMaintenanceDates_(startIso, freqMonths, durata, firstOffset);
  if (logLine) logLine('Manutenzioni da creare: ' + dateList.length);

  if (!dateList.length) return [];

  const createdIds = [];

  // ---- PRECHECK: leggo manutenzioni già esistenti della polizza e preparo gli "skip" ----
  const schemaKey = GHL_OBJECT_SCHEMA_MANUTENZIONE;

  let fkCodiceUniv =
    ghlFindFieldKeyByLabelContains_(schemaKey, ['codice', 'univoco']) ||
    ghlFindFieldKeyByContains_(schemaKey, ['codice', 'univoco']) ||
    '';

  let fkStato =
    ghlFindFieldKeyByLabelContains_(schemaKey, ['stato']) ||
    ghlFindFieldKeyByContains_(schemaKey, ['stato']) ||
    '';

  let fkMesePrev =
    ghlFindFieldKeyByLabelContains_(schemaKey, ['mese', 'prev']) ||
    ghlFindFieldKeyByContains_(schemaKey, ['mese', 'prev']) ||
    '';

  fkCodiceUniv = ghlResolveFieldKeyShort_(schemaKey, fkCodiceUniv);
  fkStato = ghlResolveFieldKeyShort_(schemaKey, fkStato);
  fkMesePrev = ghlResolveFieldKeyShort_(schemaKey, fkMesePrev);

  const codicePol = makeCodiceUnivocoPolizza_(data);
  const prefix = String(codicePol) + '|';

  const expectedSet = {};
  dateList.forEach(x => expectedSet[String(x)] = true);

  const statoDaProgKey = fkStato ? ghlOptionKeyFromLabel_(schemaKey, fkStato, 'Da programmare') : '';
  const statoEseguitoKey = fkStato ? ghlOptionKeyFromLabel_(schemaKey, fkStato, 'Eseguito') : '';

  // mesi da NON creare perché esiste già una manutenzione "non Da programmare"
  const skipMonth = {};

  try {
    const all = ghlListAllObjectRecordsSafe_({ schemaKey, pageLimit: 100, maxPages: 20 });
const existing = ghlFilterRecordsByPrefix_(all, schemaKey, fkCodiceUniv, prefix);

    (existing || []).forEach(r => {
      const statoVal = String(getRecProp_(r, schemaKey, fkStato) || '').trim();
      const meseVal = String(getRecProp_(r, schemaKey, fkMesePrev) || '').trim();

      // se non ho meseVal, non posso fare matching
      if (!meseVal) return;

      const isDaProgrammare =
        (statoDaProgKey && statoVal === String(statoDaProgKey)) ||
        (String(statoVal).toLowerCase() === 'da programmare');

      // se è "Da programmare" verrà già eliminata dal delete precedente, quindi non la considero come blocco
      if (isDaProgrammare) return;

      // safety: se è "Eseguito" ma mese non previsto dal contratto, la conservo ma NON la conto
      const isEseguito =
        (statoEseguitoKey && statoVal === String(statoEseguitoKey)) ||
        (String(statoVal).toLowerCase() === 'eseguito');

      if (isEseguito && !expectedSet[meseVal]) {
        if (logLine) logLine('SAFETY: trovato ESEGUITO fuori contratto, conservo ma non conto. mese=' + meseVal);
        return;
      }

      // per qualunque altro stato non da programmare, se mese è previsto, lo conto e quindi skippa la creazione
      if (expectedSet[meseVal]) skipMonth[meseVal] = true;
    });

  } catch (e) {
    if (logLine) logLine('WARN precheck manutenzioni failed: ' + String(e && e.message ? e.message : e));
  }

  dateList.forEach(meseIso => {
    const payload = buildManutenzionePayload_(data, polizzaRecordId, meseIso);

    // Se esiste una chiave univoca nel payload, facciamo UPSERT vero, altrimenti create semplice
    const schemaKey = GHL_OBJECT_SCHEMA_MANUTENZIONE;

    const fkCodiceUniv =
      ghlFindFieldKeyByLabelContains_(schemaKey, ['codice', 'univ']) ||
      ghlFindFieldKeyByContains_(schemaKey, ['codice', 'univ']);

        // se esiste già una manutenzione "non Da programmare" per quel mese, non creare nulla
    if (skipMonth[String(meseIso)]) {
      if (logLine) logLine('SKIP create manutenzione (già esistente non-da-programmare) mese=' + meseIso);
      return;
    }

    // qui vogliamo CREARE, non aggiornare: niente upsert
let manutId = '';
try {
  manutId = ghlCreateObjectRecord_({ schemaKey, payload });
} catch (e) {
  const msg = String(e && e.message ? e.message : e);
  const isDup = msg.indexOf('duplicate_record') !== -1 || msg.indexOf('already exists') !== -1;

  if (isDup) {
    if (logLine) logLine('SKIP manutenzione duplicate mese=' + meseIso);
    return;
  }
  throw e;
}

createdIds.push(manutId);

    // Link POLIZZA <-> MANUTENZIONE
    if (ASSOC_POLIZZA_MANUTENZIONE && ASSOC_POLIZZA_MANUTENZIONE.indexOf('INCOLLA_') !== 0) {
      ghlCreateRelationTryBoth_({
        associationId: ASSOC_POLIZZA_MANUTENZIONE,
        a: polizzaRecordId,
        b: manutId
      });
    }

    // Link CONTACT <-> MANUTENZIONE
    if (contactId && ASSOC_CONTACT_MANUTENZIONE && ASSOC_CONTACT_MANUTENZIONE.indexOf('INCOLLA_') !== 0) {
      ghlCreateRelationTryBoth_({
      associationId: ASSOC_CONTACT_MANUTENZIONE,
      a: contactId,
      b: manutId
    });
  }

    // Link MANUTENZIONE <-> MACCHINE
    if (ASSOC_MANUTENZIONE_MACCHINA && ASSOC_MANUTENZIONE_MACCHINA.indexOf('INCOLLA_') !== 0) {
      (macchinaIds || []).forEach(mid => {
        ghlCreateRelationTryBoth_({
          associationId: ASSOC_MANUTENZIONE_MACCHINA,
          a: manutId,
          b: mid
        });
      });
    }
  });

  return createdIds;
}

function mapTipologiaToOptionKey_(tp) {
  const t = String(tp || '').toLowerCase();

  // Se nel foglio MACCHINE scrivi già le key, le passi direttamente
  const keys = [
    'lavapavimenti_uomo_a_terra',
    'lavapavimenti_uomo_a_bordo',
    'motoscopa_uomo_a_terra',
    'motoscopa_uomo_a_bordo',
    'idropulitrice',
    'aspiratore_industriale',
    'monospazzola',
    'generatore_di_vapore',
    'aspiratore__aspiraliquidi'
  ];
  if (keys.indexOf(t) !== -1) return t;

  // Altrimenti provo a dedurre da etichette umane
  if (t.includes('lavapav') && t.includes('terra')) return 'lavapavimenti_uomo_a_terra';
  if (t.includes('lavapav') && (t.includes('bordo') || t.includes('uomo a bordo'))) return 'lavapavimenti_uomo_a_bordo';
  if (t.includes('motoscop') && t.includes('terra')) return 'motoscopa_uomo_a_terra';
  if (t.includes('motoscop') && (t.includes('bordo') || t.includes('uomo a bordo'))) return 'motoscopa_uomo_a_bordo';
  if (t.includes('idrop')) return 'idropulitrice';
  if (t.includes('aspir') && t.includes('liquid')) return 'aspiratore__aspiraliquidi';
  if (t.includes('aspir')) return 'aspiratore_industriale';
  if (t.includes('monosp')) return 'monospazzola';
  if (t.includes('vapore')) return 'generatore_di_vapore';

  // fallback: scegli una key valida, non lasciare vuoto se in UI lo rendi obbligatorio in futuro
  return 'lavapavimenti_uomo_a_terra';
}


/************ OBJECT SCHEMA CACHE + OPTION LOOKUP ************/
const GHL_OBJECT_SCHEMA_CACHE = {};

function ghlGetObjectSchema_(schemaKey) {
  const k = String(schemaKey);
  if (GHL_OBJECT_SCHEMA_CACHE[k]) return GHL_OBJECT_SCHEMA_CACHE[k];

  const res = ghlRequest_({
    method: 'get',
    path: '/objects/' + encodeURIComponent(k)
  });

  const obj = res && (res.object || res.data || res);
  if (!obj) throw new Error('Schema non letto: ' + JSON.stringify(res).slice(0, 500));

  const fields = Array.isArray(res.fields) ? res.fields : (Array.isArray(obj.fields) ? obj.fields : []);
  const byFieldKey = {};

  fields.forEach(f => {
    const full = String(f.fieldKey || f.key || '');
    if (!full) return;

    byFieldKey[full] = f;

    const prefix = k + '.';
    if (full.indexOf(prefix) === 0) {
      const shortKey = full.substring(prefix.length);
      if (shortKey) byFieldKey[shortKey] = f;
    }
  });

  if (DEBUG_LOG) Logger.log('DEBUG ' + k + ' field keys (sample): ' + Object.keys(byFieldKey).slice(0, 200).join(' | '));

  GHL_OBJECT_SCHEMA_CACHE[k] = { raw: obj, byFieldKey };
  return GHL_OBJECT_SCHEMA_CACHE[k];
}

function ghlResolveFieldKeyShort_(schemaKey, fieldKeyMaybeShortOrFull) {
  const schema = ghlGetObjectSchema_(schemaKey);
  const by = schema && schema.byFieldKey ? schema.byFieldKey : {};

  const raw = String(fieldKeyMaybeShortOrFull || '').trim();
  if (!raw) return '';

  const prefix = String(schemaKey) + '.';

  // se arriva full, strippo SEMPRE il prefisso e provo col short
  if (raw.indexOf(prefix) === 0) {
    const short = raw.substring(prefix.length);
    return short || '';
  }

  // se arriva qualcosa con punti, prendo l'ultimo pezzo come short "di emergenza"
  if (raw.indexOf('.') !== -1) {
    const last = raw.split('.').pop();
    return last || '';
  }

  // altrimenti è già short
  return raw;
}

function ghlFindFieldKeyByLabelContains_(schemaKey, labelContainsArr) {
  const schema = ghlGetObjectSchema_(schemaKey);
  const raw = schema && schema.raw ? schema.raw : null;

  const fields =
    (raw && Array.isArray(raw.fields)) ? raw.fields :
    (schema && schema.byFieldKey) ? Object.values(schema.byFieldKey) :
    [];

  const contains = (labelContainsArr || []).map(x => String(x).toLowerCase());

  const hit = (fields || []).find(f => {
    const lb = String(f.label || '').toLowerCase();
    return lb && contains.every(c => lb.indexOf(c) !== -1);
  });

  if (!hit) return '';

  const full = String(hit.fieldKey || hit.key || '');
  if (!full) return '';

  const prefix = String(schemaKey) + '.';
  if (full.indexOf(prefix) === 0) return full.substring(prefix.length);
  return full.indexOf('.') === -1 ? full : full.split('.').pop();
}

function ghlOptionKeyFromLabel_(schemaKey, fieldKey, value) {
  const v = String(value || '').trim();
  if (!v) return '';

  const schema = ghlGetObjectSchema_(schemaKey);
  const f = schema.byFieldKey[String(fieldKey)];
  if (!f) return v; // se non trovo il campo, ritorno il valore così com’è

  const opts = Array.isArray(f.options) ? f.options : [];
  if (!opts.length) return v;

  // prova match per key
  const hitKey = opts.find(o => String(o.key || '').toLowerCase() === v.toLowerCase());
  if (hitKey) return String(hitKey.key);

  // prova match per label
  const hitLabel = opts.find(o => String(o.label || '').toLowerCase() === v.toLowerCase());
  if (hitLabel) return String(hitLabel.key);

  // fallback: prova normalizzazione base
  const v2 = v.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '').toLowerCase();
  const hitNorm = opts.find(o => String(o.key || '').toLowerCase() === v2);
  if (hitNorm) return String(hitNorm.key);

  return v; // ultimo fallback
}

function ghlFindFieldKeyByContains_(schemaKey, containsArr) {
  const schema = ghlGetObjectSchema_(schemaKey);
  const by = (schema && schema.byFieldKey) ? schema.byFieldKey : {};

  const prefixFull = String(schemaKey) + '.';
  const contains = (containsArr || []).map(x => String(x).toLowerCase());

  // Prendo sia:
  // - full keys: custom_objects.xxx.yyy
  // - short keys: yyy
  const candidateKeys = Object.keys(by).filter(k => {
    const ks = String(k);
    return ks.indexOf(prefixFull) === 0 || ks.indexOf('.') === -1;
  });

  const hit = candidateKeys.find(k => {
    const kLow = String(k).toLowerCase();
    return contains.every(c => kLow.indexOf(c) !== -1);
  });

  if (!hit) return '';

  // Se e full, ritorno short, altrimenti e gia short
  if (String(hit).indexOf(prefixFull) === 0) return String(hit).substring(prefixFull.length);
  return String(hit);
}

function ghlPolizzaReferenteFieldKey_() {
  const schemaKey = GHL_OBJECT_SCHEMA_POLIZZA;

  // prima provo le combinazioni piu specifiche
  const try1 = ghlFindFieldKeyByContains_(schemaKey, ['refer', 'assist']);
  if (try1 && String(try1).toLowerCase().indexOf('numero') === -1) return try1;

  const try2 = ghlFindFieldKeyByContains_(schemaKey, ['refer', 'zeroguasti']);
  if (try2 && String(try2).toLowerCase().indexOf('numero') === -1) return try2;

  // fallback generico: qualsiasi cosa con "refer" ma NON numero
  const try3 = ghlFindFieldKeyByContains_(schemaKey, ['refer']);
  if (try3 && String(try3).toLowerCase().indexOf('numero') === -1) return try3;

  return '';
}

const ZG_PENDING_KEY = 'ZG_POLIZZA_PENDING';

function openPolizzaDecisionDialog_() {
  const html = HtmlService.createHtmlOutputFromFile('PolizzaDecision')
    .setWidth(420)
    .setHeight(170);
  SpreadsheetApp.getUi().showModalDialog(html, 'Conferma azione');
}

function setPendingPolizza_(payload) {
  // payload deve essere piccolo, ma qui mettiamo solo ciò che serve
  CacheService.getScriptCache().put(ZG_PENDING_KEY, JSON.stringify(payload), 600); // 10 min
}

function getPendingPolizza_() {
  const raw = CacheService.getScriptCache().get(ZG_PENDING_KEY);
  return raw ? JSON.parse(raw) : null;
}

function clearPendingPolizza_() {
  CacheService.getScriptCache().remove(ZG_PENDING_KEY);
}

function handlePolizzaDecision_(action) {
  PropertiesService.getUserProperties().setProperty('ZG_LAST_ACTION', action);
}

function firstOffsetMonthsByFreqLabel_(freqLabel) {
  const f = String(freqLabel || '').trim().toLowerCase();

  if (f.includes('bimes')) return 1;
  if (f.includes('trimes')) return 1;
  if (f.includes('quadrimes')) return 2;
  if (f.includes('semes')) return 3;
  if (f.includes('ann')) return 7;

  // mensile (o default): mese successivo
  if (f.includes('mens')) return 1;

  // fallback prudente
  return 1;
}

const ZG_FMT_BASELINE_KEY = 'ZG_INPUT_FMT_BASELINE_V1';
const ZG_FMT_SNAPSHOT_KEY = 'ZG_INPUT_FMT_SNAPSHOT_V1';

function saveInputFormatting_() {
  const ss = SpreadsheetApp.getActive();
  const sh = ss.getSheetByName('INPUT');
  if (!sh) return;

  const props = PropertiesService.getDocumentProperties();
  if (props.getProperty(ZG_FMT_SNAPSHOT_KEY)) return; // snapshot già salvato

  const rg = sh.getRange('A1:Z200');

  const payload = {
    backgrounds: rg.getBackgrounds(),
    fontColors: rg.getFontColors()
  };

  props.setProperty(ZG_FMT_SNAPSHOT_KEY, JSON.stringify(payload));
}

function restoreInputFormatting_() {
  const ss = SpreadsheetApp.getActive();
  const sh = ss.getSheetByName('INPUT');
  if (!sh) return;

  const props = PropertiesService.getDocumentProperties();

  const rawSnap = props.getProperty(ZG_FMT_SNAPSHOT_KEY);
  const rawBase = props.getProperty(ZG_FMT_BASELINE_KEY);
  const raw = rawSnap || rawBase;
  if (!raw) return;

  let payload;
  try {
    payload = JSON.parse(raw);
  } catch (e) {
    // se è corrotto, pulisco solo lo snapshot
    props.deleteProperty(ZG_FMT_SNAPSHOT_KEY);
    return;
  }

  const rg = sh.getRange('A1:Z200');
  if (payload.backgrounds) rg.setBackgrounds(payload.backgrounds);
  if (payload.fontColors) rg.setFontColors(payload.fontColors);

  // C5 e C6 vuote sempre
  sh.getRange('C5:C6').clearContent();

  // cancello SOLO lo snapshot (la baseline deve restare)
  props.deleteProperty(ZG_FMT_SNAPSHOT_KEY);
}

function zgRipristinaNormale_() {
  try {
    restoreInputFormatting_();
    SpreadsheetApp.getUi().alert('Ripristino eseguito. Se i colori non cambiano, lo snapshot originale non era stato salvato.');
  } catch (e) {
    SpreadsheetApp.getUi().alert('Errore ripristino: ' + (e && e.message ? e.message : String(e)));
  }
}

function riprendiPolizzaDaUI_(action) {
  const pending = getPendingPolizza_();
  if (!pending) {
    SpreadsheetApp.getUi().alert('Operazione scaduta. Rigenera la polizza.');
    return;
  }

  clearPendingPolizza_();

  if (action === 'cancel') {
    SpreadsheetApp.getUi().alert('Operazione annullata.');
    return;
  }

  // ORA questa gira come funzione UI vera
  resumeGhlAfterDecision_(pending, action);
}
// === ESPOSIZIONE FUNZIONI A HTMLService ===
globalThis.handlePolizzaDecision_ = handlePolizzaDecision_;
globalThis.riprendiPolizzaDaUI_ = riprendiPolizzaDaUI_;
function handlePolizzaDecision(action) {
  return handlePolizzaDecision_(action);
}

function riprendiPolizzaDaUI(action) {
  return riprendiPolizzaDaUI_(action);
}

// opzionale: se vuoi, puoi anche esportare i wrapper
globalThis.handlePolizzaDecision = handlePolizzaDecision;
globalThis.riprendiPolizzaDaUI = riprendiPolizzaDaUI;

function processPolizzaDecision(action) {
  SpreadsheetApp.getActive().toast('Elaborazione in corso...', 'ZeroGuasti', 10);

  handlePolizzaDecision_(action);
  riprendiPolizzaDaUI_(action);

  return true;
}

globalThis.processPolizzaDecision = processPolizzaDecision;


function ghlListAllObjectRecordsSafe_({ schemaKey, pageLimit, maxPages }) {
  return ghlListObjectRecords_({ schemaKey, pageLimit: pageLimit || 100, maxPages: maxPages || 10 });
}

function ghlFilterRecordsByPrefix_(records, schemaKey, fieldKeyShort, prefix) {
  const out = [];
  const pfx = String(prefix || '');
  if (!pfx) return out;

  (records || []).forEach(r => {
    const val = String(getRecProp_(r, schemaKey, fieldKeyShort) || '').trim();
    if (val && val.indexOf(pfx) === 0) out.push(r);
  });

  return out;
}

/************ TEST VARI ************/

function TEST_E2E_OBJECTS_RELATIONS_ONLY() {
  // 1) prendi un contatto esistente (metti un ID fisso se vuoi zero variabili)
  const cRes = ghlRequest_({ method: 'get', path: '/contacts/?query=test' });
  const contactId = cRes && cRes.contacts && cRes.contacts[0] && cRes.contacts[0].id;
  if (!contactId) throw new Error('Nessun contatto trovato per query=test. Metti un contactId fisso qui.');
  Logger.log('CONTACT ID: ' + contactId);

  // 2) crea polizza
  const polId = ghlCreateObjectRecord_({
    schemaKey: GHL_OBJECT_SCHEMA_POLIZZA,
    payload: {
      zeroguasti: 'TEST CLIENTE ' + Date.now(),
      polizza_zeroguasti: 'LITE'
    }
  });
  Logger.log('POLIZZA ID: ' + polId);

  // 3) crea macchina
  const macId = ghlCreateObjectRecord_({
    schemaKey: GHL_OBJECT_SCHEMA_MACCHINA,
    payload: { identificativo_macchina: 'MAC-' + Date.now() }
  });
  Logger.log('MACCHINA ID: ' + macId);

  // 4) relazioni
  const r1 = ghlCreateRelation_({
    associationId: ASSOC_CONTACT_POLIZZA,
    firstRecordId: contactId,
    secondRecordId: polId
  });
  Logger.log('REL contact-polizza: ' + JSON.stringify(r1));

  const r2 = ghlCreateRelation_({
  associationId: ASSOC_POLIZZA_MACCHINA,
  firstRecordId: macId,
  secondRecordId: polId
});
  Logger.log('REL polizza-macchina: ' + JSON.stringify(r2));

  const r3 = ghlCreateRelation_({
    associationId: ASSOC_CONTACT_MACCHINA,
    firstRecordId: contactId,
    secondRecordId: macId
  });
  Logger.log('REL contact-macchina: ' + JSON.stringify(r3));

  Logger.log('E2E OK');
}

function DEBUG_ASSOC_DIRECTIONS() {
  const list = ghlGetAssociationsCached_();
  const ids = [ASSOC_CONTACT_POLIZZA, ASSOC_POLIZZA_MACCHINA, ASSOC_CONTACT_MACCHINA];

  ids.forEach(id => {
    const a = (list || []).find(x => String(x.id || x._id) === String(id));
    Logger.log('ASSOC ' + id + ' -> ' + JSON.stringify({
      id: id,
      firstObjectKey: a && (a.firstObjectKey || a.firstObject || a.firstObjectType),
      secondObjectKey: a && (a.secondObjectKey || a.secondObject || a.secondObjectType)
    }));
  });
}

function DEBUG_POLIZZA_FIELDS() {
  const res = ghlRequest_({
    method: 'get',
    path: '/objects/' + encodeURIComponent(GHL_OBJECT_SCHEMA_POLIZZA)
  });

  const fields = (res && res.fields) ? res.fields : ((res && res.object && res.object.fields) ? res.object.fields : []);
  if (!fields || !fields.length) throw new Error('Nessun field trovato nello schema: ' + JSON.stringify(res).slice(0, 300));

  fields.forEach(f => {
    Logger.log((f.fieldKey || f.key || '') + ' | type=' + (f.type || '') + ' | label=' + (f.label || ''));
  });
}

function DEBUG_POLIZZA_REFERENTE_KEYS() {
  const res = ghlRequest_({
    method: 'get',
    path: '/objects/' + encodeURIComponent(GHL_OBJECT_SCHEMA_POLIZZA)
  });

  const fields =
    (res && Array.isArray(res.fields)) ? res.fields :
    (res && res.object && Array.isArray(res.object.fields)) ? res.object.fields :
    [];

  fields
    .filter(f => {
      const fk = String(f.fieldKey || f.key || '').toLowerCase();
      const lb = String(f.label || '').toLowerCase();
      return fk.includes('refer') || lb.includes('refer');
    })
    .forEach(f => {
      Logger.log(
        'FIELD -> ' +
        (f.fieldKey || f.key) +
        ' | type=' + (f.type || '') +
        ' | label=' + (f.label || '')
      );
    });
}

/**
 * 1) Esegui UNA VOLTA questa funzione dall'editor Apps Script
 *    per salvare la tua GHL Private Integration Token in Script Properties.
 *    (Non compare nel menu del foglio)
 */
function impostaGhlApiKey() {
  const ui = SpreadsheetApp.getUi();
  const resp = ui.prompt(
    "Imposta GHL API Key",
    "Incolla la Private Integration Token (verrà salvata in Script Properties).",
    ui.ButtonSet.OK_CANCEL
  );
  if (resp.getSelectedButton() !== ui.Button.OK) return;

  const key = (resp.getResponseText() || "").trim();
  if (!key) {
    ui.alert("API key vuota. Operazione annullata.");
    return;
  }

  PropertiesService.getScriptProperties().setProperty("MAP_GHL_API_KEY", key);
  ui.alert("OK. API key salvata nelle Script Properties.");
}

/**
 * 2) Usa questa funzione ovunque ti serve la chiave
 */
function getGhlApiKey_() {
  const key = (PropertiesService.getScriptProperties().getProperty("MAP_GHL_API_KEY") || "").trim();
  if (!key) {
    throw new Error("GHL API key non impostata nelle Script Properties. Esegui impostaGhlApiKey() una volta.");
  }
  return key;
}

function DEBUG_FIND_ASSOC_IDS_MANUTENZIONI() {
  const list = ghlGetAssociationsCached_();

  const A1 = 'custom_objects.polizze_zeroguasti';
  const B1 = 'custom_objects.manutenzioni';

  const A2 = 'custom_objects.manutenzioni';
  const B2 = 'custom_objects.macchine';

  const idPolMan = ghlFindAssociationIdSmart_(list, A1, B1);
  const idManMac = ghlFindAssociationIdSmart_(list, A2, B2);

  Logger.log('ASSOC POLIZZA <-> MANUTENZIONI = ' + idPolMan);
  Logger.log('ASSOC MANUTENZIONI <-> MACCHINE = ' + idManMac);

  // opzionale: stampa anche i dettagli completi se trovati
  if (idPolMan) {
    const a = (list || []).find(x => String(x.id || x._id) === String(idPolMan));
    Logger.log('DET POLIZZA<->MAN: ' + JSON.stringify(a));
  }
  if (idManMac) {
    const a = (list || []).find(x => String(x.id || x._id) === String(idManMac));
    Logger.log('DET MAN<->MAC: ' + JSON.stringify(a));
  }
}

function zgSalvaColoriStandard_() {
  const ss = SpreadsheetApp.getActive();
  const sh = ss.getSheetByName('INPUT');
  if (!sh) return;

  const rg = sh.getRange('A1:Z200');

  const payload = {
    backgrounds: rg.getBackgrounds(),
    fontColors: rg.getFontColors()
  };

  PropertiesService.getDocumentProperties().setProperty(ZG_FMT_BASELINE_KEY, JSON.stringify(payload));
  SpreadsheetApp.getUi().alert('Baseline salvata. Ora puoi attivare/disattivare manutenzione e i colori torneranno correttamente.');
}

function DEBUG_MANUT_SCHEMA_STATO_MESE() {
  const schemaKey = GHL_OBJECT_SCHEMA_MANUTENZIONE;
  const schema = ghlGetObjectSchema_(schemaKey);
  const raw = schema && schema.raw ? schema.raw : null;

  const fields =
    (raw && Array.isArray(raw.fields)) ? raw.fields :
    [];

  Logger.log('=== MANUT SCHEMA FIELDS: stato/mese/codice ===');

  fields.forEach(f => {
    const fk = String(f.fieldKey || f.key || '');
    const lb = String(f.label || '');
    const low = (fk + ' ' + lb).toLowerCase();

    if (
      low.includes('stato') ||
      low.includes('mese') ||
      low.includes('prev') ||
      (low.includes('codice') && low.includes('univ'))
    ) {
      Logger.log(
        'FIELD | key=' + fk +
        ' | label=' + lb +
        ' | type=' + String(f.type || '') +
        ' | options=' + (Array.isArray(f.options) ? f.options.length : 0)
      );

      // Se è un dropdown, stampo anche le opzioni
      if (Array.isArray(f.options) && f.options.length) {
        f.options.forEach(o => {
          Logger.log('  - opt key=' + String(o.key) + ' | label=' + String(o.label));
        });
      }
    }
  });

  Logger.log('=== END ===');
}

function DEBUG_SCAN_DELETE_MANUTENZIONI() {
  const data = {
    RAGIONE_SOCIALE: 'DEBUG',
    DATA_STIPULA_ISO: '2000-01-01',
    PACCHETTO: 'LITE',
    NUMERO_MACCHINE: '1',
    DURATA_ANNI: '1'
  };

  // IMPORTANTE:
  // qui devi usare gli stessi data reali della polizza che ti dà problemi
  // quindi sostituisci i 5 valori sopra copiandoli dal tuo oggetto data quando generi.
  // Se non lo fai, il codice polizza sarà diverso e non troverà record.

  const logLine = (msg) => Logger.log(msg);

  deleteFutureManutenzioniDaProgrammareByCodicePolizza_DEBUG_({ data, logLine });
}

function deleteFutureManutenzioniDaProgrammareByCodicePolizza_DEBUG_({ data, logLine }) {
  const schemaKey = GHL_OBJECT_SCHEMA_MANUTENZIONE;

  const fkCodiceUniv =
    ghlFindFieldKeyByLabelContains_(schemaKey, ['codice', 'univoco']) ||
    ghlFindFieldKeyByContains_(schemaKey, ['codice', 'univoco']) ||
    'codice_univoco_manutenzione';

  const fkStato =
    ghlFindFieldKeyByLabelContains_(schemaKey, ['stato']) ||
    ghlFindFieldKeyByContains_(schemaKey, ['stato']) ||
    'stato';

  const fkMesePrev =
    ghlFindFieldKeyByLabelContains_(schemaKey, ['mese', 'prev']) ||
    ghlFindFieldKeyByContains_(schemaKey, ['mese', 'prev']) ||
    'mese_previsto';

  const codicePol = makeCodiceUnivocoPolizza_(data);
  const prefix = String(codicePol) + '|';

  const curMonthIso = firstOfCurrentMonthIso_();

  const statoDaProgKey = ghlOptionKeyFromLabel_(schemaKey, fkStato, 'Da programmare');
  if (!statoDaProgKey) {
  if (logLine) logLine('WARN: optionKey "Da programmare" non risolta. Skip delete.');
  return 0;
}

  logLine('DEBUG fkCodiceUniv=' + fkCodiceUniv);
  logLine('DEBUG fkStato=' + fkStato);
  logLine('DEBUG fkMesePrev=' + fkMesePrev);
  logLine('DEBUG codicePol=' + codicePol);
  logLine('DEBUG search prefix=' + prefix);
  logLine('DEBUG curMonthIso=' + curMonthIso);
  logLine('DEBUG statoDaProgKey(from label)="'+ statoDaProgKey + '"');

  const records = ghlSearchObjectRecords_({
    schemaKey,
    fieldFullKey: fkCodiceUniv,
    operator: 'contains',
    value: prefix,
    pageLimit: 100
  });

  logLine('DEBUG found records=' + (records ? records.length : 0));

  const parseIsoToTime = (s) => {
    const x = String(s || '').trim();
    // accetto anche ISO con time, prendo solo i primi 10
    const iso10 = x.length >= 10 ? x.substring(0, 10) : x;
    const d = new Date(iso10 + 'T00:00:00Z');
    const t = d.getTime();
    return isNaN(t) ? NaN : t;
  };

  const curT = parseIsoToTime(curMonthIso);

  (records || []).slice(0, 100).forEach(r => {
    const id = String(r.id || r._id || (r.record && (r.record.id || r.record._id)) || '');

    const codiceVal = String(getRecProp_(r, schemaKey, fkCodiceUniv) || '').trim();
    const statoValRaw = getRecProp_(r, schemaKey, fkStato);
    const statoVal = String(statoValRaw || '').trim();

    const meseValRaw = getRecProp_(r, schemaKey, fkMesePrev);
    const meseVal = String(meseValRaw || '').trim();

    const meseT = parseIsoToTime(meseVal);
    const isFuture = isFinite(curT) && isFinite(meseT) ? (meseT >= curT) : false;

    // confronto “rigido” ma loggo anche il caso label
    const isDaProgrammareKey = (statoDaProgKey && statoVal === statoDaProgKey);
    const isDaProgrammareLabel = (String(statoVal).toLowerCase() === 'da programmare');

    logLine(
      'REC id=' + id +
      ' | codice=' + codiceVal +
      ' | meseRaw=' + JSON.stringify(meseValRaw) +
      ' | mese=' + meseVal +
      ' | meseT=' + meseT +
      ' | isFuture=' + isFuture +
      ' | statoRaw=' + JSON.stringify(statoValRaw) +
      ' | stato=' + statoVal +
      ' | isDaProgKey=' + isDaProgrammareKey +
      ' | isDaProgLabel=' + isDaProgrammareLabel
    );
  });

  logLine('DEBUG scan end (DRY RUN, no delete).');
}

function DEBUG_MANUT_LIST_SAMPLE() {
  const schemaKey = GHL_OBJECT_SCHEMA_MANUTENZIONE;

  const rows = ghlListObjectRecords_({ schemaKey, pageLimit: 20, maxPages: 1 });
  Logger.log('MANUT list count=' + rows.length);

  rows.slice(0, 5).forEach((r, i) => {
    const id = String(r.id || r._id || (r.record && (r.record.id || r.record._id)) || '');
    const props = r.properties || (r.record && r.record.properties) || {};
    Logger.log('--- #' + i + ' id=' + id);
    Logger.log('keys=' + Object.keys(props || {}).slice(0, 80).join(' | '));
    Logger.log('props=' + JSON.stringify(props, null, 2).slice(0, 2000));
  });
}

function DEBUG_FIND_OBJECTS_MANUT() {
  const log = (x) => Logger.log(x);

  let res;
  try {
    res = ghlRequest_({ method: 'get', path: '/objects/' });
  } catch (e1) {
    res = ghlRequest_({ method: 'get', path: '/objects' });
  }

  const list =
    (res && Array.isArray(res.objects)) ? res.objects :
    (res && res.data && Array.isArray(res.data.objects)) ? res.data.objects :
    (res && Array.isArray(res.data)) ? res.data :
    (Array.isArray(res)) ? res :
    [];

  log('TOT objects=' + list.length);

  const hits = list.filter(o => {
    const k = String(o.key || o.schemaKey || o.id || '').toLowerCase();
    const n = String(o.name || o.label || '').toLowerCase();
    return k.includes('manut') || n.includes('manut');
  });

  log('HITS manut=' + hits.length);

  hits.forEach(o => {
    const key = String(o.key || o.schemaKey || o.id || '');
    const name = String(o.name || o.label || '');
    log('OBJ -> key=' + key + ' | name=' + name);
  });
}

function DEBUG_FIND_ASSOC_CONTACT_MANUT() {
  const list = ghlGetAssociationsCached_();
  const id = ghlFindAssociationIdSmart_(list, 'contact', 'custom_objects.manutenzioni');
  Logger.log('ASSOC CONTACT <-> MANUTENZIONI = ' + id);
  if (id) {
    const a = (list || []).find(x => String(x.id || x._id) === String(id));
    Logger.log('DET: ' + JSON.stringify(a));
  }
}

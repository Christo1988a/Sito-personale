/* ==========================================================================
   GESTIONALE-DEMO.JS — Demo web interattiva di ElecWork Manager
   Porting semplificato in JS della logica reale dell'app desktop C#/.NET:
   stessa regola di scadenza (Domain) e stessa logica di aggregazione KPI
   (Application), riscritte qui in JavaScript per una demo esplorabile
   direttamente nel browser. Dati salvati solo in localStorage.
   ========================================================================== */

(function () {
  'use strict';

  const STORAGE_KEY = 'elecwork_demo_data_v1';
  let activeTab = 'dashboard';
  let searchQuery = '';
  let editingContext = null; // { moduleKey, recordId }

  /* ------------------------------------------------------------------ *
   * UTILITY DATE / STATO (porting della logica Domain)
   * ------------------------------------------------------------------ */

  function oggiISO() {
    return new Date().toISOString().slice(0, 10);
  }

  function dataOffset(giorni) {
    const d = new Date();
    d.setDate(d.getDate() + giorni);
    return d.toISOString().slice(0, 10);
  }

  // Porting di Certificazione.GetStato() / Dpi.GetStato() (Domain)
  function getStatoScadenza(dataScadenza, giorniAnticipo = 30) {
    const oggi = new Date(oggiISO());
    const scadenza = new Date(dataScadenza);
    if (scadenza < oggi) return 'Scaduta';
    const soglia = new Date(oggi);
    soglia.setDate(soglia.getDate() + giorniAnticipo);
    if (scadenza <= soglia) return 'InScadenza';
    return 'Regolare';
  }

  function giorniAllaScadenza(dataScadenza) {
    const oggi = new Date(oggiISO());
    const scadenza = new Date(dataScadenza);
    return Math.round((scadenza - oggi) / 86400000);
  }

  function isInterventoInRitardo(intervento) {
    if (intervento.stato === 'Completato') return false;
    return new Date(intervento.dataProgrammata) < new Date(oggiISO());
  }

  function isSottoScorta(materiale) {
    return Number(materiale.giacenza) < Number(materiale.scortaMinima);
  }

  /* ------------------------------------------------------------------ *
   * DATI DEMO (seed)
   * ------------------------------------------------------------------ */

  function creaDatiDemo() {
    return {
      cantieri: [
        { id: 1, codice: 'CT-2026-001', nome: 'Impianto FV Tenuta Aurora', cliente: 'Agricola Aurora Srl', indirizzo: 'Via dei Pioppi 12, Viterbo', stato: 'InLavorazione', squadraId: 1 },
        { id: 2, codice: 'CT-2026-002', nome: 'Manutenzione cabina MT', cliente: 'Comune di Fiano', indirizzo: 'Piazza Municipio 3, Fiano Romano', stato: 'Pianificato', squadraId: 2 },
        { id: 3, codice: 'CT-2025-014', nome: 'Rifacimento quadro elettrico', cliente: 'Logistica Sud Srl', indirizzo: 'Zona Industriale, Anagni', stato: 'Completato', squadraId: 1 },
        { id: 4, codice: 'CT-2026-003', nome: 'Impianto FV Capannone B', cliente: 'MetalTre Spa', indirizzo: "Via dell'Artigianato 8, Pomezia", stato: 'Sospeso', squadraId: null }
      ],
      squadre: [
        { id: 1, nome: 'Squadra Alfa', caposquadra: 'Marco Cristofari' },
        { id: 2, nome: 'Squadra Beta', caposquadra: 'Luca Ferretti' }
      ],
      operatori: [
        { id: 1, squadraId: 1, nome: 'Marco Cristofari', ruolo: 'Caposquadra', eta: 32, livello: 'Esperto' },
        { id: 2, squadraId: 1, nome: 'Davide Conti', ruolo: 'Elettricista', eta: 27, livello: 'Qualificato' },
        { id: 3, squadraId: 2, nome: 'Luca Ferretti', ruolo: 'Caposquadra', eta: 40, livello: 'Esperto' },
        { id: 4, squadraId: 2, nome: 'Samuel Rossi', ruolo: 'Apprendista', eta: 19, livello: 'Apprendista' }
      ],
      interventi: [
        { id: 1, cantiereId: 1, descrizione: 'Posa moduli fotovoltaici — falda sud', dataProgrammata: dataOffset(0), stato: 'InCorso', priorita: 'Alta', tecnicoResponsabile: 'Marco Cristofari' },
        { id: 2, cantiereId: 1, descrizione: 'Collaudo inverter e stringhe', dataProgrammata: dataOffset(-3), stato: 'Programmato', priorita: 'Critica', tecnicoResponsabile: 'Davide Conti' },
        { id: 3, cantiereId: 2, descrizione: 'Verifica isolamento cabina MT', dataProgrammata: dataOffset(4), stato: 'Programmato', priorita: 'Media', tecnicoResponsabile: 'Luca Ferretti' },
        { id: 4, cantiereId: 3, descrizione: 'Sostituzione interruttori quadro', dataProgrammata: dataOffset(-20), stato: 'Completato', priorita: 'Bassa', tecnicoResponsabile: 'Marco Cristofari' }
      ],
      certificazioni: [
        { id: 1, cantiereId: 1, titolo: 'Idoneità tecnica impianti FV', tipo: 'IdoneitaTecnica', intestatario: 'Marco Cristofari', dataScadenza: dataOffset(12) },
        { id: 2, cantiereId: 2, titolo: 'Documentazione cantiere cabina MT', tipo: 'DocumentazioneCantiere', intestatario: 'Squadra Beta', dataScadenza: dataOffset(-5) },
        { id: 3, cantiereId: null, titolo: 'Abilitazione lavori sotto tensione (PES/PAV)', tipo: 'Abilitazione', intestatario: 'Davide Conti', dataScadenza: dataOffset(90) }
      ],
      dpi: [
        { id: 1, nome: 'Guanti isolanti Classe 0', squadraId: 1, dataScadenza: dataOffset(8) },
        { id: 2, nome: 'Elmetto con visiera', squadraId: 1, dataScadenza: dataOffset(150) },
        { id: 3, nome: 'Tappeto isolante', squadraId: 2, dataScadenza: dataOffset(-2) }
      ],
      mezzi: [
        { id: 1, nome: 'Furgone Iveco Daily', tipo: 'Automezzo', squadraId: 1 },
        { id: 2, nome: 'Piattaforma aerea', tipo: 'Attrezzatura', squadraId: 1 },
        { id: 3, nome: 'Furgone Fiat Ducato', tipo: 'Automezzo', squadraId: 2 }
      ],
      materiali: [
        { id: 1, nome: 'Cavo FG16OR16 6mm²', unitaMisura: 'm', scortaMinima: 200, giacenza: 80 },
        { id: 2, nome: 'Moduli fotovoltaici 450W', unitaMisura: 'pz', scortaMinima: 20, giacenza: 44 },
        { id: 3, nome: 'Interruttori magnetotermici', unitaMisura: 'pz', scortaMinima: 15, giacenza: 6 }
      ],
      movimenti: [
        { id: 1, materialeId: 1, data: dataOffset(-6), quantita: -120, riferimento: 'Posa cavidotto', cantiereId: 1 },
        { id: 2, materialeId: 2, data: dataOffset(-10), quantita: 60, riferimento: 'Carico da fornitore', cantiereId: null },
        { id: 3, materialeId: 3, data: dataOffset(-2), quantita: -9, riferimento: 'Sostituzione quadro', cantiereId: 3 }
      ]
    };
  }

  let db = caricaDati();

  function caricaDati() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.error('Errore lettura dati demo:', e);
    }
    return creaDatiDemo();
  }

  function salvaDati() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    } catch (e) {
      console.error('Errore salvataggio dati demo:', e);
    }
  }

  function prossimoId(lista) {
    return lista.reduce((max, r) => Math.max(max, r.id), 0) + 1;
  }

  function trovaPerId(lista, id) {
    return lista.find((r) => r.id === id) || null;
  }

  function nomeRiferimento(lista, id, campo) {
    if (id === null || id === undefined || id === '') return null;
    const r = trovaPerId(lista, Number(id));
    return r ? r[campo] : null;
  }

  /* ------------------------------------------------------------------ *
   * BADGE HELPERS
   * ------------------------------------------------------------------ */

  function badge(testo, tipo) {
    return `<span class="gestionale-badge gestionale-badge-${tipo}">${escapeHtml(testo)}</span>`;
  }

  function badgeStatoCantiere(stato) {
    const mappa = {
      Pianificato: 'neutro',
      InLavorazione: 'attivo',
      Sospeso: 'critico',
      Completato: 'ok'
    };
    return badge(stato, mappa[stato] || 'neutro');
  }

  function badgeStatoIntervento(intervento) {
    if (isInterventoInRitardo(intervento)) return badge('In ritardo', 'critico');
    const mappa = { Programmato: 'neutro', InCorso: 'attivo', Completato: 'ok' };
    return badge(intervento.stato, mappa[intervento.stato] || 'neutro');
  }

  function badgeStatoScadenza(dataScadenza) {
    const stato = getStatoScadenza(dataScadenza);
    const mappa = { Regolare: 'ok', InScadenza: 'attivo', Scaduta: 'critico' };
    const giorni = giorniAllaScadenza(dataScadenza);
    const etichetta = stato === 'Scaduta' ? `Scaduta (${Math.abs(giorni)}gg fa)` : stato === 'InScadenza' ? `In scadenza (${giorni}gg)` : 'Regolare';
    return badge(etichetta, mappa[stato]);
  }

  function badgeSottoScorta(materiale) {
    return isSottoScorta(materiale) ? badge('Sotto scorta', 'critico') : badge('OK', 'ok');
  }

  function badgePriorita(priorita) {
    const mappa = { Bassa: 'neutro', Media: 'attivo', Alta: 'attivo', Critica: 'critico' };
    return badge(priorita, mappa[priorita] || 'neutro');
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str === null || str === undefined ? '' : String(str);
    return div.innerHTML;
  }

  function formattaData(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleDateString('it-IT');
  }

  /* ------------------------------------------------------------------ *
   * CONFIGURAZIONE MODULI (CRUD generico)
   * ------------------------------------------------------------------ */

  const MODULI = {
    cantieri: {
      label: 'Cantieri',
      icon: '🏗️',
      singolare: 'Cantiere',
      fields: [
        { name: 'codice', label: 'Codice commessa', type: 'text', required: true },
        { name: 'nome', label: 'Nome cantiere', type: 'text', required: true },
        { name: 'cliente', label: 'Cliente', type: 'text', required: true },
        { name: 'indirizzo', label: 'Indirizzo', type: 'text' },
        { name: 'stato', label: 'Stato', type: 'select', options: ['Pianificato', 'InLavorazione', 'Sospeso', 'Completato'] },
        { name: 'squadraId', label: 'Squadra assegnata', type: 'select', optionsFrom: 'squadre', optionLabel: (r) => r.nome, allowEmpty: true }
      ],
      columns: [
        { label: 'Codice', render: (r) => escapeHtml(r.codice) },
        { label: 'Nome', render: (r) => escapeHtml(r.nome) },
        { label: 'Cliente', render: (r) => escapeHtml(r.cliente) },
        { label: 'Stato', render: (r) => badgeStatoCantiere(r.stato) },
        { label: 'Squadra', render: (r) => escapeHtml(nomeRiferimento(db.squadre, r.squadraId, 'nome') || '—') }
      ]
    },
    squadre: {
      label: 'Squadre',
      icon: '👷',
      singolare: 'Squadra',
      fields: [
        { name: 'nome', label: 'Nome squadra', type: 'text', required: true },
        { name: 'caposquadra', label: 'Caposquadra', type: 'text', required: true }
      ],
      columns: [
        { label: 'Nome', render: (r) => escapeHtml(r.nome) },
        { label: 'Caposquadra', render: (r) => escapeHtml(r.caposquadra) },
        { label: 'N. Operatori', render: (r) => db.operatori.filter((o) => o.squadraId === r.id).length },
        {
          label: 'Impegnata su',
          render: (r) => {
            const attivo = db.cantieri.find((c) => c.squadraId === r.id && c.stato === 'InLavorazione');
            return attivo ? escapeHtml(attivo.codice) : badge('Disponibile', 'ok');
          }
        }
      ]
    },
    operatori: {
      label: 'Operatori',
      icon: '🧑‍🔧',
      singolare: 'Operatore',
      fields: [
        { name: 'nome', label: 'Nome operatore', type: 'text', required: true },
        { name: 'ruolo', label: 'Ruolo', type: 'text', required: true },
        { name: 'eta', label: 'Età', type: 'number' },
        { name: 'livello', label: 'Livello esperienza', type: 'select', options: ['Apprendista', 'Qualificato', 'Specializzato', 'Esperto'] },
        { name: 'squadraId', label: 'Squadra', type: 'select', optionsFrom: 'squadre', optionLabel: (r) => r.nome, allowEmpty: true }
      ],
      columns: [
        { label: 'Nome', render: (r) => escapeHtml(r.nome) },
        { label: 'Ruolo', render: (r) => escapeHtml(r.ruolo) },
        { label: 'Età', render: (r) => (r.eta ? r.eta : '—') },
        { label: 'Livello', render: (r) => badge(r.livello, r.livello === 'Esperto' ? 'ok' : r.livello === 'Apprendista' ? 'neutro' : 'attivo') },
        { label: 'Squadra', render: (r) => escapeHtml(nomeRiferimento(db.squadre, r.squadraId, 'nome') || '—') }
      ]
    },
    interventi: {
      label: 'Interventi',
      icon: '🛠️',
      singolare: 'Intervento',
      fields: [
        { name: 'descrizione', label: 'Descrizione', type: 'text', required: true },
        { name: 'cantiereId', label: 'Cantiere', type: 'select', optionsFrom: 'cantieri', optionLabel: (r) => `${r.codice} — ${r.nome}` },
        { name: 'dataProgrammata', label: 'Data programmata', type: 'date', required: true },
        { name: 'stato', label: 'Stato', type: 'select', options: ['Programmato', 'InCorso', 'Completato'] },
        { name: 'priorita', label: 'Priorità', type: 'select', options: ['Bassa', 'Media', 'Alta', 'Critica'] },
        { name: 'tecnicoResponsabile', label: 'Tecnico responsabile', type: 'text' }
      ],
      columns: [
        { label: 'Descrizione', render: (r) => escapeHtml(r.descrizione) },
        { label: 'Cantiere', render: (r) => escapeHtml(nomeRiferimento(db.cantieri, r.cantiereId, 'codice') || '—') },
        { label: 'Data', render: (r) => formattaData(r.dataProgrammata) },
        { label: 'Priorità', render: (r) => badgePriorita(r.priorita) },
        { label: 'Stato', render: (r) => badgeStatoIntervento(r) },
        { label: 'Tecnico', render: (r) => escapeHtml(r.tecnicoResponsabile || '—') }
      ]
    },
    certificazioni: {
      label: 'Certificazioni',
      icon: '📄',
      singolare: 'Certificazione',
      fields: [
        { name: 'titolo', label: 'Titolo', type: 'text', required: true },
        { name: 'tipo', label: 'Tipo', type: 'select', options: ['Abilitazione', 'Formazione', 'Sicurezza', 'IdoneitaTecnica', 'DocumentazioneCantiere'] },
        { name: 'intestatario', label: 'Intestatario', type: 'text' },
        { name: 'cantiereId', label: 'Cantiere collegato', type: 'select', optionsFrom: 'cantieri', optionLabel: (r) => `${r.codice} — ${r.nome}`, allowEmpty: true },
        { name: 'dataScadenza', label: 'Data scadenza', type: 'date', required: true }
      ],
      columns: [
        { label: 'Titolo', render: (r) => escapeHtml(r.titolo) },
        { label: 'Tipo', render: (r) => escapeHtml(r.tipo) },
        { label: 'Intestatario', render: (r) => escapeHtml(r.intestatario || '—') },
        { label: 'Scadenza', render: (r) => formattaData(r.dataScadenza) },
        { label: 'Stato', render: (r) => badgeStatoScadenza(r.dataScadenza) }
      ]
    },
    dpi: {
      label: 'DPI',
      icon: '🦺',
      singolare: 'DPI',
      fields: [
        { name: 'nome', label: 'Nome DPI', type: 'text', required: true },
        { name: 'squadraId', label: 'Squadra', type: 'select', optionsFrom: 'squadre', optionLabel: (r) => r.nome, allowEmpty: true },
        { name: 'dataScadenza', label: 'Data scadenza', type: 'date', required: true }
      ],
      columns: [
        { label: 'Nome', render: (r) => escapeHtml(r.nome) },
        { label: 'Squadra', render: (r) => escapeHtml(nomeRiferimento(db.squadre, r.squadraId, 'nome') || '—') },
        { label: 'Scadenza', render: (r) => formattaData(r.dataScadenza) },
        { label: 'Stato', render: (r) => badgeStatoScadenza(r.dataScadenza) }
      ]
    },
    mezzi: {
      label: 'Mezzi',
      icon: '🚐',
      singolare: 'Mezzo',
      fields: [
        { name: 'nome', label: 'Nome mezzo/attrezzatura', type: 'text', required: true },
        { name: 'tipo', label: 'Tipo', type: 'select', options: ['Automezzo', 'Attrezzatura'] },
        { name: 'squadraId', label: 'Squadra assegnata', type: 'select', optionsFrom: 'squadre', optionLabel: (r) => r.nome, allowEmpty: true }
      ],
      columns: [
        { label: 'Nome', render: (r) => escapeHtml(r.nome) },
        { label: 'Tipo', render: (r) => badge(r.tipo, r.tipo === 'Automezzo' ? 'neutro' : 'attivo') },
        { label: 'Squadra', render: (r) => escapeHtml(nomeRiferimento(db.squadre, r.squadraId, 'nome') || '—') }
      ]
    },
    materiali: {
      label: 'Materiali',
      icon: '📦',
      singolare: 'Materiale',
      fields: [
        { name: 'nome', label: 'Nome materiale', type: 'text', required: true },
        { name: 'unitaMisura', label: 'Unità di misura', type: 'text' },
        { name: 'scortaMinima', label: 'Scorta minima', type: 'number', required: true },
        { name: 'giacenza', label: 'Giacenza attuale', type: 'number', required: true }
      ],
      columns: [
        { label: 'Nome', render: (r) => escapeHtml(r.nome) },
        { label: 'U.M.', render: (r) => escapeHtml(r.unitaMisura || '—') },
        { label: 'Giacenza', render: (r) => r.giacenza },
        { label: 'Scorta minima', render: (r) => r.scortaMinima },
        { label: 'Stato', render: (r) => badgeSottoScorta(r) }
      ]
    },
    movimenti: {
      label: 'Movimenti',
      icon: '🔄',
      singolare: 'Movimento',
      fields: [
        { name: 'materialeId', label: 'Materiale', type: 'select', optionsFrom: 'materiali', optionLabel: (r) => r.nome, required: true },
        { name: 'data', label: 'Data movimento', type: 'date', required: true },
        { name: 'quantita', label: 'Quantità (positiva = carico, negativa = scarico)', type: 'number', required: true },
        { name: 'riferimento', label: 'Riferimento', type: 'text' },
        { name: 'cantiereId', label: 'Cantiere collegato', type: 'select', optionsFrom: 'cantieri', optionLabel: (r) => `${r.codice} — ${r.nome}`, allowEmpty: true }
      ],
      columns: [
        { label: 'Data', render: (r) => formattaData(r.data) },
        { label: 'Materiale', render: (r) => escapeHtml(nomeRiferimento(db.materiali, r.materialeId, 'nome') || '—') },
        { label: 'Quantità', render: (r) => badge((r.quantita > 0 ? '+' : '') + r.quantita, r.quantita > 0 ? 'ok' : 'attivo') },
        { label: 'Riferimento', render: (r) => escapeHtml(r.riferimento || '—') },
        { label: 'Cantiere', render: (r) => escapeHtml(nomeRiferimento(db.cantieri, r.cantiereId, 'codice') || '—') }
      ]
    }
  };

  const ORDINE_TAB = ['dashboard', 'cantieri', 'squadre', 'operatori', 'interventi', 'certificazioni', 'dpi', 'mezzi', 'materiali', 'movimenti'];

  /* ------------------------------------------------------------------ *
   * DASHBOARD KPI — porting di DashboardService.CreaKpi (Application)
   * ------------------------------------------------------------------ */

  function calcolaKpi() {
    const c = db.cantieri;
    const s = db.squadre;
    const i = db.interventi;

    const scadenzeDpi = db.dpi.filter((x) => getStatoScadenza(x.dataScadenza) !== 'Regolare').length;
    const scadenzeCertificazioni = db.certificazioni.filter((x) => getStatoScadenza(x.dataScadenza) !== 'Regolare').length;
    const sottoScorta = db.materiali.filter((x) => isSottoScorta(x)).length;

    return {
      cantieriAttivi: c.filter((x) => x.stato === 'InLavorazione').length,
      squadreTotali: s.length,
      squadreDisponibili: s.filter((sq) => !c.some((cn) => cn.squadraId === sq.id && cn.stato === 'InLavorazione')).length,
      interventiOggi: i.filter((x) => x.dataProgrammata === oggiISO()).length,
      interventiInRitardo: i.filter((x) => isInterventoInRitardo(x)).length,
      scadenzeCritiche: scadenzeCertificazioni + scadenzeDpi,
      materialiSottoScorta: sottoScorta
    };
  }

  function renderDashboard() {
    const kpi = calcolaKpi();
    const scadenzeVicine = [...db.certificazioni.map((c) => ({ ...c, origine: 'Certificazione' })), ...db.dpi.map((d) => ({ ...d, origine: 'DPI' }))]
      .filter((x) => getStatoScadenza(x.dataScadenza) !== 'Regolare')
      .sort((a, b) => new Date(a.dataScadenza) - new Date(b.dataScadenza))
      .slice(0, 5);

    const interventiRitardo = db.interventi.filter((x) => isInterventoInRitardo(x)).slice(0, 5);

    return `
      <div class="gestionale-section-header">
        <h2>Dashboard operativa</h2>
      </div>
      <p class="gestionale-dashboard-note">Stessa logica di aggregazione del DashboardService reale (Application layer), ricalcolata qui in JS sui dati della demo.</p>
      <div class="gestionale-kpi-grid">
        <div class="gestionale-kpi-card is-ok"><div class="gestionale-kpi-value">${kpi.cantieriAttivi}</div><div class="gestionale-kpi-label">Cantieri in lavorazione</div></div>
        <div class="gestionale-kpi-card"><div class="gestionale-kpi-value">${kpi.squadreDisponibili} / ${kpi.squadreTotali}</div><div class="gestionale-kpi-label">Squadre disponibili</div></div>
        <div class="gestionale-kpi-card"><div class="gestionale-kpi-value">${kpi.interventiOggi}</div><div class="gestionale-kpi-label">Interventi programmati oggi</div></div>
        <div class="gestionale-kpi-card ${kpi.interventiInRitardo > 0 ? 'is-danger' : 'is-ok'}"><div class="gestionale-kpi-value">${kpi.interventiInRitardo}</div><div class="gestionale-kpi-label">Interventi in ritardo</div></div>
        <div class="gestionale-kpi-card ${kpi.scadenzeCritiche > 0 ? 'is-warning' : 'is-ok'}"><div class="gestionale-kpi-value">${kpi.scadenzeCritiche}</div><div class="gestionale-kpi-label">Scadenze critiche (cert. + DPI)</div></div>
        <div class="gestionale-kpi-card ${kpi.materialiSottoScorta > 0 ? 'is-danger' : 'is-ok'}"><div class="gestionale-kpi-value">${kpi.materialiSottoScorta}</div><div class="gestionale-kpi-label">Materiali sotto scorta</div></div>
      </div>
      <div class="gestionale-mini-panels">
        <div class="gestionale-mini-panel">
          <h3>Scadenze più vicine</h3>
          ${
            scadenzeVicine.length
              ? `<ul>${scadenzeVicine.map((x) => `<li><span>${escapeHtml(x.origine)}: ${escapeHtml(x.titolo || x.nome)}</span>${badgeStatoScadenza(x.dataScadenza)}</li>`).join('')}</ul>`
              : '<p class="gestionale-empty-note">Nessuna scadenza imminente.</p>'
          }
        </div>
        <div class="gestionale-mini-panel">
          <h3>Interventi in ritardo</h3>
          ${
            interventiRitardo.length
              ? `<ul>${interventiRitardo.map((x) => `<li><span>${escapeHtml(x.descrizione)}</span><span>${formattaData(x.dataProgrammata)}</span></li>`).join('')}</ul>`
              : '<p class="gestionale-empty-note">Nessun intervento in ritardo. 👍</p>'
          }
        </div>
      </div>
    `;
  }

  /* ------------------------------------------------------------------ *
   * RENDER MODULO (tabella generica)
   * ------------------------------------------------------------------ */

  function renderModulo(chiave) {
    const modulo = MODULI[chiave];
    const lista = db[chiave];
    const query = searchQuery.trim().toLowerCase();
    const righe = query ? lista.filter((r) => JSON.stringify(r).toLowerCase().includes(query)) : lista;

    return `
      <div class="gestionale-section-header">
        <h2>${modulo.icon} ${modulo.label}</h2>
        <div style="display:flex; gap:10px; align-items:center;">
          <input type="text" class="gestionale-search" id="gestionaleSearchInput" placeholder="Cerca in ${modulo.label.toLowerCase()}..." value="${escapeHtml(searchQuery)}">
          <button type="button" class="gestionale-btn gestionale-btn-primary" id="gestionaleBtnNuovo">+ Nuovo ${modulo.singolare}</button>
        </div>
      </div>
      <div class="gestionale-table-wrap">
        <table class="gestionale-table">
          <thead>
            <tr>
              ${modulo.columns.map((c) => `<th>${escapeHtml(c.label)}</th>`).join('')}
              <th>Azioni</th>
            </tr>
          </thead>
          <tbody>
            ${
              righe.length
                ? righe
                    .map(
                      (r) => `
              <tr data-id="${r.id}">
                ${modulo.columns.map((c) => `<td>${c.render(r)}</td>`).join('')}
                <td class="gestionale-row-actions">
                  <button type="button" class="gestionale-icon-btn" data-action="modifica" data-id="${r.id}">Modifica</button>
                  <button type="button" class="gestionale-icon-btn is-danger" data-action="elimina" data-id="${r.id}">Elimina</button>
                </td>
              </tr>`
                    )
                    .join('')
                : `<tr><td colspan="${modulo.columns.length + 1}"><p class="gestionale-empty-note" style="padding:10px 0;">Nessun record${query ? ' corrispondente alla ricerca' : ''}.</p></td></tr>`
            }
          </tbody>
        </table>
      </div>
    `;
  }

  /* ------------------------------------------------------------------ *
   * MODALE FORM (crea / modifica)
   * ------------------------------------------------------------------ */

  function apriForm(chiave, recordId) {
    const modulo = MODULI[chiave];
    const record = recordId ? trovaPerId(db[chiave], recordId) : null;
    editingContext = { chiave, recordId: recordId || null };

    const overlay = document.getElementById('gestionaleModalOverlay');
    const modal = document.getElementById('gestionaleModal');

    const campiHtml = modulo.fields
      .map((f) => {
        const valoreAttuale = record ? record[f.name] : '';
        if (f.type === 'select') {
          let opzioni = [];
          if (f.optionsFrom) {
            opzioni = db[f.optionsFrom].map((r) => ({ value: String(r.id), label: f.optionLabel(r) }));
          } else {
            opzioni = f.options.map((o) => ({ value: o, label: o }));
          }
          const vuoto = f.allowEmpty ? `<option value="">— Nessuna —</option>` : '';
          const optHtml = opzioni
            .map((o) => `<option value="${escapeHtml(o.value)}" ${String(valoreAttuale) === o.value ? 'selected' : ''}>${escapeHtml(o.label)}</option>`)
            .join('');
          return `
            <div class="gestionale-form-field">
              <label for="campo-${f.name}">${escapeHtml(f.label)}</label>
              <select id="campo-${f.name}" name="${f.name}">${vuoto}${optHtml}</select>
            </div>`;
        }
        return `
          <div class="gestionale-form-field">
            <label for="campo-${f.name}">${escapeHtml(f.label)}</label>
            <input type="${f.type}" id="campo-${f.name}" name="${f.name}" value="${escapeHtml(valoreAttuale)}" ${f.required ? 'required' : ''}>
          </div>`;
      })
      .join('');

    modal.innerHTML = `
      <h3>${record ? 'Modifica' : 'Nuovo'} ${modulo.singolare}</h3>
      <form id="gestionaleForm">
        ${campiHtml}
        <div class="gestionale-form-actions">
          <button type="button" class="gestionale-btn" id="gestionaleBtnAnnulla">Annulla</button>
          <button type="submit" class="gestionale-btn gestionale-btn-primary">Salva</button>
        </div>
      </form>
    `;

    overlay.classList.add('is-open');
    document.getElementById('gestionaleBtnAnnulla').addEventListener('click', chiudiForm);
    document.getElementById('gestionaleForm').addEventListener('submit', salvaForm);
  }

  function chiudiForm() {
    document.getElementById('gestionaleModalOverlay').classList.remove('is-open');
    editingContext = null;
  }

  function salvaForm(evento) {
    evento.preventDefault();
    const { chiave, recordId } = editingContext;
    const modulo = MODULI[chiave];
    const formData = new FormData(evento.target);
    const nuovoRecord = recordId ? { ...trovaPerId(db[chiave], recordId) } : { id: prossimoId(db[chiave]) };

    modulo.fields.forEach((f) => {
      let valore = formData.get(f.name);
      if (f.type === 'number') valore = valore === '' ? null : Number(valore);
      if (f.type === 'select' && f.optionsFrom) valore = valore === '' ? null : Number(valore);
      nuovoRecord[f.name] = valore;
    });

    if (recordId) {
      const idx = db[chiave].findIndex((r) => r.id === recordId);
      db[chiave][idx] = nuovoRecord;
    } else {
      db[chiave].push(nuovoRecord);
    }

    // Effetto collaterale: un movimento materiale aggiorna la giacenza (come RegistraMovimento nell'app reale)
    if (chiave === 'movimenti') {
      const materiale = trovaPerId(db.materiali, Number(nuovoRecord.materialeId));
      if (materiale && !recordId) {
        materiale.giacenza = Number(materiale.giacenza) + Number(nuovoRecord.quantita);
      }
    }

    salvaDati();
    chiudiForm();
    render();
  }

  function eliminaRecord(chiave, id) {
    const modulo = MODULI[chiave];
    if (!confirm(`Eliminare questo ${modulo.singolare.toLowerCase()}? L'azione non è reversibile.`)) return;
    db[chiave] = db[chiave].filter((r) => r.id !== id);
    salvaDati();
    render();
  }

  /* ------------------------------------------------------------------ *
   * RENDER GENERALE / SIDEBAR / EVENTI
   * ------------------------------------------------------------------ */

  function renderSidebar() {
    const sidebar = document.getElementById('gestionaleSidebar');
    sidebar.innerHTML = ORDINE_TAB.map((chiave) => {
      if (chiave === 'dashboard') {
        return `<button type="button" class="gestionale-tab ${activeTab === 'dashboard' ? 'is-active' : ''}" data-tab="dashboard">
          <span class="gestionale-tab-icon">📊</span><span>Dashboard</span>
        </button>`;
      }
      const modulo = MODULI[chiave];
      return `<button type="button" class="gestionale-tab ${activeTab === chiave ? 'is-active' : ''}" data-tab="${chiave}">
        <span class="gestionale-tab-icon">${modulo.icon}</span><span>${modulo.label}</span>
        <span class="gestionale-tab-count">${db[chiave].length}</span>
      </button>`;
    }).join('');

    sidebar.querySelectorAll('.gestionale-tab').forEach((btn) => {
      btn.addEventListener('click', () => {
        activeTab = btn.dataset.tab;
        searchQuery = '';
        render();
      });
    });
  }

  function renderMain() {
    const main = document.getElementById('gestionaleMain');
    main.innerHTML = activeTab === 'dashboard' ? renderDashboard() : renderModulo(activeTab);

    if (activeTab !== 'dashboard') {
      const searchInput = document.getElementById('gestionaleSearchInput');
      searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        renderMain();
        // Ripristina il focus dopo il re-render della sola area principale
        const nuovoInput = document.getElementById('gestionaleSearchInput');
        nuovoInput.focus();
        nuovoInput.setSelectionRange(nuovoInput.value.length, nuovoInput.value.length);
      });

      document.getElementById('gestionaleBtnNuovo').addEventListener('click', () => apriForm(activeTab, null));

      main.querySelectorAll('[data-action="modifica"]').forEach((btn) => {
        btn.addEventListener('click', () => apriForm(activeTab, Number(btn.dataset.id)));
      });
      main.querySelectorAll('[data-action="elimina"]').forEach((btn) => {
        btn.addEventListener('click', () => eliminaRecord(activeTab, Number(btn.dataset.id)));
      });
    }
  }

  function render() {
    renderSidebar();
    renderMain();
  }

  /* ------------------------------------------------------------------ *
   * INIZIALIZZAZIONE
   * ------------------------------------------------------------------ */

  function initTema() {
    const salvato = localStorage.getItem('tema');
    if (salvato) document.documentElement.setAttribute('data-theme', salvato);
    const btn = document.getElementById('gestionaleThemeToggle');
    if (btn) {
      btn.addEventListener('click', () => {
        const attuale = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
        const nuovo = attuale === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', nuovo);
        localStorage.setItem('tema', nuovo);
      });
    }
  }

  function initReset() {
    const btn = document.getElementById('gestionaleBtnReset');
    if (!btn) return;
    btn.addEventListener('click', () => {
      if (!confirm('Ripristinare i dati demo originali? Tutte le modifiche fatte finora andranno perse.')) return;
      db = creaDatiDemo();
      salvaDati();
      activeTab = 'dashboard';
      render();
    });
  }

  function initOverlay() {
    const overlay = document.getElementById('gestionaleModalOverlay');
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) chiudiForm();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.classList.contains('is-open')) chiudiForm();
    });
  }

  function init() {
    initTema();
    initReset();
    initOverlay();
    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

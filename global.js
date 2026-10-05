/* Email protetta: ricostruita solo quando l'utente esegue un'azione. */
function decodePortfolioEmail() {
  const codes = [109,97,114,99,111,99,114,105,115,116,111,102,97,114,105,56,56,64,103,109,97,105,108,46,99,111,109];
  return codes.map(code => String.fromCharCode(code)).join('');
}

/**
 * ==========================================================================
 * GLOBAL.JS — FUNZIONALITÀ CONDIVISE PORTFOLIO MARCO CRISTOFARI
 * - Barra di avanzamento lettura scroll
 * - Animazioni di reveal sezioni con IntersectionObserver (rispetto prefers-reduced-motion)
 * - Command Palette rapida (Ctrl + K / Cmd + K) con ricerca istantanea e navigazione tastiera
 * ==========================================================================
 */

(function () {
  'use strict';

  // --- 1. BARRA DI AVANZAMENTO LETTURA SCROLL ---
  function initScrollProgress() {
    let progressBar = document.getElementById('scrollProgressBar');
    if (!progressBar) {
      progressBar = document.createElement('div');
      progressBar.id = 'scrollProgressBar';
      progressBar.className = 'scroll-progress-bar';
      progressBar.setAttribute('aria-hidden', 'true');
      document.body.appendChild(progressBar);
    }

    function aggiornaProgresso() {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      progressBar.style.width = Math.min(100, Math.max(0, progress)) + '%';
    }

    let ticking = false;
    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        aggiornaProgresso();
        ticking = false;
      });
    }, { passive: true });
    window.addEventListener('resize', aggiornaProgresso, { passive: true });
    aggiornaProgresso();
  }

  // --- 2. REVEAL MORBIDO ALLO SCROLL CON INTERSECTION OBSERVER ---
  function initScrollReveal() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      return; // Degrada con grazia: elementi già visibili
    }

    // Seleziona elementi di primo livello per l'animazione sobria
    const targets = document.querySelectorAll(
      '.timeline-card, .skill-category-card, .featured-project-card, .roadmap-card, .contact-item-card, .hero-side-card'
    );

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px'
      }
    );

    targets.forEach((el) => {
      el.classList.add('reveal-on-scroll');
      observer.observe(el);
    });
  }

  // --- 3. COMMAND PALETTE RAPIDA (Ctrl + K / Cmd + K) ---
  const COMMANDS = [
    // Pagine e Navigazione
    {
      id: 'nav-home',
      group: 'Navigazione Pagine',
      label: 'Home — Profilo, Percorso & Competenze',
      hint: 'index.html',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
      action: () => navigaVerso('index.html')
    },
    {
      id: 'nav-progetti',
      group: 'Navigazione Pagine',
      label: 'Progetti — Portfolio Applicazioni C#, Python & Web',
      hint: 'progetti.html',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',
      action: () => navigaVerso('progetti.html')
    },
    {
      id: 'nav-contatti',
      group: 'Navigazione Pagine',
      label: 'Contatti — Riferimenti & Modulo Diretto',
      hint: 'contatti.html',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22 6 12 13 2 6"/></svg>',
      action: () => navigaVerso('contatti.html')
    },

    {
      id: 'nav-gioco',
      group: 'Navigazione Pagine',
      label: "L'Eredità — Web App & TV Game Show",
      hint: 'gioco.html',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>',
      action: () => navigaVerso('gioco.html')
    },
    // Azioni Veloci
    {
      id: 'act-cv',
      group: 'Azioni Rapide',
      label: 'Scarica Curriculum Vitae (PDF)',
      hint: 'cv.pdf',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
      action: () => {
        const link = document.createElement('a');
        link.href = 'cv.pdf';
        link.download = 'Marco_Cristofari_CV.pdf';
        link.click();
      }
    },
    {
      id: 'act-theme',
      group: 'Azioni Rapide',
      label: 'Cambia Tema (Scuro / Chiaro)',
      hint: 'Toggle Theme',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>',
      action: () => {
        const html = document.documentElement;
        const isDark = html.getAttribute('data-theme') === 'dark';
        const newTheme = isDark ? 'light' : 'dark';
        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('tema', newTheme);
      }
    },
    {
      id: 'act-email',
      group: 'Azioni Rapide',
      label: 'Copia Indirizzo Email',
      hint: 'Copia',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
      action: () => copiaTesto(decodePortfolioEmail(), 'Email copiata negli appunti!')
    },
    {
      id: 'act-phone',
      group: 'Azioni Rapide',
      label: 'Copia Numero Telefono (+39 333 313 9123)',
      hint: 'Copia',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
      action: () => copiaTesto('+393333139123', 'Telefono copiato negli appunti!')
    },
    {
      id: 'act-linkedin',
      group: 'Azioni Rapide',
      label: 'Apri Profilo LinkedIn (Nuova Scheda)',
      hint: 'Esterno',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>',
      action: () => window.open('https://www.linkedin.com/in/marco-cristofari-15001b422/', '_blank', 'noopener,noreferrer')
    }
  ];

  function navigaVerso(href) {
    if (window.location.pathname.endsWith(href)) {
      return; // Già sulla pagina
    }
    document.body.classList.add('page-hidden');
    setTimeout(() => {
      window.location.href = href;
    }, 280);
  }

  async function copiaTesto(testo, messaggio) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(testo);
      } else {
        const ta = document.createElement('textarea');
        ta.value = testo;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      mostraMiniToast(messaggio);
    } catch (e) {
      console.error('Errore copia:', e);
    }
  }

  function mostraMiniToast(testo) {
    let toast = document.getElementById('globalMiniToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'globalMiniToast';
      toast.className = 'global-mini-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = testo;
    toast.classList.add('is-visible');
    setTimeout(() => {
      toast.classList.remove('is-visible');
    }, 2500);
  }

  function initCommandPalette() {
    // Genera markup modale
    const overlay = document.createElement('div');
    overlay.id = 'cmdPaletteOverlay';
    overlay.className = 'cmd-palette-overlay';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.innerHTML = `
      <div class="cmd-palette-box" role="dialog" aria-modal="true" aria-label="Menu Comandi Rapidi">
        <div class="cmd-palette-input-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input type="text" id="cmdPaletteInput" class="cmd-palette-input" placeholder="Digita un comando o cerca una pagina..." autocomplete="off" spellcheck="false">
          <button type="button" class="cmd-palette-close-btn" id="cmdPaletteClose" aria-label="Chiudi menu comandi">
            <kbd>Esc</kbd>
          </button>
        </div>
        <ul id="cmdPaletteList" class="cmd-palette-list" role="listbox"></ul>
        <div class="cmd-palette-footer">
          <span>Usa <kbd>↑</kbd> <kbd>↓</kbd> per scorrere, <kbd>↵</kbd> per selezionare</span>
          <span><kbd>Esc</kbd> per chiudere</span>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    const input = document.getElementById('cmdPaletteInput');
    const list = document.getElementById('cmdPaletteList');
    const closeBtn = document.getElementById('cmdPaletteClose');
    let filteredCommands = [...COMMANDS];
    let selectedIndex = 0;
    let lastFocusedElement = null;

    function apriPalette() {
      lastFocusedElement = document.activeElement;
      overlay.classList.add('is-open');
      overlay.setAttribute('aria-hidden', 'false');
      document.body.classList.add('modal-open');
      input.value = '';
      renderList('');
      requestAnimationFrame(() => {
        input.focus();
      });
    }

    function chiudiPalette() {
      overlay.classList.remove('is-open');
      overlay.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('modal-open');
      if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
        lastFocusedElement.focus();
      }
    }

    function renderList(query) {
      const q = query.trim().toLowerCase();
      filteredCommands = COMMANDS.filter((cmd) => {
        if (!q) return true;
        return (
          cmd.label.toLowerCase().includes(q) ||
          cmd.group.toLowerCase().includes(q) ||
          cmd.hint.toLowerCase().includes(q)
        );
      });

      list.innerHTML = '';
      if (filteredCommands.length === 0) {
        list.innerHTML = `
          <div class="cmd-palette-empty">
            Nessun comando o pagina corrispondente a "<strong>${escapeText(query)}</strong>"
          </div>
        `;
        return;
      }

      selectedIndex = 0;
      let currentGroup = '';

      filteredCommands.forEach((cmd, idx) => {
        if (cmd.group !== currentGroup) {
          currentGroup = cmd.group;
          const groupTitle = document.createElement('li');
          groupTitle.className = 'cmd-palette-group-title';
          groupTitle.textContent = currentGroup;
          list.appendChild(groupTitle);
        }

        const item = document.createElement('li');
        item.className = 'cmd-palette-item' + (idx === 0 ? ' is-selected' : '');
        item.setAttribute('role', 'option');
        item.setAttribute('aria-selected', idx === 0 ? 'true' : 'false');
        item.innerHTML = `
          <div class="cmd-palette-item-left">
            ${cmd.icon}
            <span>${cmd.label}</span>
          </div>
          <span class="cmd-palette-item-badge">${cmd.hint}</span>
        `;

        item.addEventListener('click', () => {
          eseguiComando(idx);
        });

        item.addEventListener('mouseenter', () => {
          impostaIndiceSelezionato(idx);
        });

        list.appendChild(item);
      });
    }

    function impostaIndiceSelezionato(idx) {
      if (filteredCommands.length === 0) return;
      selectedIndex = Math.max(0, Math.min(idx, filteredCommands.length - 1));
      const items = list.querySelectorAll('.cmd-palette-item');
      items.forEach((it, i) => {
        const sel = i === selectedIndex;
        it.classList.toggle('is-selected', sel);
        it.setAttribute('aria-selected', sel ? 'true' : 'false');
        if (sel) {
          it.scrollIntoView({ block: 'nearest' });
        }
      });
    }

    function eseguiComando(idx) {
      const cmd = filteredCommands[idx];
      if (!cmd) return;
      chiudiPalette();
      setTimeout(() => {
        cmd.action();
      }, 150);
    }

    function escapeText(str) {
      const div = document.createElement('div');
      div.textContent = str;
      return div.innerHTML;
    }

    input.addEventListener('input', () => {
      renderList(input.value);
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        // Mantiene il focus all'interno della palette quando è aperta.
        const focusables = overlay.querySelectorAll('button, input, [tabindex]:not([tabindex="-1"])');
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        impostaIndiceSelezionato(selectedIndex + 1);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        impostaIndiceSelezionato(selectedIndex - 1);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        eseguiComando(selectedIndex);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        chiudiPalette();
      }
    });

    closeBtn.addEventListener('click', chiudiPalette);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        chiudiPalette();
      }
    });

    // Scorciatoia globale Ctrl+K o Cmd+K
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        if (overlay.classList.contains('is-open')) {
          chiudiPalette();
        } else {
          apriPalette();
        }
      } else if (e.key === 'Escape' && overlay.classList.contains('is-open')) {
        chiudiPalette();
      }
    });

    // Collega pulsanti con classe .cmd-k-trigger
    document.querySelectorAll('.cmd-k-trigger').forEach((btn) => {
      btn.addEventListener('click', apriPalette);
    });
  }

  // --- INIZIALIZZAZIONE ALL'AVVIO ---
  function init() {
    initScrollProgress();
    initScrollReveal();
    initCommandPalette();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

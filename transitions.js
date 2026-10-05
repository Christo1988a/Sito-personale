/* ==========================================================================
   TRANSIZIONI TRA PAGINE
   Applica un fade-in all'ingresso e un fade-out prima di navigare
   verso un altro link interno del sito.
   ========================================================================== */
(function () {
  const DURATA_MS = 320;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function mostraPagina() {
    requestAnimationFrame(function () {
      document.body.classList.remove('page-hidden');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mostraPagina);
  } else {
    mostraPagina();
  }

  document.addEventListener('click', function (evento) {
    const link = evento.target.closest('a');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href) return;

    // Ignora link speciali: ancore, nuove schede, download, email, telefono
    if (link.target === '_blank') return;
    if (link.hasAttribute('download')) return;
    if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
    if (/^https?:\/\//i.test(href)) return; // link esterni (es. LinkedIn)
    if (evento.metaKey || evento.ctrlKey || evento.shiftKey || evento.altKey || evento.button !== 0) return;

    // Naviga solo dopo l'animazione di uscita
    evento.preventDefault();
    if (prefersReducedMotion) {
      window.location.href = href;
      return;
    }

    document.body.classList.add('page-hidden');
    setTimeout(function () {
      window.location.href = href;
    }, DURATA_MS);
  });
})();

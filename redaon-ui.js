/* ============================================================
   RedaON UI — redaon-ui.js (v1 · branch redesign)
   Injeta a barra de navegação inferior aprovada nos mockups.
   Vanilla JS, escopo global, sem type="module" (convenção do projeto).

   Uso em cada página, antes de </body>:
     <script>window.REDAON_NAV = 'inicio';</script>
     <script src="redaon-ui.js"></script>

   Valores de REDAON_NAV: 'inicio' | 'temas' | 'redacoes' | 'mais'
   (nova-redacao NÃO usa a barra — modo foco por decisão de design)
   ============================================================ */
(function () {
  var ativa = window.REDAON_NAV || '';

  // Modo foco: páginas sem barra simplesmente não definem REDAON_NAV
  if (!ativa) return;

  var itens = [
    { id: 'inicio',   rotulo: 'Início',   icone: 'home',        href: 'inicio.html' },
    { id: 'temas',    rotulo: 'Temas',    icone: 'description', href: 'temas.html' },
    { id: 'fab' },
    { id: 'redacoes', rotulo: 'Redações', icone: 'edit_note',   href: 'minhas-redacoes.html' },
    { id: 'mais',     rotulo: 'Mais',     icone: 'more_horiz',  href: 'configuracoes.html' }
  ];

  var nav = document.createElement('nav');
  nav.className = 'rd-bottomnav';
  nav.setAttribute('aria-label', 'Navegação principal');

  itens.forEach(function (item) {
    var a = document.createElement('a');
    if (item.id === 'fab') {
      a.className = 'rd-fab';
      a.href = 'nova-redacao.html';
      a.setAttribute('aria-label', 'Escrever nova redação');
      a.innerHTML = '<span class="material-symbols-outlined">stylus_note</span>';
    } else {
      a.href = item.href;
      if (item.id === ativa) {
        a.className = 'rd-on';
        a.setAttribute('aria-current', 'page');
      }
      a.innerHTML =
        '<span class="material-symbols-outlined">' + item.icone + '</span>' +
        '<span>' + item.rotulo + '</span>';
    }
    nav.appendChild(a);
  });

  document.body.appendChild(nav);
  document.body.classList.add('rd-has-nav');
})();

/* ============================================================
   RedaON · Portal do Aluno · BASE COMPARTILHADA · v6-2-1 (24/08/2026)
   v6-1: Aparência sai do menu Mais e da sidebar (decisão A6 — tema em
   dois lugares: sol/lua do topo + tela Configurações). Ícones/textos
   de tema remanescentes atualizam só se existirem no DOM.
   Injeta o esqueleto (sidebar, header, barra, gavetas, toast)
   e concentra tema, navegação e utilidades.
   Cada tela chama: montarEsqueleto({ ativo, titulo, icone, versao, sino })
   ============================================================ */

/* ─── Utilidades ─── */
var _tT;
function toast(m, ms) {
  var t = document.getElementById('toast');
  if (!t) return;
  t.textContent = m; t.classList.add('show');
  clearTimeout(_tT);
  _tT = setTimeout(function(){ t.classList.remove('show'); }, ms || 1900);
}
function mostrarEmBreve(nome) { toast(nome + ' \u2014 em breve \u2728', 2000); }
function escapeHtmlSimples(s) {
  if (s === null || s === undefined) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}
function fmtNum(n) {
  if (n === null || n === undefined || isNaN(n)) return '\u2014';
  return n;
}
window.authLogout = window.authLogout || function() {
  if (confirm('Deseja sair da sua conta?')) {
    localStorage.clear();
    window.location.href = 'login.html';
  }
};

/* ─── Tema claro/escuro/automático ─── */
function temaPreferido(){
  return document.documentElement.getAttribute('data-tema-pref') || 'auto';
}
function sistemaEstaClaro(){
  try { return window.matchMedia('(prefers-color-scheme: light)').matches; } catch(e) { return false; }
}
function aplicarTema(pref){
  var efetivo = (pref === 'auto') ? (sistemaEstaClaro() ? 'claro' : 'escuro') : pref;
  document.documentElement.setAttribute('data-tema', efetivo);
  document.documentElement.setAttribute('data-tema-pref', pref);
  try { localStorage.setItem('redaon-tema', pref); } catch(e) {}
  aplicarIconeTema();
}
function aplicarIconeTema() {
  var pref = temaPreferido();
  var efetivo = document.documentElement.getAttribute('data-tema');
  var icMat = (pref === 'auto') ? 'brightness_medium' : (efetivo === 'claro' ? 'dark_mode' : 'light_mode');
  var emoji = (pref === 'auto') ? '\u{1F317}' : (efetivo === 'claro' ? '\u{1F319}' : '\u2600\uFE0F');
  var nome = (pref === 'auto') ? 'Autom\u00e1tico' : (pref === 'claro' ? 'Claro' : 'Escuro');
  var el;
  el = document.getElementById('iconeTema');      if (el) el.textContent = icMat;
  el = document.getElementById('iconeTemaSide');  if (el) el.textContent = emoji;
  el = document.getElementById('iconeTemaMais');  if (el) el.textContent = emoji;
  el = document.getElementById('txtTemaSide');    if (el) el.textContent = 'Apar\u00eancia \u00b7 ' + nome;
  el = document.getElementById('txtTemaMais');    if (el) el.textContent = 'Apar\u00eancia \u00b7 ' + nome;
}
function alternarTema() {
  var ordem = ['claro','escuro','auto'];
  var prox = ordem[(ordem.indexOf(temaPreferido()) + 1) % 3];
  aplicarTema(prox);
  toast(prox === 'auto' ? '\u{1F317} Autom\u00e1tico \u2014 segue o aparelho'
      : (prox === 'claro' ? '\u2600\uFE0F Claro' : '\u{1F319} Escuro'), 1800);
}
(function(){
  try {
    var mq = window.matchMedia('(prefers-color-scheme: light)');
    var reagir = function(){ if (temaPreferido() === 'auto') aplicarTema('auto'); };
    if (mq.addEventListener) mq.addEventListener('change', reagir);
    else if (mq.addListener) mq.addListener(reagir);
  } catch(e) {}
})();

/* ─── Sidebar ─── */
function toggleSidebar() {
  var s = document.getElementById('sidebar');
  var o = document.getElementById('overlay');
  if (s) s.classList.toggle('open');
  if (o) o.classList.toggle('open');
}
function toggleRecolher() {
  var s = document.getElementById('sidebar');
  if (!s) return;
  if (window.innerWidth < 1024) { toggleSidebar(); return; }
  s.classList.toggle('mini');
  var mini = s.classList.contains('mini');
  var b = document.getElementById('btnRecolher');
  if (b) { b.innerHTML = mini ? '&raquo;' : '&laquo;'; b.title = mini ? 'Expandir menu' : 'Recolher menu'; }
  try { localStorage.setItem('redaon-menu', mini ? 'mini' : 'full'); } catch(e) {}
}

/* ─── Foco no resultado (helper compartilhado · v6-2) ───
   Toda escolha feita nos controles leva o resultado para a área nobre da tela,
   logo abaixo do cabeçalho. Só rola quando o resultado ainda não está visível ali
   (evita solavanco). Usado pelo Estúdio; serve Temas/Minhas Redações/Evolução. */
function focarResultados(id, opts) {
  opts = opts || {};
  var el = document.getElementById(id || 'lista');
  if (!el) return;
  var header = document.querySelector('header.hApp');
  var alturaTopo = (header ? header.offsetHeight : 0) + 8;
  var r = el.getBoundingClientRect();
  var jaVisivel = (r.top >= alturaTopo - 2 && r.top < window.innerHeight * 0.5);
  if (typeof opts.travar === 'function') opts.travar(jaVisivel ? 900 : 1400);
  if (jaVisivel) return;
  var destino = window.pageYOffset + r.top - alturaTopo;
  try { window.scrollTo({ top: destino, behavior: 'smooth' }); }
  catch(e) { window.scrollTo(0, destino); }
}

/* ─── Gavetas genéricas ─── */
function abrirGaveta(id) {
  var g = document.getElementById(id), b = document.getElementById(id + 'Bg');
  if (g) g.classList.add('open');
  if (b) b.classList.add('open');
}
function fecharGaveta(id) {
  var g = document.getElementById(id), b = document.getElementById(id + 'Bg');
  if (g) g.classList.remove('open');
  if (b) b.classList.remove('open');
  limparFundosOrfaos();
  acordarDocks();
}
/* Nenhum fundo escuro pode continuar capturando toques com a gaveta fechada */
function limparFundosOrfaos() {
  document.querySelectorAll('.gvBg.open').forEach(function(bg){
    var alvo = document.getElementById(String(bg.id).replace(/Bg$/, ''));
    if (!alvo || !alvo.classList.contains('open')) bg.classList.remove('open');
  });
}
function toggleGaveta(id) {
  var g = document.getElementById(id);
  if (g && g.classList.contains('open')) fecharGaveta(id); else abrirGaveta(id);
}

/* ─── Gaveta "Mais" ─── */
function abrirMais() {
  abrirGaveta('gavetaMais');
  var m = document.getElementById('bMais'); if (m) m.classList.add('on');
}
function fecharMais() {
  fecharGaveta('gavetaMais');
  var m = document.getElementById('bMais'); if (m) m.classList.remove('on');
}
function toggleMais() {
  var g = document.getElementById('gavetaMais');
  if (g && g.classList.contains('open')) fecharMais(); else abrirMais();
}

/* ─── Gaveta de métodos (Escrever) ───
   Contrato de produção: sessionStorage['tema_selecionado'] = JSON do tema.
   definirTemaSelecionado(obj) antes de abrir preenche a legenda e a sessão. */
function definirTemaSelecionado(tema) {
  try {
    if (tema) sessionStorage.setItem('tema_selecionado', JSON.stringify(tema));
    else sessionStorage.removeItem('tema_selecionado');
  } catch(e) {}
  var el = document.getElementById('metodoTema');
  if (el) el.textContent = tema && tema.titulo ? 'Tema: ' + tema.titulo : 'Escolha o tema depois, na folha';
}
function abrirMetodos() { fecharMais(); abrirGaveta('gavetaMetodos'); }
function fecharMetodos() { fecharGaveta('gavetaMetodos'); limparFundosOrfaos(); }
function toggleMetodos() {
  var g = document.getElementById('gavetaMetodos');
  if (g && g.classList.contains('open')) fecharMetodos(); else abrirMetodos();
}

/* ─── Montagem do esqueleto ─── */
function montarEsqueleto(cfg) {
  cfg = cfg || {};
  var ativo = cfg.ativo || '';
  var body = document.body;

  function navClasse(chave){ return 'nav-item' + (ativo === chave ? ' ativo' : ''); }
  function barraClasse(chave){ return ativo === chave ? ' class="on"' : ''; }

  /* Overlay + Sidebar */
  var topo = document.createElement('div');
  topo.innerHTML =
    '<div id="overlay" onclick="toggleSidebar()"></div>' +
    '<aside id="sidebar">' +
      '<div class="sideLogo">' +
        '<span class="lg" onclick="toggleRecolher()">R</span>' +
        '<span class="nm">Reda<i>ON</i></span>' +
        '<button id="btnRecolher" onclick="toggleRecolher()" title="Recolher menu">&laquo;</button>' +
      '</div>' +
      '<nav style="flex:1;overflow-y:auto;display:flex;flex-direction:column;gap:.2rem;">' +
        '<a class="' + navClasse('inicio') + '" href="inicio.html" title="In\u00edcio"><i class="em">\u{1F3E0}</i><span class="tx">In\u00edcio</span></a>' +
        '<a class="' + navClasse('temas') + '" href="temas.html" title="Temas"><i class="em">\u{1F4CB}</i><span class="tx">Temas</span></a>' +
        '<a class="' + navClasse('escrever') + '" onclick="abrirMetodos()" style="cursor:pointer;" title="Escrever"><i class="em">\u270F\uFE0F</i><span class="tx">Escrever</span></a>' +
        '<a class="' + navClasse('redacoes') + '" href="minhas-redacoes.html" title="Minhas Reda\u00e7\u00f5es"><i class="em">\u{1F4DA}</i><span class="tx">Minhas Reda\u00e7\u00f5es</span></a>' +
        '<p class="nav-section-label"><span>Mais</span></p>' +
        '<a class="nav-item" href="evolucao.html" title="Evolu\u00e7\u00e3o"><i class="em">\u{1F4C8}</i><span class="tx">Evolu\u00e7\u00e3o</span></a>' +
        '<a class="nav-item" href="plano.html" title="Plano de estudos"><i class="em">\u{1F4C5}</i><span class="tx">Plano de estudos</span></a>' +
        '<a class="' + navClasse('estudio') + '" href="estudio.html" title="Est\u00fadio"><i class="em">\u{1F4D6}</i><span class="tx">Est\u00fadio</span></a>' +
        '<p class="nav-section-label"><span>Conta</span></p>' +
        '<a class="nav-item" href="configuracoes.html" title="Configura\u00e7\u00f5es"><i class="em">\u2699\uFE0F</i><span class="tx">Configura\u00e7\u00f5es</span></a>' +
        '<a class="nav-item" onclick="authLogout()" style="cursor:pointer;color:var(--red);margin-top:.3rem;" title="Sair"><i class="em">\u{1F6AA}</i><span class="tx">Sair</span></a>' +
      '</nav>' +
      '<div class="perfilAluno" id="perfilAluno" title="Perfil">' +
        '<div class="avt" id="avatarSidebar">\u{1F9D1}\u200D\u{1F393}</div>' +
        '<div class="tx" style="min-width:0;">' +
          '<span id="nomeUsuarioSidebar" style="display:block;font-size:.8rem;font-weight:700;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">Estudante</span>' +
          '<span style="display:block;font-size:.65rem;color:var(--muted);">Portal do Aluno</span>' +
        '</div>' +
      '</div>' +
      '<p class="sideVersao">' + (cfg.versao || 'aluno') + '</p>' +
    '</aside>';
  while (topo.firstChild) body.insertBefore(topo.firstChild, body.firstChild);

  /* Header dentro do main-content */
  var main = document.getElementById('main-content');
  if (main) {
    var hd = document.createElement('header');
    hd.className = 'hApp';
    hd.innerHTML =
      '<div style="display:flex;align-items:center;gap:.5rem;">' +
        '<button id="btnHamburger" onclick="toggleSidebar()" aria-label="Abrir menu"><span class="material-symbols-outlined">menu</span></button>' +
        '<div style="display:flex;align-items:center;gap:.5rem;">' +
          '<span class="material-symbols-outlined" style="color:var(--cyan);font-variation-settings:\'FILL\' 1;">' + (cfg.icone || 'edit_note') + '</span>' +
          '<h2 style="font-size:1.1rem;font-weight:800;color:var(--text);">' + (cfg.titulo || 'RedaON') + '</h2>' +
        '</div>' +
      '</div>' +
      '<div style="display:flex;align-items:center;gap:.25rem;">' +
        '<button id="btnTema" onclick="alternarTema()" title="Alternar tema" aria-label="Alternar tema"><span class="material-symbols-outlined" id="iconeTema">light_mode</span></button>' +
        (cfg.sino ? '<button class="hIcone" onclick="mostrarEmBreve(\'Notifica\u00e7\u00f5es\')" aria-label="Notifica\u00e7\u00f5es"><span class="material-symbols-outlined">notifications</span><span class="ponto"></span></button>' : '') +
      '</div>';
    main.insertBefore(hd, main.firstChild);
  }

  /* Barra inferior + gavetas Mais/Métodos + toast */
  var fim = document.createElement('div');
  fim.innerHTML =
    '<div class="gvBg atrasBarra" id="gavetaMaisBg" onclick="fecharMais()"></div>' +
    '<div class="gv atrasBarra" id="gavetaMais">' +
      '<div class="grip"></div>' +
      '<p class="tit">Mais</p>' +
      '<a class="pill" href="evolucao.html"><i class="pemoji">\u{1F4C8}</i>Evolu\u00e7\u00e3o<i class="fim">\u203A</i></a>' +
      '<a class="pill" href="plano.html"><i class="pemoji">\u{1F4C5}</i>Plano de estudos<i class="fim">\u203A</i></a>' +
      '<a class="pill" href="estudio.html"><i class="pemoji">\u{1F4D6}</i>Est\u00fadio<i class="fim">\u203A</i></a>' +
      '<a class="pill" href="configuracoes.html"><i class="pemoji">\u2699\uFE0F</i>Configura\u00e7\u00f5es<i class="fim">\u203A</i></a>' +
      '<a class="pill" style="color:var(--red);" onclick="authLogout()"><i class="pemoji">\u{1F6AA}</i>Sair</a>' +
    '</div>' +
    '<div class="gvBg atrasTudo" id="gavetaMetodosBg" onclick="fecharMetodos()"></div>' +
    '<div class="gv atrasTudo" id="gavetaMetodos">' +
      '<div class="grip"></div>' +
      '<p class="tit">Como voc\u00ea quer fazer sua reda\u00e7\u00e3o?</p>' +
      '<p class="sub" id="metodoTema">Escolha o tema depois, na folha</p>' +
      '<a class="pill" style="background:rgba(var(--cyanRGB),.12);color:var(--cyan);border-color:rgba(var(--cyanRGB),.35);" href="nova-redacao.html?metodo=digitar"><i class="pemoji">\u270F\uFE0F</i>Digitar na folha <span style="font-size:.7rem;color:var(--muted);font-weight:400;">recomendado</span><i class="fim">\u203A</i></a>' +
      '<a class="pill" href="nova-redacao.html?metodo=imagem"><i class="pemoji" style="color:var(--purpleSoft);">\u{1F4F7}</i>Enviar imagem<i class="fim">\u203A</i></a>' +
      '<a class="pill" href="nova-redacao.html?metodo=pdf"><i class="pemoji" style="color:var(--gold);">\u{1F4C4}</i>Enviar documento<i class="fim">\u203A</i></a>' +
    '</div>' +
    '<nav id="barraInferior">' +
      '<a' + barraClasse('inicio') + ' href="inicio.html"><i class="bEmoji">\u{1F3E0}</i>In\u00edcio</a>' +
      '<a' + barraClasse('temas') + ' href="temas.html"><i class="bEmoji">\u{1F4CB}</i>Temas</a>' +
      '<a class="fabWrap" onclick="toggleMetodos()"><span class="fab"><i class="bEmoji" style="font-size:20px;">\u270F\uFE0F</i></span><span class="fabCap">Escrever</span></a>' +
      '<a' + barraClasse('redacoes') + ' href="minhas-redacoes.html"><i class="bEmoji">\u{1F4DA}</i>Reda\u00e7\u00f5es</a>' +
      '<a id="bMais" onclick="toggleMais()"><i class="bEmoji">\u2630</i>Mais</a>' +
    '</nav>' +
    '<div id="toast"></div>';
  while (fim.firstChild) body.appendChild(fim.firstChild);

  /* Estado inicial */
  try {
    if (localStorage.getItem('redaon-menu') === 'mini' && window.innerWidth >= 1024) {
      var s = document.getElementById('sidebar');
      if (s) s.classList.add('mini');
      var b = document.getElementById('btnRecolher');
      if (b) { b.innerHTML = '&raquo;'; b.title = 'Expandir menu'; }
    }
  } catch(e) {}
  aplicarIconeTema();

  /* Nome do aluno */
  var nome = (typeof authGetNome === 'function') ? authGetNome() : 'Estudante';
  var el = document.getElementById('nomeUsuarioSidebar');
  if (el) el.textContent = nome;
  window.NOME_ALUNO = nome;
  window.PRIMEIRO_NOME = String(nome).split(' ')[0];
}

var _docksVivas = [];
/* Fechou gaveta? A dock volta na hora, sem depender de rolagem. */
function acordarDocks(){ _docksVivas.forEach(function(f){ try { f(); } catch(e) {} }); }
/* ─── Dock da zona do polegar (comportamento padrão) ───
   iniciarDock('idDaDock', { protegidaPor: 'idDeGavetaQueImpedeRecolher' }) */
function iniciarDock(dockId, opts) {
  opts = opts || {};
  var dock = document.getElementById(dockId);
  if (!dock) return;
  document.body.classList.add('temDock');
  var timer = null, lastY = 0;
  // Informa a altura real da dock ao CSS, para as gavetas reservarem a folga certa
  function medirDock(){
    var h = dock.offsetHeight || 160;
    document.documentElement.style.setProperty('--alturaDock', h + 'px');
  }
  medirDock();
  window.addEventListener('resize', medirDock);
  if (window.ResizeObserver) { try { new ResizeObserver(medirDock).observe(dock); } catch(e) {} }
  function protegida() {
    // Nunca recolher com gaveta aberta, com o dedo na dock ou com campo em foco
    if (dock.dataset.segurando === '1') return true;
    if (dock.contains(document.activeElement)) return true;
    var alvos = [].concat(opts.protegidaPor || []);
    for (var i = 0; i < alvos.length; i++) {
      var g = document.getElementById(alvos[i]);
      if (g && g.classList.contains('open')) return true;
    }
    return false;
  }
  function agendar() {
    if (timer) clearTimeout(timer);
    timer = setTimeout(function(){
      if (protegida()) { agendar(); return; }
      dock.classList.add('recolhida');
    }, 8000);
  }
  function mostrar() { dock.dataset.segurando = '0'; dock.classList.remove('recolhida'); agendar(); }
  window['mostrarDock_' + dockId] = mostrar;
  _docksVivas.push(mostrar);
  /* Soltar o dedo em QUALQUER lugar limpa a marca (antes ela ficava presa
     quando o toque come\u00e7ava na dock e terminava sobre uma gaveta) */
  ['pointerup','touchend','touchcancel','mouseup'].forEach(function(ev){
    document.addEventListener(ev, function(){ dock.dataset.segurando = '0'; });
  });
  window['mostrarDock_' + dockId] = mostrar;
  window.addEventListener('scroll', function(){
    var y = window.scrollY;
    if (y < 24) { mostrar(); }
    else if (y > lastY + 4 && !protegida()) { dock.classList.add('recolhida'); if (timer) clearTimeout(timer); }
    else if (y < lastY - 4) { mostrar(); }
    lastY = y;
  }, { passive:true });
  // Enquanto o dedo estiver na dock, ela não foge
  ['touchstart','pointerdown','mousedown'].forEach(function(ev){
    dock.addEventListener(ev, function(){ dock.dataset.segurando = '1'; mostrar(); });
  });
  ['touchend','pointerup','mouseup','touchcancel'].forEach(function(ev){
    dock.addEventListener(ev, function(){ dock.dataset.segurando = '0'; mostrar(); });
  });
  ['click','focusin','input','change'].forEach(function(ev){
    dock.addEventListener(ev, function(){ mostrar(); });
  });
  mostrar();
}

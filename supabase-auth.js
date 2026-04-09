/**
 * RedaON — supabase-auth.js
 * Biblioteca global de autenticação e acesso ao banco.
 * Incluir via <script src="supabase-auth.js"></script> em todas as telas.
 * NÃO usa type="module" — funciona com fetch direto.
 */

// ─────────────────────────────────────────────
// CONFIGURAÇÃO
// ─────────────────────────────────────────────
const SUPABASE_URL = 'https://fejlkxmjucnhdvgwtilo.supabase.co';
const SUPABASE_KEY = 'sb_publishable_M43NSb-WXlxgo6m-P1_oKg_YLf0wjOY';

// ─────────────────────────────────────────────
// AUTH — Login / Logout / Cadastro
// ─────────────────────────────────────────────

async function authLogin(email, senha) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_KEY
    },
    body: JSON.stringify({ email, password: senha })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error_description || data.msg || 'Erro ao fazer login');
  
  // Salvar sessão no localStorage
  localStorage.setItem('redaon_token', data.access_token);
  localStorage.setItem('redaon_refresh', data.refresh_token);
  localStorage.setItem('redaon_user_id', data.user.id);
  localStorage.setItem('redaon_user_email', data.user.email);
  
  // Buscar perfil completo
  const perfil = await dbGetPerfil(data.user.id, data.access_token);
  localStorage.setItem('redaon_perfil', JSON.stringify(perfil));
  localStorage.setItem('redaon_tipo', perfil?.perfil || 'aluno');
  localStorage.setItem('redaon_nome', perfil?.nome || data.user.email);
  
  return { user: data.user, perfil };
}

async function authCadastro({ nome, email, senha, perfil = 'aluno', escola = null, cpf = null }) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_KEY
    },
    body: JSON.stringify({
      email,
      password: senha,
      data: { nome, perfil, escola, cpf }
    })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error_description || data.msg || 'Erro ao criar conta');
  if (data.error) throw new Error(data.error_description || data.error);
  return data;
}

async function authLogout() {
  const token = localStorage.getItem('redaon_token');
  if (token) {
    await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'apikey': SUPABASE_KEY
      }
    }).catch(() => {});
  }
  localStorage.removeItem('redaon_token');
  localStorage.removeItem('redaon_refresh');
  localStorage.removeItem('redaon_user_id');
  localStorage.removeItem('redaon_user_email');
  localStorage.removeItem('redaon_perfil');
  localStorage.removeItem('redaon_tipo');
  localStorage.removeItem('redaon_nome');
  window.location.href = 'login.html';
}

async function authRefreshToken() {
  const refresh = localStorage.getItem('redaon_refresh');
  if (!refresh) return null;
  
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_KEY
    },
    body: JSON.stringify({ refresh_token: refresh })
  });
  
  if (!res.ok) {
    authLogout();
    return null;
  }
  
  const data = await res.json();
  localStorage.setItem('redaon_token', data.access_token);
  localStorage.setItem('redaon_refresh', data.refresh_token);
  return data.access_token;
}

// ─────────────────────────────────────────────
// SESSÃO — Verificar se está logado
// ─────────────────────────────────────────────

function authGetToken() {
  return localStorage.getItem('redaon_token');
}

function authGetUserId() {
  return localStorage.getItem('redaon_user_id');
}

function authGetNome() {
  return localStorage.getItem('redaon_nome') || 'Usuário';
}

function authGetTipo() {
  return localStorage.getItem('redaon_tipo') || 'aluno';
}

function authGetPerfil() {
  const p = localStorage.getItem('redaon_perfil');
  try { return p ? JSON.parse(p) : null; } catch { return null; }
}

function authEstaLogado() {
  return !!localStorage.getItem('redaon_token');
}

/**
 * Guard de rota — chamar no topo de cada tela protegida:
 *   authGuard();          // qualquer usuário logado
 *   authGuard('professor'); // só professores
 *   authGuard('admin');     // só admin
 */
function authGuard(tipoRequerido = null) {
  if (!authEstaLogado()) {
    window.location.href = 'login.html';
    return;
  }
  if (tipoRequerido && authGetTipo() !== tipoRequerido) {
    // Redireciona para a tela correta do seu perfil
    const rota = { aluno: 'inicio.html', professor: 'professor.html', admin: 'admin-professores.html' };
    window.location.href = rota[authGetTipo()] || 'login.html';
  }
}

// ─────────────────────────────────────────────
// DATABASE — Helpers de fetch para a REST API
// ─────────────────────────────────────────────

function dbHeaders(token = null) {
  const t = token || authGetToken();
  return {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${t || SUPABASE_KEY}`,
    'Prefer': 'return=representation'
  };
}

async function dbGetPerfil(userId, token = null) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/usuarios?id=eq.${userId}&select=*`, {
    headers: dbHeaders(token)
  });
  const data = await res.json();
  return data[0] || null;
}

async function dbUpdatePerfil(campos) {
  const userId = authGetUserId();
  const res = await fetch(`${SUPABASE_URL}/rest/v1/usuarios?id=eq.${userId}`, {
    method: 'PATCH',
    headers: dbHeaders(),
    body: JSON.stringify(campos)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(data));
  
  // Atualizar cache local
  const perfil = authGetPerfil();
  localStorage.setItem('redaon_perfil', JSON.stringify({ ...perfil, ...campos }));
  if (campos.nome) localStorage.setItem('redaon_nome', campos.nome);
  return data[0];
}

async function dbGetRedacoes(filtros = {}) {
  const userId = authGetUserId();
  let url = `${SUPABASE_URL}/rest/v1/redacoes?aluno_id=eq.${userId}&order=created_at.desc`;
  if (filtros.status) url += `&status=eq.${filtros.status}`;
  if (filtros.limit) url += `&limit=${filtros.limit}`;
  
  const res = await fetch(url, { headers: dbHeaders() });
  return await res.json();
}

async function dbSalvarRedacao({ texto, tema_id = null, tema_livre = null, turma_id = null }) {
  const userId = authGetUserId();
  const res = await fetch(`${SUPABASE_URL}/rest/v1/redacoes`, {
    method: 'POST',
    headers: dbHeaders(),
    body: JSON.stringify({
      aluno_id: userId,
      texto,
      tema_id,
      tema_livre,
      turma_id,
      status: 'enviada'
    })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(data));
  return data[0];
}

async function dbGetTemas(filtros = {}) {
  let url = `${SUPABASE_URL}/rest/v1/temas?ativo=eq.true&order=created_at.desc`;
  if (filtros.categoria) url += `&categoria=eq.${encodeURIComponent(filtros.categoria)}`;
  if (filtros.nivel) url += `&nivel=eq.${encodeURIComponent(filtros.nivel)}`;
  
  const res = await fetch(url, { headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` } });
  return await res.json();
}

async function dbGetCorrecoes(redacaoId) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/correcoes?redacao_id=eq.${redacaoId}&order=created_at.desc`, {
    headers: dbHeaders()
  });
  return await res.json();
}

async function dbSalvarCorrecaoIA({ redacao_id, c1, c2, c3, c4, c5, feedback_geral, feedback_c1, feedback_c2, feedback_c3, feedback_c4, feedback_c5, pontos_fortes, pontos_melhorar }) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/correcoes`, {
    method: 'POST',
    headers: dbHeaders(),
    body: JSON.stringify({
      redacao_id,
      tipo: 'ia',
      c1, c2, c3, c4, c5,
      feedback_geral, feedback_c1, feedback_c2, feedback_c3, feedback_c4, feedback_c5,
      pontos_fortes, pontos_melhorar
    })
  });
  const data = await res.json();
  
  // Atualizar nota na redação
  const nota = (c1||0)+(c2||0)+(c3||0)+(c4||0)+(c5||0);
  await fetch(`${SUPABASE_URL}/rest/v1/redacoes?id=eq.${redacao_id}`, {
    method: 'PATCH',
    headers: dbHeaders(),
    body: JSON.stringify({ status: 'corrigida', nota_final: nota })
  });
  
  return data[0];
}

async function dbGetRanking(turmaId = null) {
  let url = `${SUPABASE_URL}/rest/v1/ranking?order=media_notas.desc&limit=50`;
  if (turmaId) url += `&turma_id=eq.${turmaId}`;
  const res = await fetch(url, { headers: dbHeaders() });
  return await res.json();
}

// ─────────────────────────────────────────────
// PROFESSOR — helpers específicos
// ─────────────────────────────────────────────

async function dbGetAlunosDoProfessor() {
  const profId = authGetUserId();
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/turma_alunos?select=aluno_id,joined_at,turmas!inner(professor_id,nome),usuarios!inner(nome,email,plano)&turmas.professor_id=eq.${profId}`,
    { headers: dbHeaders() }
  );
  return await res.json();
}

async function dbGetTurmasDoProfessor() {
  const profId = authGetUserId();
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/turmas?professor_id=eq.${profId}&order=nome`,
    { headers: dbHeaders() }
  );
  return await res.json();
}

async function dbGetRedacoesDaTurma(turmaId) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/redacoes?turma_id=eq.${turmaId}&order=created_at.desc&select=*,usuarios!inner(nome)`,
    { headers: dbHeaders() }
  );
  return await res.json();
}

// ─────────────────────────────────────────────
// UTILITÁRIOS
// ─────────────────────────────────────────────

function formatarData(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function notaParaCor(nota) {
  if (nota >= 800) return '#45edee';
  if (nota >= 600) return '#6c5ce7';
  if (nota >= 400) return '#f39c12';
  return '#e74c3c';
}

function notaParaLabel(nota) {
  if (nota >= 800) return 'Excelente';
  if (nota >= 600) return 'Bom';
  if (nota >= 400) return 'Regular';
  return 'Iniciante';
}

// Preencher nome do usuário em elementos com data-user-name
function preencherNomeUsuario() {
  const nome = authGetNome();
  document.querySelectorAll('[data-user-name]').forEach(el => el.textContent = nome);
}

// Inicialização automática: preencher nomes quando o DOM estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', preencherNomeUsuario);
} else {
  preencherNomeUsuario();
}

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
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZlamxreG1qdWNuaGR2Z3d0aWxvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5NDc2MjMsImV4cCI6MjA5MDUyMzYyM30.autXhnCTjmz4w41fuBT-leZgnegzDe7RTQZ37PmNazY';

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

/**
 * Versão segura do fetch para o Supabase.
 * Se receber 401 (JWT expirado), renova o token automaticamente e tenta de novo.
 */
async function dbFetch(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: { ...dbHeaders(), ...(options.headers || {}) }
  });

  if (res.status !== 401) return res;

  // Token expirado — tenta renovar
  const novoToken = await authRefreshToken();
  if (!novoToken) {
    window.location.href = 'login.html';
    return res;
  }

  // Segunda tentativa com token novo
  return fetch(url, {
    ...options,
    headers: { ...dbHeaders(novoToken), ...(options.headers || {}) }
  });
}

async function dbGetPerfil(userId, token = null) {
  const res = await dbFetch(`${SUPABASE_URL}/rest/v1/usuarios?id=eq.${userId}&select=*`, {
    headers: dbHeaders(token)
  });
  const data = await res.json();
  return data[0] || null;
}

async function dbUpdatePerfil(campos) {
  const userId = authGetUserId();
  const res = await dbFetch(`${SUPABASE_URL}/rest/v1/usuarios?id=eq.${userId}`, {
    method: 'PATCH',body: JSON.stringify(campos)
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
  
  const res = await dbFetch(url, {});
  return await res.json();
}

async function dbSalvarRedacao({ texto, tema_id = null, tema_livre = null, turma_id = null }) {
  const userId = authGetUserId();
  const res = await dbFetch(`${SUPABASE_URL}/rest/v1/redacoes`, {
    method: 'POST',body: JSON.stringify({
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
  const res = await dbFetch(`${SUPABASE_URL}/rest/v1/correcoes?redacao_id=eq.${redacaoId}&order=created_at.desc`, {});
  return await res.json();
}

async function dbSalvarCorrecaoIA({ redacao_id, c1, c2, c3, c4, c5, feedback_geral, feedback_c1, feedback_c2, feedback_c3, feedback_c4, feedback_c5, pontos_fortes, pontos_melhorar }) {
  const res = await dbFetch(`${SUPABASE_URL}/rest/v1/correcoes`, {
    method: 'POST',body: JSON.stringify({
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
  await dbFetch(`${SUPABASE_URL}/rest/v1/redacoes?id=eq.${redacao_id}`, {
    method: 'PATCH',body: JSON.stringify({ status: 'corrigida', nota_final: nota })
  });
  
  return data[0];
}

async function dbGetRanking(turmaId = null) {
  let url = `${SUPABASE_URL}/rest/v1/ranking?order=media_notas.desc&limit=50`;
  if (turmaId) url += `&turma_id=eq.${turmaId}`;
  const res = await dbFetch(url, {});
  return await res.json();
}

// ─────────────────────────────────────────────
// PROFESSOR — helpers específicos (Caminho B)
// Atualizado em 27/04/2026 — Etapa 2 do Painel Professor
// Tabela oficial de vínculo aluno↔turma: alunos_turma
// ─────────────────────────────────────────────

// ---------- ESCOLAS ----------

/**
 * Cria uma escola vinculada ao professor logado.
 * @param {object} dados - { nome, cidade, estado }
 * @returns {Promise<object>} escola criada
 */
async function dbSalvarEscola({ nome, cidade = null, estado = null }) {
  const profId = authGetUserId();
  const res = await dbFetch(`${SUPABASE_URL}/rest/v1/escolas`, {
    method: 'POST',
    body: JSON.stringify({
      nome,
      cidade,
      estado,
      professor_id: profId
    })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(data));
  return data[0];
}

/**
 * Lista as escolas que o professor logado criou.
 * @returns {Promise<Array>} lista de escolas
 */
async function dbGetEscolasDoProfessor() {
  const profId = authGetUserId();
  const res = await dbFetch(
    `${SUPABASE_URL}/rest/v1/escolas?professor_id=eq.${profId}&order=nome`,
    {}
  );
  const data = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(data));
  return data;
}

// ---------- TURMAS ----------

/**
 * Cria uma turma. O código é gerado automaticamente pela função SQL
 * gerar_codigo_turma() (trigger do banco).
 * @param {object} dados - { escola_id, nome, serie, ano_letivo }
 * @returns {Promise<object>} turma criada (já com código gerado)
 */
async function dbSalvarTurma({ escola_id, nome, serie = null, ano_letivo = null }) {
  const profId = authGetUserId();
  const res = await dbFetch(`${SUPABASE_URL}/rest/v1/turmas`, {
    method: 'POST',
    body: JSON.stringify({
      escola_id,
      professor_id: profId,
      nome,
      serie,
      ano_letivo: ano_letivo || new Date().getFullYear()
    })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(data));
  return data[0];
}

/**
 * Lista todas as turmas do professor logado, com nome da escola via JOIN.
 * REFATORADA — agora inclui dados da escola.
 * @returns {Promise<Array>} lista de turmas com escola
 */
async function dbGetTurmasDoProfessor() {
  const profId = authGetUserId();
  const res = await dbFetch(
    `${SUPABASE_URL}/rest/v1/turmas?professor_id=eq.${profId}&order=nome&select=*,escolas(id,nome,cidade,estado)`,
    {}
  );
  const data = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(data));
  return data;
}

// ---------- ALUNOS ----------

/**
 * Aluno entra numa turma usando o código (estilo Google Classroom).
 * Idempotente — se o aluno já está na turma, retorna o vínculo existente.
 *
 * @param {string} codigo - código da turma (ex: "redaon-rapido-tigre-42")
 * @returns {Promise<object>} { turma, vinculo, jaEstava }
 */
async function dbAlunoEntrarComCodigo(codigo) {
  const userId = authGetUserId();
  const codigoLimpo = (codigo || '').trim().toLowerCase();
  if (!codigoLimpo) throw new Error('Código da turma vazio.');

  // 1. Buscar turma pelo código
  const resTurma = await dbFetch(
    `${SUPABASE_URL}/rest/v1/turmas?codigo=eq.${encodeURIComponent(codigoLimpo)}&select=*,escolas(nome)`,
    {}
  );
  const turmas = await resTurma.json();
  if (!resTurma.ok) throw new Error(JSON.stringify(turmas));
  if (!Array.isArray(turmas) || turmas.length === 0) {
    throw new Error('Código de turma inválido. Verifique com seu professor.');
  }
  const turma = turmas[0];

  // 2. Verificar se o aluno já está vinculado
  const resExiste = await dbFetch(
    `${SUPABASE_URL}/rest/v1/alunos_turma?turma_id=eq.${turma.id}&aluno_id=eq.${userId}`,
    {}
  );
  const existentes = await resExiste.json();
  if (Array.isArray(existentes) && existentes.length > 0) {
    return { turma, vinculo: existentes[0], jaEstava: true };
  }

  // 3. Criar vínculo
  const resVinculo = await dbFetch(`${SUPABASE_URL}/rest/v1/alunos_turma`, {
    method: 'POST',
    body: JSON.stringify({
      turma_id: turma.id,
      aluno_id: userId,
      status: 'ativo'
    })
  });
  const vinculo = await resVinculo.json();
  if (!resVinculo.ok) throw new Error(JSON.stringify(vinculo));

  return { turma, vinculo: vinculo[0], jaEstava: false };
}

/**
 * Lista os alunos de uma turma específica.
 * @param {string} turmaId - UUID da turma
 * @returns {Promise<Array>} lista de alunos
 */
async function dbGetAlunosDaTurma(turmaId) {
  const res = await dbFetch(
    `${SUPABASE_URL}/rest/v1/alunos_turma?turma_id=eq.${turmaId}&select=*,usuarios!inner(id,nome,email,plano)&order=entrou_em.desc`,
    {}
  );
  const data = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(data));
  return data;
}

/**
 * Lista TODOS os alunos do professor (de todas as suas turmas).
 * REFATORADA — agora usa `alunos_turma` (antes era `turma_alunos`).
 * @returns {Promise<Array>} lista de alunos com turma e usuário
 */
async function dbGetAlunosDoProfessor() {
  const profId = authGetUserId();
  const res = await dbFetch(
    `${SUPABASE_URL}/rest/v1/alunos_turma?select=aluno_id,entrou_em,status,turmas!inner(id,nome,professor_id),usuarios!inner(nome,email,plano)&turmas.professor_id=eq.${profId}`,
    {}
  );
  const data = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(data));
  return data;
}

// ---------- REDAÇÕES ----------

/**
 * Lista as redações de uma turma específica.
 * REFATORADA — agora retorna a correção da IA junto.
 * @param {string} turmaId - UUID da turma
 * @returns {Promise<Array>} lista de redações com aluno e correção
 */
async function dbGetRedacoesDaTurma(turmaId) {
  const res = await dbFetch(
    `${SUPABASE_URL}/rest/v1/redacoes?turma_id=eq.${turmaId}&order=created_at.desc&select=*,usuarios!redacoes_aluno_id_fkey(nome,email),correcoes(id,c1,c2,c3,c4,c5,feedback_geral,revisao_professor,created_at)`,
    {}
  );
  const data = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(data));
  return data;
}

/**
 * Lista TODAS as redações de TODAS as turmas do professor logado.
 * Permite filtro opcional por status da redação.
 *
 * @param {object} filtros - { status?: 'enviada'|'corrigida'|'revisada', limit?: number }
 * @returns {Promise<Array>} lista de redações
 */
async function dbGetRedacoesDoProfessor(filtros = {}) {
  const profId = authGetUserId();

  let url = `${SUPABASE_URL}/rest/v1/redacoes`
    + `?select=*,usuarios!redacoes_aluno_id_fkey(id,nome,email),turmas!inner(id,nome,professor_id),correcoes(id,c1,c2,c3,c4,c5,feedback_geral,revisao_professor,created_at)`
    + `&turmas.professor_id=eq.${profId}`
    + `&order=created_at.desc`;

  if (filtros.status) url += `&status=eq.${encodeURIComponent(filtros.status)}`;
  if (filtros.limit)  url += `&limit=${filtros.limit}`;

  const res = await dbFetch(url, {});
  const data = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(data));
  return data;
}

// ---------- REVISÃO PEDAGÓGICA ----------

/**
 * Salva a revisão pedagógica do professor numa correção da IA.
 * O professor edita as notas C1-C5 e adiciona comentários por competência
 * + comentário geral. A correção da IA fica intocada — a revisão é overlay.
 *
 * Estrutura do jsonb gravado em correcoes.revisao_professor:
 * {
 *   professor_id, revisado_em,
 *   competencias: { c1: {nota, comentario}, ..., c5: {nota, comentario} },
 *   nota_total, comentario_geral, visivel_aluno
 * }
 *
 * @param {string} correcaoId - UUID da correção da IA
 * @param {object} revisao - { competencias, comentario_geral, visivel_aluno }
 * @returns {Promise<object>} correção atualizada
 */
async function dbSalvarRevisaoProfessor(correcaoId, revisao) {
  const profId = authGetUserId();

  // Aceita 2 formatos:
  // (a) NOVO — comps[k] = { concorda: true|false }   (validação 3.5+)
  // (b) ANTIGO — comps[k] = { nota: number, comentario: string }   (revisão de nota)
  // O formato é detectado pela presença de 'concorda' OU 'nota'.
  const comps = revisao.competencias || {};
  let formatoNovo = false;
  Object.keys(comps).forEach(c => {
    if (comps[c] && typeof comps[c].concorda === 'boolean') formatoNovo = true;
  });

  // Validação leve — pelo menos uma competência marcada
  const algumaMarcada = ['c1','c2','c3','c4','c5'].some(c =>
    comps[c] && (typeof comps[c].concorda === 'boolean' || typeof comps[c].nota === 'number')
  );
  if (!algumaMarcada) {
    throw new Error('Marque pelo menos uma competência antes de salvar.');
  }

  const payload = {
    revisao_professor: {
      professor_id: profId,
      revisado_em: new Date().toISOString(),
      competencias: comps,
      comentario_geral: revisao.comentario_geral || '',
      feedback_discordancia: revisao.feedback_discordancia || '',
      visivel_aluno: revisao.visivel_aluno !== false,
      formato: formatoNovo ? 'validacao' : 'revisao_nota'
    }
  };

  const res = await dbFetch(
    `${SUPABASE_URL}/rest/v1/correcoes?id=eq.${correcaoId}`,
    {
      method: 'PATCH',
      body: JSON.stringify(payload)
    }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(data));
  return data[0];
}

/**
 * Busca a revisão do professor de uma correção específica.
 * Retorna null se ainda não foi revisada.
 *
 * @param {string} correcaoId - UUID da correção
 * @returns {Promise<object|null>} objeto da revisão ou null
 */
async function dbGetRevisaoProfessor(correcaoId) {
  const res = await dbFetch(
    `${SUPABASE_URL}/rest/v1/correcoes?id=eq.${correcaoId}&select=id,revisao_professor`,
    {}
  );
  const data = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(data));
  if (!Array.isArray(data) || data.length === 0) return null;
  return data[0].revisao_professor || null;
}

// ─────────────────────────────────────────────
// DISC — Perfil comportamental
// ─────────────────────────────────────────────

async function dbSalvarPerfilDisc({ perfil_disc, disc_primario, disc_secundario }) {
  const userId = authGetUserId();
  const res = await dbFetch(`${SUPABASE_URL}/rest/v1/usuarios?id=eq.${userId}`, {
    method: 'PATCH',body: JSON.stringify({ perfil_disc, disc_primario, disc_secundario })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(data));
  const perfil = authGetPerfil();
  localStorage.setItem('redaon_perfil', JSON.stringify({
    ...perfil, perfil_disc, disc_primario, disc_secundario
  }));
  return data[0];
}

function authGetDiscPerfil() {
  const perfil = authGetPerfil();
  return perfil?.perfil_disc || 'S/C';
}

function authTemDiscPerfil() {
  const perfil = authGetPerfil();
  return !!(perfil?.perfil_disc);
}

// ─────────────────────────────────────────────
// PDCA — Histórico e análise
// ─────────────────────────────────────────────

async function dbGetHistoricoRedacoes(limite = 5) {
  const userId = authGetUserId();
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/redacoes?aluno_id=eq.${userId}&status=eq.corrigida&order=created_at.desc&limit=${limite}&select=id,nota_final,tema_livre,created_at,correcoes(c1,c2,c3,c4,c5,feedback_geral,pdca_pareto,pdca_causa_raiz,pdca_tendencia)`,
    { headers: dbHeaders() }
  );
  const data = await res.json();
  if (!Array.isArray(data)) return [];
  return data.map(r => {
    const c = r.correcoes?.[0] || {};
    return {
      id: r.id,
      total: r.nota_final || 0,
      c1: c.c1 || 0, c2: c.c2 || 0, c3: c.c3 || 0, c4: c.c4 || 0, c5: c.c5 || 0,
      tema: r.tema_livre || '',
      data: r.created_at,
      pdca_pareto: c.pdca_pareto || null,
      pdca_causa_raiz: c.pdca_causa_raiz || null,
      pdca_tendencia: c.pdca_tendencia || null
    };
  });
}

async function dbGetBenchmarkPessoal() {
  const userId = authGetUserId();
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/correcoes?select=c1,c2,c3,c4,c5,redacoes!inner(aluno_id)&redacoes.aluno_id=eq.${userId}&order=created_at.desc`,
    { headers: dbHeaders() }
  );
  const data = await res.json();
  if (!Array.isArray(data) || data.length === 0) return { c1: 0, c2: 0, c3: 0, c4: 0, c5: 0 };
  return {
    c1: Math.max(...data.map(d => d.c1 || 0)),
    c2: Math.max(...data.map(d => d.c2 || 0)),
    c3: Math.max(...data.map(d => d.c3 || 0)),
    c4: Math.max(...data.map(d => d.c4 || 0)),
    c5: Math.max(...data.map(d => d.c5 || 0))
  };
}

async function dbGetCompetenciasConsolidadas() {
  const userId = authGetUserId();
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/correcoes?select=c1,c2,c3,c4,c5,redacoes!inner(aluno_id)&redacoes.aluno_id=eq.${userId}&order=created_at.desc&limit=3`,
    { headers: dbHeaders() }
  );
  const data = await res.json();
  if (!Array.isArray(data) || data.length < 3) return [];
  const consolidadas = [];
  ['c1','c2','c3','c4','c5'].forEach(comp => {
    if (data.every(d => (d[comp] || 0) >= 160)) consolidadas.push(comp.toUpperCase());
  });
  return consolidadas;
}

async function dbGetCompetenciaPareto() {
  const historico = await dbGetHistoricoRedacoes(5);
  if (historico.length === 0) return null;
  const medias = { C1: 0, C2: 0, C3: 0, C4: 0, C5: 0 };
  historico.forEach(r => {
    medias.C1 += r.c1; medias.C2 += r.c2; medias.C3 += r.c3;
    medias.C4 += r.c4; medias.C5 += r.c5;
  });
  Object.keys(medias).forEach(k => medias[k] /= historico.length);
  return Object.entries(medias).sort((a, b) => a[1] - b[1])[0][0];
}

async function dbGetContextoPDCA() {
  try {
    const [historico, benchmark, consolidadas, pareto] = await Promise.all([
      dbGetHistoricoRedacoes(5),
      dbGetBenchmarkPessoal(),
      dbGetCompetenciasConsolidadas(),
      dbGetCompetenciaPareto()
    ]);
    const historicoFormatado = historico.length > 0
      ? historico.map((r, i) =>
          `Redacao ${i + 1}: C1=${r.c1}, C2=${r.c2}, C3=${r.c3}, C4=${r.c4}, C5=${r.c5}, Total=${r.total}`
        ).join('\n')
      : 'Primeira redacao do aluno — sem historico anterior.';
    const benchmarkFormatado = Object.entries(benchmark)
      .map(([k, v]) => `${k.toUpperCase()}: ${v}`).join(', ');
    return {
      historico, historicoFormatado,
      benchmark, benchmarkFormatado,
      consolidadas, pareto,
      totalRedacoes: historico.length
    };
  } catch(e) {
    console.warn('Erro ao buscar contexto PDCA:', e);
    return {
      historico: [], historicoFormatado: 'Sem historico disponivel.',
      benchmark: { c1: 0, c2: 0, c3: 0, c4: 0, c5: 0 },
      benchmarkFormatado: 'Sem benchmark.',
      consolidadas: [], pareto: null, totalRedacoes: 0
    };
  }
}

async function dbSalvarCorrecaoIACompleta({
  redacao_id, c1, c2, c3, c4, c5,
  feedback_geral, feedback_c1, feedback_c2, feedback_c3, feedback_c4, feedback_c5,
  pontos_fortes, pontos_melhorar, modo = 'normal', pdca = null,
  correcao_json = null
}) {
  const res = await dbFetch(`${SUPABASE_URL}/rest/v1/correcoes`, {
    method: 'POST',body: JSON.stringify({
      redacao_id, tipo: 'ia', modo,
      c1, c2, c3, c4, c5,
      feedback_geral, feedback_c1, feedback_c2, feedback_c3, feedback_c4, feedback_c5,
      pontos_fortes, pontos_melhorar,
      pdca_pareto:     pdca?.pareto_competencia || null,
      pdca_recorrente: pdca?.pareto_recorrente || false,
      pdca_causa_raiz: pdca?.causa_raiz || null,
      pdca_tendencia:  pdca?.tendencia || null,
      pdca_plano:      JSON.stringify(pdca?.plano_5w2h || {}),
      pdca_r3g:        JSON.stringify(pdca?.r3g || {}),
      consolidadas:    JSON.stringify(pdca?.competencias_consolidadas_atualizadas || []),
      correcao_json:   correcao_json || null
    })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(data));
  const nota = (c1||0)+(c2||0)+(c3||0)+(c4||0)+(c5||0);
  await dbFetch(`${SUPABASE_URL}/rest/v1/redacoes?id=eq.${redacao_id}`, {
    method: 'PATCH',body: JSON.stringify({ status: 'corrigida', nota_final: nota })
  });
  return data[0];
}

// Busca a correção IA mais recente de uma redação, incluindo o correcao_json
// completo (usado pelo Cenário B para merges subsequentes e leitura em
// minhas-redacoes.html).
async function dbBuscarCorrecao(redacao_id) {
  const res = await dbFetch(
    `${SUPABASE_URL}/rest/v1/correcoes?redacao_id=eq.${redacao_id}&tipo=eq.ia&order=created_at.desc&limit=1&select=id,correcao_json`,
    {}
  );
  const data = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(data));
  return Array.isArray(data) && data.length > 0 ? data[0] : null;
}

// Atualiza o correcao_json de uma correção fazendo MERGE com campos novos,
// preservando o que já existe. Usado pelo Cenário B para adicionar:
//   - analise_completa (Chamada 2, preload em background)
//   - redacao_nota_1000_* (Chamada 3, sob demanda)
//   - melhoria_c* (Chamada 4, sob demanda)
//   - chamadas.<nome>: "completa" (marca status de cada chamada)
//
// PostgreSQL jsonb não tem operador nativo de deep-merge via REST, então
// lemos o objeto atual, mesclamos em JS, e escrevemos de volta. Race
// conditions são minimizadas porque cada chamada atualiza campos diferentes
// (última escrita ganha só em caso de atualização do mesmo campo).
async function dbAtualizarCorrecaoJson(redacao_id, camposNovos) {
  // 1. Busca correção atual
  const correcao = await dbBuscarCorrecao(redacao_id);
  if (!correcao || !correcao.id) {
    throw new Error('Correção não encontrada para redacao_id=' + redacao_id);
  }

  // 2. Merge: começa com o correcao_json atual, aplica campos novos por cima
  const atual = correcao.correcao_json || {};
  const merged = { ...atual, ...camposNovos };

  // 3. Se camposNovos tem .chamadas, faz merge aninhado também
  if (camposNovos.chamadas || atual.chamadas) {
    merged.chamadas = { ...(atual.chamadas || {}), ...(camposNovos.chamadas || {}) };
  }

  // 4. Escreve de volta
  const res = await dbFetch(
    `${SUPABASE_URL}/rest/v1/correcoes?id=eq.${correcao.id}`,
    {
      method: 'PATCH',
      body: JSON.stringify({ correcao_json: merged })
    }
  );
  if (!res.ok) {
    const err = await res.text();
    throw new Error('Falha ao atualizar correcao_json: ' + err);
  }
  return merged;
}

async function dbGetRelatorioPDCAAluno(alunoId) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/correcoes?select=c1,c2,c3,c4,c5,pdca_pareto,pdca_causa_raiz,pdca_tendencia,pdca_r3g,pdca_plano,consolidadas,created_at,modo,redacoes!inner(aluno_id,tema_livre,nota_final)&redacoes.aluno_id=eq.${alunoId}&order=created_at.desc&limit=10`,
    { headers: dbHeaders() }
  );
  const data = await res.json();
  if (!Array.isArray(data)) return null;
  const benchmark = {
    c1: Math.max(...data.map(d => d.c1 || 0), 0),
    c2: Math.max(...data.map(d => d.c2 || 0), 0),
    c3: Math.max(...data.map(d => d.c3 || 0), 0),
    c4: Math.max(...data.map(d => d.c4 || 0), 0),
    c5: Math.max(...data.map(d => d.c5 || 0), 0)
  };
  const ultima = data[0] || {};
  let consolidadas = [];
  try { consolidadas = JSON.parse(ultima.consolidadas || '[]'); } catch {}
  return {
    historico: data,
    benchmark,
    pareto: ultima.pdca_pareto || null,
    tendencia: ultima.pdca_tendencia || null,
    consolidadas
  };
}

async function dbGetRelatorioPeriodoTurma(turmaId) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/redacoes?turma_id=eq.${turmaId}&order=created_at.desc&select=aluno_id,nota_final,created_at,usuarios!redacoes_aluno_id_fkey(nome),correcoes(c1,c2,c3,c4,c5,pdca_pareto,pdca_tendencia)`,
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

// ═══════════════════════════════════════════════════════════
// RedaON — gemini-client.js
// Substitui as chamadas diretas à Gemini API
// Chame via Edge Function do Supabase (chave segura no servidor)
//
// COMO USAR:
// 1. Adicione no <head> das páginas:
//    <script src="/gemini-client.js"></script>
// 2. Substitua no código:
//    ANTES: const genAI = new GoogleGenerativeAI(API_KEY)
//    DEPOIS: use window.Blanche.chamar(tipo, payload)
// ═══════════════════════════════════════════════════════════

(function() {
  'use strict';

  // ── CONFIGURAÇÃO ─────────────────────────────────────────
  // Em produção: trocar pela URL real do seu projeto Supabase
  const SUPABASE_URL      = 'https://SEU_PROJETO.supabase.co';
  const EDGE_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/gemini`;

  // ── ARMAZENAR TOKEN DO USUÁRIO ────────────────────────────
  // Em produção: virá do Supabase Auth após login
  let _token = localStorage.getItem('redaon_token') || null;

  function setToken(token) {
    _token = token;
    if (token) localStorage.setItem('redaon_token', token);
    else localStorage.removeItem('redaon_token');
  }

  // ── FUNÇÃO PRINCIPAL ──────────────────────────────────────
  async function chamar(tipo, payload = {}) {
    if (!_token) {
      console.warn('[Blanche] Sem token de autenticação. Usando fallback local.');
      return chamarLocal(tipo, payload);
    }

    try {
      const res = await fetch(EDGE_FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${_token}`,
        },
        body: JSON.stringify({ tipo, ...payload }),
      });

      if (!res.ok) {
        const erro = await res.json().catch(() => ({}));
        // Rate limit
        if (res.status === 429) throw new Error('rate_limit');
        // Não autorizado — limpar token e redirecionar
        if (res.status === 401) {
          setToken(null);
          throw new Error('unauthorized');
        }
        throw new Error(erro.erro || `HTTP ${res.status}`);
      }

      const data = await res.json();
      return data.resposta;

    } catch (err) {
      // Fallback para chamada local durante desenvolvimento
      if (err.message !== 'rate_limit' && err.message !== 'unauthorized') {
        console.warn('[Blanche] Edge Function indisponível, usando fallback:', err.message);
        return chamarLocal(tipo, payload);
      }
      throw err;
    }
  }

  // ── FALLBACK LOCAL (desenvolvimento / sem Supabase) ───────
  // Mantém compatibilidade enquanto o backend não está pronto
  async function chamarLocal(tipo, payload = {}) {
    // Chave temporária de dev — REMOVER em produção
    const DEV_KEY = 'AIzaSyAj9B5qLu6r14dkZbrsNHWYNb9oUadamMU';

    try {
      const { GoogleGenerativeAI } = await import(
        'https://cdn.skypack.dev/@google/generative-ai'
      );
      const genAI = new GoogleGenerativeAI(DEV_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

      const prompt = montarPromptLocal(tipo, payload);
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (err) {
      console.error('[Blanche] Erro no fallback local:', err);
      throw err;
    }
  }

  function montarPromptLocal(tipo, payload) {
    const tema     = payload.tema     || '';
    const texto    = payload.texto    || '';
    const pergunta = payload.pergunta || '';
    const fraquezas = payload.fraquezas || 'C4';

    const map = {
      correcao_redacao:        `Analise esta redação ENEM e responda APENAS com JSON: {"nota_estimada":0,"competencias":[0,0,0,0,0],"erros":[],"feedback":"","trecho_destaque":"","dica_competencia":1,"dica_titulo":"","dica_texto":"","versao_elite":"","por_que_elite":"","correcao_completa":""}. Redação: ${texto}`,
      analise_tempo_real:      `Analise este trecho APENAS com JSON: {"nota_estimada":0,"competencias":[0,0,0,0,0],"feedback":"","trecho_destaque":"","dica_competencia":1,"dica_titulo":"","dica_texto":""}. Texto: ${texto}`,
      reescrever_argumento:    `Reescreva melhorando para o ENEM, retorne APENAS o texto: "${texto}"`,
      repertorio_legislacao:   `Liste 5 leis sobre "${tema}" com marcadores.`,
      repertorio_historia:     `5 marcos históricos de "${tema}" numerados.`,
      repertorio_especialistas:`5 especialistas sobre "${tema}" com obra e citação.`,
      repertorio_atualidades:  `5 dados recentes sobre "${tema}" com fonte.`,
      resumo_texto:            `Resuma "${tema}" para redação ENEM.`,
      resumo_audio:            `Roteiro de podcast sobre "${tema}".`,
      roteiro_video:           `Roteiro de vídeo-aula sobre "${tema}".`,
      mapa_mental:             `Mapa mental de "${tema}" com hierarquia →.`,
      flashcards:              `8 flashcards sobre "${tema}" APENAS JSON: [{"frente":"...","verso":"..."}]`,
      quiz:                    `5 questões ENEM sobre "${tema}" APENAS JSON: [{"pergunta":"...","alternativas":["A)...","B)...","C)...","D)...","E)..."],"correta":0,"explicacao":"..."}]`,
      infografico:             `Infográfico sobre "${tema}": seções, dados, comparações.`,
      relatorio:               `Relatório acadêmico sobre "${tema}".`,
      redacao_modelo:          `Redação nota 1000 sobre "${tema}". 28-30 linhas. Linguagem formal.`,
      caderno_pessoal:         `Caderno personalizado para fraquezas em ${fraquezas}. Tema: "${tema}".`,
      chat_blanche:            `Você é a Profa. Blanche. Sobre "${tema}": ${pergunta}`,
    };
    return map[tipo] || `Responda sobre: ${tema || texto}`;
  }

  // ── API PÚBLICA ───────────────────────────────────────────
  window.Blanche = {
    // Chamar a IA
    chamar,

    // Autenticação
    setToken,
    getToken: () => _token,
    isLogado: () => !!_token,

    // Helpers para cada funcionalidade
    async corrigirRedacao(texto) {
      const json = await chamar('correcao_redacao', { texto });
      return JSON.parse(json.trim().replace(/```json|```/g, ''));
    },

    async analisarTempoReal(texto) {
      const json = await chamar('analise_tempo_real', { texto });
      return JSON.parse(json.trim().replace(/```json|```/g, ''));
    },

    async reescreverArgumento(texto) {
      return chamar('reescrever_argumento', { texto });
    },

    async getRepertorio(tipo, tema) {
      const tipos = ['legislacao','historia','especialistas','atualidades'];
      if (!tipos.includes(tipo)) throw new Error('Tipo inválido');
      return chamar(`repertorio_${tipo}`, { tema });
    },

    async getEstudio(tipo, tema, extras = {}) {
      return chamar(tipo, { tema, ...extras });
    },

    async getFlashcards(tema) {
      const json = await chamar('flashcards', { tema });
      return JSON.parse(json.trim().replace(/```json|```/g, ''));
    },

    async getQuiz(tema) {
      const json = await chamar('quiz', { tema });
      return JSON.parse(json.trim().replace(/```json|```/g, ''));
    },

    async chat(tema, pergunta, historico = []) {
      return chamar('chat_blanche', { tema, pergunta, historico: JSON.stringify(historico) });
    },

    async getCadernoPessoal(tema, fraquezas) {
      return chamar('caderno_pessoal', { tema, fraquezas });
    },
  };

  console.log('[RedaON] Blanche client carregado. Modo:', _token ? 'produção' : 'desenvolvimento');
})();

// ═══════════════════════════════════════════════════════════
// RedaON — Supabase Edge Function: /functions/v1/gemini
//
// COMO USAR:
// 1. Instale o Supabase CLI: npm install -g supabase
// 2. supabase login
// 3. supabase functions new gemini
// 4. Cole este código em supabase/functions/gemini/index.ts
// 5. supabase secrets set GEMINI_API_KEY=sua_chave_aqui
// 6. supabase functions deploy gemini
//
// No frontend, substitua a chamada direta à Gemini por:
// fetch('https://SEU_PROJETO.supabase.co/functions/v1/gemini', {...})
// ═══════════════════════════════════════════════════════════

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// ── CORS ──────────────────────────────────────────────────
const CORS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// ── TIPOS DE REQUISIÇÃO PERMITIDOS ───────────────────────
const TIPOS_PERMITIDOS = [
  "correcao_redacao",
  "analise_tempo_real",
  "reescrever_argumento",
  "repertorio_legislacao",
  "repertorio_historia",
  "repertorio_especialistas",
  "repertorio_atualidades",
  "resumo_texto",
  "resumo_audio",
  "roteiro_video",
  "mapa_mental",
  "flashcards",
  "quiz",
  "infografico",
  "relatorio",
  "redacao_modelo",
  "caderno_pessoal",
  "chat_blanche",
];

// ── RATE LIMITING (simples, por IP) ──────────────────────
const requestCounts = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string, limite = 30): boolean {
  const agora = Date.now();
  const dados = requestCounts.get(ip);

  if (!dados || agora > dados.resetAt) {
    requestCounts.set(ip, { count: 1, resetAt: agora + 60_000 }); // 30 req/min
    return true;
  }

  if (dados.count >= limite) return false;
  dados.count++;
  return true;
}

// ── PROMPTS POR TIPO ──────────────────────────────────────
function montarPrompt(tipo: string, payload: Record<string, string>): string {
  const tema    = payload.tema    || "";
  const texto   = payload.texto   || "";
  const pergunta = payload.pergunta || "";
  const fraquezas = payload.fraquezas || "C4 — Coesão Textual";

  const prompts: Record<string, string> = {
    correcao_redacao: `Você é a Profa. Blanche da RedaON, especialista em redação ENEM.
Analise a redação abaixo e responda APENAS com JSON válido:
{
  "nota_estimada": <0-1000>,
  "competencias": [<C1 0-200>,<C2 0-200>,<C3 0-200>,<C4 0-200>,<C5 0-200>],
  "erros": [{"original":"...","correto":"...","tipo":"ortografia|coesao|argumento"}],
  "feedback": "<comentário direto de 2-3 frases>",
  "trecho_destaque": "<trecho problemático máx 8 palavras>",
  "dica_competencia": <1-5>,
  "dica_titulo": "<nome da competência>",
  "dica_texto": "<dica prática>",
  "versao_elite": "<redação reescrita nota 1000>",
  "por_que_elite": "<explicação da melhoria>",
  "correcao_completa": "<análise parágrafo a parágrafo>"
}
Redação: ${texto}`,

    analise_tempo_real: `Você é a Profa. Blanche da RedaON. Analise este trecho e responda APENAS com JSON:
{
  "nota_estimada": <0-1000>,
  "competencias": [<C1>,<C2>,<C3>,<C4>,<C5>],
  "feedback": "<1-2 frases diretas>",
  "trecho_destaque": "<máx 8 palavras>",
  "dica_competencia": <1-5>,
  "dica_titulo": "<competência>",
  "dica_texto": "<dica prática>"
}
Texto: ${texto}`,

    reescrever_argumento: `Você é a Profa. Blanche da RedaON. Reescreva o trecho melhorando o argumento para o ENEM. Retorne APENAS o trecho reescrito, sem comentários:
"${texto}"`,

    repertorio_legislacao: `Liste os 5 principais artigos da Constituição Federal e leis relevantes para: "${tema}". Para cada: número, nome e aplicação em 1 frase. Use marcadores. Português.`,
    repertorio_historia: `Explique o contexto histórico de "${tema}" com 5 marcos temporais numerados. Cada: data, fato e relevância para o Brasil.`,
    repertorio_especialistas: `Liste 5 especialistas relevantes para "${tema}". Para cada: nome, área, obra e 1 ideia aplicável ao ENEM.`,
    repertorio_atualidades: `Liste 5 dados recentes (IBGE, OMS, ONU) sobre "${tema}". Para cada: fonte, dado numérico e como usar na redação.`,

    resumo_texto: `Crie um RESUMO DIDÁTICO de "${tema}" para redação ENEM. Problema, causas, consequências, dados e soluções. Markdown.`,
    resumo_audio: `ROTEIRO DE PODCAST sobre "${tema}". Tom conversacional, com [pausa]. ~8 minutos.`,
    roteiro_video: `ROTEIRO DE VÍDEO-AULA sobre "${tema}" em cenas numeradas. Fala + sugestão visual. ~10 minutos.`,
    mapa_mental: `MAPA MENTAL hierárquico de "${tema}" com →. Ramos: Causas, Consequências, Legislação, Especialistas, Dados, Soluções.`,

    flashcards: `Crie 8 flashcards sobre "${tema}" para o ENEM. APENAS JSON sem markdown:
[{"frente":"conceito/lei/dado","verso":"explicação aplicada ao ENEM"}]`,

    quiz: `Crie 5 questões estilo ENEM sobre "${tema}". APENAS JSON sem markdown:
[{"pergunta":"...","alternativas":["A)...","B)...","C)...","D)...","E)..."],"correta":0,"explicacao":"..."}]`,

    infografico: `CONTEÚDO DE INFOGRÁFICO sobre "${tema}": título, seções, dados, comparações, timeline, curiosidades.`,
    relatorio: `RELATÓRIO ACADÊMICO sobre "${tema}": Resumo, Introdução, Contexto, Análise, Legislação, Especialistas, Dados, Conclusão.`,

    redacao_modelo: `REDAÇÃO NOTA 1000 sobre "${tema}". Introdução com repertório + 2 parágrafos + conclusão com proposta completa. 28-30 linhas. Linguagem formal impecável.`,

    caderno_pessoal: `Você é a Profa. Blanche. Crie um CADERNO PERSONALIZADO para o aluno com fraquezas em: ${fraquezas}.
Inclua: diagnóstico, plano semanal (3 dias), lista de conectivos, modelo de proposta C5 e checklist. Markdown. Use o tema: "${tema}".`,

    chat_blanche: `Você é a Profa. Blanche da RedaON, especialista em redação ENEM. Responda de forma direta, amigável e didática.
Contexto do tema: "${tema}"
Pergunta: ${pergunta}
Responda em 2-4 parágrafos com exemplos práticos para o ENEM.`,
  };

  return prompts[tipo] || `Analise o seguinte para o ENEM: ${texto || tema}`;
}

// ── HANDLER PRINCIPAL ─────────────────────────────────────
serve(async (req: Request) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ erro: "Método não permitido" }),
      { status: 405, headers: { ...CORS, "Content-Type": "application/json" } }
    );
  }

  try {
    // Rate limiting por IP
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    if (!checkRateLimit(ip)) {
      return new Response(
        JSON.stringify({ erro: "Muitas requisições. Aguarde 1 minuto." }),
        { status: 429, headers: { ...CORS, "Content-Type": "application/json" } }
      );
    }

    // Validar autenticação (token Supabase do usuário)
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ erro: "Não autorizado" }),
        { status: 401, headers: { ...CORS, "Content-Type": "application/json" } }
      );
    }

    // Parsear body
    const body = await req.json();
    const { tipo, ...payload } = body;

    // Validar tipo
    if (!tipo || !TIPOS_PERMITIDOS.includes(tipo)) {
      return new Response(
        JSON.stringify({ erro: "Tipo de requisição inválido", tipos_validos: TIPOS_PERMITIDOS }),
        { status: 400, headers: { ...CORS, "Content-Type": "application/json" } }
      );
    }

    // Pegar chave Gemini das variáveis de ambiente (SEGURO)
    const GEMINI_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_KEY) throw new Error("GEMINI_API_KEY não configurada");

    // Montar prompt
    const prompt = montarPrompt(tipo, payload);

    // Chamar Gemini API
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    if (!geminiRes.ok) {
      const erro = await geminiRes.text();
      throw new Error(`Gemini API error: ${geminiRes.status} — ${erro}`);
    }

    const geminiData = await geminiRes.json();
    const resposta = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Log de uso (em produção: salvar no Supabase para billing/analytics)
    console.log(`[RedaON] tipo=${tipo} | ip=${ip} | chars=${resposta.length}`);

    return new Response(
      JSON.stringify({ resposta, tipo, ok: true }),
      { status: 200, headers: { ...CORS, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("[RedaON] Erro na Edge Function:", err);
    return new Response(
      JSON.stringify({ erro: "Erro interno. Tente novamente.", detalhe: err.message }),
      { status: 500, headers: { ...CORS, "Content-Type": "application/json" } }
    );
  }
});

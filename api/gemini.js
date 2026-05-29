// api/gemini.js – Função serverless do Vercel
// ROTEAMENTO POR TASK (v2 — 28/05/2026):
// - task='correcao'  → gemini-3-flash       (R$ 0,07/correção, raciocínio superior, resolve oscilação C3/C4)
// - task=qualquer outro ou ausente → gemini-2.5-flash-lite (R$ 0,001/chamada, suficiente pra Hub, OCR, Material de Apoio)
//
// Frontend envia o task no body. Tudo que NÃO é correção usa o modelo barato por default
// (mantém o comportamento histórico dos endpoints que ainda não foram migrados).

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

  try {
    const { contents, generationConfig: clientConfig, task } = req.body;
    if (!contents) return res.status(400).json({ error: 'Campo contents obrigatório' });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'GEMINI_API_KEY não configurada' });

    // ─── Seleção de modelo por task ─────────────────────────────────────
    // Arquitetura de 7 agentes (v5.0): cada agente é uma task própria.
    // Tasks de correção: 'gate', 'c1', 'c2', 'c3', 'c4', 'c5', 'orq'.
    // Tasks auxiliares e legado: 'correcao', OCR (sem task), Hub, Material.
    //
    // Decisão (28/05/2026): TODAS as tasks usam gemini-2.5-flash-lite. O teste
    // com gemini-3.5-flash mostrou pior estabilidade e custo 19x maior. A
    // arquitetura de agentes resolve a instabilidade dividindo o trabalho,
    // não trocando o modelo. Estrutura mantida para reativar premium se preciso:
    // basta listar a task em TASKS_PREMIUM e definir o modelo premium abaixo.
    const TASKS_PREMIUM = []; // vazio: nenhuma task usa modelo premium por ora
    const MODELO_PREMIUM = 'gemini-3.5-flash';
    const MODELO_PADRAO = 'gemini-2.5-flash-lite';
    const modelo = TASKS_PREMIUM.includes(task) ? MODELO_PREMIUM : MODELO_PADRAO;

    // Endpoint v1beta: suporta responseMimeType (o v1 estável não suporta)
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent`;

    // Configuração padrão para correção ENEM:
    // - maxOutputTokens 32000: folga durante transição para Cenário B (chamadas
    //   fracionadas). No estado final cada chamada pedirá 1500-3000 tokens.
    // - temperature 0.1: correção determinística. Reduzido de 0.3 → 0.1 em
    //   28/05/2026 para eliminar variância entre rodadas. OCR mantém sua
    //   própria temperature (sobrescrita pelo frontend).
    // - responseMimeType application/json: força JSON válido e parseável.
    const defaultConfig = {
      maxOutputTokens: 32000,
      temperature: 0.1,
      responseMimeType: 'application/json'
    };

    // Frontend pode sobrescrever campos específicos por chamada
    // (ex: OCR sobrescreve responseMimeType para 'text/plain')
    const generationConfig = { ...defaultConfig, ...(clientConfig || {}) };

    const geminiRes = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey
      },
      body: JSON.stringify({
        contents,
        generationConfig
      }),
    });

    const data = await geminiRes.json();

    if (!geminiRes.ok) {
      return res.status(geminiRes.status).json({ error: data.error?.message || 'Erro do Gemini' });
    }

    // Retorna data + meta informando qual modelo foi usado (útil pra debug
    // e pra UI confirmar "correção foi feita com Gemini 3 Flash")
    return res.status(200).json({ ...data, _redaon_modelo_usado: modelo });

  } catch (err) {
    return res.status(500).json({ error: 'Erro interno: ' + err.message });
  }
}

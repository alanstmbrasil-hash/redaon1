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
    // Estrutura de roteamento mantida para uso futuro (quando voltarmos a
    // testar modelos superiores). Por ora (28/05/2026), TODAS as tasks usam
    // gemini-2.5-flash-lite: o teste com gemini-3.5-flash mostrou amplitude
    // de 120pts (pior que o 2.5 FL) e custo 19x maior. Decisão: voltar ao
    // 2.5 FL e atacar instabilidade restante via prompt-engineering (v4.18).
    //
    // Quando quiser reativar modelo premium para correção: trocar a string
    // 'gemini-2.5-flash-lite' abaixo por 'gemini-3.5-flash' (ou outro válido).
    const TASKS_PREMIUM = ['correcao'];
    const modelo = TASKS_PREMIUM.includes(task)
      ? 'gemini-2.5-flash-lite'
      : 'gemini-2.5-flash-lite';

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

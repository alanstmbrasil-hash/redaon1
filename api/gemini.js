// api/gemini.js – Função serverless do Vercel
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

  try {
    const { contents, generationConfig: clientConfig } = req.body;
    if (!contents) return res.status(400).json({ error: 'Campo contents obrigatório' });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'GEMINI_API_KEY não configurada' });

    // Modelo mais robusto para geração estruturada longa
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent`;

    // Config padrão pensada para correção ENEM completa:
    // - 16000 tokens: cabe 5 competências + pontos de melhoria + análise completa
    //   + versão Elite reescrita (~300 palavras) + explicação "por que nota 1000"
    // - temperature baixa: correção deve ser consistente, não criativa
    // - responseMimeType JSON: garante que a Gemini retorne JSON válido e parseável
    //   (elimina erros "Expected ',' or ']' at position X")
    const defaultConfig = {
      maxOutputTokens: 16000,
      temperature: 0.3,
      responseMimeType: 'application/json'
    };

    // Permite que o frontend sobrescreva config por chamada
    // (útil pra chamadas que não precisam de JSON, ex: chat livre)
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

    return res.status(200).json(data);

  } catch (err) {
    return res.status(500).json({ error: 'Erro interno: ' + err.message });
  }
}

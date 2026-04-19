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

    // Endpoint v1beta: suporta responseMimeType (o v1 estável não suporta)
    // Modelo gemini-2.5-flash-lite mantido para custo baixo
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent`;

    // Configuração padrão para correção ENEM completa:
    // - maxOutputTokens 16000: cabe 5 competências + pontos de melhoria +
    //   análise completa + versão Elite reescrita + explicação nota 1000.
    //   O valor anterior (1500) era o que cortava a resposta no meio e
    //   causava "Versão elite não disponível", "Por que nota 1000: não
    //   disponível" e Análise Completa truncada.
    // - temperature 0.3: correção consistente, não criativa
    // - responseMimeType application/json: força JSON válido e parseável,
    //   elimina os erros "Expected ',' or ']' at position X" no console
    const defaultConfig = {
      maxOutputTokens: 16000,
      temperature: 0.3,
      responseMimeType: 'application/json'
    };

    // Frontend pode sobrescrever campos específicos por chamada
    // (útil se alguma chamada futura não precisar de JSON)
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

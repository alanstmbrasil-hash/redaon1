// api/gemini.js — Função serverless do Vercel
// A key do Gemini fica aqui no servidor, nunca exposta no navegador

export default async function handler(req, res) {
  // Apenas POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  // CORS — permitir chamadas do próprio domínio
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  const API_KEY = process.env.GEMINI_API_KEY;
  if (!API_KEY) {
    return res.status(500).json({ error: 'API key não configurada no servidor' });
  }

  try {
    const { contents } = req.body;
    if (!contents) {
      return res.status(400).json({ error: 'Campo contents obrigatório' });
    }

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents })
      }
    );

    const data = await geminiRes.json();

    if (!geminiRes.ok) {
      return res.status(geminiRes.status).json({ error: data.error?.message || 'Erro no Gemini' });
    }

    return res.status(200).json(data);

  } catch (err) {
    return res.status(500).json({ error: err.message || 'Erro interno' });
  }
}

// api/gemini.js – Função serverless do Vercel
// Compatível com keys AQ. (Vertex AI) e AIzaSy (Generative Language)

export default async function handler(req, res) {
  // Apenas POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  // CORS – permitir chamadas do próprio domínio
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

    const isOAuth = API_KEY.startsWith('AQ.');

    let url, headers;

    if (isOAuth) {
      // Vertex AI endpoint – aceita Bearer token
      url = 'https://us-central1-aiplatform.googleapis.com/v1/projects/45751368191/locations/us-central1/publishers/google/models/gemini-2.0-flash:generateContent';
      headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      };
    } else {
      // Generative Language endpoint – aceita API key
      url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;
      headers = { 'Content-Type': 'application/json' };
    }

    const geminiRes = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ contents }),
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

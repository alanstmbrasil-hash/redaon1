// ============================================================
//  /api/gemini.js  —  RedaON
//  Guarda a chave do Gemini NO SERVIDOR. O navegador nunca a vê.
//
//  COMO INSTALAR (Alan / Pedro):
//  1. Salve este arquivo como  api/gemini.js  na raiz do projeto.
//  2. No painel do Vercel → Settings → Environment Variables,
//     crie a variável:   GEMINI_API_KEY = <a chave NOVA>
//  3. REVOGUE a chave antiga no Google AI Studio — ela já circulou.
//  4. Faça o deploy.
//
//  A página chama assim:
//     fetch('/api/gemini', { method:'POST',
//       headers:{'Content-Type':'application/json'},
//       body: JSON.stringify({ prompt: '...', buscarNaWeb: true }) })
// ============================================================

export default async function handler(req, res) {
  // Só aceita POST
  if (req.method !== 'POST') {
    return res.status(405).json({ erro: 'Método não permitido' });
  }

  const CHAVE = process.env.GEMINI_API_KEY;
  if (!CHAVE) {
    console.error('GEMINI_API_KEY não configurada no ambiente');
    return res.status(500).json({ erro: 'Serviço de IA não configurado' });
  }

  const { prompt, buscarNaWeb = true, modelo = 'gemini-2.5-flash' } = req.body || {};

  if (!prompt || typeof prompt !== 'string' || prompt.trim().length < 3) {
    return res.status(400).json({ erro: 'Prompt ausente ou muito curto' });
  }
  // Trava simples de tamanho, para evitar custo acidental
  if (prompt.length > 12000) {
    return res.status(400).json({ erro: 'Prompt longo demais' });
  }

  const corpo = {
    contents: [{ parts: [{ text: prompt }] }]
  };

  // Busca real na web (decisão aprovada: todas as categorias).
  // Reduz alucinação e traz fontes verificáveis.
  if (buscarNaWeb) {
    corpo.tools = [{ google_search: {} }];
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent`;

  try {
    const resposta = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': CHAVE          // chave vai no cabeçalho, nunca na URL
      },
      body: JSON.stringify(corpo)
    });

    if (!resposta.ok) {
      const detalhe = await resposta.text();
      console.error('Erro do Gemini:', resposta.status, detalhe.slice(0, 500));
      return res.status(502).json({ erro: 'A IA não respondeu. Tente novamente.' });
    }

    const dados = await resposta.json();

    // Texto gerado
    const texto = (dados?.candidates?.[0]?.content?.parts || [])
      .map(p => p.text || '')
      .join('')
      .trim();

    // Fontes usadas na busca (para mostrar ao professor)
    const meta = dados?.candidates?.[0]?.groundingMetadata;
    const fontes = (meta?.groundingChunks || [])
      .map(c => c?.web ? { titulo: c.web.title, url: c.web.uri } : null)
      .filter(Boolean);

    return res.status(200).json({ texto, fontes });

  } catch (e) {
    console.error('Falha ao chamar o Gemini:', e);
    return res.status(500).json({ erro: 'Falha ao gerar. Tente novamente.' });
  }
}

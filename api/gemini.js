// api/gemini.js
const { GoogleGenerativeAI } = require("@google/generative-ai");

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    // Usando a chave AQ que você salvou na Vercel
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_APPLICATION_CREDENTIALS_KEY);
    
    // Configuração do modelo (Gemini 1.5 Flash é ideal para o RedaON)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const { prompt } = req.body;

    const systemInstruction = "Você é a Profa. Blanche, mentora de redação do projeto RedaON...";
    
    const result = await model.generateContent([systemInstruction, prompt]);
    const response = await result.response;
    const text = response.text();

    return res.status(200).json({ text });
  } catch (error) {
    console.error("Erro na API Gemini:", error);
    return res.status(500).json({ 
      error: "Falha na comunicação com a Profa. Blanche.",
      details: error.message 
    });
  }
}
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateQuestions(mode, players, count = 3) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const playersList = players.join(', ');

  let instructions = "Mode Chill : drôle, bienveillant et léger.";
  if (mode === 'Spicy') instructions = "Mode Spicy : relations, jalousie, questions qui piquent.";
  if (mode === 'Hardcore') instructions = "Mode Hardcore : Humour très noir, trash, clash. Soyez sans pitié pour ce jeu d'adultes.";

  const prompt = `
    Jeu d'alcool "Le Thermomètre". Joueurs : ${playersList}.
    TON : ${instructions}
    Génère ${count} questions à la 3ème personne ciblant 1 seul joueur à chaque fois.
    Réponds UNIQUEMENT avec ce JSON strict :
    [{"cible": "Nom", "question": "..."}]
  `;

  try {
    const result = await model.generateContent(prompt);
    let text = result.response.text();
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(text);
  } catch (error) {
    console.error("Erreur Gemini:", error);
    throw error;
  }
}

module.exports = { generateQuestions };

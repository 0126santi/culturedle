const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI("AIzaSyDrm2lmbM9vGmGR4iISSY9D-WqzVxi-8bk");

const PROMPT = `Genera una pregunta de cultura general mundial clara y su respuesta, la respuesta debe ser una sola palabra común (sin nombres propios ni tecnicismos), formato JSON: {"question": "...", "answer": "..."}`;

function getTodaySeed() {
  const now = new Date();
  return now.getFullYear() + '-' + (now.getMonth()+1) + '-' + now.getDate();
}

async function getQuestionOfTheDay() {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  const todaySeed = getTodaySeed();
  const prompt = PROMPT + `\nSeed: ${todaySeed}`;
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log('Respuesta de Gemini:', text);
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        const obj = JSON.parse(match[0]);
        if (obj.question && obj.answer && /^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ0-9 ]+$/.test(obj.answer)) {
          return { question: obj.question, answer: obj.answer.toLowerCase() };
        }
      } catch (e) {
        console.error('Error al parsear JSON de Gemini:', e);
      }
    }
    throw new Error('No se pudo extraer una pregunta válida de la respuesta de Gemini.');
  } catch (e) {
    console.error('Error al llamar a Gemini:', e);
    throw new Error('No se pudo generar una pregunta de cultura general con Gemini.');
  }
}

module.exports = { getQuestionOfTheDay };

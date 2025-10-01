
// Gemini (Google AI) generación diaria
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI("AIzaSyDrm2lmbM9vGmGR4iISSY9D-WqzVxi-8bk");

// Prompt ajustado para mayor dificultad, sin acentos y preguntas breves
const PROMPT = `Genera una pregunta de cultura general mundial difícil (nivel experto, no trivial), pero breve y concisa (máximo 20 palabras), y su respuesta. La respuesta debe ser una sola palabra común (sin nombres propios ni tecnicismos), SIN ACENTOS ni caracteres especiales, solo letras minúsculas y números. Formato JSON: {"question": "...", "answer": "..."}`;

// Función para obtener un seed único por día
function getTodaySeed() {
    const now = new Date();
    return now.getFullYear() + '-' + (now.getMonth()+1) + '-' + now.getDate();
}

// Función para quitar acentos y caracteres especiales (compatible cross-platform)
function normalize(str) {
    return str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // elimina diacríticos
        .replace(/[^a-zA-Z0-9 ]/g, '')    // solo letras, números y espacios
        .toLowerCase();
}
// Función para quitar acentos y caracteres especiales (compatible cross-platform)
function normalize(str) {
    return str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // elimina diacríticos
        .replace(/[^a-zA-Z0-9 ]/g, '')    // solo letras, números y espacios
        .toLowerCase();
}
// Función para quitar acentos y caracteres especiales (compatible cross-platform)
function normalize(str) {
    return str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // elimina diacríticos
        .replace(/[^a-zA-Z0-9 ]/g, '')    // solo letras, números y espacios
        .toLowerCase();
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
                if (obj.question && obj.answer && /^[a-zA-Z0-9 ]+$/.test(normalize(obj.answer))) {
                    return { question: obj.question, answer: normalize(obj.answer) };
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

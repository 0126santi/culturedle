// ...existing code...

// Endpoint temporal para reiniciar la pregunta de hoy (debe ir después de la inicialización de 'app')
app.post('/api/admin/reset-today', (req, res) => {
    const today = getToday();
    db.run('DELETE FROM daily_question WHERE date = ?', [today], function(err) {
        if (err) return res.status(500).json({ error: 'DB error' });
        res.json({ ok: true });
    });
});
const express = require('express');
const cors = require('cors');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { getQuestionOfTheDay } = require('./ai-generator');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// DB setup
const db = new sqlite3.Database('./worldle.db');
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS daily_question (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT UNIQUE,
        question TEXT,
        answer TEXT
    )`);
});

// Helper: get today string
function getToday() {
    return new Date().toISOString().slice(0, 10);
}

// API: Get today's question
app.get('/api/question', async (req, res) => {
    const today = getToday();
    db.get('SELECT question, answer FROM daily_question WHERE date = ?', [today], async (err, row) => {
        if (err) return res.status(500).json({ error: 'DB error' });
        if (row) {
            res.json({ question: row.question, answerLength: row.answer.length });
        } else {
            // Generar nueva pregunta, manejar error si la IA falla
            try {
                const { question, answer } = await getQuestionOfTheDay();
                db.run('INSERT INTO daily_question (date, question, answer) VALUES (?, ?, ?)', [today, question, answer], (err) => {
                    if (err) return res.status(500).json({ error: 'DB error' });
                    res.json({ question, answerLength: answer.length });
                });
            } catch (e) {
                res.status(500).json({ error: 'No se pudo generar la pregunta de hoy. Intenta más tarde.' });
            }
        }
    });
});

// Función para quitar acentos y caracteres especiales
function normalize(str) {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9 ]/g, '').toLowerCase();
}

// API: Check guess
app.post('/api/check', (req, res) => {
    const { guess } = req.body;
    const today = getToday();
    db.get('SELECT answer FROM daily_question WHERE date = ?', [today], (err, row) => {
        if (err || !row) return res.status(500).json({ error: 'No hay pregunta hoy' });
        const answer = normalize(row.answer);
        const userGuess = normalize(guess);
        const colored = colorizeGuess(userGuess, answer);
        res.json({ correct: userGuess === answer, colored, answer });
    });
});

// Colorize guess like Wordle
function colorizeGuess(guess, answer) {
    const result = [];
    const answerArr = answer.split('');
    const guessArr = guess.split('');
    const used = Array(answer.length).fill(false);
    // First pass: green
    for (let i = 0; i < guessArr.length; i++) {
        if (guessArr[i] === answerArr[i]) {
            result.push({ letter: guessArr[i], color: 'green' });
            used[i] = true;
        } else {
            result.push(null);
        }
    }
    // Second pass: yellow/gray
    for (let i = 0; i < guessArr.length; i++) {
        if (result[i]) continue;
        const idx = answerArr.findIndex((a, j) => a === guessArr[i] && !used[j]);
        if (idx !== -1) {
            result[i] = { letter: guessArr[i], color: 'yellow' };
            used[idx] = true;
        } else {
            result[i] = { letter: guessArr[i], color: 'gray' };
        }
    }
    return result;
}

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

const API_URL = '/api/question';
const CHECK_URL = '/api/check';
let maxAttempts = 6;
let attempts = 0;
let answerLength = 0;

function renderAttempts(attemptsArr) {
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = '';
    attemptsArr.forEach(row => {
        const rowDiv = document.createElement('div');
        row.forEach(l => {
            const span = document.createElement('span');
            let colorClass = l.color;
            if (l.color === 'input') colorClass = '';
            span.className = `letter ${colorClass}`;
            span.textContent = l.letter;
            rowDiv.appendChild(span);
        });
        resultDiv.appendChild(rowDiv);
    });
}

async function loadQuestion() {
    const res = await fetch(API_URL);
    const data = await res.json();
    document.getElementById('question').textContent = data.question;
    answerLength = data.answerLength;
    document.getElementById('guess-input').setAttribute('maxlength', answerLength);
}

let attemptsArr = [];

// --- LocalStorage helpers ---
function getTodayStr() {
    return new Date().toISOString().slice(0, 10);
}

function saveGameState(state) {
    localStorage.setItem('worldle-state', JSON.stringify(state));
}

function loadGameState() {
    const raw = localStorage.getItem('worldle-state');
    if (!raw) return null;
    try {
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

function clearGameState() {
    localStorage.removeItem('worldle-state');
}

async function checkGuess(guess) {
    const res = await fetch(CHECK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guess })
    });
    return await res.json();
}

const answerReveal = document.getElementById('answer-reveal');
const guessInput = document.getElementById('guess-input');
const guessForm = document.getElementById('guess-form');

// Mostrar la palabra que el usuario escribe en los cuadros (como en Wordle)

// Prevenir espacios en blanco en el input
guessInput.addEventListener('input', () => {
    // Eliminar todos los espacios en blanco automáticamente
    guessInput.value = guessInput.value.replace(/\s+/g, '');
    const val = guessInput.value.toLowerCase();
    const row = [];
    for (let i = 0; i < answerLength; i++) {
        row.push({ letter: val[i] ? val[i] : '', color: 'input' });
    }
    renderAttempts([...attemptsArr, row]);
});

guessForm.addEventListener('submit', async (e) => {
    // Prevenir envío si hay espacios en blanco
    if (/\s/.test(guessInput.value)) {
        alert('No se permiten espacios en blanco en la respuesta.');
        guessInput.value = guessInput.value.replace(/\s+/g, '');
        return;
    }
    e.preventDefault();
    const guess = guessInput.value.trim().toLowerCase();
    if (guess.length !== answerLength) {
        alert(`La respuesta debe tener ${answerLength} letras.`);
        return;
    }
    const result = await checkGuess(guess);
    attempts++;
    attemptsArr.push(result.colored);
    renderAttempts(attemptsArr);
    guessInput.value = '';
    document.getElementById('attempts').textContent = `Intento ${attempts} de ${maxAttempts}`;
    let finished = false;
    let win = false;
    if (result.correct) {
        answerReveal.style.display = 'block';
        answerReveal.textContent = '¡Correcto!';
        answerReveal.style.color = '#388e3c'; // verde
        guessInput.disabled = true;
        finished = true;
        win = true;
    } else if (attempts >= maxAttempts) {
        answerReveal.style.display = 'block';
        answerReveal.textContent = `La respuesta era: ${result.answer}`;
        answerReveal.style.color = '#d32f2f'; // rojo
        guessInput.disabled = true;
        finished = true;
    } else {
        answerReveal.style.display = 'none';
    }
    // Guardar estado
    saveGameState({
        date: getTodayStr(),
        attempts,
        attemptsArr,
        finished,
        win
    });
});

window.onload = async () => {
    await loadQuestion();
    document.getElementById('attempts').textContent = `Intento 0 de ${maxAttempts}`;
    answerReveal.style.display = 'none';
    answerReveal.style.color = '#d32f2f';
    guessInput.disabled = false;
    renderAttempts([]);

    // Cargar estado guardado
    const state = loadGameState();
    const today = getTodayStr();
    if (state && state.date === today) {
        attempts = state.attempts;
        attemptsArr = state.attemptsArr;
        renderAttempts(attemptsArr);
        document.getElementById('attempts').textContent = `Intento ${attempts} de ${maxAttempts}`;
        if (state.finished) {
            guessInput.disabled = true;
            answerReveal.style.display = 'block';
            if (state.win) {
                answerReveal.textContent = '¡Correcto!';
                answerReveal.style.color = '#388e3c';
            } else {
                // Mostrar la respuesta correcta guardada en el último intento
                if (attemptsArr.length > 0 && attemptsArr[attemptsArr.length - 1]) {
                    // Buscar la respuesta en el estado guardado
                    const res = await fetch(API_URL);
                    const data = await res.json();
                    answerReveal.textContent = `La respuesta era: ${data.answer ? data.answer : ''}`;
                } else {
                    answerReveal.textContent = 'La respuesta era:';
                }
                answerReveal.style.color = '#d32f2f';
            }
        }
    } else {
        // Si es otro día, limpiar estado
        clearGameState();
    }
};

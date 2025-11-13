# Culturedle (Cultura General diario)

Juego tipo Wordle: cada día se genera automáticamente una pregunta breve y difícil de cultura general. El usuario adivina la respuesta (una sola palabra, sin acentos), con feedback de colores por letra.

## Características
- Pregunta diaria generada por IA (Google Gemini, `gemini-2.5-flash`).
- Preguntas breves (<= 20 palabras) y nivel experto.
- Respuesta normalizada: no requiere acentos ni signos.
- Persistencia local con SQLite: 1 solicitud a la IA por día.
- Interfaz simple estilo Wordle con 6 intentos.

## Requisitos
- Node.js 18+
- API key de Gemini (Google Generative AI)

## Configuración
1. Clona el repositorio.
2. Copia `.env.sample` a `.env` y coloca tu clave:
```
GEMINI_API_KEY=tu_api_key_de_gemini
PORT=3000
```
3. Instala dependencias:
```pwsh
npm install
```
4. Inicia el servidor:
```pwsh
npm start
```
La app quedará en `http://localhost:3000`.

## Cómo funciona
- `GET /api/question` devuelve la pregunta del día y la longitud de la respuesta. Si no existe para el día actual, se genera vía Gemini y se guarda en `worldle.db`.
- `POST /api/check` compara tu intento (sin acentos/espacios) y devuelve colores por letra.

## Desarrollo y notas
- La clave de API no se guarda en el repo. Usa `.env`.
- El archivo `worldle.db` está ignorado por Git. Si deseas reiniciar el juego, elimina la fila del día actual en la tabla `daily_question` o borra el archivo local (se recreará).
- Si superas la cuota de Gemini (free tier ~250 req/día por modelo), espera el reseteo diario (00:00 UTC) o usa una cuenta de pago.

## Estructura
```
├─ server.js          # API (Express + SQLite)
├─ ai-generator.js    # Generación diaria con Gemini
├─ index.html         # UI
├─ script.js          # Lógica frontend
├─ style.css          # Estilos
├─ worldle.db         # DB local (ignorada por Git)
├─ .env.sample        # Variables de entorno de ejemplo
└─ .gitignore
```

## Despliegue
- Cualquier PaaS (Railway, Render, Fly.io). Asegura:
  - Variable `GEMINI_API_KEY` configurada.
  - Persistencia para `worldle.db` (volumen/disco) para evitar llamadas diarias repetidas a la IA.
  - No subas `node_modules/` ni `worldle.db` al repo.

## Roadmap (ideas)
- Límite diario por IP/usuario.
- Panel admin (protegido) para reiniciar pregunta del día.
- Internacionalización de UI.
- Historial y marcador de rachas.

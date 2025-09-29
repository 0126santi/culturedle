const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./worldle.db');
const today = new Date().toISOString().slice(0, 10);

db.run('DELETE FROM daily_question WHERE date = ?', [today], function(err) {
    if (err) {
        console.error('Error al borrar la pregunta de hoy:', err.message);
    } else {
        console.log('Pregunta de hoy eliminada correctamente.');
    }
    db.close();
});

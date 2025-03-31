/**
 * Dieses Script generiert einen sicheren API-Key für den Translations Export
 * Führe es mit `node scripts/generate-export-key.js` aus
 */

const crypto = require('crypto');

// Generiere einen 32-Byte zufälligen String und konvertiere ihn in Base64
const key = crypto.randomBytes(32).toString('base64');

console.log('\n========= TRANSLATIONS EXPORT API KEY =========');
console.log(key);
console.log('==============================================\n');
console.log('Füge diesen Key zu deinen Umgebungsvariablen hinzu als TRANSLATIONS_EXPORT_API_KEY');
console.log('Füge ihn auch als GitHub Secret hinzu unter dem gleichen Namen');
console.log('\n');
console.log('Für GitHub Actions müssen auch folgende Secrets gesetzt werden:');
console.log('- APP_URL: Die URL deiner Anwendung (z.B. https://europetalks.org)');
console.log('- TRANSLATIONS_EXPORT_API_KEY: Der oben generierte Key');
console.log('\n'); 
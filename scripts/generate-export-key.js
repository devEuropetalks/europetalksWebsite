/**
 * Dieses Script generiert einen sicheren API-Key für den Translations Export
 * Führe es mit `node scripts/generate-export-key.js` aus
 */

import crypto from "crypto";

// Generiere einen 32-Byte zufälligen String und konvertiere ihn in Base64
const key = crypto.randomBytes(32).toString("base64");

console.warn("\n========= TRANSLATIONS EXPORT API KEY =========");
console.warn(key);
console.warn("==============================================\n");
console.warn(
  "Füge diesen Key zu deinen Umgebungsvariablen hinzu als TRANSLATIONS_EXPORT_API_KEY"
);
console.warn("Füge ihn auch als GitHub Secret hinzu unter dem gleichen Namen");
console.warn("\n");
console.warn("Für GitHub Actions müssen auch folgende Secrets gesetzt werden:");
console.warn(
  "- APP_URL: Die URL deiner Anwendung (z.B. https://europetalks.org)"
);
console.warn("- TRANSLATIONS_EXPORT_API_KEY: Der oben generierte Key");
console.warn("\n");

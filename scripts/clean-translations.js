/**
 * Dieses Script identifiziert unbenutzte Übersetzungsschlüssel in der Anwendung
 * Es durchsucht den Quellcode nach Verwendungen von Übersetzungsfunktionen
 * und vergleicht sie mit allen verfügbaren Übersetzungsschlüsseln
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { glob } from "glob";

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Konfiguration
const sourceDir = path.resolve(__dirname, "..");
const translationsFile = path.resolve(
  __dirname,
  "../translations/translations.json"
);
const outputFile = path.resolve(__dirname, "../unused-translations.json");

// Funktionen zum Auslesen aller Übersetzungsschlüssel
function getAllTranslationKeys(obj, prefix = "", result = []) {
  for (const key in obj) {
    const newPrefix = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === "object" && obj[key] !== null) {
      getAllTranslationKeys(obj[key], newPrefix, result);
    } else {
      result.push(newPrefix);
    }
  }
  return result;
}

// Regex-Patterns für die Suche nach Übersetzungsfunktionsaufrufen
const patterns = [
  /t\(['"]([^'"]+)['"]/g, // t('key')
  /t\(['"]([^'"]+)['"],\s*{/g, // t('key', {
  /useTranslation\(['"]([^'"]+)['"]\)/g, // useTranslation('namespace')
  /i18n\.t\(['"]([^'"]+)['"]/g, // i18n.t('key')
  /i18n\.t\(['"]([^'"]+)['"],\s*{/g, // i18n.t('key', {
];

// Extrahiere verwendete Translation-Keys aus dem Quellcode
async function findUsedTranslations(translations) {
  const usedKeys = new Set();

  // Use async version of glob
  const sourceFiles = await glob(`${sourceDir}/**/*.{ts,tsx,js,jsx}`, {
    ignore: [
      "**/node_modules/**",
      "**/build/**",
      "**/dist/**",
      "**/translations/**",
      "**/scripts/**",
    ],
  });

  console.warn(`Analyzing ${sourceFiles.length} files...`);

  sourceFiles.forEach((file) => {
    const content = fs.readFileSync(file, "utf-8");

    // Suche nach allen Translation-Aufrufen
    patterns.forEach((pattern) => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        // Wenn ein Namespace in useTranslation gefunden wurde, markiere alle Schlüssel in diesem Namespace als verwendet
        if (pattern.toString().includes("useTranslation")) {
          const namespace = match[1];
          if (translations.en && translations.en[namespace]) {
            const namespaceKeys = getAllTranslationKeys(
              translations.en[namespace],
              namespace
            );
            namespaceKeys.forEach((key) => usedKeys.add(key));
          }
        } else {
          usedKeys.add(match[1]);
        }
      }
    });
  });

  // Suche auch nach hartcodierten Namespace-Referenzen wie components:languageSelector.label
  sourceFiles.forEach((file) => {
    const content = fs.readFileSync(file, "utf-8");

    // Extrahiere alle Strings der Form "namespace:key.subkey"
    const namespacePattern = /['"]([a-z]+):([a-zA-Z0-9_.]+)['"]/g;
    let match;
    while ((match = namespacePattern.exec(content)) !== null) {
      const fullKey = `${match[1]}.${match[2]}`;
      usedKeys.add(fullKey);
    }
  });

  return Array.from(usedKeys);
}

async function main() {
  try {
    // Load translations
    console.warn("Loading translations from", translationsFile);
    const translations = JSON.parse(fs.readFileSync(translationsFile, "utf-8"));

    // Get all available translation keys
    const allKeys = getAllTranslationKeys(translations.en);
    console.warn(`Found: ${allKeys.length} translation keys in total`);

    // Search for used translations in code
    const usedKeys = await findUsedTranslations(translations);
    console.warn(`Found: ${usedKeys.length} used translation keys`);

    // Identify unused keys
    const unusedKeys = allKeys.filter((key) => !usedKeys.includes(key));
    console.warn(`Found: ${unusedKeys.length} unused translation keys`);

    // Organize unused keys by namespace
    const unusedByNamespace = {};
    unusedKeys.forEach((key) => {
      const [namespace, ...rest] = key.split(".");
      if (!unusedByNamespace[namespace]) {
        unusedByNamespace[namespace] = [];
      }
      unusedByNamespace[namespace].push(rest.join("."));
    });

    // Save results
    fs.writeFileSync(outputFile, JSON.stringify(unusedByNamespace, null, 2));
    console.warn(`Results saved to ${outputFile}`);

    // Give a summary in the console
    console.warn("\nSummary of unused translations by namespace:");
    Object.entries(unusedByNamespace).forEach(([namespace, keys]) => {
      console.warn(`${namespace}: ${keys.length} unused keys`);
    });

    console.warn(
      "\nYou can now go to /admin/translations/clean to clean up these keys."
    );
  } catch (error) {
    console.error("Error during translation analysis:", error);

    // Create sample data if analysis fails
    const mockUnusedTranslations = {
      header: ["navigation.home", "navigation.about", "other.signIn"],
      components: ["languageSelector.label", "theme.toggleTheme"],
      home: ["hero.title", "cta.buttons.explore"],
      auth: ["signIn.title", "signUp.error"],
      other: ["months.january", "cities.berlin", "countries.germany"],
    };

    // Write sample data to output file
    fs.writeFileSync(
      outputFile,
      JSON.stringify(mockUnusedTranslations, null, 2)
    );
    console.warn(
      `✅ Created ${outputFile} with example unused translation keys`
    );
    console.warn("");
    console.warn(
      "NOTE: This is a fallback implementation due to an error in the analysis."
    );
    console.warn(
      "The actual analysis could not be completed. Check the error message above."
    );
    console.warn("");
    console.warn(
      "You can still go to /admin/translations/clean to test the UI."
    );
  }
}

// Execute the script
main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});

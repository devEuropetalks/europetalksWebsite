# Übersetzungssystem

Das Übersetzungssystem von EuropeTalks nutzt zwei Quellen für Übersetzungen:

1. **Lokale JSON-Dateien** im `translations/` Verzeichnis
2. **Datenbank-gespeicherte Übersetzungen** (primäre Quelle, wenn vorhanden)

## Wie Übersetzungen geladen werden

1. Beim Start der Anwendung werden alle lokalen JSON-Dateien geladen (aus dem `translations/` Verzeichnis)
2. Wenn ein Benutzer die Sprache wechselt, versucht die Anwendung, Übersetzungen aus der Datenbank zu laden
3. Falls es keine Datenbank-Übersetzungen gibt oder die Datenbank nicht erreichbar ist, werden die lokalen JSON-Dateien verwendet

## Automatischer Export von Datenbank zu JSON-Dateien

Um die lokalen JSON-Dateien mit den aktuellen Datenbank-Übersetzungen zu synchronisieren, gibt es mehrere Möglichkeiten:

### 1. Manueller Export über die Admin-Oberfläche

Administratoren können jederzeit den Export-Knopf auf der Seite `/admin/translations/export` verwenden, um alle Datenbank-Übersetzungen in die entsprechenden JSON-Dateien zu exportieren.

### 2. Automatisierter Export über GitHub Actions

Ein GitHub Actions Workflow ist eingerichtet, um:
- Automatisch einmal pro Woche (Sonntag um Mitternacht) zu exportieren
- Manuell über den "Run workflow" Knopf in GitHub ausgelöst zu werden
- (Optional) Nach jedem Push in den main-Branch zu exportieren

### Einrichtung des automatischen Exports

1. **Generiere einen API-Key**:
   ```
   node scripts/generate-export-key.js
   ```

2. **Setze Umgebungsvariablen**:
   - Füge `TRANSLATIONS_EXPORT_API_KEY=dein-generierter-key` zu deiner `.env` Datei hinzu
   - Der API-Key wird verwendet, um den Export-Endpunkt zu schützen

3. **Setze GitHub Secrets**:
   - `APP_URL`: Die URL deiner Anwendung (z.B. https://europetalks.eu)
   - `TRANSLATIONS_EXPORT_API_KEY`: Der gleiche Key wie in Schritt 2

4. **Aktiviere GitHub Actions**:
   - Der Workflow ist bereits eingerichtet in `.github/workflows/export-translations.yml`
   - Du kannst ihn nach Bedarf anpassen

## Vorteile dieser Lösung

- **Ausfallsicherheit**: Selbst wenn die Datenbank nicht erreichbar ist, funktionieren die Übersetzungen über die JSON-Dateien
- **Versionskontrolle**: Änderungen an Übersetzungen werden in Git verfolgt
- **Offline-Entwicklung**: Lokale Entwicklung ist ohne Datenbank-Verbindung möglich
- **Leichteres Deployment**: Keine Migration der Datenbank für Übersetzungsänderungen nötig

## Übersetzungseditor

Der Übersetzungseditor unter `/admin/translations` ermöglicht es Administratoren:
- Übersetzungen für alle Sprachen zu bearbeiten
- Neue Übersetzungsschlüssel hinzuzufügen
- Bestehende Übersetzungen zu aktualisieren

Für Mitglieder gibt es eine eingeschränkte Version unter `/member/translations`, die nur bestimmte Sprachen bearbeiten kann. 
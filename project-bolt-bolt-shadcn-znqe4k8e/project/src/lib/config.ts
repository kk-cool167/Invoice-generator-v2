/**
 * Zentrale Konfigurationsdatei für die Anwendung
 * Enthält Konfigurationen für API, Templates und andere globale Einstellungen
 */

// API Konfiguration
export const API_CONFIG = {
  // Basis-URL für API-Aufrufe, verwendet Umgebungsvariablen wenn verfügbar
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3003/api/v1',
  
  // Timeout für API-Anfragen in Millisekunden
  TIMEOUT: 30000,
  
  // Soll die API mit Credentials aufgerufen werden
  WITH_CREDENTIALS: false,
};

// PDF Template Konfiguration
export const PDF_CONFIG = {
  DEFAULT_TEMPLATE: 'businessstandard',
  AVAILABLE_TEMPLATES: ['businessstandard', 'classic', 'professional', 'businessgreen', 'allrauer2'],
};

// App Konfiguration
export const APP_CONFIG = {
  // Automatisches Speichern von Formulardaten in Minuten (0 = deaktiviert)
  AUTO_SAVE_INTERVAL: 2,
  
  // Maximale Anzahl der gespeicherten Formular-Snapshots
  MAX_FORM_HISTORY: 10,
}; 
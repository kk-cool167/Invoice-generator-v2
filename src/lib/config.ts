@@ .. @@
 // API Konfiguration
 export const API_CONFIG = {
   // Basis-URL für API-Aufrufe, verwendet Umgebungsvariablen wenn verfügbar
-  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3003/api/v1',
+  BASE_URL: '/api/v1', // Use relative URL for Vite proxy
   
   // Timeout für API-Anfragen in Millisekunden
   TIMEOUT: 30000,
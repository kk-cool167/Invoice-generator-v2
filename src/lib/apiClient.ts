@@ .. @@
 /**
  * Formatiert eine URL mit der API Basis-URL
  */
 const formatUrl = (endpoint: string): string => {
-  const baseUrl = API_CONFIG.BASE_URL;
+  const baseUrl = '/api/v1'; // Use relative URL for Vite proxy
   return `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
 };
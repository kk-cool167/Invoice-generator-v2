@@ .. @@
   // Show error state with detailed information
   if (hasError) {
-    const failedServices = Object.entries(errorDetails)
-      .filter(([, error]) => error)
-      .map(([service]) => service);
-
     return (
       <div className="p-8 text-center">
         <h3 className="text-lg font-semibold text-red-600 mb-4">
-          {t('errors.load.title')}
+          Connection Issue
         </h3>
         <div className="space-y-3">
           <p className="text-gray-600">
-            {t('errors.load.message')}
+            Using offline data. Some features may be limited.
           </p>
-          {failedServices.length > 0 && (
-            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
-              <p className="text-sm font-medium text-red-800 mb-2">
-                Failed to load:
-              </p>
-              <ul className="text-sm text-red-700 space-y-1">
-                {failedServices.map(service => (
-                  <li key={service}>• {service}</li>
-                ))}
-              </ul>
-            </div>
-          )}
           <button 
             onClick={() => window.location.reload()} 
-            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
+            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
           >
-            Retry
+            Retry Connection
           </button>
         </div>
       </div>
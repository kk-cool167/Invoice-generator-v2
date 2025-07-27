@@ .. @@
   // Show error state with detailed information
   if (hasError) {
     return (
       <div className="p-8 text-center">
         <h3 className="text-lg font-semibold text-red-600 mb-4">
           Connection Issue
         </h3>
         <div className="space-y-3">
           <p className="text-gray-600">
             Using offline data. Some features may be limited.
           </p>
           <button 
             onClick={() => window.location.reload()} 
             className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
           >
             Retry Connection
           </button>
         </div>
       </div>
     );
   }
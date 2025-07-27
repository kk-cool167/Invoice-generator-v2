import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import LoginPage from "./components/LoginPage";
import { InvoiceForm } from "./components/InvoiceForm";
import PrivateRoute from "./components/PrivateRoute";
import { LanguageSelector } from "./components/LanguageSelector";
const queryClient = new QueryClient();

// Layout component to provide consistent structure
const AppLayout: React.FC<{children: React.ReactNode}> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 relative overflow-hidden">
      
      <header className="bg-white/90 backdrop-blur-sm border-b border-purple-200 sticky top-0 z-20 shadow-lg">
        <div className="w-full px-3 sm:px-4 lg:px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="bg-purple-600 p-2.5 rounded-xl shadow-lg">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
                  <path d="M20 22H4C3.44772 22 3 21.5523 3 21V3C3 2.44772 3.44772 2 4 2H20C20.5523 2 21 2.44772 21 3V21C21 21.5523 20.5523 22 20 22Z" stroke="currentColor" strokeWidth="2" />
                  <path d="M8 10H16M8 14H16M8 18H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M8 6H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-900">
                  Invoice System
                </h1>
                <p className="text-xs text-gray-500/80 hidden sm:block">Modern Document Management System</p>
              </div>
            </div>
            <LanguageSelector />
          </div>
        </div>
      </header>
      
      <main className="relative z-10 min-h-[calc(100vh-80px)]">
        {children}
      </main>
      
      <footer className="bg-gradient-to-r from-purple-50/90 via-white/95 to-blue-50/90 backdrop-blur-md relative z-20 shadow-inner">
        <div className="w-full px-3 sm:px-4 lg:px-6 py-6">
          <div className="text-center space-y-1">
            <div className="text-sm font-semibold text-gray-600">
              Invoice Generator System
            </div>
            <div className="text-xs text-gray-500 flex items-center justify-center gap-4">
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                © {new Date().getFullYear()}
              </span>
              <span className="text-purple-400">|</span>
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
                Beini Kittel
              </span>
              <span className="text-purple-400">|</span>
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                </svg>
                SER Solution Engineering
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <AppLayout>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/" element={
                <PrivateRoute>
                  <div className="w-full p-3 sm:p-4 lg:p-6">
                    {/* Single Main Content Area - Full Width */}
                    <div className="w-full">
                      <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl shadow-black/5 border border-purple-200/30 min-h-[600px] overflow-hidden">
                        <InvoiceForm />
                      </div>
                    </div>
                  </div>
                </PrivateRoute>
              } />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </AppLayout>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;

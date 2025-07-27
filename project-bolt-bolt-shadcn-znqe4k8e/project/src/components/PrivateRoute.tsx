// components/PrivateRoute.tsx
import React, { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

interface PrivateRouteProps {
  children: ReactNode;
}

export default function PrivateRoute({ children }: PrivateRouteProps) {
  const { isAuthenticated } = useAuth();

  // Falls NICHT eingeloggt → redirect zum Login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Ansonsten gerenderte Kinder (z.B. Invoice-Seite)
  return <>{children}</>;
}

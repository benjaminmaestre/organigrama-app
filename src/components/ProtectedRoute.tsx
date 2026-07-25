import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  // Comprobamos si hay alguna sesión activa en localStorage
  // Supabase guarda su sesión bajo claves que empiezan por 'sb-' y terminan en '-auth-token'
  const hasSupabaseSession = Object.keys(localStorage).some(
    (key) => key.startsWith('sb-') && key.endsWith('-auth-token')
  );
  const hasMockSession = localStorage.getItem('mock-session') === 'true';

  if (!hasSupabaseSession && !hasMockSession) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
export default ProtectedRoute;

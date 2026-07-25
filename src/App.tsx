import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { OrganigramaPage } from './pages/OrganigramaPage';
import { LoginPage } from './pages/LoginPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { SeguimientoPage } from './pages/SeguimientoPage';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<OrganigramaPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route 
          path="/seguimiento" 
          element={
            <ProtectedRoute>
              <SeguimientoPage />
            </ProtectedRoute>
          } 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

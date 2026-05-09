import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthGuard from './components/AuthGuard';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import RedirectPage from './pages/RedirectPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota pública de redirecionamento */}
        <Route path="/r/:code" element={<RedirectPage />} />
        
        {/* Rota de login */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* Rotas protegidas */}
        <Route element={<AuthGuard />}>
          <Route path="/" element={<DashboardPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

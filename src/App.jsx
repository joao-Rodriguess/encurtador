import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthGuard from './components/AuthGuard';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import HubPage from './pages/HubPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota pública do Hub / Portfólio */}
        <Route path="/" element={<HubPage />} />
        
        {/* Rota de login */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* Rotas protegidas (Admin) */}
        <Route element={<AuthGuard />}>
          <Route path="/admin" element={<DashboardPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

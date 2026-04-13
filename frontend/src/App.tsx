import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { AuthProvider }    from './contexts/AuthContext';
import ProtectedRoute      from './components/ProtectedRoute';
import Navbar              from './components/Navbar';
import Footer              from './components/Footer';

import HomePage            from './pages/HomePage';
import BiensPage           from './pages/BiensPage';
import BienDetailPage      from './pages/BienDetailPage';
import AgencesPage         from './pages/AgencesPage';
import AgenceDetailPage    from './pages/AgenceDetailPage';
import LoginPage           from './pages/LoginPage';
import RegisterPage        from './pages/RegisterPage';
import ResetPasswordPage   from './pages/ResetPasswordPage';
import ProfilPage          from './pages/ProfilPage';
import AnnoncesPage        from './pages/dashboard/AnnoncesPage';
import TransactionsPage    from './pages/dashboard/TransactionsPage';
import StatsPage           from './pages/dashboard/StatsPage';
import AdminPage           from './pages/AdminPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />

        <div style={{ minHeight: 'calc(100vh - 64px - 320px)' }}>
          <Routes>
            {/* ── Routes publiques ── */}
            <Route path="/"           element={<HomePage />} />
            <Route path="/biens"      element={<BiensPage />} />
            <Route path="/biens/:id"  element={<BienDetailPage />} />
            <Route path="/agences"    element={<AgencesPage />} />
            <Route path="/agences/:id" element={<AgenceDetailPage />} />
            <Route path="/login"          element={<LoginPage />} />
            <Route path="/register"       element={<RegisterPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />

            {/* ── Profil client (tout utilisateur connecté) ── */}
            <Route path="/profil" element={
              <ProtectedRoute>
                <ProfilPage />
              </ProtectedRoute>
            } />

            {/* ── Dashboard commercial / admin ── */}
            <Route path="/dashboard/annonces" element={
              <ProtectedRoute roles={['commercial', 'admin']}>
                <AnnoncesPage />
              </ProtectedRoute>
            } />

            {/* ── Dashboard gestionnaire des ventes / admin ── */}
            <Route path="/dashboard/transactions" element={
              <ProtectedRoute roles={['gestionnaire_ventes', 'admin']}>
                <TransactionsPage />
              </ProtectedRoute>
            } />

            {/* ── Dashboard directeur / admin ── */}
            <Route path="/dashboard/stats" element={
              <ProtectedRoute roles={['directeur', 'admin']}>
                <StatsPage />
              </ProtectedRoute>
            } />

            {/* ── Administration (admin uniquement) ── */}
            <Route path="/admin" element={
              <ProtectedRoute roles={['admin']}>
                <AdminPage />
              </ProtectedRoute>
            } />

            {/* ── 404 ── */}
            <Route path="*" element={
              <div style={{
                textAlign: 'center', padding: '6rem 1.5rem', fontFamily: 'Inter, sans-serif',
              }}>
                <h1 style={{ fontSize: '4rem', color: '#00B0A0', marginBottom: '1rem' }}>404</h1>
                <p style={{ color: '#6B7280', marginBottom: '1.5rem' }}>Cette page n'existe pas.</p>
                <a href="/" style={{ color: '#00B0A0', fontWeight: 600, textDecoration: 'underline' }}>
                  Retour à l'accueil
                </a>
              </div>
            } />
          </Routes>
        </div>

        <Footer />
      </AuthProvider>
    </BrowserRouter>
  );
}

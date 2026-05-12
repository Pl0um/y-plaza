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

        <main>
          <Routes>
            {/* ── Routes publiques ── */}
            <Route path="/"            element={<HomePage />} />
            <Route path="/biens"       element={<BiensPage />} />
            <Route path="/biens/:id"   element={<BienDetailPage />} />
            <Route path="/agences"     element={<AgencesPage />} />
            <Route path="/agences/:id" element={<AgenceDetailPage />} />
            <Route path="/login"           element={<LoginPage />} />
            <Route path="/register"        element={<RegisterPage />} />
            <Route path="/reset-password"  element={<ResetPasswordPage />} />

            {/* ── Profil client ── */}
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

            {/* ── Dashboard gestionnaire / admin ── */}
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

            {/* ── Administration ── */}
            <Route path="/admin" element={
              <ProtectedRoute roles={['admin']}>
                <AdminPage />
              </ProtectedRoute>
            } />

            {/* ── 404 ── */}
            <Route path="*" element={
              <div style={{
                textAlign: 'center',
                padding: '8rem 1.5rem',
                fontFamily: "'Inter', sans-serif",
                minHeight: '60vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <h1 style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: '5rem',
                  color: '#38573F',
                  marginBottom: '1rem',
                  lineHeight: 1,
                }}>
                  404
                </h1>
                <p style={{ color: '#5a4a3a', marginBottom: '2rem', fontSize: '1.05rem' }}>
                  Cette page n&apos;existe pas.
                </p>
                <a href="/" style={{
                  color: '#38573F',
                  fontWeight: 600,
                  borderBottom: '1.5px solid #38573F',
                  paddingBottom: '2px',
                  fontSize: '0.9rem',
                }}>
                  Retour à l&apos;accueil
                </a>
              </div>
            } />
          </Routes>
        </main>

        <Footer />
      </AuthProvider>
    </BrowserRouter>
  );
}

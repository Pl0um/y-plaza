import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

import HomePage from './pages/HomePage';
import BiensPage from './pages/BiensPage';
import BienDetailPage from './pages/BienDetailPage';
import AgencesPage from './pages/AgencesPage';
import AgenceDetailPage from './pages/AgenceDetailPage';

export default function App() {
  return (
    <BrowserRouter>
      {/* Navigation persistante sur toutes les pages */}
      <Navbar />

      {/* Contenu principal — flex: 1 pour pousser le footer en bas */}
      <div style={{ minHeight: 'calc(100vh - 64px - 320px)' }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/biens" element={<BiensPage />} />
          <Route path="/biens/:id" element={<BienDetailPage />} />
          <Route path="/agences" element={<AgencesPage />} />
          <Route path="/agences/:id" element={<AgenceDetailPage />} />

          {/* 404 */}
          <Route path="*" element={
            <div style={{
              textAlign: 'center',
              padding: '6rem 1.5rem',
              fontFamily: 'Inter, sans-serif',
            }}>
              <h1 style={{ fontSize: '4rem', color: '#00B0A0', marginBottom: '1rem' }}>404</h1>
              <p style={{ color: '#6B7280', marginBottom: '1.5rem' }}>
                Cette page n'existe pas.
              </p>
              <a href="/" style={{
                color: '#00B0A0',
                fontWeight: 600,
                textDecoration: 'underline',
              }}>
                Retour à l'accueil
              </a>
            </div>
          } />
        </Routes>
      </div>

      <Footer />
    </BrowserRouter>
  );
}

import { useEffect } from 'react';
import { useAuthStore, authStore } from './store/authStore';
import { Toaster } from 'react-hot-toast';
import { useUIStore } from './store/uiStore';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { AdminPage } from './pages/AdminPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { TermsPage } from './pages/TermsPage';
import { Spinner } from './components/ui/Spinner';

export default function App() {
  const loading = useAuthStore(s => s.loading);
  const user = useAuthStore(s => s.user);
  const currentPage = useUIStore(s => s.currentPage);

  // Initialize secure session upon mount
  useEffect(() => {
    authStore.initSession();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center text-white select-none">
        <Spinner size="lg" />
        <span className="text-[10px] font-mono tracking-widest text-neutral-500 mt-4 uppercase">
          Decrypting Secure Handshake Files...
        </span>
      </div>
    );
  }

  return (
    <>
      {/* Visual Routing Hub */}
      {currentPage === 'privacy' ? (
        <PrivacyPage />
      ) : currentPage === 'terms' ? (
        <TermsPage />
      ) : !user ? (
        <LandingPage />
      ) : currentPage === 'admin' && user.role === 'admin' ? (
        <AdminPage />
      ) : (
        <DashboardPage />
      )}

      {/* Styled feedback notification toaster */}
      <Toaster 
        position="bottom-right"
        toastOptions={{
          className: 'border border-neutral-900 bg-[#0c0c0c] text-white font-mono text-xs shadow-xl rounded px-4.5 py-3',
          duration: 3500,
          style: {
            background: '#0d0d0d',
            color: '#fff',
            border: '1px solid #1a1a1a',
            borderRadius: '4px',
            fontSize: '11px',
          },
          success: {
            iconTheme: {
              primary: '#fff',
              secondary: '#000',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#000',
            },
          },
        }}
      />
    </>
  );
}

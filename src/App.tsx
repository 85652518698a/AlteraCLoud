import { useEffect } from 'react';
import { useAuthStore, authStore } from './store/authStore';
import { Toaster } from 'react-hot-toast';
import { useUIStore, uiStore } from './store/uiStore';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { AdminPage } from './pages/AdminPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { TermsPage } from './pages/TermsPage';
import { DownloadPage } from './pages/DownloadPage';

import { Spinner } from './components/ui/Spinner';

export default function App() {
  const loading = useAuthStore(s => s.loading);
  const user = useAuthStore(s => s.user);
  const currentPage = useUIStore(s => s.currentPage);

  // Initialize secure session upon mount
  useEffect(() => {
    authStore.initSession();
  }, []);

  // Sync URL path ↔ store-based routing
  useEffect(() => {
    const path = window.location.pathname.replace(/\/$/, '');
    if (path === '/privacy') uiStore.setCurrentPage('privacy');
    else if (path === '/terms') uiStore.setCurrentPage('terms');
    else if (path === '/download') uiStore.setCurrentPage('download');
    else if (path === '/admin') uiStore.setCurrentPage('admin');

  }, []);

  useEffect(() => {
    const path = window.location.pathname.replace(/\/$/, '');
    const page = currentPage;
    const expected = page === 'privacy' ? '/privacy' : page === 'terms' ? '/terms' : page === 'download' ? '/download' : page === 'admin' ? '/admin' : '/';
    if (path !== expected) window.history.replaceState(null, '', expected);
  }, [currentPage]);

  useEffect(() => {
    const handlePop = () => {
      const path = window.location.pathname.replace(/\/$/, '');
      if (path === '/privacy') uiStore.setCurrentPage('privacy');
      else if (path === '/terms') uiStore.setCurrentPage('terms');
      else if (path === '/download') uiStore.setCurrentPage('download');
      else if (path === '/admin') uiStore.setCurrentPage('admin');
      else {
        uiStore.setCurrentPage('landing');
      }
    };
    window.addEventListener('popstate', handlePop);
    return () => window.removeEventListener('popstate', handlePop);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center text-black select-none">
        <Spinner size="lg" />
        <span className="text-[10px] font-mono tracking-widest text-neutral-600 mt-4 uppercase">
          Loading encrypted vault...
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
      ) : currentPage === 'download' ? (
        <DownloadPage />
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
          className: 'border-2 border-black bg-white text-black font-mono text-xs font-bold px-4.5 py-3',
          duration: 3500,
          style: {
            background: '#FFFFFF',
            color: '#000000',
            border: '3px solid #000000',
            borderRadius: '0',
            fontSize: '11px',
          },
          success: {
            iconTheme: {
              primary: '#000',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#FF3B30',
              secondary: '#fff',
            },
          },
        }}
      />
    </>
  );
}

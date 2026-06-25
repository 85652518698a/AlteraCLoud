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
      <div className="min-h-screen bg-white flex flex-col items-center justify-center text-black select-none p-8">
        {/* Brand */}
        <div className="flex flex-col items-center gap-8">
          <div className="text-center">
            <div className="text-4xl md:text-6xl font-display font-black tracking-[0.08em] text-black leading-none">
              A<span className="text-[#FF3B30]">L</span>TERA
            </div>
            <div className="text-xs font-mono tracking-[0.3em] text-neutral-600 mt-3 font-bold">
              CLOUD STORAGE FACILITY
            </div>
          </div>

          {/* Brutalist animated bar */}
          <div className="w-64 border-3 border-black p-1">
            <div className="h-2 bg-[#FF3B30] animate-load-bar" />
          </div>

          {/* Cycling message */}
          <span className="text-xs font-mono tracking-widest text-neutral-700 font-bold animate-fade-msg">
            INITIALIZING SECURE SESSION...
          </span>

          {/* Terminal blocks */}
          <div className="flex gap-1.5">
            {[0, 1, 2, 3].map(i => (
              <div
                key={i}
                className="w-2 h-2 border-2 border-black bg-white animate-blink"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
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

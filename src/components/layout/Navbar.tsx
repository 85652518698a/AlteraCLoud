import React from 'react';
import { useAuthStore, authStore } from '../../store/authStore';
import { useUIStore, uiStore } from '../../store/uiStore';
import { LogOut, ShieldCheck, Library } from 'lucide-react';

export const Navbar: React.FC = () => {
  const user = useAuthStore(s => s.user);
  const currentPage = useUIStore(s => s.currentPage);

  const handleSignOut = async () => {
    await authStore.logout();
    uiStore.setCurrentPage('landing');
  };

  const navigateToDashboard = () => {
    if (user) {
      uiStore.setCurrentPage('dashboard');
    }
  };

  const navigateToAdmin = () => {
    if (user && user.role === 'admin') {
      uiStore.setCurrentPage('admin');
    }
  };

  const isLegalPage = currentPage === 'privacy' || currentPage === 'terms';

  return (
    <nav className="w-full bg-black/90 backdrop-blur-md border-b border-neutral-900 sticky top-0 z-40 px-6 py-4 shadow-[0_1px_20px_rgba(0,0,0,0.8)]">
      <div className="max-w-[1240px] mx-auto flex items-center justify-between">
        {/* Responsive Logo Container */}
        <div 
          onClick={() => uiStore.setCurrentPage(user ? 'dashboard' : 'landing')}
          className="flex items-center gap-2 cursor-pointer group select-none"
        >
          <div className="text-xl uppercase tracking-wide flex items-baseline">
            <span className="font-display font-black tracking-[0.08em] text-white transition-opacity group-hover:opacity-90">
              A<span className="text-accent">L</span>TERA
            </span>
            <span className="font-display font-light tracking-[0.16em] text-neutral-400 ml-1.5">
              CLOUD
            </span>
          </div>
          <span className="hidden sm:inline-block text-[9px] font-mono border border-neutral-800 text-neutral-400 bg-neutral-900/50 px-2 py-0.5 rounded-sm ml-2.5 font-bold">
            CSMU v2.1
          </span>
        </div>

        {/* Navigation Actions */}
        {isLegalPage ? (
          <div className="flex items-center gap-4">
            <button
              onClick={() => uiStore.setCurrentPage(user ? 'dashboard' : 'landing')}
              className="text-[10px] font-mono font-bold text-neutral-300 hover:text-white flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 border border-neutral-800 hover:border-neutral-750 rounded-sm transition-all cursor-pointer uppercase tracking-wider"
            >
              <Library className="w-3.5 h-3.5" />
              {user ? 'BACK TO PORTAL' : 'BACK TO HOME'}
            </button>
          </div>
        ) : user && (
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4">
              {currentPage === 'admin' ? (
                <button
                  onClick={navigateToDashboard}
                  className="text-[10px] font-mono font-bold text-neutral-300 hover:text-white flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 border border-neutral-800 hover:border-neutral-750 rounded-sm transition-all cursor-pointer uppercase tracking-wider"
                >
                  <Library className="w-3.5 h-3.5" />
                  STUDENT PORTAL
                </button>
              ) : (
                user.role === 'admin' && (
                  <button
                    onClick={navigateToAdmin}
                    className="text-[10px] font-mono font-bold text-black flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-white rounded-sm hover:bg-neutral-200 transition-all cursor-pointer uppercase tracking-wider shadow-[0_0_12px_rgba(255,255,255,0.15)] hover:shadow-glow-white"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    ADMIN CABINET
                  </button>
                )
              )}
            </div>

            {/* User Profile Avatar with dropdown dropdown-style design */}
            <div className="flex items-center gap-3 border-l border-neutral-900 pl-4">
              <div className="text-right hidden md:block select-none">
                <div className="text-xs font-semibold text-zinc-100">
                  {user.displayName || 'Registered User'}
                </div>
                <div className="text-[10px] font-mono text-neutral-500 uppercase flex items-center justify-end gap-1.5 font-bold mt-0.5">
                  {user.role === 'admin' ? (
                    <span className="text-emerald-400">● FULL ADMIN</span>
                  ) : (
                    <span className="text-neutral-400">● CSMU STUDENT</span>
                  )}
                </div>
              </div>

              {/* Avatar Initial Badge */}
              <div className="h-8 w-8 rounded-full bg-neutral-950 border border-neutral-800 hover:border-neutral-600 flex items-center justify-center text-xs font-bold text-white font-mono uppercase tracking-widest relative cursor-default select-none transition-colors shadow-inner">
                {(user.displayName || user.email || 'A')[0]}
              </div>

              {/* Minimal Sign Out Button */}
              <button
                onClick={handleSignOut}
                title="Sign out of system"
                className="p-1.5 hover:bg-neutral-950 text-neutral-500 hover:text-red-400 border border-transparent hover:border-neutral-800 rounded-sm transition-all duration-150 cursor-pointer ml-1"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

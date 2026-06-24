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
    <nav className="w-full bg-white border-b-4 border-black sticky top-0 z-40 px-6 py-4">
      <div className="max-w-[1240px] mx-auto flex items-center justify-between">
        {/* Logo */}
        <div 
          onClick={() => uiStore.setCurrentPage(user ? 'dashboard' : 'landing')}
          className="flex items-center gap-2 cursor-pointer group select-none"
        >
          <div className="text-xl uppercase tracking-wide flex items-baseline">
            <span className="font-display font-black tracking-[0.08em] text-black">
              A<span className="text-[#FF3B30]">L</span>TERA
            </span>
            <span className="font-display font-light tracking-[0.16em] text-neutral-500 ml-1.5">
              CLOUD
            </span>
          </div>
          <span className="hidden sm:inline-block text-[9px] font-mono border-2 border-black text-black bg-white px-2 py-0.5 font-bold">
            CSMU v2.1
          </span>
        </div>

        {/* Navigation Actions */}
        {isLegalPage ? (
          <div className="flex items-center gap-4">
            <button
              onClick={() => uiStore.setCurrentPage(user ? 'dashboard' : 'landing')}
              className="text-[10px] font-mono font-bold text-black flex items-center gap-1.5 px-3 py-1.5 bg-white border-2 border-black hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all duration-150 cursor-pointer uppercase tracking-wider"
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
              className="text-[10px] font-mono font-bold text-black flex items-center gap-1.5 px-3 py-1.5 bg-white border-2 border-black hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all duration-150 cursor-pointer uppercase tracking-wider"
                >
                  <Library className="w-3.5 h-3.5" />
                  STUDENT PORTAL
                </button>
              ) : (
                user.role === 'admin' && (
                  <button
                    onClick={navigateToAdmin}
                    className="text-[10px] font-mono font-bold text-white flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 border-2 border-blue-600 hover:bg-black hover:border-black transition-all duration-150 cursor-pointer uppercase tracking-wider"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    ADMIN CABINET
                  </button>
                )
              )}
            </div>

            {/* User profile */}
            <div className="flex items-center gap-3 border-l-2 border-black pl-4">
              <div className="text-right hidden md:block select-none">
                <div className="text-xs font-semibold text-black">
                  {user.displayName || 'Registered User'}
                </div>
                <div className="text-[10px] font-mono text-neutral-600 uppercase flex items-center justify-end gap-1.5 font-bold mt-0.5">
                  {user.role === 'admin' ? (
                    <span className="text-[#FF3B30]">● FULL ADMIN</span>
                  ) : (
                    <span className="text-neutral-700">● CSMU STUDENT</span>
                  )}
                </div>
              </div>

              {/* Avatar */}
              <div className="h-8 w-8 bg-white border-2 border-black flex items-center justify-center text-xs font-bold text-black font-mono uppercase tracking-widest relative cursor-default select-none">
                {(user.displayName || user.email || 'A')[0]}
              </div>

              {/* Sign out */}
              <button
                onClick={handleSignOut}
                title="Sign out of system"
                className="p-1.5 hover:bg-[#FF3B30] text-neutral-600 hover:text-white border-2 border-black hover:border-[#FF3B30] transition-all duration-150 cursor-pointer ml-1"
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

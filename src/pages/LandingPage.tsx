import React, { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { uiStore } from '../store/uiStore';
import { LoginCard } from '../components/auth/LoginCard';

export const LandingPage: React.FC = () => {
  const user = useAuthStore(s => s.user);

  useEffect(() => {
    if (user) {
      uiStore.setCurrentPage('dashboard');
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center relative overflow-hidden select-none">
      {/* Premium ambient glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.02)_0%,rgba(0,0,0,0)_70%)] pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[radial-gradient(ellipse_at_center,rgba(34,211,238,0.04)_0%,transparent_60%)] pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent" />
      
      <div className="relative z-10 w-full">
        <LoginCard />
      </div>
    </div>
  );
};

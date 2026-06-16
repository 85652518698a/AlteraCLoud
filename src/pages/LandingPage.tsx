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
      {/* Subtle radial glow matching mockup precisely */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.02)_0%,rgba(0,0,0,0)_70%)] pointer-events-none" />
      
      <div className="relative z-10 w-full">
        <LoginCard />
      </div>
    </div>
  );
};

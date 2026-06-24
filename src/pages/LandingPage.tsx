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
    <div className="min-h-screen bg-white flex flex-col items-center justify-center relative overflow-hidden select-none">
      <div className="relative z-10 w-full">
        <LoginCard />
      </div>
    </div>
  );
};

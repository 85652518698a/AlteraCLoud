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
      {/* Dot grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #ffffff 0.5px, transparent 0.5px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Premium ambient glow layers */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.02)_0%,rgba(0,0,0,0)_70%)] pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[radial-gradient(ellipse_at_center,rgba(34,211,238,0.05)_0%,transparent_60%)] pointer-events-none" />
      <div className="absolute top-1/3 right-0 w-[300px] h-[300px] bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.03)_0%,transparent_60%)] pointer-events-none" />
      <div className="absolute bottom-1/4 left-0 w-[250px] h-[250px] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_0%,transparent_60%)] pointer-events-none" />
      
      {/* Floating decorative orbs */}
      <div className="absolute top-[15%] left-[10%] w-2 h-2 rounded-full bg-accent/20 animate-float-slow pointer-events-none" />
      <div className="absolute top-[30%] right-[15%] w-1.5 h-1.5 rounded-full bg-white/10 animate-float-slow pointer-events-none" style={{ animationDelay: '-2s' }} />
      <div className="absolute bottom-[25%] right-[20%] w-1 h-1 rounded-full bg-accent/30 animate-float-slow pointer-events-none" style={{ animationDelay: '-4s' }} />
      
      {/* Bottom glow line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent" />
      
      <div className="relative z-10 w-full page-enter">
        <LoginCard />
      </div>
    </div>
  );
};

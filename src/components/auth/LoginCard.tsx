import React, { useState } from 'react';
import { authStore } from '../../store/authStore';
import { Button } from '../ui/Button';
import { ShieldAlert, LogIn, Mail, Sparkles } from 'lucide-react';

export const LoginCard: React.FC = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [error, setError] = useState('');

  const handleOpenApp = async () => {
    try {
      await authStore.login();
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please try again.');
    }
  };

  const selectDemoEmail = (demoEmail: string, demoName: string) => {
    handleOpenApp();
  };

  return (
    <div className="relative min-h-[92vh] flex flex-col items-center justify-center p-4 selection:bg-white selection:text-black">
      {/* Background radial soft light highlight */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.025)_0%,transparent_60%)] pointer-events-none" />

      <div className="w-full max-w-xl text-center z-10 space-y-12 animate-fade-in my-auto">
        
        {/* Brand visual header logo */}
        <div className="space-y-4 select-none">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-neutral-900 border border-neutral-800 rounded mb-1 text-[9px] font-mono tracking-[0.2em] text-[#888]">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>SECURE VAULT GATES ACTIVE</span>
          </div>
          <div className="text-5.5xl md:text-7xl font-display font-black tracking-[0.1em] text-white leading-none">
            ALTERA<span className="font-light text-neutral-400 font-sans tracking-[0.15em] ml-2 text-4xl md:text-5.5xl leading-none">CS</span>
          </div>
          <p className="text-neutral-400 text-xs tracking-widest uppercase font-mono max-w-md mx-auto leading-relaxed">
            Your premium vault for notes, assignments, and digital excellence.
          </p>
        </div>

        {/* Action Button Segment */}
        {!showPrompt ? (
          <div className="flex flex-col items-center gap-4.5">
            <button
              onClick={handleOpenApp}
              className="px-10 py-3.5 bg-white text-black text-xs md:text-sm font-bold tracking-[0.15em] rounded-full hover:bg-neutral-200 active:scale-95 transition-all duration-150 uppercase shadow-[0_0_24px_rgba(255,255,255,0.15)] cursor-pointer"
            >
              OPEN THE APP
            </button>
            <div className="pt-8 flex items-center gap-3">
              <div className="w-16 h-[1px] bg-neutral-800" />
              <span className="text-[8px] font-mono text-neutral-700 uppercase tracking-[0.3em]">or</span>
              <div className="w-16 h-[1px] bg-neutral-800" />
            </div>
            <button
              onClick={handleOpenApp}
              className="text-[10px] text-neutral-500 hover:text-white uppercase tracking-widest font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>SIGN IN WITH GOOGLE AUTH</span>
            </button>
          </div>
        ) : null}

        {/* Feature Badges Separted by Hairlines */}
        <div className="flex justify-center items-center gap-6.5 text-[9px] font-mono uppercase tracking-[0.2em] text-[#555555] select-none pt-4">
          <div className="text-center font-bold px-4">
            <span className="block text-white mb-0.5 font-sans">50MB</span>
            <span>LIMIT</span>
          </div>
          <div className="w-[1px] h-6 bg-neutral-900" />
          
          <div className="text-center font-bold px-4">
            <span className="block text-white mb-[#1px] font-sans">SECURE</span>
            <span>STORAGE</span>
          </div>
          <div className="w-[1px] h-6 bg-neutral-900" />
          
          <div className="text-center font-bold px-4">
            <span className="block text-white mb-0.5 font-sans">LIVE</span>
            <span>SYNC</span>
          </div>
        </div>

      </div>

      {/* Standard brand footer info */}
      <div className="mt-auto text-[9px] font-mono text-[#555555] tracking-widest uppercase">
        STUDENT RESOURCES DEPOSITORY • CSMU ACADEMIC PORTAL
      </div>
    </div>
  );
};

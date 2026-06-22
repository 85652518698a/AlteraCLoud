import React, { useState } from 'react';
import { authStore } from '../../store/authStore';
import { ShieldAlert, LogIn, Sparkles } from 'lucide-react';

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

  return (
    <div className="relative min-h-[92vh] flex flex-col items-center justify-center p-4 selection:bg-white selection:text-black">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.025)_0%,transparent_60%)] pointer-events-none" />

      <div className="w-full max-w-xl text-center z-10 space-y-12 animate-fade-in my-auto">
        
        {/* Brand header */}
        <div className="space-y-5 select-none">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-neutral-900/80 border border-neutral-800 rounded mb-2 text-[9px] font-mono tracking-[0.2em] text-[#888]">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping-slow absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-accent"></span>
            </span>
            <span>SECURE VAULT GATES ACTIVE</span>
          </div>

          <div className="text-5.5xl md:text-7xl font-display font-black tracking-[0.08em] text-white leading-none">
            A<span className="text-gradient-cyan">L</span>TERA
            <span className="font-light text-neutral-500 font-sans tracking-[0.15em] ml-3 text-4xl md:text-5.5xl leading-none">CS</span>
          </div>

          <p className="text-neutral-500 text-xs tracking-[0.2em] uppercase font-mono max-w-md mx-auto leading-relaxed font-medium">
            CHANNABASWESHWAR SYSTEM MANAGEMENT UNIVERSITY
          </p>
          <p className="text-neutral-600 text-[10px] tracking-wider font-mono max-w-sm mx-auto">
            Academic Resource Depository — Notes, Assignments &amp; Digital Excellence
          </p>
        </div>

        {/* Action */}
        {!showPrompt ? (
          <div className="flex flex-col items-center gap-5">
            <button
              onClick={handleOpenApp}
              className="group relative px-10 py-3.5 bg-white text-black text-xs md:text-sm font-bold tracking-[0.15em] rounded-full hover:bg-neutral-200 active:scale-95 transition-all duration-150 uppercase shadow-[0_0_24px_rgba(255,255,255,0.15)] hover:shadow-glow-white cursor-pointer overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                OPEN THE APP
              </span>
            </button>

            <div className="pt-6 flex items-center gap-3">
              <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-neutral-700 to-transparent" />
              <span className="text-[8px] font-mono text-neutral-700 uppercase tracking-[0.3em]">or</span>
              <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-neutral-700 to-transparent" />
            </div>

            <button
              onClick={handleOpenApp}
              className="text-[10px] text-neutral-500 hover:text-white uppercase tracking-widest font-mono flex items-center gap-1.5 transition-all duration-200 cursor-pointer group"
            >
              <LogIn className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              <span>SIGN IN WITH GOOGLE AUTH</span>
            </button>
          </div>
        ) : null}

        {/* Feature badges */}
        <div className="flex justify-center items-center gap-6 text-[9px] font-mono uppercase tracking-[0.2em] text-neutral-600 select-none pt-4">
          <div className="text-center font-bold px-4">
            <span className="block text-white/80 mb-0.5 font-sans font-semibold text-[10px]">50MB</span>
            <span>LIMIT</span>
          </div>
          <div className="w-[1px] h-6 bg-gradient-to-b from-transparent via-neutral-800 to-transparent" />
          
          <div className="text-center font-bold px-4">
            <span className="block text-white/80 mb-[#1px] font-sans font-semibold text-[10px]">SECURE</span>
            <span>STORAGE</span>
          </div>
          <div className="w-[1px] h-6 bg-gradient-to-b from-transparent via-neutral-800 to-transparent" />
          
          <div className="text-center font-bold px-4">
            <span className="block text-white/80 mb-0.5 font-sans font-semibold text-[10px]">LIVE</span>
            <span>SYNC</span>
          </div>
        </div>

        {error && (
          <div className="text-red-400 text-xs font-mono flex items-center justify-center gap-1.5 mt-4">
            <ShieldAlert className="w-3.5 h-3.5" />
            {error}
          </div>
        )}
      </div>

      <div className="mt-auto text-[9px] font-mono text-neutral-700 tracking-widest uppercase pt-8">
        <span className="tracking-[0.3em]">✦</span> STUDENT RESOURCES DEPOSITORY • CSMU ACADEMIC PORTAL <span className="tracking-[0.3em]">✦</span>
      </div>
    </div>
  );
};

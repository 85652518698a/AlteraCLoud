import React, { useState } from 'react';
import { authStore } from '../../store/authStore';
import { ShieldAlert, LogIn } from 'lucide-react';

export const LoginCard: React.FC = () => {
  const [showPrompt] = useState(true);
  const [error, setError] = useState('');

  const handleOpenApp = async () => {
    try {
      await authStore.login();
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please try again.');
    }
  };

  return (
    <div className="relative min-h-[92vh] flex flex-col items-center justify-center p-4 selection:bg-[#FF3B30] selection:text-white">
      <div className="w-full max-w-xl text-center z-10 my-auto">
        
        {/* Brand header */}
        <div className="space-y-6 select-none border-4 border-black p-12 bg-white shadow-[8px_8px_0px_0px_#000000]">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border-2 border-black text-[9px] font-mono tracking-[0.2em] text-black font-bold mb-4">
            <span className="relative flex h-1.5 w-1.5">
              <span className="relative inline-flex h-1.5 w-1.5 bg-[#FF3B30]"></span>
            </span>
            <span>SECURE VAULT GATES ACTIVE</span>
          </div>

          <div className="text-5xl md:text-7xl font-display font-black tracking-[0.08em] text-black leading-none">
            A<span className="text-[#FF3B30]">L</span>TERA
            <span className="font-light text-neutral-500 font-sans tracking-[0.15em] ml-3 text-4xl md:text-5xl leading-none">CS</span>
          </div>

          <p className="text-neutral-700 text-xs tracking-[0.2em] uppercase font-mono max-w-md mx-auto leading-relaxed font-bold">
            CHANNABASWESHWAR SYSTEM MANAGEMENT UNIVERSITY
          </p>
          <p className="text-neutral-600 text-[10px] tracking-wider font-mono max-w-sm mx-auto font-medium">
            Academic Resource Depository — Notes, Assignments &amp; Digital Excellence
          </p>

          {/* Action */}
          <div className="flex flex-col items-center gap-5 pt-4">
            <button
              onClick={handleOpenApp}
              className="px-10 py-3.5 bg-black text-white text-xs md:text-sm font-bold tracking-[0.15em] uppercase border-4 border-black hover:bg-[#FF3B30] hover:border-[#FF3B30] active:translate-y-0.5 transition-all duration-150 cursor-pointer"
            >
              <span className="flex items-center gap-2">
                OPEN THE APP
              </span>
            </button>

            <div className="w-full flex items-center gap-3">
              <div className="flex-1 h-0 border-t-2 border-black" />
              <span className="text-[9px] font-mono text-neutral-600 uppercase tracking-[0.2em] font-bold">or</span>
              <div className="flex-1 h-0 border-t-2 border-black" />
            </div>

            <button
              onClick={handleOpenApp}
              className="text-[10px] text-neutral-700 hover:text-[#FF3B30] uppercase tracking-widest font-mono flex items-center gap-1.5 transition-all duration-150 cursor-pointer font-bold"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>SIGN IN WITH GOOGLE AUTH</span>
            </button>
          </div>

          {/* Feature badges */}
          <div className="flex justify-center items-center gap-6 text-[9px] font-mono uppercase tracking-[0.2em] text-neutral-600 select-none pt-6 border-t-2 border-black mt-8">
            <div className="text-center font-bold px-4">
              <span className="block text-black mb-0.5 font-sans font-semibold text-[10px]">50MB</span>
              <span>LIMIT</span>
            </div>
            <div className="w-[1px] h-6 bg-black" />
            
            <div className="text-center font-bold px-4">
              <span className="block text-black mb-0.5 font-sans font-semibold text-[10px]">SECURE</span>
              <span>STORAGE</span>
            </div>
            <div className="w-[1px] h-6 bg-black" />
            
            <div className="text-center font-bold px-4">
              <span className="block text-black mb-0.5 font-sans font-semibold text-[10px]">LIVE</span>
              <span>SYNC</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="text-[#FF3B30] text-xs font-mono flex items-center justify-center gap-1.5 mt-4 font-bold border-2 border-[#FF3B30] p-3 bg-white">
            <ShieldAlert className="w-3.5 h-3.5" />
            {error}
          </div>
        )}
      </div>

      <div className="mt-auto text-[9px] font-mono text-neutral-600 tracking-widest uppercase pt-8 font-bold">
        <span className="tracking-[0.3em]">✦</span> STUDENT RESOURCES DEPOSITORY • CSMU ACADEMIC PORTAL <span className="tracking-[0.3em]">✦</span>
      </div>
    </div>
  );
};

import React from 'react';
import { uiStore } from '../../store/uiStore';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-white border-t-4 border-black py-8 px-6 mt-16 select-none">
      <div className="max-w-[1240px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-neutral-600 font-bold">
        <div>
          © {new Date().getFullYear()} ALTERA CLOUD. CHANNABASWESHWAR SYSTEM MANAGEMENT.
        </div>
        <div className="flex items-center gap-6">
          <button
            onClick={() => uiStore.setCurrentPage('download')}
            className="hover:text-blue-600 transition-colors duration-150 cursor-pointer uppercase tracking-wider"
          >
            DOWNLOAD APP
          </button>
          <span className="hidden sm:inline-block text-black font-black">/</span>
          <button
            onClick={() => uiStore.setCurrentPage('privacy')}
            className="hover:text-blue-600 transition-colors duration-150 cursor-pointer uppercase tracking-wider"
          >
            PRIVACY
          </button>
          <span className="hidden sm:inline-block text-black font-black">/</span>
          <button
            onClick={() => uiStore.setCurrentPage('terms')}
            className="hover:text-blue-600 transition-colors duration-150 cursor-pointer uppercase tracking-wider"
          >
            TERMS
          </button>
        </div>
      </div>
    </footer>
  );
};

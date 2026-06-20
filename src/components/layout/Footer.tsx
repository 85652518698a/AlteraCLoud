import React from 'react';
import { uiStore } from '../../store/uiStore';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-black border-t border-neutral-950 py-8 px-6 mt-16 select-none">
      <div className="max-w-[1240px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-neutral-600">
        <div>
          © {new Date().getFullYear()} ALTERA CLOUD. CHANNABASWESHWAR SYSTEM MANAGEMENT.
        </div>
        <div className="flex items-center gap-6">
          <button
            onClick={() => uiStore.setCurrentPage('download')}
            className="hover:text-neutral-300 transition-colors cursor-pointer uppercase tracking-wider"
          >
            DOWNLOAD APP
          </button>
          <span className="hidden sm:inline-block text-neutral-800">/</span>
          <button
            onClick={() => uiStore.setCurrentPage('privacy')}
            className="hover:text-neutral-300 transition-colors cursor-pointer uppercase tracking-wider"
          >
            PRIVACY
          </button>
          <span className="hidden sm:inline-block text-neutral-800">/</span>
          <button
            onClick={() => uiStore.setCurrentPage('terms')}
            className="hover:text-neutral-300 transition-colors cursor-pointer uppercase tracking-wider"
          >
            TERMS
          </button>
        </div>
      </div>
    </footer>
  );
};

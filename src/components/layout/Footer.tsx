import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-black border-t border-neutral-950 py-8 px-6 mt-16 select-none">
      <div className="max-w-[1240px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-neutral-600">
        <div>
          © {new Date().getFullYear()} ALTERA CLOUD. CHANNABASWESHWAR SYSTEM MANAGEMENT.
        </div>
        <div className="flex items-center gap-6">
          <span>SECURED LOCKER GATEWAY</span>
          <span className="hidden sm:inline-block">/</span>
          <span>INTEGRITY VERIFIED</span>
        </div>
      </div>
    </footer>
  );
};

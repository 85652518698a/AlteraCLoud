import React from 'react';

interface BadgeProps {
  status: 'deployed' | 'draft' | 'normal';
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ status, children, className = '' }) => {
  const styles = {
    deployed: 'bg-white text-black font-mono font-bold tracking-wider uppercase text-[10px] px-2.5 py-0.5 rounded-sm shadow-[0_0_8px_rgba(255,255,255,0.2)]',
    draft: 'bg-transparent text-neutral-500 font-mono font-medium tracking-wider uppercase text-[10px] border border-neutral-800 px-2.5 py-0.5 rounded-sm',
    normal: 'bg-neutral-900 text-neutral-300 font-mono text-[10px] uppercase border border-neutral-800 px-2 py-0.5 rounded-sm pointer-events-none'
  };

  return (
    <span className={`${styles[status]} inline-flex items-center justify-center ${className}`}>
      {children}
    </span>
  );
};

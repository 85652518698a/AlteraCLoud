import React from 'react';

interface BadgeProps {
  status: 'deployed' | 'draft' | 'normal';
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ status, children, className = '' }) => {
  const styles = {
    deployed: 'bg-green-600 text-white font-mono font-bold tracking-wider uppercase text-[10px] px-2.5 py-0.5 border-2 border-green-600',
    draft: 'bg-amber-400 text-black font-mono font-bold tracking-wider uppercase text-[10px] px-2.5 py-0.5 border-2 border-amber-400',
    normal: 'bg-white text-black font-mono text-[10px] uppercase border-2 border-black px-2 py-0.5 font-bold'
  };

  return (
    <span className={`${styles[status]} inline-flex items-center justify-center ${className}`}>
      {children}
    </span>
  );
};

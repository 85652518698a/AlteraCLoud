import React from 'react';

interface ProgressBarProps {
  progress: number; // 0 to 100
  className?: string;
  showText?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress, className = '', showText = true }) => {
  const clamped = Math.min(100, Math.max(0, progress));

  return (
    <div className={`w-full ${className}`}>
      {showText && (
        <div className="flex justify-between items-center mb-1 text-xs font-mono text-neutral-400">
          <span>UPLOADING TO VAULT</span>
          <span>{clamped.toFixed(0)}%</span>
        </div>
      )}
      <div className="w-full bg-neutral-900 border border-neutral-800 rounded-full h-2 overflow-hidden">
        <div 
          className="bg-white h-full transition-all duration-300 ease-out shadow-[0_0_8px_rgba(255,255,255,0.4)]"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
};

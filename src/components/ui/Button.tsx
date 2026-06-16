import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyle = 'inline-flex items-center justify-center font-bold uppercase tracking-wider rounded-sm cursor-pointer transition-all duration-150 focus:outline-none';
  
  const variants = {
    primary: 'bg-white text-black hover:bg-neutral-200 border border-white shadow-[0_0_12px_rgba(255,255,255,0.1)] active:scale-[0.98]',
    secondary: 'bg-neutral-900 text-white hover:bg-neutral-800 border border-neutral-800',
    outline: 'bg-transparent text-white hover:bg-white/5 border border-neutral-800 hover:border-neutral-700',
    ghost: 'bg-transparent text-neutral-400 hover:text-white hover:bg-white/5',
    danger: 'bg-transparent text-red-500 border border-red-500 hover:bg-red-500/10 active:bg-red-500/20'
  };

  const sizes = {
    sm: 'px-4 py-1.5 text-xs',
    md: 'px-6 py-2.5 text-sm',
    lg: 'px-8 py-3.5 text-base'
  };

  const isDisabled = disabled || isLoading;

  return (
    <button
      disabled={isDisabled}
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${disabled ? 'opacity-40 cursor-not-allowed active:scale-100' : ''} ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center justify-center gap-1.5">
          <svg className="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Loading...
        </span>
      ) : (
        children
      )}
    </button>
  );
};

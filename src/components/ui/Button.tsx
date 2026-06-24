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
  const baseStyle = 'inline-flex items-center justify-center font-bold uppercase tracking-wider cursor-pointer transition-all duration-150 focus:outline-none border-2';

  const variants = {
    primary: 'bg-black text-white border-black hover:bg-[#FF3B30] hover:border-[#FF3B30] active:translate-y-0.5',
    secondary: 'bg-white text-black border-black hover:bg-black hover:text-white',
    outline: 'bg-white text-black border-black hover:bg-[#FF3B30] hover:text-white hover:border-[#FF3B30]',
    ghost: 'bg-transparent text-black border-transparent hover:text-[#FF3B30] hover:border-[#FF3B30]',
    danger: 'bg-white text-[#FF3B30] border-[#FF3B30] hover:bg-[#FF3B30] hover:text-white'
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
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${disabled ? 'opacity-40 cursor-not-allowed' : ''} ${className}`}
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

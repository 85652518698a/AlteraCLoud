import React from 'react';

interface PageWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export const PageWrapper: React.FC<PageWrapperProps> = ({ children, className = '' }) => {
  return (
    <div className={`w-full max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 min-h-[calc(100vh-160px)] ${className}`}>
      {children}
    </div>
  );
};

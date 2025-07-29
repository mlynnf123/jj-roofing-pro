
import React from 'react';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string; // Tailwind color class e.g., 'text-indigo-600'
}

const Loader: React.FC<LoaderProps> = ({ size = 'md', color = 'text-white' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-4',
    lg: 'w-12 h-12 border-[6px]',
  };

  return (
    <div className={`animate-spin rounded-full ${sizeClasses[size]} ${color} border-t-transparent border-solid`} role="status">
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default Loader;

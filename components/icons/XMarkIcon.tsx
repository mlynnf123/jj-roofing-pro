import React from 'react';
import { IconProps } from './types';

interface XMarkIconProps {
  className?: string;
}

export const XMarkIcon: React.FC<XMarkIconProps> = ({ className = "w-6 h-6" }) => {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
};
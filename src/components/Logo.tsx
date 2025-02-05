import React from 'react';
import { Flower2 } from 'lucide-react';

interface LogoProps {
  variant?: 'default' | 'light';
  size?: 'sm' | 'md' | 'lg';
}

export default function Logo({ variant = 'default', size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  const colorClasses = {
    default: 'text-primary',
    light: 'text-white',
  };

  return (
    <div className={`flex items-center space-x-2 ${colorClasses[variant]}`}>
      <Flower2 className={`${size === 'sm' ? 'w-5 h-5' : size === 'md' ? 'w-6 h-6' : 'w-8 h-8'}`} />
      <span className={`font-serif ${sizeClasses[size]} tracking-wide`}>
        diky
      </span>
    </div>
  );
}
import React from 'react';
import DikyLogo from "../../Images/Dikylogo.jpg"; // Adjust the import path as needed

interface LogoProps {
  variant?: 'default' | 'light';
  size?: 'sm' | 'md' | 'lg';
}

export default function Logo({ variant = 'default', size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  const textSizeClasses = {
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
      <img src={DikyLogo} alt="Diky Logo" className={`${sizeClasses[size]} object-contain`} />
      <span className={`font-serif ${textSizeClasses[size]} tracking-wide`}>
        diky
      </span>
    </div>
  );
}
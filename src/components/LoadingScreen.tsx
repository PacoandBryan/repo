import React from 'react';
import Logo from './Logo';

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-secondary-light flex items-center justify-center z-50">
      <div className="text-center">
        <Logo size="lg" />
        <div className="flex space-x-2 justify-center mt-6">
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className="w-3 h-3 bg-secondary-dark rounded-full animate-bounce"
              style={{
                animationDelay: `${index * 0.2}s`,
                animationDuration: '1s'
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
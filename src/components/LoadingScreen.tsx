import React from 'react';

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-[#FDF8F6] flex items-center justify-center z-50">
      <div className="text-center">
        <h1 className="text-5xl md:text-6xl font-serif text-primary mb-6">
          diky
        </h1>
        <div className="flex space-x-2 justify-center">
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className="w-3 h-3 bg-[#fcc4d4] rounded-full animate-bounce"
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
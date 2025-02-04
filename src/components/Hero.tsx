import React from 'react';

export default function Hero() {
  return (
    <div className="relative pt-16">
      <div className="bg-gradient-to-b from-[#fcdce4] to-[#fcc4d4] min-h-[90vh] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-8xl font-serif tracking-tight text-primary">
            Diky
          </h1>
          <p className="mt-6 max-w-xl mx-auto text-xl text-primary">
            Discover our collection of hand-embroidered bags and accessories,
            where each piece tells a unique story of Mexican craftsmanship.
          </p>
          <div className="mt-10">
            <a
              href="#"
              className="inline-block bg-accent px-8 py-3 text-base font-medium text-white hover:opacity-90"
            >
              Explore Collection
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
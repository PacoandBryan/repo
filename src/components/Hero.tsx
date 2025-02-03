import React from 'react';

export default function Hero() {
  return (
    <div className="relative pt-16">
      <div className="bg-[#F3E5E0] min-h-[90vh] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-8xl font-serif tracking-tight text-neutral-900">
            Diki
          </h1>
          <p className="mt-6 max-w-xl mx-auto text-xl text-neutral-600">
            Discover our collection of hand-embroidered bags and accessories,
            where each piece tells a unique story of Mexican craftsmanship.
          </p>
          <div className="mt-10">
            <a
              href="#"
              className="inline-block bg-neutral-900 px-8 py-3 text-base font-medium text-white hover:bg-neutral-800"
            >
              Explore Collection
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
import React from 'react';

export default function Story() {
  return (
    <div className="bg-[#FDF8F6] py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <img
              src="https://images.unsplash.com/photo-1604859347436-2e6925be8176?auto=format&fit=crop&q=80"
              alt="Artisan working"
              className="w-full h-[600px] object-cover"
            />
          </div>
          <div>
            <h2 className="text-3xl font-serif tracking-tight text-neutral-900 sm:text-4xl">
              Our Story
            </h2>
            <p className="mt-4 text-lg text-neutral-600">
              At Diki, we believe in preserving and celebrating the art of Mexican embroidery.
              Each piece is created by talented artisans who have perfected
              their craft through generations, blending traditional techniques
              with contemporary designs.
            </p>
            <p className="mt-4 text-lg text-neutral-600">
              Our commitment is to support artisanal communities while
              bringing these unique works of art to modern homes that appreciate
              authenticity and craftsmanship.
            </p>
            <div className="mt-8">
              <a
                href="#"
                className="text-neutral-900 font-medium hover:text-neutral-700"
              >
                Meet our artisans →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
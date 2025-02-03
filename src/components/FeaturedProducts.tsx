import React from 'react';

const products = [
  {
    id: 1,
    name: 'Pink Floral Bag',
    price: '$2,800 MXN',
    image: 'https://images.unsplash.com/photo-1528812969535-4bcefc3926bb?auto=format&fit=crop&q=80'
  },
  {
    id: 2,
    name: 'Embroidered Clutch',
    price: '$1,950 MXN',
    image: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&q=80'
  },
  {
    id: 3,
    name: 'Messenger Bag',
    price: '$3,200 MXN',
    image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&q=80'
  }
];

export default function FeaturedProducts() {
  return (
    <div className="bg-white py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-serif tracking-tight text-neutral-900 sm:text-4xl">
            Featured Pieces
          </h2>
          <p className="mt-4 text-lg text-neutral-600">
            Each piece is unique, hand-embroidered by our artisans.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
          {products.map((product) => (
            <div key={product.id} className="group relative">
              <div className="aspect-w-4 aspect-h-5 bg-neutral-100 overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-[400px] object-cover object-center group-hover:opacity-75 transition-opacity"
                />
              </div>
              <div className="mt-4 flex justify-between">
                <div>
                  <h3 className="text-sm text-neutral-700">{product.name}</h3>
                  <p className="mt-1 text-sm text-neutral-500">{product.price}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
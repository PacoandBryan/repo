import React from 'react';
import { useTranslation } from 'react-i18next';

const products = [
  {
    id: 1,
    name: 'Pink Floral Bag',
    price: '$2,800 MXN',
    image: 'https://images.unsplash.com/photo-1528812969535-4bcefc3926bb?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 2,
    name: 'Embroidered Clutch',
    price: '$1,950 MXN',
    image: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 3,
    name: 'Messenger Bag',
    price: '$3,200 MXN',
    image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&q=80&w=800'
  }
];

export default function FeaturedProducts() {
  const { t } = useTranslation();

  return (
    <div className="bg-secondary/30 py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif tracking-tight text-primary">
            {t('featured.title')}
          </h2>
          <p className="mt-4 text-base lg:text-lg text-primary/80 max-w-2xl mx-auto">
            {t('featured.subtitle')}
          </p>
        </div>

        <div className="mt-12 sm:mt-16 grid grid-cols-1 gap-y-8 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
          {products.map((product) => (
            <div key={product.id} className="group relative">
              <div className="aspect-w-4 aspect-h-5 bg-white overflow-hidden rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
                <img
                  src={product.image}
                  alt={product.name}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-[250px] sm:h-[300px] lg:h-[400px] object-cover object-center group-hover:opacity-75 transition-opacity duration-300"
                />
              </div>
              <div className="mt-4 flex justify-between items-center">
                <div>
                  <h3 className="text-sm sm:text-base text-primary font-medium">{product.name}</h3>
                  <p className="mt-1 text-sm text-primary/80">{product.price}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
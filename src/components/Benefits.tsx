import React from 'react';
import { Leaf, Heart, Home } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Benefits() {
  const { t } = useTranslation();

  const benefits = [
    {
      icon: <Leaf className="w-8 h-8" />,
      key: 'eco'
    },
    {
      icon: <Heart className="w-8 h-8" />,
      key: 'handcrafted'
    },
    {
      icon: <Home className="w-8 h-8" />,
      key: 'support'
    }
  ];

  return (
    <div className="bg-white py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-serif tracking-tight text-primary sm:text-4xl">
            {t('benefits.title')}
          </h2>
          <p className="mt-4 text-lg text-primary/80 max-w-2xl mx-auto">
            {t('benefits.subtitle')}
          </p>
        </div>

        <div className="mt-20 grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((benefit) => (
            <div key={benefit.key} className="text-center">
              <div className="flex justify-center">
                <div className="text-accent p-4 bg-primary-light rounded-full">
                  {benefit.icon}
                </div>
              </div>
              <h3 className="mt-6 text-xl font-serif text-primary">
                {t(`benefits.items.${benefit.key}.title`)}
              </h3>
              <p className="mt-4 text-primary/80">
                {t(`benefits.items.${benefit.key}.description`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
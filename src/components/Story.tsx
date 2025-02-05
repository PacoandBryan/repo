import React from 'react';
import { useTranslation } from 'react-i18next';

export default function Story() {
  const { t } = useTranslation();

  return (
    <div className="bg-white py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          <div className="order-2 lg:order-1">
            <img
              src="https://images.unsplash.com/photo-1604859347436-2e6925be8176?auto=format&fit=crop&q=80&w=1000"
              alt="Artisan working"
              loading="lazy"
              decoding="async"
              className="w-full h-[300px] sm:h-[400px] lg:h-[600px] object-cover rounded-lg shadow-md"
            />
          </div>
          <div className="order-1 lg:order-2">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif tracking-tight text-primary">
              {t('story.title')}
            </h2>
            <p className="mt-4 text-base lg:text-lg text-primary/80">
              {t('story.content')}
            </p>
            <p className="mt-4 text-base lg:text-lg text-primary/80">
              {t('story.commitment')}
            </p>
            <div className="mt-6 sm:mt-8">
              <a
                href="#"
                className="text-accent font-medium hover:opacity-80 transition-opacity duration-300 inline-flex items-center space-x-2"
              >
                <span>{t('story.cta')}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
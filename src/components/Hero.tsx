import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import DikyLogo from '../../images/Dikylogo.jpg';

export default function Hero() {
  const { t } = useTranslation();

  return (
    <div className="relative pt-16">
      <div className="bg-gradient-to-b from-[#fcdce4] to-[#fcc4d4] min-h-[90vh] flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          <div className="mb-10">
            <img src={DikyLogo} alt="Diky Logo" className="w-48 h-48 mx-auto object-contain" />
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-8xl font-serif tracking-tight text-primary">
            {t('hero.title')}
          </h1>
          <p className="mt-6 mx-auto text-lg md:text-xl text-primary max-w-xl px-4">
            {t('hero.subtitle')}
          </p>
          <div className="mt-8 md:mt-10">
            <Link
              to="/catalog"
              className="inline-block bg-accent px-6 sm:px-8 py-3 text-base font-medium text-white hover:opacity-90 rounded-md transition-opacity duration-300"
            >
              {t('hero.cta')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
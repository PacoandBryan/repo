import React, { useState, useEffect, useRef } from 'react';
import { Heart, ShoppingBag, Menu, Search, X, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const { t, i18n } = useTranslation();
  const langDropdownRef = useRef<HTMLDivElement>(null);

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Español' }
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target as Node)) {
        setIsLangDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
    setIsLangDropdownOpen(false);
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md fixed w-full z-50 border-b border-primary/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0 flex items-center">
            <h1 className="text-xl sm:text-2xl font-serif text-primary">Diky</h1>
          </div>
          
          <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
            <a href="#" className="text-sm lg:text-base text-primary/80 hover:text-primary transition-colors duration-300">{t('nav.courses')}</a>
            <a href="#" className="text-sm lg:text-base text-primary/80 hover:text-primary transition-colors duration-300">{t('nav.sweetTable')}</a>
            <a href="#" className="text-sm lg:text-base text-primary/80 hover:text-primary transition-colors duration-300">{t('nav.purses')}</a>
            <a href="#" className="text-sm lg:text-base text-primary/80 hover:text-primary transition-colors duration-300">{t('nav.catalog')}</a>
          </div>

          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className={`transition-all duration-500 ease-in-out ${isSearchOpen ? 'w-40 sm:w-72' : 'w-0'} overflow-hidden`}>
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder={t('nav.search')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-4 pr-12 py-2 text-sm rounded-full bg-[#fcdce4]/30 border-2 border-[#fcc4d4]/30 placeholder-primary/50 text-primary focus:outline-none focus:border-[#fcc4d4]/50 focus:bg-[#fcdce4]/40 transition-all duration-300"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Search size={16} className="text-primary/60" />
                </div>
              </div>
            </div>

            {/* Language Selector */}
            <div className="relative" ref={langDropdownRef}>
              <button
                className="flex items-center space-x-1 text-primary/80 hover:text-primary transition-colors duration-300"
                onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
              >
                <Globe size={18} className="sm:size-20" />
                <span className="hidden sm:inline text-sm font-medium">{i18n.language.toUpperCase()}</span>
              </button>

              {/* Dropdown Menu */}
              {isLangDropdownOpen && (
                <div className="absolute right-0 mt-2 w-36 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                  <div className="py-1" role="menu" aria-orientation="vertical">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => handleLanguageChange(lang.code)}
                        className={`${
                          i18n.language === lang.code ? 'bg-[#fcdce4]/30 text-primary' : 'text-primary/80'
                        } group flex w-full items-center px-4 py-2 text-sm hover:bg-[#fcdce4]/20 transition-colors duration-300`}
                        role="menuitem"
                      >
                        {lang.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button 
              className={`text-primary/80 hover:text-primary transition-all duration-300 ${isSearchOpen ? 'rotate-90' : 'rotate-0'}`}
              onClick={() => {
                setIsSearchOpen(!isSearchOpen);
                if (!isSearchOpen) {
                  setTimeout(() => document.querySelector('input')?.focus(), 100);
                }
              }}
            >
              {isSearchOpen ? <X size={18} className="sm:size-20" /> : <Search size={18} className="sm:size-20" />}
            </button>
            <button className="text-primary/80 hover:text-primary">
              <Heart size={18} className="sm:size-20" />
            </button>
            <button className="text-primary/80 hover:text-primary">
              <ShoppingBag size={18} className="sm:size-20" />
            </button>
            <button 
              className="md:hidden text-primary/80 hover:text-primary"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu size={18} className="sm:size-20" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-primary/10">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {/* Mobile search bar */}
            <div className="px-3 py-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder={t('nav.search')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-4 pr-12 py-2 text-sm rounded-full bg-[#fcdce4]/30 border-2 border-[#fcc4d4]/30 placeholder-primary/50 text-primary focus:outline-none focus:border-[#fcc4d4]/50 focus:bg-[#fcdce4]/40 transition-all duration-300"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Search size={16} className="text-primary/60" />
                </div>
              </div>
            </div>
            {/* Language selector for mobile */}
            <div className="px-3 py-2">
              <div className="flex flex-col space-y-2">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    className={`${
                      i18n.language === lang.code ? 'bg-[#fcdce4]/30 text-primary' : 'text-primary/80'
                    } flex items-center px-3 py-2 text-sm rounded-md hover:bg-[#fcdce4]/20 transition-colors duration-300`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>
            <a href="#" className="block px-3 py-2 text-primary/80 hover:text-primary text-sm">{t('nav.courses')}</a>
            <a href="#" className="block px-3 py-2 text-primary/80 hover:text-primary text-sm">{t('nav.sweetTable')}</a>
            <a href="#" className="block px-3 py-2 text-primary/80 hover:text-primary text-sm">{t('nav.purses')}</a>
            <a href="#" className="block px-3 py-2 text-primary/80 hover:text-primary text-sm">{t('nav.catalog')}</a>
          </div>
        </div>
      )}
    </nav>
  );
}
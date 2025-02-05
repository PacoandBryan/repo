import React, { useState, useEffect, useRef } from 'react';
import { Heart, ShoppingBag, Menu, Search, X, Globe, ChevronDown, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Logo from './Logo';

type NavItem = {
  label: string;
  href: string;
  children?: {
    label: string;
    href: string;
    description?: string;
  }[];
};

interface NavBarProps {
  onNavigate: (page: 'home' | 'catalog') => void;
}

export default function NavBar({ onNavigate }: NavBarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [expandedMobileItems, setExpandedMobileItems] = useState<string[]>([]);
  const { t, i18n } = useTranslation();
  const langDropdownRef = useRef<HTMLDivElement>(null);
  const dropdownTimeoutRef = useRef<NodeJS.Timeout>();
  const sidebarRef = useRef<HTMLDivElement>(null);

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Español' }
  ];

  const navItems: NavItem[] = [
    {
      label: t('nav.courses'),
      href: '/courses',
      children: [
        {
          label: t('nav.beginnerCourses'),
          href: '/courses/beginner',
          description: t('nav.beginnerCoursesDesc')
        },
        {
          label: t('nav.advancedCourses'),
          href: '/courses/advanced',
          description: t('nav.advancedCoursesDesc')
        }
      ]
    },
    {
      label: t('nav.sweetTable'),
      href: '/sweet-table',
      children: [
        {
          label: t('nav.tablecloths'),
          href: '/sweet-table/tablecloths'
        },
        {
          label: t('nav.napkins'),
          href: '/sweet-table/napkins'
        }
      ]
    },
    {
      label: t('nav.purses'),
      href: '/purses',
      children: [
        {
          label: t('nav.crossbody'),
          href: '/purses/crossbody'
        },
        {
          label: t('nav.clutches'),
          href: '/purses/clutches'
        },
        {
          label: t('nav.totes'),
          href: '/purses/totes'
        }
      ]
    },
    {
      label: t('nav.catalog'),
      href: '/catalog'
    }
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target as Node)) {
        setIsLangDropdownOpen(false);
      }
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node) && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isMenuOpen]);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
    setIsLangDropdownOpen(false);
  };

  const handleDropdownEnter = (label: string) => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
    setActiveDropdown(label);
  };

  const handleDropdownLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 150);
  };

  const toggleMobileItem = (label: string) => {
    setExpandedMobileItems(prev => 
      prev.includes(label) 
        ? prev.filter(item => item !== label)
        : [...prev, label]
    );
  };

  const handleNavigation = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    if (href === '/') {
      onNavigate('home');
    } else if (href === '/catalog') {
      onNavigate('catalog');
    }
    setIsMenuOpen(false);
  };

  return (
    <>
      <nav className="bg-white/80 backdrop-blur-md fixed w-full z-50 border-b border-primary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0">
              <a
                href="/"
                onClick={(e) => handleNavigation(e, '/')}
                className="hover:opacity-90 transition-opacity duration-300"
              >
                <Logo />
              </a>
            </div>
            
            <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
              {navItems.map((item) => (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => handleDropdownEnter(item.label)}
                  onMouseLeave={handleDropdownLeave}
                >
                  <a
                    href={item.href}
                    onClick={(e) => handleNavigation(e, item.href)}
                    className="flex items-center px-3 py-2 text-sm lg:text-base text-primary/80 hover:text-primary transition-colors duration-300"
                  >
                    {item.label}
                    {item.children && (
                      <ChevronDown className="ml-1 w-4 h-4" />
                    )}
                  </a>
                  
                  {item.children && activeDropdown === item.label && (
                    <div className="absolute left-0 mt-2 w-64 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <div className="py-1" role="menu" aria-orientation="vertical">
                        {item.children.map((child) => (
                          <a
                            key={child.label}
                            href={child.href}
                            className="group flex flex-col px-4 py-2 text-sm text-primary/80 hover:bg-[#fcdce4]/20 hover:text-primary transition-colors duration-300"
                            role="menuitem"
                          >
                            <span className="font-medium">{child.label}</span>
                            {child.description && (
                              <span className="mt-1 text-xs text-primary/60 group-hover:text-primary/80">
                                {child.description}
                              </span>
                            )}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className={`transition-all duration-500 ease-in-out ${isSearchOpen ? 'w-40 sm:w-72' : 'w-0'} overflow-hidden`}>
                <div className="relative w-full">
                  <input
                    type="text"
                    placeholder={t('nav.search')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input pr-10"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Search size={16} className="text-primary/60" />
                  </div>
                </div>
              </div>

              <div className="relative" ref={langDropdownRef}>
                <button
                  className="flex items-center space-x-1 text-primary/80 hover:text-primary transition-colors duration-300"
                  onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                >
                  <Globe className="w-[18px] h-[18px] sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline text-sm font-medium">{i18n.language.toUpperCase()}</span>
                </button>

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
                {isSearchOpen ? (
                  <X className="w-[18px] h-[18px] sm:w-5 sm:h-5" />
                ) : (
                  <Search className="w-[18px] h-[18px] sm:w-5 sm:h-5" />
                )}
              </button>
              <button className="text-primary/80 hover:text-primary">
                <Heart className="w-[18px] h-[18px] sm:w-5 sm:h-5" />
              </button>
              <button className="text-primary/80 hover:text-primary">
                <ShoppingBag className="w-[18px] h-[18px] sm:w-5 sm:h-5" />
              </button>
              <button 
                className="text-primary/80 hover:text-primary"
                onClick={() => setIsMenuOpen(true)}
                aria-label="Open menu"
              >
                <Menu className="w-[18px] h-[18px] sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity z-50 ${
          isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMenuOpen(false)}
      />

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="p-4 border-b border-primary/10 flex justify-between items-center">
            <h2 className="text-xl font-serif text-primary">Menu</h2>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="text-primary/80 hover:text-primary transition-colors duration-200"
              aria-label="Close menu"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {/* Search bar */}
            <div className="p-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder={t('nav.search')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input pr-10"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Search size={16} className="text-primary/60" />
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="px-2 py-2 space-y-1">
              {navItems.map((item) => (
                <div key={item.label} className="border-b border-primary/5 last:border-b-0">
                  <div className="flex items-center justify-between">
                    <a
                      href={item.href}
                      onClick={(e) => handleNavigation(e, item.href)}
                      className="flex-1 px-4 py-3 text-primary/80 hover:text-primary text-sm font-medium transition-colors duration-200"
                    >
                      {item.label}
                    </a>
                    {item.children && (
                      <button
                        onClick={() => toggleMobileItem(item.label)}
                        className="px-4 py-3 text-primary/60 hover:text-primary transition-colors duration-200"
                      >
                        <ChevronRight
                          className={`w-5 h-5 transform transition-transform duration-200 ${
                            expandedMobileItems.includes(item.label) ? 'rotate-90' : ''
                          }`}
                        />
                      </button>
                    )}
                  </div>
                  {item.children && expandedMobileItems.includes(item.label) && (
                    <div className="pl-4 pb-2 space-y-1 bg-[#fcdce4]/5">
                      {item.children.map((child) => (
                        <a
                          key={child.label}
                          href={child.href}
                          className="block px-4 py-2 text-primary/60 hover:text-primary text-sm transition-colors duration-200"
                        >
                          {child.label}
                          {child.description && (
                            <p className="mt-1 text-xs text-primary/40">
                              {child.description}
                            </p>
                          )}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Language selector */}
            <div className="px-4 py-4 border-t border-primary/10">
              <p className="text-sm font-medium text-primary/80 mb-2">Language</p>
              <div className="space-y-2">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    className={`${
                      i18n.language === lang.code ? 'bg-[#fcdce4]/30 text-primary' : 'text-primary/80'
                    } flex items-center w-full px-4 py-2 text-sm rounded-md hover:bg-[#fcdce4]/20 transition-colors duration-200`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
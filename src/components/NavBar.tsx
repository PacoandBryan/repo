import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, Search, X, Globe, ChevronDown, ChevronRight, Home, Mail } from 'lucide-react';
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

export default function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [expandedMobileItems, setExpandedMobileItems] = useState<string[]>([]);
  const [isHoveringButton, setIsHoveringButton] = useState(false);
  const [isHoveringContent, setIsHoveringContent] = useState(false);
  const { t, i18n } = useTranslation();
  const langDropdownRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout>();
  const navRef = useRef<HTMLDivElement>(null);
  const dropdownTimeoutRef = useRef<NodeJS.Timeout>();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Español' }
  ];

  const navItems: NavItem[] = [
    {
      label: t('nav.courses'),
      href: '/courses',
    },
    {
      label: t('nav.products'),
      href: '#',
      children: [
        {
          label: t('nav.sweets'),
          href: '/sweets',
          description: t('nav.sweetsDesc')
        },
        {
          label: t('nav.sweetTable'),
          href: '/sweet-table',
          description: t('nav.sweetTableDesc')
        },
        {
          label: t('nav.stitchedTeddies'),
          href: '/stitched-teddies',
          description: t('nav.stitchedTeddiesDesc')
        },
        {
          label: t('nav.purses'),
          href: '/purses',
          description: t('nav.pursesDesc')
        },
        {
          label: t('nav.chocolateDelice'), // New Nav Item
          href: '/chocolate-delice',
          description: t('nav.chocolateDeliceDesc')
        }
      ]
    },
    {
      label: t('nav.catalog'),
      href: '/catalog'
    },
    {
      label: t('nav.contact'),
      href: '#',
      children: [
        {
          label: t('nav.contactUs'),
          href: '/contact',
          description: t('nav.contactUsDesc')
        },
        {
          label: t('nav.contactGaby'),
          href: '/contact-gaby',
          description: t('nav.contactGabyDesc')
        }
      ]
    }
  ];

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setIsHoveringButton(false);
        setIsHoveringContent(false);
        if (activeDropdown) {
          setActiveDropdown(null);
        }
      }
    };

    document.addEventListener('mousemove', handleGlobalMouseMove);
    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, [activeDropdown]);

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

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
    setIsLangDropdownOpen(false);
  };

  const handleDropdownEnter = (label: string) => {
    if (window.innerWidth >= 768) {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
      setIsHoveringButton(true);
      setActiveDropdown(label);
    }
  };

  const handleDropdownLeave = () => {
    if (window.innerWidth >= 768) {
      setIsHoveringButton(false);
      closeTimeoutRef.current = setTimeout(() => {
        if (!isHoveringContent && !isHoveringButton) {
          setActiveDropdown(null);
        }
      }, 100);
    }
  };

  const handleContentEnter = () => {
    if (window.innerWidth >= 768) {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
      setIsHoveringContent(true);
    }
  };

  const handleContentLeave = () => {
    if (window.innerWidth >= 768) {
      setIsHoveringContent(false);
      closeTimeoutRef.current = setTimeout(() => {
        if (!isHoveringContent && !isHoveringButton) {
          setActiveDropdown(null);
        }
      }, 100);
    }
  };

  const handleDropdownClick = (label: string) => {
    if (window.innerWidth >= 768) {
      if (activeDropdown === label) {
        setActiveDropdown(null);
        setIsHoveringButton(false);
        setIsHoveringContent(false);
      } else {
        setActiveDropdown(label);
      }
    }
  };

  const toggleMobileDropdown = (label: string) => {
    setExpandedMobileItems(prev => 
      prev.includes(label) 
        ? prev.filter(item => item !== label)
        : [...prev, label]
    );
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalog?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch(e);
    }
  };

  return (
    <>
      <nav className="bg-white/80 backdrop-blur-md fixed w-full z-50 border-b border-primary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center" ref={navRef}>
            <div className="flex-shrink-0">
              <Link
                to="/"
                className="hover:opacity-90 transition-opacity duration-300"
              >
                <Logo />
              </Link>
            </div>
            
            <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
              <Link
                to="/"
                className="flex items-center px-3 py-2 text-sm lg:text-base text-primary/80 hover:text-primary transition-colors duration-300"
              >
                <Home className="w-4 h-4 mr-1" />
                Home
              </Link>
              {navItems.map((item) => (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => handleDropdownEnter(item.label)}
                  onMouseLeave={handleDropdownLeave}
                >
                  {item.children ? (
                    <button
                      className="flex items-center space-x-1 px-2 py-1 text-gray-700 hover:text-gray-900"
                      onClick={() => handleDropdownClick(item.label)}
                    >
                      <span>{item.label}</span>
                      <ChevronDown className="h-4 w-4" />
                    </button>
                  ) : (
                    <Link
                      to={item.href}
                      className="px-2 py-1 text-gray-700 hover:text-gray-900"
                    >
                      {item.label}
                    </Link>
                  )}

                  {item.children && activeDropdown === item.label && (
                    <div 
                      className="absolute left-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5"
                      onMouseEnter={handleContentEnter}
                      onMouseLeave={handleContentLeave}
                    >
                      <div 
                        className="py-1" 
                        role="menu"
                        onMouseEnter={handleContentEnter}
                        onMouseLeave={handleContentLeave}
                      >
                        {item.children.map((child) => (
                          <Link
                            key={child.label}
                            to={child.href}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            role="menuitem"
                            onMouseEnter={handleContentEnter}
                            onMouseLeave={handleContentLeave}
                          >
                            <div>
                              <p className="font-medium">{child.label}</p>
                              {child.description && (
                                <p className="mt-1 text-gray-500">{child.description}</p>
                              )}
                            </div>
                          </Link>
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
                  <form onSubmit={handleSearch}>
                    <input
                      type="text"
                      placeholder={t('nav.search')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="input pr-10"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <Search size={16} className="text-primary/60" />
                    </div>
                  </form>
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

              {/* The Heart and ShoppingBag icon buttons have been removed */}

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
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <input
                    type="text"
                    placeholder={t('nav.search')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="input pr-10"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Search size={16} className="text-primary/60" />
                  </div>
                </div>
              </form>
            </div>

            {/* Navigation */}
            <div className="py-6 px-4 space-y-4">
              {navItems.map((item) => (
                <div key={item.label}>
                  {item.children ? (
                    <div>
                      <button
                        className="flex items-center justify-between w-full text-gray-700 hover:text-gray-900"
                        onClick={() => toggleMobileDropdown(item.label)}
                      >
                        <span>{item.label}</span>
                        <ChevronRight
                          className={`h-4 w-4 transform transition-transform ${
                            expandedMobileItems.includes(item.label) ? 'rotate-90' : ''
                          }`}
                        />
                      </button>
                      {expandedMobileItems.includes(item.label) && (
                        <div className="mt-2 ml-4 space-y-2">
                          {item.children.map((child) => (
                            <Link
                              key={child.label}
                              to={child.href}
                              className="block py-2 text-sm text-gray-600 hover:text-gray-900"
                              onClick={() => setIsMenuOpen(false)}
                            >
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      to={item.href}
                      className="block text-gray-700 hover:text-gray-900"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
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
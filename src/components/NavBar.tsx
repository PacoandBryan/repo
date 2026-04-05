import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Search, X, ChevronDown, ChevronRight, Home } from 'lucide-react';
import Logo from './Logo';
import Tooltip from './Tooltip';

type NavItem = {
  label: string;
  href: string;
  description?: string;
  children?: {
    label: string;
    href: string;
    description?: string;
  }[];
};

// ── Updated: SearchInput component props type ──────────────────────────────
type SearchInputProps = {
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  onSearch: (e: React.FormEvent) => void;
  isSearchOpen: boolean;
};

// ── Updated: SearchInput component with suggestions ──────────────────────
function SearchInput({ searchQuery, setSearchQuery, onSearch, isSearchOpen }: SearchInputProps) {

  const suggestions = [
    'Bolso Floral Elegante',
    'Bolso de Cuero Clásico',
    'Cartera de Noche',
    'Bolso Bandolera',
    'Bolso de Diseñador',
    'Bolso Vintage',
    'Bolso de Playa',
    'Mochila Pequeña',
    'Bandolera',
    'Bolso Tipo Hobo',
    'Bolso Tipo Cubo',
    'Pastel de Cumpleaños',
    'Pastel de Bodas',
    'Cupcakes',
    'Pastel de Cupcakes',
    'Trufas de Chocolate'
  ];

  return (
    <form onSubmit={onSearch} className="relative">
      <div className="relative">
        <input
          type="text"
          placeholder="Buscar productos..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          disabled={!isSearchOpen}
          className={`w-full px-4 py-3 rounded-2xl bg-white/95 
                     shadow-[0_4px_16px_rgba(255,211,182,0.25)]
                     border border-[#FFE2E2] placeholder-[#D3CCE3]
                     focus:outline-none focus:ring-2 focus:ring-[#FFD3B6]/30 
                     focus:border-[#FFD3B6]/40
                     transition-all duration-300
                     ${!isSearchOpen && 'opacity-0'}`}
        />
        <button
          type="submit"
          disabled={!isSearchOpen}
          className={`absolute right-2.5 top-1/2 transform -translate-y-1/2
                     bg-[#FFADAD] hover:bg-[#FFD3B6] p-2.5 rounded-xl text-white
                     transition-all duration-300 shadow-[0_2px_8px_rgba(255,211,182,0.4)]
                     hover:shadow-[0_2px_12px_rgba(255,211,182,0.5)]
                     ${!isSearchOpen && 'cursor-not-allowed opacity-0'}`}
        >
          <Search size={16} className="opacity-90" />
        </button>
      </div>
      {/* Updated suggestions dropdown */}
      {isSearchOpen && searchQuery && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl 
                      shadow-[0_8px_24px_rgba(255,211,182,0.25)] 
                      border border-[#FFE2E2]/50 
                      backdrop-blur-sm 
                      overflow-hidden
                      transform transition-all duration-300 ease-out">
          {suggestions.filter(suggestion => {
            const regex = new RegExp(searchQuery.split(' ').join('.*'), 'i');
            return regex.test(suggestion);
          }).map((suggestion, index) => (
            <div
              key={index}
              className="flex items-center justify-between px-4 py-3
                         text-[#D3CCE3] hover:text-[#9F92B6]
                         hover:bg-[#FFEBE5]/30
                         transition-colors duration-200 cursor-pointer
                         border-b border-[#FFE2E2]/20 last:border-b-0"
              onClick={() => {
                setSearchQuery(suggestion);
              }}
            >
              <span className="font-medium">{suggestion}</span>
              <Search size={14} className="text-[#FFADAD] opacity-70" />
            </div>
          ))}
        </div>
      )}
    </form>
  );
}

export default function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedMobileItems, setExpandedMobileItems] = useState<string[]>([]);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isHoveringDropdown, setIsHoveringDropdown] = useState(false);
  const closeTimeoutRef = useRef<NodeJS.Timeout>();
  const navRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const searchButtonRef = useRef<HTMLButtonElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const navItems: NavItem[] = [
    {
      label: 'Cursos',
      href: '/courses',
    },
    {
      label: 'Repostería',
      href: '#',
      children: [
        {
          label: 'Mesa Dulce',
          href: '/sweet-table',
          description: 'Explora nuestras hermosas decoraciones para mesa dulce'
        },
        {
          label: 'Postres / Pasteles',
          href: '/sweets',
          description: 'Explora nuestra deliciosa colección de postres artesanales'
        },
        {
          label: 'Delicias de Chocolate',
          href: '/chocolate-delice',
          description: 'Disfruta de nuestros chocolates artesanales'
        }
      ]
    },
    {
      label: 'Artesanías',
      href: '#',
      children: [
        {
          label: 'Bolsos',
          href: '/purses',
          description: 'Elegante colección de bolsos'
        },
        {
          label: 'Peluches Cosidos',
          href: '/stitched-teddies',
          description: 'Ositos de peluche cosidos a mano'
        },
        {
          label: 'Tricotín',
          href: '/tricotin',
          description: 'Nombres y figuras personalizadas'
        },
        {
          label: 'Tejido',
          href: '/tejido',
          description: 'Bufandas, gorros y bolsas tejidas a mano'
        },
        {
          label: 'Cobijas',
          href: '/cobijas',
          description: 'Cobijas personalizadas y de patchwork'
        }
      ]
    },
    {
      label: 'Catálogo',
      href: '/catalog'
    },
    {
      label: 'Contacto',
      href: '/contact',
      description: 'Contáctanos'
    }
  ];

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        // No need to handle hover states here anymore
      }
    };

    document.addEventListener('mousemove', handleGlobalMouseMove);
    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
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

  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
        if (!isSearchOpen) {
          setTimeout(() => document.querySelector('input')?.focus(), 100);
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'm') {
        e.preventDefault();
        setIsMenuOpen(prev => !prev);
      }
    };

    document.addEventListener('keydown', handleKeyboard);
    return () => document.removeEventListener('keydown', handleKeyboard);
  }, [isSearchOpen]);

  const handleDropdownEnter = (label: string) => {
    if (window.innerWidth >= 768) {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
      setActiveDropdown(label);
      setIsHoveringDropdown(true);
    }
  };

  const handleDropdownLeave = () => {
    if (window.innerWidth >= 768) {
      closeTimeoutRef.current = setTimeout(() => {
        if (!isHoveringDropdown) {
          setActiveDropdown(null);
        }
      }, 200);
    }
  };

  const handleContentEnter = () => {
    if (window.innerWidth >= 768) {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
      setIsHoveringDropdown(true);
    }
  };

  const handleContentLeave = () => {
    if (window.innerWidth >= 768) {
      setIsHoveringDropdown(false);
      closeTimeoutRef.current = setTimeout(() => {
        setActiveDropdown(null);
      }, 200);
    }
  };

  const toggleMobileDropdown = (label: string) => {
    setExpandedMobileItems(prev =>
      prev.includes(label)
        ? prev.filter(item => item !== label)
        : [...prev, label]
    );
  };

  // Close dropdown when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (window.innerWidth < 768 && expandedMobileItems.length > 0) {
        const target = event.target as HTMLElement;
        if (!target.closest('.nav-item')) {
          setExpandedMobileItems([]);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [expandedMobileItems]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // navigate(`/catalog?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(true);
      setSearchQuery('');
    }
  };

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (isMenuOpen) {
      const focusableElements = sidebarRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      if (focusableElements?.length) {
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        firstElement.focus();

        const handleTabKey = (e: KeyboardEvent) => {
          if (e.key === 'Tab') {
            if (e.shiftKey && document.activeElement === firstElement) {
              e.preventDefault();
              lastElement.focus();
            } else if (!e.shiftKey && document.activeElement === lastElement) {
              e.preventDefault();
              firstElement.focus();
            }
          }
        };

        document.addEventListener('keydown', handleTabKey);
        return () => document.removeEventListener('keydown', handleTabKey);
      }
    }
  }, [isMenuOpen]);

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
                  className="relative nav-item"
                  onMouseEnter={() => handleDropdownEnter(item.label)}
                  onMouseLeave={handleDropdownLeave}
                >
                  {item.children ? (
                    <button
                      className="flex items-center space-x-1 px-2 py-1 text-gray-700 hover:text-gray-900"
                      onClick={() => {
                        if (window.innerWidth < 768) {
                          toggleMobileDropdown(item.label);
                        }
                      }}
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

                  {item.children && (
                    <div
                      className={`absolute left-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5
                                 transform transition-all duration-200 ease-out
                                 ${activeDropdown === item.label ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}
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
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100
                                       transform transition-all duration-200
                                       hover:translate-x-1"
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
              {/* ── Updated desktop search bar using the SearchInput component ── */}
              <div className={`transition-all duration-500 ease-in-out ${isSearchOpen ? 'w-40 sm:w-72' : 'w-0'} overflow-visible`}>
                <SearchInput
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  onSearch={handleSearch}
                  isSearchOpen={isSearchOpen}
                />
              </div>

              <Tooltip content="Search" position="bottom">
                <button
                  ref={searchButtonRef}
                  className="text-primary/80 hover:text-primary"
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
              </Tooltip>

              <Tooltip content={`Abrir menú (${navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'}+M)`} position="bottom">
                <button
                  ref={menuButtonRef}
                  className="text-primary/80 hover:text-primary"
                  onClick={() => setIsMenuOpen(true)}
                  aria-label="Abrir menú"
                >
                  <Menu className="w-[18px] h-[18px] sm:w-5 sm:h-5" />
                </button>
              </Tooltip>
            </div>
          </div>
        </div>
      </nav>

      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity z-50 ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        onClick={() => setIsMenuOpen(false)}
      />

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'
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
            {/* ── Updated mobile search bar using the SearchInput component ── */}
            <div className="p-4">
              <SearchInput
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onSearch={handleSearch}
                isSearchOpen={true}
              />
            </div>

            {/* Navigation */}
            <div className="py-6 px-4 space-y-4">
              {navItems.map((item) => (
                <div key={item.label} className="nav-item">
                  {item.children ? (
                    <div>
                      <button
                        className="flex items-center justify-between w-full text-gray-700 hover:text-gray-900"
                        onClick={() => toggleMobileDropdown(item.label)}
                      >
                        <span>{item.label}</span>
                        <ChevronRight
                          className={`h-4 w-4 transform transition-transform ${expandedMobileItems.includes(item.label) ? 'rotate-90' : ''
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

          </div>
        </div>
      </div>
    </>
  );
}
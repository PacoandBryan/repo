import React, { useState } from 'react';
import { Heart, ShoppingBag, Menu, Search, X } from 'lucide-react';

export default function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <nav className="bg-white/80 backdrop-blur-md fixed w-full z-50 border-b border-primary/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0 flex items-center">
            <h1 className="text-2xl font-serif text-primary">Diky</h1>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-primary/80 hover:text-primary">Courses</a>
            <a href="#" className="text-primary/80 hover:text-primary">Sweet Table</a>
            <a href="#" className="text-primary/80 hover:text-primary">Purses</a>
            <a href="#" className="text-primary/80 hover:text-primary">Catalog</a>
          </div>

          <div className="flex items-center space-x-4">
            <div className={`transition-all duration-500 ease-in-out ${isSearchOpen ? 'w-72' : 'w-0'} overflow-hidden`}>
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-4 pr-12 py-2 text-sm rounded-full bg-[#fcdce4]/30 border-2 border-[#fcc4d4]/30 placeholder-primary/50 text-primary focus:outline-none focus:border-[#fcc4d4]/50 focus:bg-[#fcdce4]/40 transition-all duration-300"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Search size={18} className="text-primary/60" />
                </div>
              </div>
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
              {isSearchOpen ? <X size={20} /> : <Search size={20} />}
            </button>
            <button className="text-primary/80 hover:text-primary">
              <Heart size={20} />
            </button>
            <button className="text-primary/80 hover:text-primary">
              <ShoppingBag size={20} />
            </button>
            <button className="md:hidden text-primary/80 hover:text-primary" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <Menu size={20} />
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
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-4 pr-12 py-2 text-sm rounded-full bg-[#fcdce4]/30 border-2 border-[#fcc4d4]/30 placeholder-primary/50 text-primary focus:outline-none focus:border-[#fcc4d4]/50 focus:bg-[#fcdce4]/40 transition-all duration-300"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Search size={18} className="text-primary/60" />
                </div>
              </div>
            </div>
            <a href="#" className="block px-3 py-2 text-primary/80 hover:text-primary">Courses</a>
            <a href="#" className="block px-3 py-2 text-primary/80 hover:text-primary">Sweet Table</a>
            <a href="#" className="block px-3 py-2 text-primary/80 hover:text-primary">Purses</a>
            <a href="#" className="block px-3 py-2 text-primary/80 hover:text-primary">Catalog</a>
          </div>
        </div>
      )}
    </nav>
  );
}
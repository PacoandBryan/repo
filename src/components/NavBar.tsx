import React, { useState } from 'react';
import { Heart, ShoppingBag, Menu, Search } from 'lucide-react';

export default function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-white/80 backdrop-blur-md fixed w-full z-50 border-b border-neutral-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0 flex items-center">
            <h1 className="text-2xl font-serif text-neutral-800">Diki</h1>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-neutral-600 hover:text-neutral-900">Collection</a>
            <a href="#" className="text-neutral-600 hover:text-neutral-900">Artisans</a>
            <a href="#" className="text-neutral-600 hover:text-neutral-900">Blog</a>
            <a href="#" className="text-neutral-600 hover:text-neutral-900">Contact</a>
          </div>

          <div className="flex items-center space-x-4">
            <button className="text-neutral-600 hover:text-neutral-900">
              <Search size={20} />
            </button>
            <button className="text-neutral-600 hover:text-neutral-900">
              <Heart size={20} />
            </button>
            <button className="text-neutral-600 hover:text-neutral-900">
              <ShoppingBag size={20} />
            </button>
            <button className="md:hidden text-neutral-600 hover:text-neutral-900" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <Menu size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-neutral-100">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <a href="#" className="block px-3 py-2 text-neutral-600 hover:text-neutral-900">Collection</a>
            <a href="#" className="block px-3 py-2 text-neutral-600 hover:text-neutral-900">Artisans</a>
            <a href="#" className="block px-3 py-2 text-neutral-600 hover:text-neutral-900">Blog</a>
            <a href="#" className="block px-3 py-2 text-neutral-600 hover:text-neutral-900">Contact</a>
          </div>
        </div>
      )}
    </nav>
  );
}
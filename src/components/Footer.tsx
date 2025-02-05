import React from 'react';
import { Instagram, Facebook, Mail } from 'lucide-react';
import Logo from './Logo';

export default function Footer() {
  return (
    <footer className="bg-primary text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1">
            <Logo variant="light" />
            <p className="mt-4 text-white/80 text-sm">
              Contemporary artistry celebrating the tradition of Mexican embroidery.
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold tracking-wider uppercase text-white">
              Navigation
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <a href="#" className="text-white/80 hover:text-white">
                  Collection
                </a>
              </li>
              <li>
                <a href="#" className="text-white/80 hover:text-white">
                  Artisans
                </a>
              </li>
              <li>
                <a href="#" className="text-white/80 hover:text-white">
                  Blog
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold tracking-wider uppercase text-white">
              Legal
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <a href="#" className="text-white/80 hover:text-white">
                  Privacy
                </a>
              </li>
              <li>
                <a href="#" className="text-white/80 hover:text-white">
                  Terms
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold tracking-wider uppercase text-white">
              Contact
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <a href="#" className="text-white/80 hover:text-white flex items-center space-x-2">
                  <Mail size={16} />
                  <span>contact@diky.mx</span>
                </a>
              </li>
              <li>
                <div className="flex space-x-4">
                  <a href="#" className="text-white/80 hover:text-white">
                    <Instagram size={20} />
                  </a>
                  <a href="#" className="text-white/80 hover:text-white">
                    <Facebook size={20} />
                  </a>
                </div>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-white/20">
          <p className="text-white/80 text-sm text-center">
            © 2024 Diky. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
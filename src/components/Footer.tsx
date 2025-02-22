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
        </div>
        
        <div className="mt-8 pt-8 border-t border-white/20">
          <p className="text-white/80 text-sm text-center">
            © 2025 Diky. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
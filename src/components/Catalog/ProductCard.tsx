import React, { useState, useEffect } from 'react';
import { Eye, Heart } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Product } from './types';

interface ProductCardProps {
  product: Product;
  onQuickView: () => void;
}

export default function ProductCard({ product, onQuickView }: ProductCardProps) {
  const { t } = useTranslation();
  const [isHovered, setIsHovered] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = [product.image, ...(product.additionalImages || [])];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isHovered && images.length > 1) {
      interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
      }, 1000);
    } else {
      setCurrentImageIndex(0);
    }
    return () => clearInterval(interval);
  }, [isHovered, images.length]);

  const handleQuickView = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onQuickView();
  };

  return (
    <div
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
      onTouchEnd={() => setIsHovered(false)}
    >
      <div className="card overflow-hidden">
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-secondary/10">
          <img
            src={images[currentImageIndex]}
            alt={product.name}
            className={`w-full h-full object-cover transition-all duration-700 ${
              isHovered ? 'scale-110' : 'scale-100'
            } ${isImageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setIsImageLoaded(true)}
            loading="lazy"
            decoding="async"
          />
          
          {/* Quick View Button Overlay */}
          <div 
            className={`absolute inset-0 bg-black/40 transition-all duration-300 
              ${isHovered ? 'opacity-100 visible' : 'opacity-0 invisible sm:group-hover:opacity-100 sm:group-hover:visible'}
              flex items-center justify-center`}
          >
            <button
              onClick={handleQuickView}
              className="relative z-10 btn bg-white/90 hover:bg-white text-primary p-2 rounded-full transform transition-all duration-300 hover:scale-110 active:scale-95 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-accent focus:ring-opacity-50 hover:animate-pulse"
              aria-label={t('catalog.quickView')}
            >
              <Eye className="w-5 h-5" />
            </button>
          </div>

          {/* Loading State */}
          {!isImageLoaded && (
            <div className="absolute inset-0 bg-secondary/10 animate-pulse" />
          )}
        </div>

        {/* Content */}
        <div className="p-3 sm:p-4">
          <h3 className="font-serif text-base sm:text-lg text-primary line-clamp-2 group-hover:text-accent transition-colors duration-300">
            {product.name}
          </h3>
          <p className="text-xs sm:text-sm text-primary/60 mt-1 line-clamp-1">
            {t('catalog.by')} {product.artisan}
          </p>
        </div>
      </div>
    </div>
  );
}
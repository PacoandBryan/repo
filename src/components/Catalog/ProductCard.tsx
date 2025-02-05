import React, { useState } from 'react';
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(price);
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
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-secondary/10">
          <img
            src={product.image}
            alt={product.name}
            className={`w-full h-full object-cover transition-all duration-700 ${
              isHovered ? 'scale-110' : 'scale-100'
            } ${isImageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setIsImageLoaded(true)}
            loading="lazy"
            decoding="async"
          />
          
          {/* Overlay */}
          <div className={`absolute inset-0 bg-black/40 flex items-center justify-center gap-4 transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0 sm:group-hover:opacity-100'
          }`}>
            <button
              onClick={(e) => {
                e.preventDefault();
                onQuickView();
              }}
              className="btn bg-white/90 hover:bg-white text-primary p-2 rounded-full touch-manipulation"
              aria-label={t('catalog.quickView')}
            >
              <Eye className="w-5 h-5" />
            </button>
            <button
              className="btn bg-white/90 hover:bg-white text-primary p-2 rounded-full touch-manipulation"
              aria-label={t('catalog.addToWishlist')}
            >
              <Heart className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-3 sm:p-4">
          <h3 className="font-serif text-base sm:text-lg text-primary line-clamp-2">
            {product.name}
          </h3>
          <p className="text-xs sm:text-sm text-primary/60 mt-1 line-clamp-1">
            {t('catalog.by')} {product.artisan} {t('catalog.from')} {product.region}
          </p>
          <p className="mt-2 font-medium text-primary text-sm sm:text-base">
            {formatPrice(product.price)}
          </p>
          <div className="mt-2">
            <span className="inline-block px-2 py-1 text-xs rounded-full bg-secondary/20 text-primary">
              {product.technique}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
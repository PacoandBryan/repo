import React from 'react';
import { X, Heart, ShoppingBag } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Product } from './types';

interface QuickViewModalProps {
  product: Product;
  onClose: () => void;
}

export default function QuickViewModal({ product, onClose }: QuickViewModalProps) {
  const { t } = useTranslation();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(price);
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
        onClick={onClose}
      />
      
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-2 sm:p-4">
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl animate-fade-in">
            <button
              onClick={onClose}
              className="absolute right-2 sm:right-4 top-2 sm:top-4 text-primary/60 hover:text-primary p-2 touch-manipulation"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Image */}
              <div className="aspect-square">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </div>

              {/* Content */}
              <div className="p-4 sm:p-6 md:p-8">
                <h2 className="text-xl sm:text-2xl font-serif text-primary">
                  {product.name}
                </h2>
                
                <p className="mt-2 text-lg sm:text-xl font-medium text-primary">
                  {formatPrice(product.price)}
                </p>

                <div className="mt-4 space-y-4">
                  <p className="text-sm sm:text-base text-primary/80">
                    {product.description}
                  </p>

                  <div className="border-t border-primary/10 pt-4">
                    <h3 className="font-medium text-primary">{t('catalog.artisanStory')}</h3>
                    <p className="mt-2 text-sm sm:text-base text-primary/80">
                      {t('catalog.by')} {product.artisan} {t('catalog.from')} {product.region}, this piece showcases the
                      traditional {product.technique} technique passed down through generations.
                    </p>
                  </div>

                  <div className="border-t border-primary/10 pt-4">
                    <h3 className="font-medium text-primary">{t('catalog.details')}</h3>
                    <ul className="mt-2 space-y-1 text-sm sm:text-base text-primary/80">
                      <li>• {t('catalog.filterCategories.region')}: {product.region}</li>
                      <li>• {t('catalog.filterCategories.technique')}: {product.technique}</li>
                      <li>• {t('catalog.filterCategories.productType')}: {product.category}</li>
                    </ul>
                  </div>

                  <div className="border-t border-primary/10 pt-4 space-y-3">
                    <button className="btn btn-primary w-full touch-manipulation">
                      <ShoppingBag className="w-5 h-5 mr-2" />
                      {t('catalog.addToCart')}
                    </button>
                    <button className="btn btn-outline w-full touch-manipulation">
                      <Heart className="w-5 h-5 mr-2" />
                      {t('catalog.addToWishlist')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
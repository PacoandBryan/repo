import React from 'react';
import { X, Heart, ShoppingBag } from 'lucide-react';
import { Product } from './types';

interface QuickViewModalProps {
  product: Product;
  onClose: () => void;
}

export default function QuickViewModal({ product, onClose }: QuickViewModalProps) {
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
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full animate-fade-in">
            <button
              onClick={onClose}
              className="absolute right-4 top-4 text-primary/60 hover:text-primary"
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
              <div className="p-6 md:p-8">
                <h2 className="text-2xl font-serif text-primary">
                  {product.name}
                </h2>
                
                <p className="mt-2 text-xl font-medium text-primary">
                  {formatPrice(product.price)}
                </p>

                <div className="mt-4 space-y-4">
                  <p className="text-primary/80">
                    {product.description}
                  </p>

                  <div className="border-t border-primary/10 pt-4">
                    <h3 className="font-medium text-primary">Artisan Story</h3>
                    <p className="mt-2 text-primary/80">
                      Crafted by {product.artisan} in {product.region}, this piece showcases the
                      traditional {product.technique} technique passed down through generations.
                    </p>
                  </div>

                  <div className="border-t border-primary/10 pt-4">
                    <h3 className="font-medium text-primary">Details</h3>
                    <ul className="mt-2 space-y-1 text-primary/80">
                      <li>• Region: {product.region}</li>
                      <li>• Technique: {product.technique}</li>
                      <li>• Category: {product.category}</li>
                    </ul>
                  </div>

                  <div className="border-t border-primary/10 pt-4 space-y-4">
                    <button className="btn btn-primary w-full">
                      <ShoppingBag className="w-5 h-5 mr-2" />
                      Add to Cart
                    </button>
                    <button className="btn btn-outline w-full">
                      <Heart className="w-5 h-5 mr-2" />
                      Add to Wishlist
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
import React, { useState, useRef } from 'react';
import { X, ShoppingBag, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Product } from './types';

interface QuickViewModalProps {
  product: Product;
  onClose: () => void;
}

export default function QuickViewModal({ product, onClose }: QuickViewModalProps) {
  const { t } = useTranslation();
  const [isZoomed, setIsZoomed] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLImageElement>(null);
  
  // Handle both image formats (array and image/additionalImages)
  const images = Array.isArray(product.images) 
    ? product.images 
    : [product.image, ...(product.additionalImages || [])];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
    setIsZoomed(false);
  };

  const previousImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    setIsZoomed(false);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed || !imageRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setZoomPosition({ x, y });
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isZoomed || !imageRef.current) return;
    
    const touch = e.touches[0];
    const rect = imageRef.current.getBoundingClientRect();
    const x = ((touch.clientX - rect.left) / rect.width) * 100;
    const y = ((touch.clientY - rect.top) / rect.height) * 100;

    setZoomPosition({ x, y });
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
        onClick={onClose}
      />
      
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-2 sm:p-4">
          <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-5xl animate-fade-in">
            <button
              onClick={onClose}
              className="absolute right-2 sm:right-4 top-2 sm:top-4 text-primary/60 hover:text-primary p-2 touch-manipulation z-10"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Image Section */}
              <div 
                className="relative aspect-square group overflow-hidden"
                onMouseMove={handleMouseMove}
                onTouchMove={handleTouchMove}
                onMouseLeave={() => setIsZoomed(false)}
              >
                <div className={`relative w-full h-full ${isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'}`}>
                  <img
                    ref={imageRef}
                    src={images[currentImageIndex]}
                    alt={product.name}
                    className={`w-full h-full object-cover transition-all duration-300 ${
                      isZoomed ? 'scale-[2.5]' : 'scale-100'
                    }`}
                    style={isZoomed ? {
                      transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`
                    } : undefined}
                    loading="lazy"
                    decoding="async"
                    onClick={() => setIsZoomed(!isZoomed)}
                  />
                </div>

                {/* Image Navigation */}
                {images.length > 1 && !isZoomed && (
                  <>
                    <button
                      onClick={(e) => { e.stopPropagation(); previousImage(); }}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ChevronLeft className="w-5 h-5 text-primary" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); nextImage(); }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ChevronRight className="w-5 h-5 text-primary" />
                    </button>
                  </>
                )}

                {/* Thumbnail Navigation */}
                {images.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center space-x-2">
                    {images.map((_, index) => (
                      <button
                        key={index}
                        onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(index); }}
                        className={`w-2 h-2 rounded-full transition-all ${
                          currentImageIndex === index 
                            ? 'bg-primary scale-125' 
                            : 'bg-white/70 hover:bg-white'
                        }`}
                      />
                    ))}
                  </div>
                )}

                {/* Zoom indicator */}
                {!isZoomed && (
                  <button
                    className="absolute bottom-4 right-4 bg-white/90 p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => setIsZoomed(true)}
                  >
                    <ZoomIn className="w-5 h-5 text-primary" />
                  </button>
                )}
              </div>

              {/* Content Section */}
              <div className="p-6 md:p-8 flex flex-col h-full">
                <h2 className="text-2xl sm:text-3xl font-serif text-primary mb-4">
                  {product.name}
                </h2>


                <p className="text-base text-primary/80 leading-relaxed">
                  {product.description}
                </p>
                {product.category && (
                  <div className="mb-4">
                    <span 
                      className="
                        inline-flex items-center px-3 py-1.5 
                        rounded-full text-sm font-medium
                        bg-pink-50 text-pink-500
                        border border-pink-200
                        transition-all duration-300
                        hover:bg-pink-100 hover:scale-105
                        hover:shadow-md hover:shadow-pink-100
                        cursor-default
                      "
                    >
                      {product.category}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
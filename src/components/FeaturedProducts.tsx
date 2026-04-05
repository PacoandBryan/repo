
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Eye } from 'lucide-react';
import QuickViewModal from './Catalog/QuickViewModal';
import { Product } from './Catalog/types';
import { PublicCatalogService } from '../services/PublicCatalogService';

export default function FeaturedProducts() {
  const { t } = useTranslation();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        setLoading(true);
        const data = await PublicCatalogService.fetchProducts({ featured: true });
        // If no featured products returned, maybe fetch first 3 as fallback if we want something to show
        // but user asked to REMOVE dummy products, so if it's empty, it's empty.
        setProducts(data.products.slice(0, 3));
      } catch (error) {
        console.error("Error fetching featured products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  const handleQuickView = (product: Product) => {
    setSelectedProduct(product);
  };

  if (loading) return null; // or skeleton
  if (products.length === 0) return null; // Hide section if no featured products

  return (
    <div className="bg-secondary/30 py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-serif text-primary tracking-tight sm:text-4xl">
            {t('catalog.featured.title')}
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-primary/80">
            {t('catalog.featured.subtitle')}
          </p>
        </div>

        <div className="mt-12 sm:mt-16 grid grid-cols-1 gap-y-8 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
          {products.map((product) => (
            <div key={product.id} className="group relative">
              <div className="aspect-w-4 aspect-h-5 bg-white overflow-hidden rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-[250px] sm:h-[300px] lg:h-[400px] object-cover object-center transition-opacity duration-300"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <button
                    onClick={() => handleQuickView(product)}
                    className="bg-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    aria-label={t('catalog.quickView')}
                  >
                    <Eye className="w-5 h-5 text-primary" />
                  </button>
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-sm sm:text-base text-primary font-medium">{product.name}</h3>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className="text-xs font-semibold text-primary/50 uppercase tracking-wider">Precio:</span>
                  {product.sale_price != null && product.sale_price < product.price ? (
                    <>
                      <span className="text-sm line-through text-primary/40">${product.price.toFixed(2)}</span>
                      <span className="text-sm font-bold text-[#ff6b9a]">${product.sale_price.toFixed(2)} MXN</span>
                      <span className="inline-flex items-center bg-[#ff6b9a] text-white text-[10px] font-black uppercase px-1.5 py-0.5 rounded-full">
                        {product.promotion?.label || 'OFERTA'}
                      </span>
                    </>
                  ) : (
                    <span className="text-sm text-primary/60">${product.price.toFixed(2)} MXN</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedProduct && (
        <QuickViewModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}
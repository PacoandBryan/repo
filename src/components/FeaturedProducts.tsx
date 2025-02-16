import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Eye } from 'lucide-react';
import QuickViewModal from './Catalog/QuickViewModal';
import { Product } from './Catalog/types';;
import purse1 from '../../assets/purse1.jpg';
import purse2 from '../../assets/purse2.jpg';
import purse2V2 from '../../assets/purse2-V2.jpg';
import purse3 from '../../assets/purse3.jpg';

const products = [
  {
    id: 1,
    name: "Bolso azul grande",
    price: 1950,
    description: "Bolso de color azul oscuro de tamaño grande",
    image: purse1,
    artisan: "María de la Luz",
    region: "Estado de México",
    technique: "Floral embroidery",
    category: "Bolso",
  },
  {
    id: 2,
    name: "Bolso conejo",
    price: 2800,
    description: "Bolso de color blanco con detalles y forma de conejo.",
    image: purse2,
    additionalImages: [purse2V2],
    artisan: "María de la Luz",
    region: "Estado de México",
    technique: "Geometric weaving",
    category: "Peluche",
  },
  {
    id: 3,
    name: "Bolso blanco y rosa",
    price: 1200,
    description: "Hermoso bolso blanco y rosa con detalles tiernos e infantiles",
    image: purse3,
    artisan: "María de la Luz",
    region: "Estado de México",
    technique: "Traditional embroidery",
    category: "Bolso",
  }
];

export default function FeaturedProducts() {
  const { t } = useTranslation();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const handleQuickView = (product: Product) => {
    setSelectedProduct(product);
  };

  return (
    <div className="bg-secondary/30 py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ... existing title and subtitle ... */}

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
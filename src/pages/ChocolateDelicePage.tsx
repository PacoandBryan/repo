
import React, { useState, useEffect } from 'react';
import QuickViewModal from '../components/Catalog/QuickViewModal';
import ProductCard from '../components/Catalog/ProductCard';
import { Eye, Leaf, Heart as HeartIcon, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { JsonLd } from 'react-schemaorg';
import { Product } from '../components/Catalog/types';
import { PublicCatalogService } from '../services/PublicCatalogService';

export default function ChocolateDelicePage() {
  const { t } = useTranslation();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // Using 'Chocolate' as category name which seems common in the codebase link
        const data = await PublicCatalogService.fetchProducts({ category: 'chocolate' });
        setProducts(data.products);
      } catch (error) {
        console.error("Error fetching chocolate products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleQuickView = (product: Product) => {
    setSelectedProduct(product);
  };

  const structuredDataItems = products.map(product => ({
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.image,
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "MXN",
      availability: "https://schema.org/InStock"
    },
    brand: {
      "@type": "Brand",
      name: "ChocoDelice"
    }
  }));

  return (
    <>
      <SEO
        title="Chocolates Artesanales y Delicias"
        description="Chocolates finos y postres artesanales hechos a mano. El regalo perfecto o el antojo ideal."
        canonical="https://diky.com/chocolates"
      />
      <JsonLd
        item={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Exquisite Chocolate Delights",
          description: "Indulge in our exquisite collection of handcrafted chocolates made by skilled chocolatiers.",
          url: "https://yoursite.com/chocolates",
          itemListElement: structuredDataItems
        }}
      />
      <div className="pt-16">
        {/* Hero Section */}
        <div className="animate-slide-up" style={{ animationDelay: "0s" }}>
          <div className="relative h-[70vh] overflow-hidden">
            <img
              src="https://cdn.pixabay.com/photo/2019/12/15/17/06/chocolate-4697591_1280.jpg"
              alt="Exquisite chocolate delights"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div className="text-center text-white max-w-4xl px-4">
                <h1 className="text-4xl md:text-6xl font-serif mb-6">
                  {t('chocolates.hero.title')}
                </h1>
                <p className="text-lg md:text-xl mb-8 text-white/90">
                  {t('chocolates.hero.subtitle')}
                </p>
                <Link to="/catalog?category=Chocolate" className="inline-block">
                  <button className="btn bg-white/90 hover:bg-white text-primary transition-colors duration-300">
                    {t('chocolates.hero.cta')}
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Collection Section */}
        <div className="animate-slide-up" style={{ animationDelay: "0.4s" }}>
          <div className="py-16">
            <div className="max-w-7xl mx-auto px-4">
              <h2 className="text-3xl font-serif text-primary text-center mb-12">
                {t('chocolates.collection.title')}
              </h2>

              {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="bg-gray-200 h-64 rounded-lg mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : products.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onQuickView={() => handleQuickView(product)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-lg text-primary/80">No hay chocolates en la base de datos por el momento.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {selectedProduct && (
          <QuickViewModal
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
          />
        )}

        {/* Why Choose Us Section */}
        <div className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <div className="bg-secondary-light py-24">
            <div className="max-w-7xl mx-auto px-4">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-serif text-primary mb-6">
                  {t('chocolates.whyChoose.title')}
                </h2>
                <p className="text-lg text-primary/80 max-w-2xl mx-auto">
                  {t('chocolates.whyChoose.subtitle')}
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                <div className="text-center">
                  <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Leaf className="w-8 h-8 text-accent" />
                  </div>
                  <h3 className="text-xl font-serif text-primary mb-4">
                    {t('chocolates.whyChoose.features.sustainable.title')}
                  </h3>
                  <p className="text-primary/80">
                    {t('chocolates.whyChoose.features.sustainable.description')}
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <HeartIcon className="w-8 h-8 text-accent" />
                  </div>
                  <h3 className="text-xl font-serif text-primary mb-4">
                    {t('chocolates.whyChoose.features.handcrafted.title')}
                  </h3>
                  <p className="text-primary/80">
                    {t('chocolates.whyChoose.features.handcrafted.description')}
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Users className="w-8 h-8 text-accent" />
                  </div>
                  <h3 className="text-xl font-serif text-primary mb-4">
                    {t('chocolates.whyChoose.features.community.title')}
                  </h3>
                  <p className="text-primary/80">
                    {t('chocolates.whyChoose.features.community.description')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
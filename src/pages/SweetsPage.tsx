
import { useState, useEffect } from 'react';
import { Eye, Heart, Share2, Star, Leaf, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SEO from '../components/SEO';
import QuickViewModal from '../components/Catalog/QuickViewModal';
import ProductCard from '../components/Catalog/ProductCard';
import { Product } from '../components/Catalog/types';
import { PublicCatalogService } from '../services/PublicCatalogService';

export default function SweetsPage() {
  const { t } = useTranslation();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const [pastelesData, chocolateData] = await Promise.all([
          PublicCatalogService.fetchProducts({ category: 'pasteles' }),
          PublicCatalogService.fetchProducts({ category: 'chocolate' })
        ]);
        // Combine products from both categories
        setProducts([...pastelesData.products, ...chocolateData.products]);
      } catch (error) {
        console.error("Error fetching sweets products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleQuickView = (product: Product) => {
    setSelectedProduct(product);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="min-h-screen bg-secondary-light pt-16">
      <SEO
        title="Postres y Chocolates Artesanales"
        description="Deliciosos postres hechos a mano y chocolates finos. La mejor selección dulce para tus eventos o antojos."
      />
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="relative h-[70vh] overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1587248720327-8eb72564be1e?auto=format&fit=crop&q=80&w=2000"
            alt="Handcrafted sweets and cakes collection"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <div className="text-center text-white max-w-4xl px-4">
              <h1 className="text-4xl md:text-6xl font-serif mb-6">
                {t('sweets.hero.title')}
              </h1>
              <p className="text-lg md:text-xl mb-8 text-white/90">
                {t('sweets.hero.subtitle')}
              </p>
              <Link to="/catalog?category=Postres" className="inline-block">
                <button className="btn bg-white/90 hover:bg-white text-primary transition-colors duration-300">
                  {t('sweets.hero.cta')}
                </button>
              </Link>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Artisan Introduction Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2 className="text-3xl md:text-4xl font-serif text-primary mb-6">{t('sweets.artisan.title')}</h2>
            <p className="text-lg text-primary/80 max-w-2xl">
              {t('sweets.artisan.description')}
            </p>
          </motion.div>
          <motion.div
            className="relative h-80 rounded-lg overflow-hidden shadow-lg"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <img
              src="https://images.unsplash.com/photo-1481391319762-47dff72954d9?auto=format&fit=crop&q=80&w=800"
              alt="Artisanal truffles collection"
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent flex items-end p-6">
              <p className="text-white text-sm italic">Hecho con amor por nuestros maestros reposteros</p>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Products Grid */}
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-3xl font-serif text-primary text-center mb-12">Nuestras Creaciones</h2>

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
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickView={() => handleQuickView(product)}
              />
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-12">
            <p className="text-lg text-primary/80">No hay productos disponibles en esta categoría por el momento.</p>
          </div>
        )}
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

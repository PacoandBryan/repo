
import { useState, useEffect } from 'react';
import QuickViewModal from '../components/Catalog/QuickViewModal';
import ProductCard from '../components/Catalog/ProductCard';
import { Leaf, Heart, Users, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { JsonLd } from 'react-schemaorg';
import { Product } from '../components/Catalog/types';
import { PublicCatalogService } from '../services/PublicCatalogService';

export default function PursesPage() {
  const { t } = useTranslation();
  const [selectedPurse, setSelectedPurse] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await PublicCatalogService.fetchProducts({ category: 'bolsos' });
        setProducts(data.products);
      } catch (error) {
        console.error("Error fetching purse products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleQuickView = (product: Product) => {
    setSelectedPurse(product);
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
      name: "Paco & Bryan"
    }
  }));

  return (
    <>
      <SEO
        title="Bolsas Artesanales y Tejidas"
        description="Colección exclusiva de bolsas artesanales mexicanas, tejidas a mano con materiales sostenibles. Moda lenta y ética."
        canonical="https://diky.com/purses"
        openGraph={{
          title: 'Bolsas Artesanales | Diky',
          description: 'Bolsas hechas a mano. Sin prisas. Con materiales conscientes.',
          images: [
            {
              url: 'https://cdn.pixabay.com/photo/2015/09/16/05/57/embroidery-942255_1280.jpg',
              alt: 'Bolsas Artesanales Diky',
            },
          ],
        }}
      />
      <JsonLd
        item={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Bolsas Artesanales Reales",
          description: "Nuestra colección de bolsas hechas con manos mexicanas y materiales honestos.",
          url: "https://diky.com/purses",
          itemListElement: structuredDataItems
        }}
      />
      <div className="pt-16">
        {/* Hero Section */}
        <div className="animate-slide-up" style={{ animationDelay: "0s" }}>
          <div className="relative h-[70vh] overflow-hidden">
            <img
              src="https://cdn.pixabay.com/photo/2015/09/16/05/57/embroidery-942255_1280.jpg"
              alt="Bolsas artesanales"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div className="text-center text-white max-w-4xl px-4">
                <h1 className="text-4xl md:text-6xl font-serif mb-6">
                  Bolsas con historia propia
                </h1>
                <p className="text-lg md:text-xl mb-8 text-white/90 font-light leading-relaxed">
                  Lleva algo que signifique algo. Honestamente, lo industrial aburre. Esto es tradición que puedes usar todos los días.
                </p>
                <Link to="/catalog?category=Bolso" className="inline-block">
                  <button className="btn bg-white/90 hover:bg-white text-primary transition-colors duration-300">
                    Mira lo que hay pronto
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
              <h2 className="text-3xl font-serif text-primary text-center mb-4">
                Lo que acabamos de soltar
              </h2>
              <p className="text-center text-primary/60 mb-12 italic">Cero filtros. Solo buen trabajo manual.</p>

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
                <div className="text-center py-12 bg-secondary-light/20 rounded-3xl">
                  <p className="text-lg text-primary/80 italic">Estamos terminando unas bolsas maestras. Paciencia, en serio. Lo bueno toma tiempo.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {selectedPurse && (
          <QuickViewModal
            product={selectedPurse}
            onClose={() => setSelectedPurse(null)}
          />
        )}

        {/* Why Choose Us Section */}
        <div className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <div className="bg-secondary-light py-24">
            <div className="max-w-7xl mx-auto px-4">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-serif text-primary mb-6">
                  Bolsas reales, materiales conscientes
                </h2>
                <p className="text-lg text-primary/80 max-w-2xl mx-auto font-light">
                  Creo que la moda tiene que ser más lenta. Menos tirar, más cuidar.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                <div className="text-center p-8 bg-white rounded-[2rem] shadow-soft transition-all hover:scale-[1.02]">
                  <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Leaf className="w-8 h-8 text-accent" />
                  </div>
                  <h3 className="text-xl font-serif text-primary mb-4">
                    Puro <span className="text-accent font-semibold italic decoration-accent/30 underline underline-offset-4">Eco Friendly</span>
                  </h3>
                  <p className="text-primary/80 leading-relaxed font-light">
                    Hilos naturales. Ética real. No es marketing, es que de verdad nos importa el planeta.
                  </p>
                </div>
                <div className="text-center p-8 bg-white rounded-[2rem] shadow-soft transition-all hover:scale-[1.02]">
                  <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Heart className="w-8 h-8 text-accent" />
                  </div>
                  <h3 className="text-xl font-serif text-primary mb-4">
                    Paciencia real
                  </h3>
                  <p className="text-primary/80 leading-relaxed font-light">
                    Cada bolsa nos toma días. No hay máquinas gigantes haciendo miles por hora. Solo nosotros.
                  </p>
                </div>
                <div className="text-center p-8 bg-white rounded-[2rem] shadow-soft transition-all hover:scale-[1.02]">
                  <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Users className="w-8 h-8 text-accent" />
                  </div>
                  <h3 className="text-xl font-serif text-primary mb-4">
                    Ayuda de verdad
                  </h3>
                  <p className="text-primary/80 leading-relaxed font-light">
                    Comercio justo... suena a frase hecha, pero para nosotros es que las artesanas coman bien y vivan mejor.
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
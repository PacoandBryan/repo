
import { useState, useEffect } from 'react';
import QuickViewModal from '../components/Catalog/QuickViewModal';
import ProductCard from '../components/Catalog/ProductCard';
import { Leaf, Heart, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { Product } from '../components/Catalog/types';
import { PublicCatalogService } from '../services/PublicCatalogService';

export default function StitchedTeddiesPage() {
  const { t } = useTranslation();
  const [selectedTeddy, setSelectedTeddy] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await PublicCatalogService.fetchProducts({ category: 'peluche' });
        setProducts(data.products);
      } catch (error) {
        console.error("Error fetching teddy products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleQuickView = (product: Product) => {
    setSelectedTeddy(product);
  };

  return (
    <div className="pt-16">
      <SEO
        title="Peluches Artesanales Cosidos a Mano"
        description="Peluches hechos a mano con materiales seguros y ecológicos. Compañeros únicos para toda la vida."
        canonical="https://diky.com/stitched-teddies"
        openGraph={{
          title: 'Peluches Artesanales | Diky',
          description: 'Peluches hechos a mano con materiales seguros y ecológicos.',
          images: [
            {
              url: 'https://cdn.pixabay.com/photo/2014/11/09/21/44/teddy-bear-524251_1280.jpg',
              alt: 'Peluches Diky',
            }
          ]
        }}
      />
      {/* Hero Section */}
      <div className="animate-slide-up" style={{ animationDelay: "0s" }}>
        <div className="relative h-[70vh] overflow-hidden">
          <img
            src="https://cdn.pixabay.com/photo/2014/11/09/21/44/teddy-bear-524251_1280.jpg"
            alt="Peluches artesanales"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <div className="text-center text-white max-w-4xl px-4">
              <h1 className="text-4xl md:text-6xl font-serif mb-6">
                Compañeros de verdad
              </h1>
              <p className="text-lg md:text-xl mb-8 text-white/90">
                La verdad, no son solo juguetes. Son amigos que aguantan todo... y que hacemos a mano para que duren años.
              </p>
              <Link to="/catalog?category=Peluche" className="inline-block">
                <button className="btn bg-white/90 hover:bg-white text-primary transition-colors duration-300">
                  Llévate uno a casa
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
              Los que están listos ahora
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
                <p className="text-lg text-primary/80 italic">Estamos cosiendo nuevos amigos. No queremos correr, queremos que queden bien. Honestamente.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedTeddy && (
        <QuickViewModal
          product={selectedTeddy}
          onClose={() => setSelectedTeddy(null)}
        />
      )}

      {/* Why Choose Us Section */}
      <div className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
        <div className="bg-secondary-light py-24">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-serif text-primary mb-6">
                ¿Por qué Diky?
              </h2>
              <p className="text-lg text-primary/80 max-w-2xl mx-auto font-light">
                Es simple: nos preocupamos por lo que hacemos. Y por quién lo recibe.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="text-center p-8 rounded-3xl bg-white shadow-soft transition-transform hover:-translate-y-2">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Leaf className="w-8 h-8 text-accent" />
                </div>
                <h3 className="text-xl font-serif text-primary mb-4">
                  Todo <span className="text-accent font-semibold italic">Eco Friendly</span>
                </h3>
                <p className="text-primary/80 font-light leading-relaxed">
                  Usamos fibras naturales. Sin químicos raros. Creo que la seguridad de un niño es lo primero, ¿no?
                </p>
              </div>
              <div className="text-center p-8 rounded-3xl bg-white shadow-soft transition-transform hover:-translate-y-2">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Heart className="w-8 h-8 text-accent" />
                </div>
                <h3 className="text-xl font-serif text-primary mb-4">
                  Cero máquinas, pura mano
                </h3>
                <p className="text-primary/80 font-light leading-relaxed">
                  Nada de fábricas gigantes. Solo nosotros cosiendo con paciencia. Se siente la diferencia, en serio.
                </p>
              </div>
              <div className="text-center p-8 rounded-3xl bg-white shadow-soft transition-transform hover:-translate-y-2">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="w-8 h-8 text-accent" />
                </div>
                <h3 className="text-xl font-serif text-primary mb-4">
                  Gente real, trabajo real
                </h3>
                <p className="text-primary/80 font-light leading-relaxed">
                  Trabajamos con artesanas de aquí. Es justicia... y es amor por lo local. Nada más.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

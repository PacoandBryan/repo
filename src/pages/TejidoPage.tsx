
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wind, Heart, Star, Leaf, ArrowRight } from 'lucide-react';
import QuickViewModal from '../components/Catalog/QuickViewModal';
import ProductCard from '../components/Catalog/ProductCard';
import { Link } from 'react-router-dom';
import { Product } from '../components/Catalog/types';
import { PublicCatalogService } from '../services/PublicCatalogService';

export default function TejidoPage() {
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const data = await PublicCatalogService.fetchProducts({ category: 'tejido' });
                setProducts(data.products);
            } catch (error) {
                console.error("Error fetching tejido products:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    const handleQuickView = (product: Product) => {
        setSelectedProduct(product);
    };

    const features = [
        {
            icon: <Heart className="w-8 h-8" />,
            title: "Pensado para ti",
            description: "No tejemos por tejer. Buscamos que cada pieza te haga sentir cómodo. Es ropa con la que puedes vivir, ¿sabes?"
        },
        {
            icon: <Leaf className="w-8 h-8" />,
            title: "Materiales Eco Friendly",
            description: "La verdad, solo usamos hilos naturales. Creo que el mundo no necesita más plástico, ¿no crees?"
        },
        {
            icon: <Wind className="w-8 h-8" />,
            title: "Calor real",
            description: "Es ligero, pero abriga. De ese calorcito rico que no te sofoca. Honestamente, es pura magia artesanal."
        }
    ];

    return (
        <div className="pt-16 bg-white overflow-hidden">
            <div className="relative h-[75vh] flex items-center justify-center">
                <motion.div
                    initial={{ scale: 1.1, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 1.5 }}
                    className="absolute inset-0"
                >
                    <img
                        src="https://cdn.pixabay.com/photo/2016/06/02/03/47/knitting-1430153_640.jpg"
                        alt="Tejidos Artesanales"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-white" />
                </motion.div>

                <div className="relative text-center max-w-4xl px-4 text-white z-10">
                    <motion.span
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="inline-block px-4 py-1 rounded-full bg-accent/20 backdrop-blur-md border border-accent/20 text-accent-light text-sm font-medium mb-6 uppercase tracking-widest"
                    >
                        Paciencia, hilos y mucho cariño
                    </motion.span>
                    <motion.h1
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.7 }}
                        className="text-5xl md:text-8xl font-serif mb-8 drop-shadow-2xl"
                    >
                        Tejido
                    </motion.h1>
                    <motion.p
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.9 }}
                        className="text-lg md:text-2xl font-light tracking-wide max-w-2xl mx-auto opacity-90 leading-relaxed"
                    >
                        Sentir un tejido hecho a mano... es otra cosa. En serio. Se siente el tiempo y el cuidado en cada vuelta.
                    </motion.p>
                </div>
            </div>

            <div className="py-24 bg-white relative">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {features.map((feature, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.2, duration: 0.8 }}
                                whileHover={{ y: -10 }}
                                className={`group p-10 rounded-3xl ${idx === 1 ? 'bg-accent/5 border-accent/10 shadow-xl shadow-accent/5' : 'bg-secondary-light/30'} border border-transparent hover:border-accent/10 hover:bg-white hover:shadow-2xl hover:shadow-accent/5 transition-all duration-500 text-center`}
                            >
                                <div className={`mb-8 inline-flex p-4 rounded-2xl bg-white shadow-soft group-hover:bg-accent group-hover:text-white transition-colors duration-500 ${idx === 1 ? 'text-accent bg-accent/10' : 'text-accent'}`}>
                                    {feature.icon}
                                </div>
                                <h3 className="text-2xl font-serif text-primary mb-4">{feature.title}</h3>
                                <p className="text-primary/70 leading-relaxed font-light">
                                    {feature.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="py-24 bg-secondary-light/20">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="relative order-last lg:order-first"
                        >
                            <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl">
                                <img
                                    src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR82ZXMDQxcJyGC9KeDsdsOFN5AWT5Hik3YCw&s"
                                    alt="Proceso de Tejido"
                                    className="w-full h-full object-cover transition-transform duration-1000 hover:scale-110"
                                />
                            </div>
                            <div className="absolute -top-10 -left-10 bg-white p-8 rounded-3xl shadow-xl max-w-xs hidden md:block border border-secondary-light">
                                <Star className="w-8 h-8 mb-4 text-accent" />
                                <p className="font-serif text-xl italic text-primary leading-snug">
                                    "La verdad... nada le gana al tejido tradicional. Se siente real."
                                </p>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="space-y-8"
                        >
                            <h2 className="text-4xl md:text-5xl font-serif text-primary leading-tight">
                                Diseño que te <span className="text-accent underline decoration-accent/20 underline-offset-8">entiende de verdad</span>
                            </h2>
                            <p className="text-xl text-primary/80 leading-relaxed font-light">
                                Apostamos por lo que dura. Materiales <span className="text-accent font-semibold italic">eco-friendly</span> porque creo que es lo correcto. Menos plástico y más manos artesanas trabajando con amor.
                            </p>
                            <div className="pt-6 space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-2 h-2 rounded-full bg-accent mt-3 shrink-0" />
                                    <p className="text-lg text-primary/80">Bufandas... de esas que no te quieres quitar nunca.</p>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-2 h-2 rounded-full bg-accent mt-3 shrink-0" />
                                    <p className="text-lg text-primary/80"><span className="text-accent font-semibold italic">Gorros</span> que no pican, prometido. Calidad pura.</p>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-2 h-2 rounded-full bg-accent mt-3 shrink-0" />
                                    <p className="text-lg text-primary/80">Accesorios diferentes. Con personalidad.</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            <div className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
                        <div className="max-w-xl">
                            <h2 className="text-4xl font-serif text-primary mb-4 tracking-tight">Lo que acabamos de terminar</h2>
                            <p className="text-lg text-primary/60">Trabajo manual. Un poco de imperfección perfecta.</p>
                        </div>
                        <Link to="/catalog">
                            <button className="group flex items-center gap-3 text-primary font-medium hover:text-accent transition-colors duration-300">
                                Ver todo el tejido
                                <div className="p-2 rounded-full border border-primary/10 group-hover:border-accent/20 group-hover:bg-accent/5 transition-all">
                                    <ArrowRight className="w-5 h-5" />
                                </div>
                            </button>
                        </Link>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="animate-pulse space-y-4">
                                    <div className="bg-secondary-light h-80 rounded-3xl"></div>
                                    <div className="h-6 bg-secondary-light rounded-full w-3/4"></div>
                                    <div className="h-4 bg-secondary-light rounded-full w-1/2"></div>
                                </div>
                            ))}
                        </div>
                    ) : products.length > 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
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
                        <div className="text-center py-24 border-2 border-dashed border-secondary-light rounded-[40px] bg-secondary-light/5">
                            <Wind className="w-12 h-12 text-accent/30 mx-auto mb-6" />
                            <p className="text-2xl font-serif text-primary/60 mb-8">Nuestras tejedoras están en ello. Honestamente, no queremos correr para que todo quede impecable.</p>
                            <Link to="/catalog">
                                <button className="px-10 py-4 bg-primary text-white rounded-full hover:bg-black transition-all duration-300 shadow-xl shadow-primary/10">
                                    Mirar otras cosas
                                </button>
                            </Link>
                        </div>
                    )}
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


import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Coffee, ShieldCheck, Leaf, Layers, ArrowRight } from 'lucide-react';
import QuickViewModal from '../components/Catalog/QuickViewModal';
import ProductCard from '../components/Catalog/ProductCard';
import { Link } from 'react-router-dom';
import { Product } from '../components/Catalog/types';
import { PublicCatalogService } from '../services/PublicCatalogService';

export default function CobijasPage() {
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const data = await PublicCatalogService.fetchProducts({ category: 'cobijas' });
                setProducts(data.products);
            } catch (error) {
                console.error("Error fetching cobijas products:", error);
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
            icon: <Layers className="w-8 h-8" />,
            title: "Patchwork con paciencia",
            description: "Es como un rompecabezas de texturas. La verdad, nos toma tiempo, pero cada cobija termina siendo una pieza de arte única."
        },
        {
            icon: <Leaf className="w-8 h-8" />,
            title: "Materiales Eco Friendly",
            description: "Solo usamos lo natural. Sin vueltas. Creo que tu descanso tiene que ser tan limpio como tu consciencia."
        },
        {
            icon: <ShieldCheck className="w-8 h-8" />,
            title: "Dura una vida",
            description: "Están hechas para aguantar de todo. De esas que pasan de generación en generación. Honestamente, ya no se hacen cosas así."
        }
    ];

    return (
        <div className="pt-16 bg-white overflow-hidden">
            <div className="relative h-[80vh] flex items-center justify-center">
                <motion.div
                    initial={{ scale: 1.1, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 1.5 }}
                    className="absolute inset-0"
                >
                    <img
                        src="https://cdn.pixabay.com/photo/2020/11/09/17/07/chair-5727263_960_720.jpg"
                        alt="Cobijas Artesanales"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-white" />
                </motion.div>

                <div className="relative text-center max-w-4xl px-4 text-white z-10">
                    <motion.span
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="inline-block px-5 py-2 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-white text-sm font-medium mb-6 uppercase tracking-[0.2em]"
                    >
                        Cobijando momentos reales
                    </motion.span>
                    <motion.h1
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.7 }}
                        className="text-6xl md:text-9xl font-serif mb-8 drop-shadow-2xl"
                    >
                        Cobijas
                    </motion.h1>
                    <motion.p
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.9 }}
                        className="text-lg md:text-2xl font-light tracking-wide max-w-3xl mx-auto opacity-90 leading-relaxed"
                    >
                        La verdad, una buena cobija lo arregla todo. El frío se va, y queda esa sensación de estar a salvo.
                    </motion.p>
                </div>
            </div>

            <div className="py-32 bg-white relative">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
                        {features.map((feature, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.2, duration: 0.8 }}
                                className={`group relative text-center p-8 rounded-[40px] transition-all duration-500 ${idx === 1 ? 'bg-accent/5 ring-1 ring-accent/20' : ''}`}
                            >
                                <div className={`mb-10 inline-flex p-6 rounded-3xl group-hover:bg-primary group-hover:text-white transition-all duration-500 transform group-hover:rotate-6 ${idx === 1 ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'bg-secondary-light/50 text-primary'}`}>
                                    {feature.icon}
                                </div>
                                <h3 className="text-3xl font-serif text-primary mb-6">{feature.title}</h3>
                                <p className="text-xl text-primary/70 leading-relaxed font-light italic">
                                    {feature.description}
                                </p>
                                <div className={`absolute -bottom-4 left-1/2 -translate-x-1/2 w-0 h-1 bg-accent group-hover:w-20 transition-all duration-500 ${idx === 1 ? 'w-10' : ''}`} />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="py-32 bg-primary/5">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="relative group"
                        >
                            <div className="aspect-square rounded-[40px] overflow-hidden shadow-[0_40px_80px_-15px_rgba(0,0,0,0.15)] group-hover:shadow-[0_50px_100px_-20px_rgba(0,0,0,0.2)] transition-all duration-700">
                                <img
                                    src="https://cdn.pixabay.com/photo/2020/01/23/17/04/chair-4788242_960_720.jpg"
                                    alt="Artesanía en Cobijas"
                                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                                />
                            </div>
                            <div className="absolute -bottom-12 -right-12 bg-white p-10 rounded-[40px] shadow-2xl max-w-sm hidden xl:block border border-secondary-light/50">
                                <Coffee className="w-10 h-10 mb-6 text-accent" />
                                <h4 className="text-2xl font-serif text-primary mb-3">Tu rincón seguro</h4>
                                <p className="text-lg text-primary/70 leading-relaxed">
                                    La idea es que puedas desconectar. Un té, tu libro favorito y ese peso suave encima... es el cielo, ¿no?
                                </p>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="space-y-10"
                        >
                            <div className="inline-block p-2 px-4 rounded-lg bg-accent/10 text-accent font-semibold tracking-tighter text-sm uppercase">Cosas hechas con sentido</div>
                            <h2 className="text-5xl md:text-6xl font-serif text-primary leading-[1.1]">
                                Refugio real <br /><span className="text-accent italic">para tu descanso</span>
                            </h2>
                            <p className="text-2xl text-primary/80 leading-relaxed font-light italic">
                                Sinceramente, no me gusta lo industrial. Preferimos fibras <span className="text-accent font-semibold decoration-accent/30 underline underline-offset-4">eco-friendly</span> y suaves. De esas que te gusta tocar.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-primary/10">
                                <div>
                                    <h5 className="font-bold text-primary mb-2">Manos de verdad</h5>
                                    <p className="text-primary/60">Paciencia. Mucha paciencia en cada milímetro.</p>
                                </div>
                                <div>
                                    <h5 className="font-bold text-primary mb-2">Planeta Amigable</h5>
                                    <p className="text-primary/60">Cuidamos el futuro. Es lo mínimo que podemos hacer.</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            <div className="py-32 bg-white">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex flex-col md:flex-row items-end justify-between mb-20 gap-8">
                        <div className="max-w-2xl">
                            <h2 className="text-5xl font-serif text-primary mb-6 tracking-tight">Lo que hemos armado</h2>
                            <p className="text-xl text-primary/50 leading-relaxed">Cosas únicas. Un poco imperfectas, como la vida misma.</p>
                        </div>
                        <Link to="/catalog">
                            <button className="group flex items-center gap-4 bg-primary text-white pl-8 pr-3 py-3 rounded-full hover:bg-black transition-all duration-500 shadow-2xl shadow-primary/20">
                                <span className="font-medium">Ir al catálogo completo</span>
                                <div className="p-3 rounded-full bg-white/10 group-hover:bg-accent transition-colors">
                                    <ArrowRight className="w-5 h-5 text-white" />
                                </div>
                            </button>
                        </Link>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="animate-pulse space-y-6">
                                    <div className="bg-secondary-light h-[420px] rounded-[40px]"></div>
                                    <div className="h-8 bg-secondary-light rounded-full w-3/4"></div>
                                    <div className="h-5 bg-secondary-light rounded-full w-1/2"></div>
                                </div>
                            ))}
                        </div>
                    ) : products.length > 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10"
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
                        <div className="text-center py-32 rounded-[60px] bg-secondary-light/30 border border-secondary-light">
                            <Layers className="w-16 h-16 text-accent/20 mx-auto mb-8" />
                            <h3 className="text-3xl font-serif text-primary/70 mb-10">Honestamente, nos tomamos nuestro tiempo para que queden perfectas. Vuelve pronto.</h3>
                            <Link to="/catalog">
                                <button className="px-12 py-5 bg-primary text-white rounded-full hover:bg-black transition-all duration-300 shadow-2xl shadow-primary/30 font-medium">
                                    Mirar otras cosas artesanas
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

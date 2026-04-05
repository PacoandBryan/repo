
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Heart, Palette, ShieldCheck, ArrowRight, Leaf } from 'lucide-react';
import QuickViewModal from '../components/Catalog/QuickViewModal';
import ProductCard from '../components/Catalog/ProductCard';
import { Link } from 'react-router-dom';
import { Product } from '../components/Catalog/types';
import { PublicCatalogService } from '../services/PublicCatalogService';

export default function TricotinPage() {
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const data = await PublicCatalogService.fetchProducts({ category: 'tricotin' });
                setProducts(data.products);
            } catch (error) {
                console.error("Error fetching tricotin products:", error);
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
            icon: <Palette className="w-8 h-8" />,
            title: "Lo que tú sueñes",
            description: "No es solo elegir un color. Es armar algo que signifique algo para ti. Honestamente, nos encanta ver cómo cada idea se vuelve real."
        },
        {
            icon: <Leaf className="w-8 h-8" />,
            title: "Eco Friendly... de verdad",
            description: "Usamos hilos naturales. Sin vueltas. Creo que si vamos a crear cosas bellas, hay que cuidar el planeta en el proceso. Punto."
        },
        {
            icon: <ShieldCheck className="w-8 h-8" />,
            title: "Aguanta el paso del tiempo",
            description: "El tejido es suave pero el alma es de alambre resistente. No se deforma a la primera. Está hecho para que te acompañe un buen rato."
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
                        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTUk48alHLU-3IInVpxt5qGopHv-nMQlgL42w&s"
                        alt="Arte en Tricotín"
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
                        Puntadas con alma, de nosotros para ti
                    </motion.span>
                    <motion.h1
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.7 }}
                        className="text-5xl md:text-8xl font-serif mb-8 drop-shadow-2xl"
                    >
                        Tricotín
                    </motion.h1>
                    <motion.p
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.9 }}
                        className="text-lg md:text-2xl font-light tracking-wide max-w-2xl mx-auto opacity-90 leading-relaxed"
                    >
                        A veces un hilo y un poco de alambre son suficientes para crear algo mágico... o al menos eso sentimos aquí.
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
                            className="relative"
                        >
                            <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl">
                                <img
                                    src="https://www.clothkits.co.uk/cdn/shop/files/beginners-french-knitting-cotton-clara.jpg?v=1753785011&width=860"
                                    alt="Proceso Tricotín"
                                    className="w-full h-full object-cover transition-transform duration-1000 hover:scale-110"
                                />
                            </div>
                            <div className="absolute -bottom-10 -right-10 bg-accent text-white p-8 rounded-3xl shadow-xl max-w-xs hidden md:block">
                                <Heart className="w-8 h-8 mb-4 animate-pulse" />
                                <p className="font-serif text-xl italic leading-snug">
                                    "La verdad, cada pieza que hacemos tiene un poquito de nuestra energía. Se nota."
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
                                Cosas con <span className="text-accent underline decoration-accent/20 underline-offset-8 italic">sentido real</span>
                            </h2>
                            <p className="text-xl text-primary/80 leading-relaxed font-light">
                                Creemos que el mundo ya tiene demasiadas cosas iguales. Por eso apostamos por materiales <span className="text-accent font-semibold italic">eco-friendly</span>. Queremos que tu casa se vea bien, pero que tú también te sientas bien sabiendo cómo se hizo lo que compras.
                            </p>
                            <div className="pt-6 space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-2 h-2 rounded-full bg-accent mt-3 shrink-0" />
                                    <p className="text-lg text-primary/80">Nombres para bebés... un detalle que siempre emociona.</p>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-2 h-2 rounded-full bg-accent mt-3 shrink-0" />
                                    <p className="text-lg text-primary/80">Figuras simples, minimalistas. Menos es más, ¿no?</p>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-2 h-2 rounded-full bg-accent mt-3 shrink-0" />
                                    <p className="text-lg text-primary/80">Regalos que duran. De esos que no se tiran a los dos meses.</p>
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
                            <h2 className="text-4xl font-serif text-primary mb-4 tracking-tight">Lo que tenemos listo</h2>
                            <p className="text-lg text-primary/60">Artesanía pura, sin filtros. A ver qué te parece.</p>
                        </div>
                        <Link to="/catalog">
                            <button className="group flex items-center gap-3 text-primary font-medium hover:text-accent transition-colors duration-300">
                                Ver todo el catálogo
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
                            <Sparkles className="w-12 h-12 text-accent/30 mx-auto mb-6" />
                            <p className="text-2xl font-serif text-primary/60 mb-8">Todavía estamos terminando unas piezas. Honestamente, nos tomamos nuestro tiempo para que queden bien.</p>
                            <Link to="/catalog">
                                <button className="px-10 py-4 bg-primary text-white rounded-full hover:bg-black transition-all duration-300 shadow-xl shadow-primary/10">
                                    Mirar otros tesoros
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

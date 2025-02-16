import React, { useState } from 'react';
import QuickViewModal from '../components/Catalog/QuickViewModal';
import { Eye, Heart, Download, Share2, ChevronRight, Star, Leaf, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { NextSeo } from 'next-seo';
import { JsonLd } from 'react-schemaorg';
import GabyLogo from '../../Images/GabyLogo.jpg';

interface Sweet {
  id: number;
  name: string;
  price: number;
  description: string;
  technique: string;
  artisan: {
    name: string;
    location: string;
    image: string;
    quote: string;
  };
  images: string[];
  category: string;
}

export default function SweetsPage() {
  const { t } = useTranslation();
  const [selectedSweet, setSelectedSweet] = useState<Sweet | null>(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [likedImages, setLikedImages] = useState<boolean[]>(new Array(5).fill(false));
  const [showCopyNotification, setShowCopyNotification] = useState(false);

  const handleQuickView = (sweet: Sweet) => {
    setSelectedSweet(sweet);
  };

  const handleLike = (index: number) => {
    setLikedImages(prev => {
      const newLiked = [...prev];
      newLiked[index] = !newLiked[index];
      return newLiked;
    });
  };

  const handleShare = async (sweetId: number) => {
    try {
      await navigator.clipboard.writeText(window.location.origin + `/product/${sweetId}`);
      setShowCopyNotification(true);
      setTimeout(() => setShowCopyNotification(false), 3000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const sweets: Sweet[] = [
    {
      id: 1,
      name: t('sweets.products.cake1.name'),
      price: 450,
      description: t('sweets.products.cake1.description'),
      technique: t('sweets.products.cake1.technique'),
      artisan: {
        name: t('sweets.products.cake1.artisan.name'),
        location: t('sweets.products.cake1.artisan.location'),
        image: "https://images.unsplash.com/photo-1556911261-6bd341186b2f?auto=format&fit=crop&q=80&w=400",
        quote: t('sweets.products.cake1.artisan.quote')
      },
      images: [
        "https://images.unsplash.com/photo-1535254973040-607b474cb50d?auto=format&fit=crop&q=80&w=1000"
      ],
      category: t('sweets.filters.cakes')
    },
    {
      id: 2,
      name: t('sweets.products.cookie1.name'),
      price: 250,
      description: t('sweets.products.cookie1.description'),
      technique: t('sweets.products.cookie1.technique'),
      artisan: {
        name: t('sweets.products.cookie1.artisan.name'),
        location: t('sweets.products.cookie1.artisan.location'),
        image: "https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?auto=format&fit=crop&q=80&w=400",
        quote: t('sweets.products.cookie1.artisan.quote')
      },
      images: [
        "https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?auto=format&fit=crop&q=80&w=1000"
      ],
      category: t('sweets.filters.cookies')
    },
    {
      id: 3,
      name: t('sweets.products.cake2.name'),
      price: 500,
      description: t('sweets.products.cake2.description'),
      technique: t('sweets.products.cake2.technique'),
      artisan: {
        name: t('sweets.products.cake2.artisan.name'),
        location: t('sweets.products.cake2.artisan.location'),
        image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=80&w=400",
        quote: t('sweets.products.cake2.artisan.quote')
      },
      images: [
        "https://images.unsplash.com/photo-1562440499-64c9a111f713?auto=format&fit=crop&q=80&w=1000"
      ],
      category: t('sweets.filters.cakes')
    },
    {
      id: 4,
      name: t('sweets.products.sweet1.name'),
      price: 180,
      description: t('sweets.products.sweet1.description'),
      technique: t('sweets.products.sweet1.technique'),
      artisan: {
        name: t('sweets.products.sweet1.artisan.name'),
        location: t('sweets.products.sweet1.artisan.location'),
        image: "https://images.unsplash.com/photo-1624001934657-640aae5ff42e?auto=format&fit=crop&q=80&w=400",
        quote: t('sweets.products.sweet1.artisan.quote')
      },
      images: [
        "https://images.unsplash.com/photo-1531594652722-292a43e752b4?auto=format&fit=crop&q=80&w=1000"
      ],
      category: t('sweets.filters.traditional')
    },
    {
      id: 5,
      name: t('sweets.products.sweet2.name'),
      price: 120,
      description: t('sweets.products.sweet2.description'),
      technique: t('sweets.products.sweet2.technique'),
      artisan: {
        name: t('sweets.products.sweet2.artisan.name'),
        location: t('sweets.products.sweet2.artisan.location'),
        image: "https://images.unsplash.com/photo-1516684732162-798a0062be99?auto=format&fit=crop&q=80&w=400",
        quote: t('sweets.products.sweet2.artisan.quote')
      },
      images: [
        "https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&q=80&w=1000"
      ],
      category: t('sweets.filters.traditional')
    }
  ];

  // Prepare structured data for sweets products
  const sweetStructuredData = sweets.map(sweet => ({
    "@type": "Product",
    name: sweet.name,
    description: sweet.description,
    image: sweet.images[0],
    offers: {
      "@type": "Offer",
      price: sweet.price,
      priceCurrency: "MXN",
      availability: "https://schema.org/InStock",
      priceValidUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString()
    },
    brand: {
      "@type": "Brand",
      name: "Paco & Bryan"
    },
    manufacturer: {
      "@type": "Organization",
      name: sweet.artisan.name,
      address: {
        "@type": "PostalAddress",
        addressLocality: sweet.artisan.location
      }
    },
    category: sweet.category,
    countryOfOrigin: "Mexico"
  }));

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  return (
    <div className="bg-white">
      <NextSeo
        title={t('sweets.seo.title')}
        description={t('sweets.seo.description')}
      />
      <JsonLd
        item={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: t('sweets.seo.title'),
          description: t('sweets.seo.description'),
        }}
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
            className="relative h-64 bg-secondary-light rounded-lg overflow-hidden"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            whileHover={{ scale: 1.02 }}
          >
            <img src={GabyLogo} alt="Gaby Manzano Logo" className="absolute inset-0 w-full h-full object-contain" />
          </motion.div>
        </div>
      </motion.div>

      {/* Why Choose Us Section */}
      <div className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
        <div className="bg-secondary-light py-24">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-serif text-primary mb-6">
                {t('sweets.whyChoose.title')}
              </h2>
              <p className="text-lg text-primary/80 max-w-2xl mx-auto">
                {t('sweets.whyChoose.subtitle')}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="text-center">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Leaf className="w-8 h-8 text-accent" />
                </div>
                <h3 className="text-xl font-serif text-primary mb-4">
                  {t('sweets.whyChoose.features.sustainable.title')}
                </h3>
                <p className="text-primary/80">
                  {t('sweets.whyChoose.features.sustainable.description')}
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Star className="w-8 h-8 text-accent" />
                </div>
                <h3 className="text-xl font-serif text-primary mb-4">
                  {t('sweets.whyChoose.features.handcrafted.title')}
                </h3>
                <p className="text-primary/80">
                  {t('sweets.whyChoose.features.handcrafted.description')}
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="w-8 h-8 text-accent" />
                </div>
                <h3 className="text-xl font-serif text-primary mb-4">
                  {t('sweets.whyChoose.features.community.title')}
                </h3>
                <p className="text-primary/80">
                  {t('sweets.whyChoose.features.community.description')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap gap-4 justify-center mb-8"
        >
          {Object.entries(t('sweets.filters', { returnObjects: true })).map(([key, value]) => (
            <button
              key={key}
              onClick={() => setActiveFilter(key)}
              className={`px-4 py-2 rounded-full transition-colors duration-300 ${
                activeFilter === key
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
              }`}
            >
              {value as string}
            </button>
          ))}
        </motion.div>

        {/* Products Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {sweets
            .filter(sweet => activeFilter === 'all' || sweet.category === t(`sweets.filters.${activeFilter}`))
            .map(sweet => (
              <motion.div
                key={sweet.id}
                variants={itemVariants}
                className="bg-white rounded-lg shadow-md overflow-hidden group"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={sweet.images[0]}
                    alt={sweet.name}
                    className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <button
                      onClick={() => handleQuickView(sweet)}
                      className="bg-white/90 p-2 rounded-full hover:bg-white transition-colors duration-300"
                    >
                      <Eye className="w-6 h-6 text-primary" />
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-semibold mb-2">{sweet.name}</h3>
                  <p className="text-gray-600 mb-4">{sweet.description}</p>
                  <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                      <button
                        className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-300"
                        onClick={() => handleLike(sweet.id - 1)}
                      >
                        <Heart
                          className={`w-5 h-5 ${likedImages[sweet.id - 1] ? 'text-red-500' : 'text-gray-600'}`}
                        />
                      </button>
                      <button
                        className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-300"
                        onClick={() => handleShare(sweet.id)}
                      >
                        <Share2 className="w-5 h-5 text-gray-600" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
        </motion.div>
      </div>

      {/* Quick View Modal */}
      {selectedSweet && (
        <QuickViewModal
          isOpen={!!selectedSweet}
          onClose={() => setSelectedSweet(null)}
          product={{
            ...selectedSweet,
            benefits: [
              { icon: Star, text: 'Artisanal Quality' },
              { icon: Leaf, text: 'Natural Ingredients' },
              { icon: Users, text: 'Community Impact' }
            ]
          }}
        />
      )}
      {showCopyNotification && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg transform transition-all duration-300 ease-in-out z-50">
          Link copied to clipboard!
        </div>
      )}
    </div>
  );
}

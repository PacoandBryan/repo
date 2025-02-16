import React, { useState } from 'react';
import QuickViewModal from '../components/Catalog/QuickViewModal';
import { Eye, Heart, Leaf, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import TeddyImage1 from "../../assets/purse4.jpg";
import TeddyImage2 from "../../assets/purse6.jpg";
import TeddyImage3 from "../../assets/purse7.jpg";
import { Product } from '../components/Catalog/types';

interface Teddy {
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


export default function StitchedTeddiesPage() {
  const { t } = useTranslation();
  const [selectedTeddy, setSelectedTeddy] = useState<Product | null>(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const teddies: Teddy[] = [
    {
      id: 1,
      name: t('stitchedTeddies.products.teddy1.name'),
      price: 2100,
      description: t('stitchedTeddies.products.teddy1.description'),
      technique: t('stitchedTeddies.products.teddy1.technique'),
      artisan: {
        name: t('stitchedTeddies.products.teddy1.artisan.name'),
        location: t('stitchedTeddies.products.teddy1.artisan.location'),
        image: "https://cdn.pixabay.com/photo/2016/11/14/17/39/person-1824144_1280.png",
        quote: t('stitchedTeddies.products.teddy1.artisan.quote')
      },
      images: [
        TeddyImage1, // purse4
        TeddyImage2  // purse6
      ],
      category: t('stitchedTeddies.filters.bears')
    },
    {
      id: 2,
      name: t('stitchedTeddies.products.teddy2.name'),
      price: 850,
      description: t('stitchedTeddies.products.teddy2.description'),
      technique: t('stitchedTeddies.products.teddy2.technique'),
      artisan: {
        name: t('stitchedTeddies.products.teddy2.artisan.name'),
        location: t('stitchedTeddies.products.teddy2.artisan.location'),
        image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=400",
        quote: t('stitchedTeddies.products.teddy2.artisan.quote')
      },
      images: [
        TeddyImage2, // purse6
        TeddyImage3  // purse7
      ],
      category: t('stitchedTeddies.filters.dolls')
    },
    {
      id: 3,
      name: t('stitchedTeddies.products.teddy3.name'),
      price: 1800,
      description: t('stitchedTeddies.products.teddy3.description'),
      technique: t('stitchedTeddies.products.teddy3.technique'),
      artisan: {
        name: t('stitchedTeddies.products.teddy3.artisan.name'),
        location: t('stitchedTeddies.products.teddy3.artisan.location'),
        image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400",
        quote: t('stitchedTeddies.products.teddy3.artisan.quote')
      },
      images: [
        TeddyImage3, // purse7
        TeddyImage2  // purse6
      ],
      category: t('stitchedTeddies.filters.monsters')
    }
  ];
  const handleQuickView = (teddy: Teddy) => {
    const productView: Product = {
      id: teddy.id,
      name: teddy.name,
      price: teddy.price,
      description: teddy.description,
      image: teddy.images[0],
      artisan: teddy.artisan.name,
      region: teddy.artisan.location,
      technique: teddy.technique,
      category: teddy.category,
      images: teddy.images
    };
    setSelectedTeddy(productView);
  };

  return (
    <div className="pt-16">
      {/* Hero Section */}
      <div className="animate-slide-up" style={{ animationDelay: "0s" }}>
        <div className="relative h-[70vh] overflow-hidden">
          <img
            src="https://cdn.pixabay.com/photo/2014/11/09/21/44/teddy-bear-524251_1280.jpg"
            alt="Handcrafted teddy bears collection"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <div className="text-center text-white max-w-4xl px-4">
              <h1 className="text-4xl md:text-6xl font-serif mb-6">
                {t('stitchedTeddies.hero.title')}
              </h1>
              <p className="text-lg md:text-xl mb-8 text-white/90">
                {t('stitchedTeddies.hero.subtitle')}
              </p>
              <Link to="/catalog?category=Peluche" className="inline-block">
                <button className="btn bg-white/90 hover:bg-white text-primary transition-colors duration-300">
                  {t('stitchedTeddies.hero.cta')}
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Teddies Collection Section */}
      <div className="animate-slide-up" style={{ animationDelay: "0.4s" }}>
        <div className="py-16">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-serif text-primary text-center mb-12">
              {t('stitchedTeddies.collection.title')}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {teddies.map((teddy, index) => (
                <div
                  key={teddy.id}
                  className="animate-slide-up group relative"
                  style={{ animationDelay: `${index * 0.1 + 0.4}s` }}
                >
                  <div className="bg-white rounded-lg shadow p-4">
                    <div className="relative">
                      <img
                        src={teddy.images[0]}
                        alt={teddy.name}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <button
                          onClick={() => handleQuickView(teddy)}
                          className="bg-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          aria-label={t('catalog.quickView')}
                        >
                          <Eye className="w-5 h-5 text-primary" />
                        </button>
                      </div>
                    </div>
                    <div className="flex p-4">
                      <div>
                        <h3 className="text-lg font-semibold text-primary">
                          {teddy.name}
                        </h3>
                        <p className="text-primary/80">{teddy.description}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
                {t('stitchedTeddies.whyChoose.title')}
              </h2>
              <p className="text-lg text-primary/80 max-w-2xl mx-auto">
                {t('stitchedTeddies.whyChoose.subtitle')}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="text-center">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Leaf className="w-8 h-8 text-accent" />
                </div>
                <h3 className="text-xl font-serif text-primary mb-4">
                  {t('stitchedTeddies.whyChoose.features.sustainable.title')}
                </h3>
                <p className="text-primary/80">
                  {t('stitchedTeddies.whyChoose.features.sustainable.description')}
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Heart className="w-8 h-8 text-accent" />
                </div>
                <h3 className="text-xl font-serif text-primary mb-4">
                  {t('stitchedTeddies.whyChoose.features.handcrafted.title')}
                </h3>
                <p className="text-primary/80">
                  {t('stitchedTeddies.whyChoose.features.handcrafted.description')}
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="w-8 h-8 text-accent" />
                </div>
                <h3 className="text-xl font-serif text-primary mb-4">
                  {t('stitchedTeddies.whyChoose.features.community.title')}
                </h3>
                <p className="text-primary/80">
                  {t('stitchedTeddies.whyChoose.features.community.description')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import QuickViewModal from '../components/Catalog/QuickViewModal';
import { Eye } from 'lucide-react';
import { Heart, Download, Share2, ChevronRight, Star, Leaf, Heart as HeartIcon, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Image1 from "../../assets/purse1.jpg";
import Image2 from "../../assets/purse2.jpg";
import Image3 from "../../assets/purse2-V2.jpg"
import { Link } from 'react-router-dom';
import { NextSeo } from 'next-seo';
import { JsonLd } from 'react-schemaorg';

interface Purse {
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

export default function PursesPage() {
  const { t } = useTranslation();

  const [selectedPurse, setSelectedPurse] = useState<Purse | null>(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const handleQuickView = (purse: Purse) => {
    setSelectedPurse(purse);
  };

  const purses: Purse[] = [
    {
      id: 1,
      name: t('purses.products.purse1.name'),
      price: 2800,
      description: t('purses.products.purse1.description'),
      technique: t('purses.products.purse1.technique'),
      artisan: {
        name: t('purses.products.purse1.artisan.name'),
        location: t('purses.products.purse1.artisan.location'),
        image: "https://cdn.pixabay.com/photo/2016/11/14/17/39/person-1824144_1280.png",
        quote: t('purses.products.purse1.artisan.quote')
      },
      images: [
        Image1
      ],
      category: t('purses.filters.crossbody')
    },
    {
      id: 2,
      name: t('purses.products.purse2.name'),
      price: 1950,
      description: t('purses.products.purse2.description'),
      technique: t('purses.products.purse2.technique'),
      artisan: {
        name: t('purses.products.purse2.artisan.name'),
        location: t('purses.products.purse2.artisan.location'),
        image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=400",
        quote: t('purses.products.purse2.artisan.quote')
      },
      images: [
        Image2,
        Image3
      ],
      category: t('purses.filters.clutch')
    }
  ];

  // Get all purses for structured data
  const structuredDataItems = purses.map(purse => ({
    "@type": "Product",
    name: purse.name,
    description: purse.description,
    image: purse.images[0],
    offers: {
      "@type": "Offer",
      price: purse.price,
      priceCurrency: "MXN",
      availability: "https://schema.org/InStock"
    },
    brand: {
      "@type": "Brand",
      name: "Paco & Bryan"
    },
    manufacturer: {
      "@type": "Person",
      name: purse.artisan.name,
      address: {
        "@type": "PostalAddress",
        addressLocality: purse.artisan.location
      }
    }
  }));

  return (
    <>
      <NextSeo
        title="Handcrafted Purses Collection | Paco & Bryan"
        description="Discover our unique collection of handcrafted purses made by skilled Mexican artisans. Each piece tells a story of tradition and craftsmanship."
        canonical="https://yoursite.com/purses"
        openGraph={{
          url: 'https://yoursite.com/purses',
          title: 'Handcrafted Purses Collection | Paco & Bryan',
          description: 'Discover our unique collection of handcrafted purses made by skilled Mexican artisans. Each piece tells a story of tradition and craftsmanship.',
          images: [
            {
              url: Image1,
              width: 1200,
              height: 630,
              alt: 'Handcrafted Purses Collection',
            },
          ],
        }}
      />
      <JsonLd
        item={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Handcrafted Purses Collection",
          description: "Discover our unique collection of handcrafted purses made by skilled Mexican artisans.",
          url: "https://yoursite.com/purses",
          itemListElement: structuredDataItems
        }}
      />
      <div className="pt-16">
        {/* Hero Section */}
        <div className="animate-slide-up" style={{ animationDelay: "0s" }}>
          <div className="relative h-[70vh] overflow-hidden">
            <img
              src="https://cdn.pixabay.com/photo/2015/09/16/05/57/embroidery-942255_1280.jpg"
              alt="Handcrafted purses collection"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div className="text-center text-white max-w-4xl px-4">
                <h1 className="text-4xl md:text-6xl font-serif mb-6">
                  {t('purses.hero.title')}
                </h1>
                <p className="text-lg md:text-xl mb-8 text-white/90">
                  {t('purses.hero.subtitle')}
                </p>
                <Link to="/catalog?category=Bolso" className="inline-block">
                  <button className="btn bg-white/90 hover:bg-white text-primary transition-colors duration-300">
                    {t('purses.hero.cta')}
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Purses Collection Section */}
        <div className="animate-slide-up" style={{ animationDelay: "0.4s" }}>
          <div className="py-16">
            <div className="max-w-7xl mx-auto px-4">
              <h2 className="text-3xl font-serif text-primary text-center mb-12">
                {t('purses.collection.title')}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {purses.map((purse, index) => (
                  <div
                    key={purse.id}
                    className="animate-slide-up group relative"
                    style={{ animationDelay: `${index * 0.1 + 0.4}s` }}
                  >
                    <div className="bg-white rounded-lg shadow p-4">
                      <div className="relative">
                        <img
                          src={purse.images[0]}
                          alt={purse.name}
                          className="w-full h-48 object-cover rounded-t-lg"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <button
                            onClick={() => handleQuickView(purse)}
                            className="bg-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            aria-label={t('catalog.quickView')}
                          >
                            <Eye className="w-5 h-5 text-primary" />
                          </button>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="text-lg font-semibold text-primary">
                          {purse.name}
                        </h3>
                        <p className="text-primary/80">{purse.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
                  {t('purses.whyChoose.title')}
                </h2>
                <p className="text-lg text-primary/80 max-w-2xl mx-auto">
                  {t('purses.whyChoose.subtitle')}
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                <div className="text-center">
                  <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Leaf className="w-8 h-8 text-accent" />
                  </div>
                  <h3 className="text-xl font-serif text-primary mb-4">
                    {t('purses.whyChoose.features.sustainable.title')}
                  </h3>
                  <p className="text-primary/80">
                    {t('purses.whyChoose.features.sustainable.description')}
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <HeartIcon className="w-8 h-8 text-accent" />
                  </div>
                  <h3 className="text-xl font-serif text-primary mb-4">
                    {t('purses.whyChoose.features.handcrafted.title')}
                  </h3>
                  <p className="text-primary/80">
                    {t('purses.whyChoose.features.handcrafted.description')}
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Users className="w-8 h-8 text-accent" />
                  </div>
                  <h3 className="text-xl font-serif text-primary mb-4">
                    {t('purses.whyChoose.features.community.title')}
                  </h3>
                  <p className="text-primary/80">
                    {t('purses.whyChoose.features.community.description')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick View Modal */}
        {selectedPurse && (
          <QuickViewModal
            product={selectedPurse}
            onClose={() => setSelectedPurse(null)}
          />
        )}
      </div>
    </>
  );
}
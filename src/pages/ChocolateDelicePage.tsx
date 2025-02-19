import React, { useState } from 'react';
import QuickViewModal from '../components/Catalog/QuickViewModal';
import { Eye, Leaf, Heart as HeartIcon, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Image1 from "../../assets/truffles.jpg";
import Image2 from "../../assets/truffles2.jpg";
import { Link } from 'react-router-dom';
import { NextSeo } from 'next-seo';
import { JsonLd } from 'react-schemaorg';



interface Chocolate {
  id: number;
  name: string;
  price: number;
  description: string;
  ingredients: string;
  chocolatier: {
    name: string;
    location: string;
    image: string;
    quote: string;
  };
  images: string[];
  category: string;
  artisan: string;
  technique: string;
}

export default function ChocolateDelicePage() {
  const { t } = useTranslation();

  const [selectedChocolate, setSelectedChocolate] = useState<Chocolate | null>(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const handleQuickView = (chocolate: Chocolate) => {
    setSelectedChocolate(chocolate);
  };

  const chocolates: Chocolate[] = [
    {
      id: 1,
      name: t('chocolates.products.chocolate1.name'),
      price: 150,
      description: t('chocolates.products.chocolate1.description'),
      ingredients: t('chocolates.products.chocolate1.ingredients'),
      chocolatier: {
        name: t('chocolates.products.chocolate1.chocolatier.name'),
        location: t('chocolates.products.chocolate1.chocolatier.location'),
        image: "https://cdn.pixabay.com/photo/2016/11/14/17/39/person-1824144_1280.png",
        quote: t('chocolates.products.chocolate1.chocolatier.quote')
      },
      images: [
        Image1,
        Image2
      ],
      category: t('catalog.categories.dessert'),
      artisan: t('chocolates.products.chocolate1.chocolatier.name'),
      technique: t('chocolates.products.chocolate1.technique')
    }
  ];

  // Get all chocolates for structured data
  const structuredDataItems = chocolates.map(chocolate => ({
    "@type": "Product",
    name: chocolate.name,
    description: chocolate.description,
    image: chocolate.images[0],
    offers: {
      "@type": "Offer",
      price: chocolate.price,
      priceCurrency: "USD",
      availability: "https://schema.org/InStock"
    },
    brand: {
      "@type": "Brand",
      name: "ChocoDelice"
    },
    manufacturer: {
      "@type": "Person",
      name: chocolate.chocolatier.name,
      address: {
        "@type": "PostalAddress",
        addressLocality: chocolate.chocolatier.location
      }
    }
  }));

  return (
    <>
      <NextSeo
        title="Exquisite Chocolate Delights | ChocoDelice"
        description="Indulge in our exquisite collection of handcrafted chocolates made by skilled chocolatiers. Each piece is a work of art."
        canonical="https://yoursite.com/chocolates"
        openGraph={{
          url: 'https://yoursite.com/chocolates',
          title: 'Exquisite Chocolate Delights | ChocoDelice',
          description: 'Indulge in our exquisite collection of handcrafted chocolates made by skilled chocolatiers. Each piece is a work of art.',
          images: [
            {
              url: Image1,
              width: 1200,
              height: 630,
              alt: 'Exquisite Chocolate Delights',
            },
          ],
        }}
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

        {/* Chocolates Collection Section */}
        <div className="animate-slide-up" style={{ animationDelay: "0.4s" }}>
          <div className="py-16">
            <div className="max-w-7xl mx-auto px-4">
              <h2 className="text-3xl font-serif text-primary text-center mb-12">
                {t('chocolates.collection.title')}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {chocolates.map((chocolate, index) => (
                  <div
                    key={chocolate.id}
                    className="animate-slide-up group relative"
                    style={{ animationDelay: `${index * 0.1 + 0.4}s` }}
                  >
                    <div className="bg-white rounded-lg shadow p-4">
                      <div className="relative">
                        <img
                          src={chocolate.images[0]}
                          alt={chocolate.name}
                          className="w-full h-48 object-cover rounded-t-lg"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <button
                            onClick={() => handleQuickView(chocolate)}
                            className="bg-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            aria-label={t('catalog.quickView')}
                          >
                            <Eye className="w-5 h-5 text-primary" />
                          </button>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="text-lg font-semibold text-primary">
                          {chocolate.name}
                        </h3>
                        <p className="text-primary/80">{chocolate.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {selectedChocolate && (
          <QuickViewModal
            product={selectedChocolate}
            onClose={() => setSelectedChocolate(null)}
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

        {/* History of Chocolate Truffles and Enjambres Section */}
        <div className="animate-slide-up" style={{ animationDelay: "0.3s" }}>
          <div className="py-16 bg-secondary-light">
            <div className="max-w-7xl mx-auto px-4">
              <h2 className="text-3xl font-serif text-primary text-center mb-12">
                {t('chocolates.history.title')}
              </h2>
              <div className="text-lg text-primary/80 max-w-3xl mx-auto">
                <p className="mb-6">
                  {t('chocolates.history.truffles')}
                </p>
                <p>
                  {t('chocolates.history.enjambres')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick View Modal */}
        {selectedChocolate && (
          <QuickViewModal
            product={selectedChocolate}
            onClose={() => setSelectedChocolate(null)}
          />
        )}
      </div>
    </>
  );
}
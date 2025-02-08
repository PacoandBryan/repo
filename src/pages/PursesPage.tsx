import React, { useState } from 'react';
import { Heart, Download, Share2, ChevronRight, Star, Leaf, Heart as HeartIcon, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';

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

const purses: Purse[] = [
  {
    id: 1,
    name: "Flor de Tehuana Purse",
    price: 2800,
    description: "Inspired by the vibrant floral patterns of Oaxaca, this purse features intricate hand-embroidered flowers in rich, jewel tones.",
    technique: "Traditional Floral Embroidery",
    artisan: {
      name: "María González",
      location: "Oaxaca",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400",
      quote: "Each stitch carries the stories of my grandmother's teachings."
    },
    images: [
      "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1528812969535-4bcefc3926bb?auto=format&fit=crop&q=80&w=800"
    ],
    category: "Crossbody"
  },
  {
    id: 2,
    name: "Mariposa Clutch",
    price: 1950,
    description: "A delicate evening clutch adorned with butterfly motifs, symbolizing transformation and beauty.",
    technique: "Contemporary Embroidery",
    artisan: {
      name: "Ana Ramírez",
      location: "Mexico City",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=400",
      quote: "I blend traditional techniques with modern designs to create pieces that tell our story in a contemporary way."
    },
    images: [
      "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1604859347436-2e6925be8176?auto=format&fit=crop&q=80&w=800"
    ],
    category: "Clutch"
  }
];

export default function PursesPage() {
  const { t } = useTranslation();
  const [selectedPurse, setSelectedPurse] = useState<Purse | null>(null);
  const [activeFilter, setActiveFilter] = useState('all');

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(price);
  };

  return (
    <div className="pt-16">
      {/* Hero Section */}
      <div className="relative h-[70vh] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&q=80&w=2000"
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
            <button className="btn bg-white/90 hover:bg-white text-primary transition-colors duration-300">
              {t('purses.hero.cta')}
            </button>
          </div>
        </div>
      </div>

      {/* Why Choose Us Section */}
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

      {/* Featured Artisan */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-serif text-primary mb-6">
                {t('purses.artisans.title')}
              </h2>
              <div className="bg-secondary/10 p-6 rounded-lg">
                <div className="flex items-center space-x-4 mb-4">
                  <img
                    src={purses[0].artisan.image}
                    alt={purses[0].artisan.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-medium text-primary">{purses[0].artisan.name}</h3>
                    <p className="text-sm text-primary/60">{purses[0].artisan.location}</p>
                  </div>
                </div>
                <blockquote className="text-primary/80 italic">
                  "{purses[0].artisan.quote}"
                </blockquote>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <img
                src={purses[0].images[0]}
                alt="Artisan work"
                className="w-full h-48 object-cover rounded-lg"
              />
              <img
                src={purses[0].images[1]}
                alt="Artisan work"
                className="w-full h-48 object-cover rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="bg-secondary/10 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-serif text-primary text-center mb-12">
            {t('purses.testimonials.title')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex text-accent mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4" fill="currentColor" />
                  ))}
                </div>
                <p className="text-primary/80 mb-4">
                  {t('purses.testimonials.review')}
                </p>
                <div className="flex items-center space-x-3">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400"
                    alt="Customer"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-medium text-primary">Sofia Rodriguez</p>
                    <p className="text-sm text-primary/60">Mexico City</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      {selectedPurse && (
        <>
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
            onClick={() => setSelectedPurse(null)}
          />
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <div className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl">
                <button
                  onClick={() => setSelectedPurse(null)}
                  className="absolute right-4 top-4 text-primary/60 hover:text-primary"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
                <div className="grid grid-cols-1 md:grid-cols-2">
                  <div className="aspect-square">
                    <img
                      src={selectedPurse.images[0]}
                      alt={selectedPurse.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-8">
                    <h2 className="text-2xl font-serif text-primary mb-2">
                      {selectedPurse.name}
                    </h2>
                    <p className="text-xl font-medium text-primary mb-4">
                      {formatPrice(selectedPurse.price)}
                    </p>
                    <p className="text-primary/80 mb-6">
                      {selectedPurse.description}
                    </p>
                    <div className="space-y-4">
                      <button className="w-full btn bg-primary text-white hover:bg-primary/90">
                        {t('purses.quickView.addToCart')}
                      </button>
                      <button className="w-full btn border-2 border-primary text-primary hover:bg-primary/5">
                        {t('purses.quickView.addToWishlist')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
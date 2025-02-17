import React, { useState, useEffect } from 'react';
import { Heart, Download, Share2, ChevronRight, Instagram } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { NextSeo } from 'next-seo';
import { JsonLd } from 'react-schemaorg';
import Image1 from "../../assets/SweetTable1.jpg";
import Image2 from "../../assets/SweetTable2.jpg";
import Image3 from "../../assets/SweetTable3.jpg";
import Image4 from "../../assets/SweetTable4.jpg";
import Image5 from "../../assets/SweetTable5.jpg";
import Image6 from "../../assets/SweetTable6.jpg";
import Image7 from "../../assets/SweetTable7.jpg";
import Image8 from "../../assets/SweetTable8.jpg";
import Image9 from "../../assets/SweetTable9.jpg";
import Image10 from "../../assets/SweetTable10.jpg";
import Image11 from "../../assets/SweetTable11.jpg";


interface InspirationStep {
  title: string;
  description: string;
  image: string;
  animation?: string;
}

interface Story {
  name: string;
  location: string;
  image: string;
  quote: string;
  tableImage: string;
}

export default function SweetTablePage() {
  const { t } = useTranslation();
  const [activeStep, setActiveStep] = useState(0);
  const [showNewsletter, setShowNewsletter] = useState(false);
  const [email, setEmail] = useState('');
  const [visibleSections, setVisibleSections] = useState<string[]>([]);
  const [likedImages, setLikedImages] = useState<boolean[]>(new Array(4).fill(false));
  const [hoveredBalloon, setHoveredBalloon] = useState<number | null>(null);
  const [confettiActive, setConfettiActive] = useState(false);

  const sweetTableImages = [Image1, Image2, Image3, Image4, Image5, Image6, Image7, Image8];
  
  const inspirationSteps: InspirationStep[] = [
    {
      title: t('sweetTable.inspiration.steps.step1.title'),
      description: t('sweetTable.inspiration.steps.step1.description'),
      image: Image1
    },
    // ... other steps
  ];

  // Structured data for the inspiration steps as HowTo
  const howToSteps = inspirationSteps.map((step, index) => ({
    "@type": "HowToStep",
    position: index + 1,
    name: step.title,
    text: step.description,
    image: step.image
  }));

  // Prepare gallery images for structured data
  const galleryItems = sweetTableImages.map((image, index) => ({
    "@type": "ImageObject",
    contentUrl: image,
    name: `Sweet Table Design ${index + 1}`,
    description: t('sweetTable.gallery.imageDescription', { number: index + 1 }),
    representativeOfPage: index === 0
  }));

  const handleLike = (index: number) => {
    setLikedImages(prev => {
      const newLiked = [...prev];
      newLiked[index] = !newLiked[index];
      return newLiked;
    });
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => [...prev, entry.target.id]);
          }
        });
      },
      { threshold: 0.1 }
    );

    const sections = document.querySelectorAll('[data-animate]');
    sections.forEach((section) => observer.observe(section));

    return () => {
      sections.forEach((section) => observer.unobserve(section));
    };
  }, []);

  const steps = [
    {
      key: 'foundation',
      image: "https://images.unsplash.com/photo-1522767131594-6b7e96848fba?auto=format&fit=crop&q=80&w=800"
    },
    {
      key: 'texture',
      image: "https://images.unsplash.com/photo-1523294557-3637e8b33cc9?auto=format&fit=crop&q=80&w=800"
    },
    {
      key: 'height',
      image: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&q=80&w=800"
    },
    {
      key: 'personal',
      image: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&q=80&w=800"
    }
  ];

  const colorPalettes = [
    {
      key: 'spring',
      colors: ["#FFE5E5", "#FFC4C4", "#FF9F9F", "#FF7474"]
    },
    {
      key: 'fiesta',
      colors: ["#FFE5D9", "#FFCBA4", "#FF9A5C", "#FF7F50"]
    },
    {
      key: 'modern',
      colors: ["#F5E6E8", "#D5C6E0", "#AAA1C8", "#967AA1"]
    }
  ];

  const stories = [
    {}

  ];

  const birthdayThemes = [
    {
      image: Image1,
      animation: "float"
    },
    {
      image: Image2,
      animation: "zoom"
    },
    {
      image: Image3,
      animation: "float"
    },
    {
      image: Image4,
      animation: "spin"
    },
    {
      image: Image5,
      animation: "float"
    },
    {
      image: Image6,
      animation: "zoom"
    },
    {
      image: Image7,
      animation: "float"
    },
    {
      image: Image8,
      animation: "spin"
    },
    {
      image: Image9,
      animation: "float"
    },
    {
      image: Image10,
      animation: "zoom"
    },
    {
      image: Image11,
      animation: "spin"
    }
  ];

  const handleDownload = async () => {
    try {
      const response = await fetch('/sweet-table-guide.pdf');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'diki-sweet-table-guide.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading guide:', error);
    }
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    setShowNewsletter(false);
  };

  const isVisible = (sectionId: string) => visibleSections.includes(sectionId);

  const animateClass = (sectionId: string) =>
    isVisible(sectionId)
      ? 'opacity-100 translate-y-0'
      : 'opacity-0 translate-y-8';

  const handleBalloonHover = (index: number | null) => {
    setHoveredBalloon(index);
    if (index !== null) {
      setConfettiActive(true);
      setTimeout(() => setConfettiActive(false), 1000);
    }
  };

  return (
    <>
      <NextSeo
        title="Sweet Table Designs & Inspiration | Paco & Bryan"
        description="Discover our stunning sweet table designs for weddings and special events. Get inspired by our creative Mexican candy displays, traditional dessert arrangements, and custom table setups."
        canonical="https://yoursite.com/sweet-table"
        openGraph={{
          url: 'https://yoursite.com/sweet-table',
          title: 'Sweet Table Designs & Inspiration | Paco & Bryan',
          description: 'Create magical moments with our stunning sweet table designs. Perfect for weddings and special events.',
          images: sweetTableImages.map(image => ({
            url: image,
            width: 1200,
            height: 630,
            alt: 'Sweet Table Design Inspiration',
          })),
          type: 'article'
        }}
        additionalMetaTags={[
          {
            name: 'keywords',
            content: 'sweet table, candy buffet, mexican desserts, wedding desserts, event planning, dessert display, candy bar'
          },
          {
            name: 'robots',
            content: 'index, follow'
          }
        ]}
      />
      <JsonLd
        item={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: "Sweet Table Designs & Inspiration",
          description: "Create magical moments with our stunning sweet table designs. Perfect for weddings and special events.",
          image: sweetTableImages,
          author: {
            "@type": "Organization",
            name: "Paco & Bryan"
          },
          publisher: {
            "@type": "Organization",
            name: "Paco & Bryan",
            logo: {
              "@type": "ImageObject",
              url: "https://yoursite.com/logo.png"
            }
          },
          mainEntity: {
            "@type": "HowTo",
            name: "How to Create a Beautiful Sweet Table",
            description: "Learn how to create a stunning sweet table for your special event",
            image: Image1,
            step: howToSteps
          },
          about: {
            "@type": "Service",
            name: "Sweet Table Design",
            description: "Professional sweet table design and setup services for special events",
            provider: {
              "@type": "Organization",
              name: "Paco & Bryan"
            }
          },
          associatedMedia: {
            "@type": "ImageGallery",
            associatedMedia: galleryItems
          }
        }}
      />
      <div className="pt-16">
        {/* Hero Section */}
        <div className="relative h-[80vh] overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&q=80&w=2000"
            alt={t('sweetTable.hero.title')}
            className="w-full h-full object-cover transform scale-105 animate-[ken-burns_20s_ease-in-out_infinite_alternate]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-center justify-center">
            <div className="text-center text-white max-w-4xl px-4">
              <h1 className="text-4xl md:text-6xl font-serif mb-6 animate-[fade-in-up_1s_ease-out]">
                {t('sweetTable.hero.title')}
              </h1>
              <p className="text-lg md:text-xl mb-8 text-white/90 animate-[fade-in-up_1s_ease-out_0.3s]">
                {t('sweetTable.hero.subtitle')}
              </p>
              <button 
                onClick={() => document.getElementById('inspiration')?.scrollIntoView({ behavior: 'smooth' })}
                className="btn bg-white/90 hover:bg-white text-primary transition-all duration-300 animate-[fade-in-up_1s_ease-out_0.6s] hover:transform hover:scale-105"
              >
                {t('sweetTable.hero.cta')}
              </button>
            </div>
          </div>
        </div>

        {/* Inspiration & Mood Board */}
        <div 
          id="inspiration" 
          data-animate
          className={`bg-secondary-light py-24 transition-all duration-1000 ${animateClass('inspiration')}`}
        >
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-serif text-primary mb-6">
                {t('sweetTable.inspiration.title')}
              </h2>
              <p className="text-lg text-primary/80 max-w-2xl mx-auto">
                {t('sweetTable.inspiration.subtitle')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {colorPalettes.map((palette) => (
                <div key={palette.key} className="bg-white rounded-lg p-6 shadow-soft hover:shadow-medium transition-all duration-300">
                  <h3 className="text-xl font-serif text-primary mb-4">
                    {t(`sweetTable.inspiration.palettes.${palette.key}.name`)}
                  </h3>
                  <div className="flex space-x-2 mb-4">
                    {palette.colors.map((color, i) => (
                      <div
                        key={i}
                        className="w-12 h-12 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <p className="text-primary/80">
                    {t(`sweetTable.inspiration.palettes.${palette.key}.description`)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Styling Steps */}
        <div 
          id="steps"
          data-animate
          className={`bg-white py-24 transition-all duration-1000 ${animateClass('steps')}`}
        >
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-serif text-primary text-center mb-16">
              {t('sweetTable.steps.title')}
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                {steps.map((step, index) => (
                  <div
                    key={step.key}
                    className={`mb-8 cursor-pointer transition-all duration-500 ${
                      activeStep === index 
                        ? 'scale-105 bg-secondary-light/50 p-4 rounded-lg' 
                        : 'opacity-70 hover:opacity-100'
                    }`}
                    onClick={() => setActiveStep(index)}
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                        activeStep === index ? 'scale-110' : ''
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="text-xl font-serif text-primary mb-2">
                          {t(`sweetTable.steps.items.${step.key}.title`)}
                        </h3>
                        <p className="text-primary/80">
                          {t(`sweetTable.steps.items.${step.key}.description`)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="relative">
                <img
                  src="https://cdn.pixabay.com/photo/2016/03/27/21/41/wood-1284388_1280.jpg"
                  alt={t(`sweetTable.steps.items.${steps[activeStep].key}.title`)}
                  className="w-full rounded-lg shadow-medium transition-all duration-500 hover:transform hover:scale-105"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Birthday Section */}
        <section 
          id="birthday-section" 
          data-animate="true"
          className={`py-12 ${visibleSections.includes('birthday-section') ? 'animate-fade-in' : 'opacity-0'}`}
        >
          <h2 className="text-4xl font-bold text-center mb-2 text-purple-600">
            {t('sweetTable.birthday.title')}
          </h2>
          <p className="text-xl text-center mb-8 text-purple-400">
            {t('sweetTable.birthday.subtitle')}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
            {birthdayThemes.map((theme, index) => (
              <div
                key={index}
                className={`relative transform transition-all duration-300 hover:scale-105 cursor-pointer
                  ${theme.animation === 'float' ? 'hover:translate-y-[-10px]' : ''}
                  ${theme.animation === 'zoom' ? 'hover:scale-110' : ''}
                  ${theme.animation === 'bounce' ? 'animate-bounce' : ''}
                  ${theme.animation === 'spin' ? 'hover:rotate-3' : ''}`}
                onMouseEnter={() => handleBalloonHover(index)}
                onMouseLeave={() => handleBalloonHover(null)}
              >
                <div className="bg-white rounded-lg shadow-xl overflow-hidden">
                  <img
                    src={theme.image}
                    alt={`Sweet Table Design ${index + 1}`}
                    className="w-full h-48 object-cover"
                  />
                  {hoveredBalloon === index && (
                    <div className="absolute -top-4 -right-4">
                      <span className="animate-bounce text-2xl">🎈</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          {confettiActive && (
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-confetti">🎉</div>
              </div>
            </div>
          )}
        </section>

        {/* Newsletter Modal */}
        {showNewsletter && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-8 max-w-md mx-4 relative animate-fade-in">
              <button
                onClick={() => setShowNewsletter(false)}
                className="absolute right-4 top-4 text-primary/60 hover:text-primary"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
              <h3 className="text-2xl font-serif text-primary mb-4">
                {t('sweetTable.newsletter.title')}
              </h3>
              <p className="text-primary/80 mb-6">
                {t('sweetTable.newsletter.subtitle')}
              </p>
              <form onSubmit={handleSubscribe}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('sweetTable.newsletter.placeholder')}
                  className="input mb-4"
                  required
                />
                <button type="submit" className="btn btn-primary w-full">
                  {t('sweetTable.newsletter.button')}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Final CTA */}
        <div 
          id="cta"
          data-animate
          className={`bg-secondary-light py-24 text-center transition-all duration-1000 ${animateClass('cta')}`}
        >
          <div className="max-w-3xl mx-auto px-4">
            <h2 className="text-3xl font-serif text-primary mb-6">
              {t('sweetTable.download.title')}
            </h2>
            <p className="text-lg text-primary/80 mb-8">
              {t('sweetTable.download.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button 
                onClick={handleDownload}
                className="btn btn-primary group hover:transform hover:scale-105 transition-all duration-300"
              >
                <Download className="w-5 h-5 mr-2 group-hover:animate-bounce" />
                {t('sweetTable.download.button')}
              </button>
              <button
                onClick={() => setShowNewsletter(true)}
                className="btn btn-outline hover:transform hover:scale-105 transition-all duration-300"
              >
                {t('sweetTable.download.moreInspiration')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
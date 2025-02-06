import React, { useState, useEffect } from 'react';
import { Heart, Download, Share2, ChevronRight, Instagram } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface InspirationStep {
  title: string;
  description: string;
  image: string;
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
    {
      key: 'isabella',
      name: "Isabella Martinez",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400",
      tableImage: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&q=80&w=800"
    },
    {
      key: 'sofia',
      name: "Sofia Rodriguez",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=400",
      tableImage: "https://images.unsplash.com/photo-1523294557-3637e8b33cc9?auto=format&fit=crop&q=80&w=800"
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

  const isVisible = (sectionId: string) => visibleSections.includes(sectionId);

  const animateClass = (sectionId: string) =>
    isVisible(sectionId)
      ? 'opacity-100 translate-y-0'
      : 'opacity-0 translate-y-8';

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    setShowNewsletter(false);
  };

  return (
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
                src={steps[activeStep].image}
                alt={t(`sweetTable.steps.items.${steps[activeStep].key}.title`)}
                className="w-full rounded-lg shadow-medium transition-all duration-500 hover:transform hover:scale-105"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stories Section */}
      <div className="bg-secondary-light py-24">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-serif text-primary text-center mb-16">
            {t('sweetTable.stories.title')}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {stories.map((story) => (
              <div key={story.key} className="bg-white rounded-lg overflow-hidden shadow-soft hover:shadow-medium transition-all duration-300">
                <img
                  src={story.tableImage}
                  alt="Sweet table creation"
                  className="w-full h-64 object-cover"
                />
                <div className="p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <img
                      src={story.image}
                      alt={story.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="font-medium text-primary">{story.name}</h3>
                      <p className="text-sm text-primary/60">
                        {t(`sweetTable.stories.quotes.${story.key}.location`)}
                      </p>
                    </div>
                  </div>
                  <blockquote className="text-primary/80 italic">
                    "{t(`sweetTable.stories.quotes.${story.key}.quote`)}"
                  </blockquote>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Community Section */}
      <div className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-serif text-primary mb-8">
            {t('sweetTable.community.title')}
          </h2>
          <p className="text-lg text-primary/80 max-w-2xl mx-auto mb-12">
            {t('sweetTable.community.subtitle')}
          </p>
          
          <div className="flex justify-center space-x-6 mb-12">
            <button className="btn btn-outline">
              <Share2 className="w-5 h-5 mr-2" />
              {t('sweetTable.community.share')}
            </button>
            <button className="btn btn-outline">
              <Instagram className="w-5 h-5 mr-2" />
              {t('sweetTable.community.follow')}
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="relative group overflow-hidden rounded-lg">
                <img
                  src={`https://images.unsplash.com/photo-${1522767131594 + index}-6b7e96848fba?auto=format&fit=crop&q=80&w=400`}
                  alt="Community creation"
                  className="w-full aspect-square object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <Heart className="w-8 h-8 text-white" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

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
  );
}
import React from 'react';
import Hero from '../components/Hero';
import Benefits from '../components/Benefits';
import FeaturedProducts from '../components/FeaturedProducts';
import Story from '../components/Story';
import Testimonials from '../components/Testimonials';
import FAQ from '../components/FAQ';
import SEO from '../components/SEO';
import { JsonLd } from 'react-schemaorg';
import { useScrollAnimations } from '../hooks/useScrollAnimations';


export default function HomePage() {
  // Call the custom scroll animations hook
  useScrollAnimations();

  return (
    <>
      <SEO
        title="Authentic Mexican Crafts"
        description="Discover authentic handmade Mexican bags, purses, and knitted accessories at Diky. Unique craftsmanship telling a story in every piece."
        canonical="https://diky.com"
        openGraph={{
          title: 'Authentic Mexican Crafts | Diky',
          description: 'Discover authentic handmade Mexican bags, purses, and knitted accessories at Diky. Unique craftsmanship telling a story in every piece.',
          images: [
            {
              url: 'https://diky.com/og-image.jpg',
              alt: 'Diky - Handmade Mexican Crafts',
            },
          ],
        }}
      />
      <JsonLd
        item={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Diky",
          url: "https://diky.com",
          potentialAction: {
            "@type": "SearchAction",
            target: "https://diky.com/search?q={search_term_string}",
            "query-input": "required name=search_term_string"
          }
        }}
      />
      <div>
        <div data-animate className="animate-slide-up" style={{ animationDelay: '0s' }}>
          <Hero />
        </div>
        <div data-animate className="animate-slide-up" style={{ animationDelay: '0.5s' }}>
          <Benefits />
        </div>
        <div data-animate className="animate-slide-up" style={{ animationDelay: '1s' }}>
          <FeaturedProducts />
        </div>
        <div data-animate className="animate-slide-up" style={{ animationDelay: '1.5s' }}>
          <Story />
        </div>
        <div data-animate className="animate-slide-up" style={{ animationDelay: '2s' }}>
          <Testimonials />
        </div>
        <div data-animate className="animate-slide-up" style={{ animationDelay: '2.5s' }}>
          <FAQ />
        </div>

      </div>
    </>
  );
}
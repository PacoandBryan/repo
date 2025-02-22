import React from 'react';
import Hero from '../components/Hero';
import Benefits from '../components/Benefits';
import FeaturedProducts from '../components/FeaturedProducts';
import Story from '../components/Story';
import Testimonials from '../components/Testimonials';
import FAQ from '../components/FAQ';
import { NextSeo } from 'next-seo';
import { JsonLd } from 'react-schemaorg';
import { useScrollAnimations } from '../hooks/useScrollAnimations';

export default function HomePage() {
  // Call the custom scroll animations hook
  useScrollAnimations();

  return (
    <>
      <NextSeo
        title="Home"
        description="Welcome to our website. Find the best content here."
        canonical="https://yoursite.com"
        openGraph={{
          url: 'https://yoursite.com',
          title: 'Home',
          description: 'Welcome to our website. Find the best content here.',
          images: [
            {
              url: 'https://yoursite.com/og-image.jpg',
              width: 1200,
              height: 630,
              alt: 'Site Homepage',
            },
          ],
        }}
      />
      <JsonLd
        item={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Your Site Name",
          url: "https://yoursite.com",
          potentialAction: {
            "@type": "SearchAction",
            target: "https://yoursite.com/search?q={search_term_string}",
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
        <div className="animate-slide-up" style={{ animationDelay: '3s' }}>
          {/*Temporary disabled until backend is ready <Newsletter />*/}
        </div>
      </div>
    </>
  );
}
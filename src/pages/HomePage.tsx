import React from 'react';
import Hero from '../components/Hero';
import Benefits from '../components/Benefits';
import FeaturedProducts from '../components/FeaturedProducts';
import Story from '../components/Story';
import Testimonials from '../components/Testimonials';
import Newsletter from '../components/Newsletter';
import FAQ from '../components/FAQ';

export default function HomePage() {
  return (
    <>
      <Hero />
      <Benefits />
      <FeaturedProducts />
      <Story />
      <Testimonials />
      <FAQ />
      <Newsletter />
    </>
  );
}
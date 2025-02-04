import React from 'react';
import NavBar from './components/NavBar';
import Hero from './components/Hero';
import Benefits from './components/Benefits';
import FeaturedProducts from './components/FeaturedProducts';
import Story from './components/Story';
import FAQ from './components/FAQ';
import Footer from './components/Footer';

function App() {
  return (
    <div className="min-h-screen bg-[#FDF8F6]">
      <NavBar />
      <Hero />
      <Benefits />
      <FeaturedProducts />
      <Story />
      <FAQ />
      <Footer />
    </div>
  );
}

export default App;
import React, { useState, useEffect } from 'react';
import NavBar from './components/NavBar';
import Hero from './components/Hero';
import Benefits from './components/Benefits';
import FeaturedProducts from './components/FeaturedProducts';
import Story from './components/Story';
import Testimonials from './components/Testimonials';
import Newsletter from './components/Newsletter';
import FAQ from './components/FAQ';
import Footer from './components/Footer';
import LoadingScreen from './components/LoadingScreen';
import CatalogPage from './components/Catalog/CatalogPage';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState<'home' | 'catalog'>('home');

  useEffect(() => {
    Promise.all([
      document.fonts.ready,
      new Promise(resolve => setTimeout(resolve, 200))
    ]).then(() => {
      setIsLoading(false);
    });
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-[#FDF8F6]">
      <NavBar onNavigate={(page: 'home' | 'catalog') => setCurrentPage(page)} />
      
      {currentPage === 'home' ? (
        <>
          <Hero />
          <Benefits />
          <FeaturedProducts />
          <Story />
          <Testimonials />
          <FAQ />
          <Newsletter />
        </>
      ) : (
        <CatalogPage />
      )}
      
      <Footer />
    </div>
  );
}

export default App;
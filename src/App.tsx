import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import NavBar from './components/NavBar';
import HomePage from './pages/HomePage';
import CatalogPage from './components/Catalog/CatalogPage';
import PursesPage from './pages/PursesPage';
import SweetTablePage from './pages/SweetTablePage';
import CoursesPage from './pages/CoursesPage';
import ContactPage from './pages/ContactPage';
import Footer from './components/Footer';
import LoadingScreen from './components/LoadingScreen';
import StitchedTeddiesPage from './pages/StitchedTeddiesPage';
import SweetsPage from './pages/SweetsPage';
import ContactGaby from './pages/ContactGaby';
import ChocolateDelicePage from './pages/ChocolateDelicePage';

function App() {
  const [isLoading, setIsLoading] = useState(true);

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
    <Router>
      <div className="min-h-screen bg-[#FDF8F6]">
        <NavBar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/purses" element={<PursesPage />} />
          <Route path="/sweet-table" element={<SweetTablePage />} />
          <Route path="/sweets" element={<SweetsPage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/stitched-teddies" element={<StitchedTeddiesPage />} />
          <Route path="/contact-gaby" element={<ContactGaby />} />
          <Route path="/chocolate-delice" element={<ChocolateDelicePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App
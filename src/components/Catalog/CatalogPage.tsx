import React, { useState, useMemo, useEffect } from 'react';
import { Search, SlidersHorizontal, ChevronDown, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { NextSeo, ProductJsonLd } from 'next-seo';
import ProductCard from './ProductCard';
import FilterSidebar from './FilterSidebar';
import QuickViewModal from './QuickViewModal';
import { Product } from './types';
import purse1 from '../../../assets/purse1.jpg';
import purse2 from '../../../assets/purse2.jpg';
import purse2V2 from '../../../assets/purse2-V2.jpg';
import purse3 from '../../../assets/purse3.jpg';
import purse4 from '../../../assets/purse4.jpg';
import purse5 from '../../../assets/purse5.jpg';
import purse6 from '../../../assets/purse6.jpg';
import purse7 from '../../../assets/purse7.jpg';
import purse8 from '../../../assets/purse8.jpg';
import purse9 from '../../../assets/purse9.jpg';
import purse10 from '../../../assets/purse10.jpg';
import purse11 from '../../../assets/purse11.jpg';
import purse12 from '../../../assets/SweetTable10.jpg';
import purse13 from '../../../assets/SweetTable12.jpg';
import purse14 from '../../../assets/SweetTable13.jpg';
import purse15 from '../../../assets/WeddingCake1.jpg';
import purse16 from '../../../assets/WeddingCake2.jpg';
import purse17 from '../../../assets/WeddingCake3.jpg';
import cupcake1 from '../../../assets/cupcakes1.jpg';
import cupcake2 from '../../../assets/cupcakes2.jpg';
import cupcakeCake from '../../../assets/CupCake-Cake.jpg';

export default function CatalogPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc'>('newest');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [hoveredProduct, setHoveredProduct] = useState<number | null>(null);
  const products: Product[] = [
    {
      id: 1,
      name: t('catalog.products.purse1.name'),
      price: 1950,
      description: t('catalog.products.purse1.description'),
      image: purse1,
      artisan: t('catalog.products.purse1.artisan'),
      region: t('catalog.products.purse1.region'),
      technique: t('catalog.products.purse1.technique'),
      category: t('catalog.categories.purse'),
    },
    {
      id: 2,
      name: t('catalog.products.purse2.name'),
      price: 2800,
      description: t('catalog.products.purse2.description'),
      image: purse2,
      additionalImages: [purse2V2],
      artisan: t('catalog.products.purse2.artisan'),
      region: t('catalog.products.purse2.region'),
      technique: t('catalog.products.purse2.technique'),
      category: t('catalog.categories.purse'),
    },
    {
      id: 3,
      name: t('catalog.products.purse3.name'),
      price: 1200,
      description: t('catalog.products.purse3.description'),
      image: purse3,
      artisan: t('catalog.products.purse3.artisan'),
      region: t('catalog.products.purse3.region'),
      technique: t('catalog.products.purse3.technique'),
      category: t('catalog.categories.purse'),
    },
    {
      id: 4,
      name: t('catalog.products.purse4.name'),
      price: 2100,
      description: t('catalog.products.purse4.description'),
      image: purse4,
      artisan: t('catalog.products.purse4.artisan'),
      region: t('catalog.products.purse4.region'),
      technique: t('catalog.products.purse4.technique'),
      category: "Peluche"
    },
    {
      id: 5,
      name: t('catalog.products.purse5.name'),
      price: 3200,
      description: t('catalog.products.purse5.description'),
      image: purse5,
      artisan: t('catalog.products.purse5.artisan'),
      region: t('catalog.products.purse5.region'),
      technique: t('catalog.products.purse5.technique'),
      category: t('catalog.categories.purse'),
    },
    {
      id: 6,
      name: t('catalog.products.purse6.name'),
      price: 850,
      description: t('catalog.products.purse6.description'),
      image: purse6,
      artisan: t('catalog.products.purse6.artisan'),
      region: t('catalog.products.purse6.region'),
      technique: t('catalog.products.purse6.technique'),
      category: "Peluche"
    },
    {
      id: 7,
      name: t('catalog.products.purse7.name'),
      price: 1800,
      description: t('catalog.products.purse7.description'),
      image: purse7,
      artisan: t('catalog.products.purse7.artisan'),
      region: t('catalog.products.purse7.region'),
      technique: t('catalog.products.purse7.technique'),
      category: "Peluche"
    },
    {
      id: 8,
      name: t('catalog.products.purse8.name'),
      price: 1500,
      description: t('catalog.products.purse8.description'),
      image: purse8,
      artisan: t('catalog.products.purse8.artisan'),
      region: t('catalog.products.purse8.region'),
      technique: t('catalog.products.purse8.technique'),
      category: t('catalog.categories.purse'),
    },
    {
      id: 9,
      name: t('catalog.products.purse9.name'),
      price: 1200,
      description: t('catalog.products.purse9.description'),
      image: purse9,
      artisan: t('catalog.products.purse9.artisan'),
      region: t('catalog.products.purse9.region'),
      technique: t('catalog.products.purse9.technique'),
      category: "Peluche"
    },
    {
      id: 10,
      name: t('catalog.products.purse10.name'),
      price: 1350,
      description: t('catalog.products.purse10.description'),
      image: purse10,
      artisan: t('catalog.products.purse10.artisan'),
      region: t('catalog.products.purse10.region'),
      technique: t('catalog.products.purse10.technique'),
      category: "Peluche"
    },
    {
      id: 11,
      name: t('catalog.products.purse11.name'),
      price: 980,
      description: t('catalog.products.purse11.description'),
      image: purse11,
      artisan: t('catalog.products.purse11.artisan'),
      region: t('catalog.products.purse11.region'),
      technique: t('catalog.products.purse11.technique'),
      category: "Peluche"
    },
    {
      id: 12,
      name: t('sweets.products.cake1.name'),
      price: 450,
      description: t('sweets.products.cake1.description'),
      image: "https://images.unsplash.com/photo-1535254973040-607b474cb50d?auto=format&fit=crop&q=80&w=1000",
      artisan:"Gaby",
      region: t('sweets.products.cake1.artisan.location'),
      technique: t('sweets.products.cake1.technique'),
      category: 'Postres',
    },
    {
      id: 13,
      name: t('sweets.products.cookie1.name'),
      price: 250,
      description: t('sweets.products.cookie1.description'),
      image: "https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?auto=format&fit=crop&q=80&w=1000",
      artisan:"Gaby",
      region: t('sweets.products.cookie1.artisan.location'),
      technique: t('sweets.products.cookie1.technique'),
      category: 'Postres',
    },
    {
      id: 14,
      name: t('sweets.products.cake2.name'),
      price: 500,
      description: t('sweets.products.cake2.description'),
      image: "https://images.unsplash.com/photo-1562440499-64c9a111f713?auto=format&fit=crop&q=80&w=1000",
      artisan:"Gaby",
      region: t('sweets.products.cake2.artisan.location'),
      technique: t('sweets.products.cake2.technique'),
      category: 'Postres',
    },
    {
      id: 15,
      name: t('sweets.products.sweet1.name'),
      price: 180,
      description: t('sweets.products.sweet1.description'),
      image: "https://images.unsplash.com/photo-1531594652722-292a43e752b4?auto=format&fit=crop&q=80&w=1000",
      artisan: "Gaby",
      region: t('sweets.products.sweet1.artisan.location'),
      technique: t('sweets.products.sweet1.technique'),
      category: 'Postres',
    },
    {
      id: 16,
      name: t('sweets.products.sweet2.name'),
      price: 120,
      description: t('sweets.products.sweet2.description'),
      image: "https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&q=80&w=1000",
      artisan: "Gaby",
      region: t('sweets.products.sweet2.artisan.location'),
      technique: t('sweets.products.sweet2.technique'),
      category: 'Postres',
    },
    {
      id: 17,
      name: t('sweets.products.birthdayCake.name'),
      price: 650,
      description: t('sweets.products.birthdayCake.description'),
      image : purse12,
      images: [purse12, purse13, purse14],
      artisan: "Gaby",
      region: t('sweets.products.cake3.artisan.location'),
      technique: t('sweets.products.cake3.technique'),
      category: 'Postres'
    },
    {
      id: 18,
      name: t('sweets.products.weddingCake.name'),
      price: 1200,
      description: t('sweets.products.weddingCake.description'),
      image : purse15,
      images: [purse15, purse16, purse17],
      artisan: "Gaby",
      region: t('sweets.products.cake3.artisan.location'),
      technique: t('sweets.products.cake3.technique'),
      category: 'Postres'
    },
    {
      id: 19,
      name: t('sweets.products.cupcake.name'),
      price: 180,
      description: t('sweets.products.cupcake.description'),
      image : cupcake1,
      images: [cupcake1, cupcake2],
      artisan: "Gaby",
      region: t('sweets.products.cake3.artisan.location'),
      technique: t('sweets.products.cake3.technique'),
      category: 'Postres'
    },
    {
      id: 20,
      name: t('sweets.products.cupcakeCake.name'),
      price: 180,
      description: t('sweets.products.cupcakeCake.description'),
      image : cupcakeCake,
      images: [cupcakeCake],
      artisan: "Gaby",
      region: t('sweets.products.cake3.artisan.location'),
      technique: t('sweets.products.cake3.technique'),
      category: 'Postres'
    }
  ];
  // Update search query and filters when URL parameters change
  useEffect(() => {
    const searchFromUrl = searchParams.get('search');
    const categoryFromUrl = searchParams.get('category');

    if (searchFromUrl) {
      setSearchQuery(searchFromUrl);
      setIsSearchVisible(true);
    }

    if (categoryFromUrl) {
      setActiveFilters(prev =>
        prev.includes(categoryFromUrl) ? prev : [...prev, categoryFromUrl]
      );
    }
  }, [searchParams]);

  // Scroll progress handler
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrolled / maxScroll) * 100;
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Simulate loading state when filters change
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, [activeFilters, searchQuery, sortBy]);

  // Show notification
  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleQuickView = (product: Product) => {
    setSelectedProduct(product);
  };

  const closeQuickView = () => {
    setSelectedProduct(null);
  };

  const toggleFilter = (filter: string) => {
    setActiveFilters(prev => {
      const newFilters = prev.includes(filter)
        ? prev.filter(f => f !== filter)
        : [...prev, filter];

      // Update URL with new filters
      if (newFilters.length > 0) {
        searchParams.set('category', newFilters.join(','));
      } else {
        searchParams.delete('category');
      }
      setSearchParams(searchParams);

      return newFilters;
    });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setSearchQuery(newQuery);

    // Update URL with search parameter
    if (newQuery) {
      searchParams.set('search', newQuery);
    } else {
      searchParams.delete('search');
    }
    setSearchParams(searchParams);
  };

  const clearSearch = () => {
    setSearchQuery('');
    searchParams.delete('search');
    setSearchParams(searchParams);
  };

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let result = [...products];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        (typeof product.artisan === 'string' ? product.artisan.toLowerCase() : product.artisan.name.toLowerCase()).includes(query) ||
        product.technique.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query)
      );
    }

    // Apply category/region/technique filters
    if (activeFilters.length > 0) {
      result = result.filter(product =>
        activeFilters.some(filter =>
          product.category === filter ||
          product.region === filter ||
          product.technique === filter ||
          (filter === 'Under $1,000' && product.price < 1000) ||
          (filter === '$1,000 - $2,000' && product.price >= 1000 && product.price <= 2000) ||
          (filter === '$2,000 - $3,000' && product.price > 2000 && product.price <= 3000) ||
          (filter === 'Over $3,000' && product.price > 3000)
        )
      );
    }

    // Apply sorting
    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        result.sort((a, b) => b.id - a.id);
        break;
    }

    return result;
  }, [products, searchQuery, activeFilters, sortBy]);

  const structuredProducts = products.map(product => ({
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: [product.image, ...(product.additionalImages || [])],
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "MXN",
      availability: "https://schema.org/InStock",
      seller: {
        "@type": "Organization",
        name: "Paco & Bryan",
        areaServed: "Mexico"
      }
    },
    brand: {
      "@type": "Brand",
      name: "Paco & Bryan"
    },
    manufacturer: {
      "@type": "Organization",
      name: product.artisan,
      areaServed: product.region
    }
  }));

  return (
    <>
      <NextSeo
        title={t('catalog.meta.title')}
        description={t('catalog.meta.description')}
        canonical="https://yoursite.com/catalog"
        openGraph={{
          type: 'website',
          locale: 'es_MX',
          url: 'https://yoursite.com/catalog',
          title: t('catalog.meta.title'),
          description: t('catalog.meta.description'),
          images: [
            {
              url: 'https://yoursite.com/images/catalog-og.jpg',
              width: 1200,
              height: 630,
              alt: t('catalog.meta.ogImageAlt'),
            }
          ],
          site_name: 'Paco & Bryan',
        }}
        additionalMetaTags={[
          {
            name: 'keywords',
            content: t('catalog.meta.keywords')
          },
          {
            name: 'geo.region',
            content: 'MX'
          }
        ]}
      />
      <ProductJsonLd
        type="ItemList"
        itemListElement={structuredProducts}
      />
      <div className="min-h-screen bg-secondary-light pt-16">
        {/* Scroll Progress Bar */}
        <div 
          className="fixed top-0 left-0 h-1 bg-accent z-50 transition-all duration-300"
          style={{ width: `${scrollProgress}%` }}
        />

        {/* Notification Toast */}
        {notification && (
          <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transform transition-all duration-300 ${
            notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          } text-white animate-slide-in-right`}>
            {notification.message}
          </div>
        )}

        {/* Header with enhanced animations */}
        <div className="bg-white shadow-soft sticky top-16 z-40 transition-transform duration-300 transform">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            {/* Title and Search Toggle */}
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif text-primary">
                {t('catalog.title')}
              </h1>
              <button
                onClick={() => setIsSearchVisible(!isSearchVisible)}
                className="sm:hidden text-primary/80 hover:text-primary"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>

            {/* Search Bar - Mobile */}
            <div className={`sm:hidden mb-4 transition-all duration-300 ${isSearchVisible ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
              }`}>
              <div className="relative">
                <input
                  type="text"
                  placeholder={t('catalog.search')}
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="input pr-10"
                />
                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-10 top-1/2 transform -translate-y-1/2 text-primary/60 hover:text-primary"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary/40 w-5 h-5" />
              </div>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap gap-3 items-center">
              {/* Search Bar - Desktop */}
              <div className="hidden sm:block relative flex-grow sm:flex-grow-0 sm:w-64">
                <input
                  type="text"
                  placeholder={t('catalog.search')}
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="input pr-10"
                />
                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-10 top-1/2 transform -translate-y-1/2 text-primary/60 hover:text-primary"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary/40 w-5 h-5" />
              </div>

              {/* Filter and Sort Controls */}
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="btn btn-outline py-2 px-4 flex-1 sm:flex-none"
                >
                  <SlidersHorizontal className="w-5 h-5" />
                  <span className="ml-2">{t('catalog.filters')}</span>
                </button>
              </div>
            </div>

            {/* Active Filters */}
            {(activeFilters.length > 0 || searchQuery) && (
              <div className="flex flex-wrap gap-2 mt-4">
                <div className="w-full sm:w-auto flex flex-wrap gap-2 items-center">
                  {searchQuery && (
                    <button
                      onClick={clearSearch}
                      className="inline-flex items-center px-3 py-1 rounded-full bg-secondary/20 text-primary text-sm hover:bg-secondary/30 transition-colors duration-200"
                    >
                      Search: {searchQuery}
                      <X className="w-4 h-4 ml-1" />
                    </button>
                  )}
                  {activeFilters.map(filter => (
                    <button
                      key={filter}
                      onClick={() => toggleFilter(filter)}
                      className="inline-flex items-center px-3 py-1 rounded-full bg-secondary/20 text-primary text-sm hover:bg-secondary/30 transition-colors duration-200"
                    >
                      {filter}
                      <X className="w-4 h-4 ml-1" />
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      setActiveFilters([]);
                      clearSearch();
                    }}
                    className="text-sm text-primary/60 hover:text-primary transition-colors duration-200"
                  >
                    {t('catalog.clearAll')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content with Loading State */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 h-64 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : filteredAndSortedProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
              {filteredAndSortedProducts.map((product, index) => (
                <div 
                  key={product.id} 
                  className="relative transform transition-all duration-300"
                  style={{
                    opacity: 0,
                    animation: `fade-in-up 0.6s ease-out ${index * 0.1}s forwards`
                  }}
                  onMouseEnter={() => setHoveredProduct(product.id)}
                  onMouseLeave={() => setHoveredProduct(null)}
                >
                  <ProductCard
                    product={product}
                    onQuickView={() => {
                      handleQuickView(product);
                      showNotification('success', 'Quick view opened');
                    }}
                    isHovered={hoveredProduct === product.id}
                  />
                  {/* Enhanced product labels */}
                  {product.artisan === "Gaby" && (
                    <span className="absolute top-2 right-2 bg-rose-500 text-white px-3 py-1 rounded-full text-xs font-medium shadow-sm z-10 transform transition-transform duration-300 hover:scale-110">
                      {t('catalog.labels.external')}
                    </span>
                  )}
                  
                  {/* Hover overlay with additional actions */}
                  {hoveredProduct === product.id && (
                    <div className="absolute inset-0 bg-black/5 backdrop-blur-sm rounded-lg flex items-center justify-center gap-4 transition-opacity duration-300">
                      <button 
                        onClick={() => handleQuickView(product)}
                        className="btn btn-primary btn-sm transform hover:scale-110 transition-transform duration-300"
                      >
                        Quick View
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 animate-fade-in">
              <p className="text-lg text-primary/80">No products found</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setActiveFilters([]);
                  showNotification('success', 'Filters cleared');
                }}
                className="mt-4 text-accent hover:text-accent/80 transition-colors duration-200 transform hover:scale-105"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* Enhanced Filter Sidebar */}
        <FilterSidebar
          isOpen={isSidebarOpen}
          onClose={() => {
            setIsSidebarOpen(false);
            showNotification('success', 'Filters applied');
          }}
          activeFilters={activeFilters}
          onToggleFilter={toggleFilter}
        />

        {/* Enhanced Quick View Modal */}
        {selectedProduct && (
          <QuickViewModal
            product={selectedProduct}
            onClose={() => {
              closeQuickView();
              showNotification('success', 'Quick view closed');
            }}
          />
        )}
      </div>
    </>
  );
}
import React, { useState, useMemo, useEffect } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { NextSeo, ProductJsonLd } from 'next-seo';
import ProductCard from './ProductCard';
import FilterSidebar from './FilterSidebar';
import QuickViewModal from './QuickViewModal';
import { Product } from './types';
import { PublicCatalogService } from '../../services/PublicCatalogService';


export default function CatalogPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sortBy] = useState<'newest' | 'price-asc' | 'price-desc'>('newest');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [hoveredProduct, setHoveredProduct] = useState<number | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [productsData, categoriesData] = await Promise.all([
          PublicCatalogService.fetchProducts(),
          PublicCatalogService.fetchCategories()
        ]);
        setProducts(productsData.products);
        setCategories(categoriesData.categories.map(c => c.name));
      } catch (err) {
        console.error('Failed to fetch catalog data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);
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
        product.category.toLowerCase().includes(query)
      );
    }

    // Apply category filters
    if (activeFilters.length > 0) {
      result = result.filter(product =>
        activeFilters.some(filter =>
          product.category === filter ||
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
      name: "Diky Artisans",
      areaServed: "Mexico"
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
        productName="Diky Artisan Products"
        type="ItemList"
        name="Diky Artisan Products"
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
          <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transform transition-all duration-300 ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
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
          categories={categories}
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
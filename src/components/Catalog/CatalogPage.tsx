import React, { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, ChevronDown, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ProductCard from './ProductCard';
import FilterSidebar from './FilterSidebar';
import QuickViewModal from './QuickViewModal';
import { Product } from './types';

const products: Product[] = [
  {
    id: 1,
    name: "Rosa Embroidered Clutch",
    price: 1950,
    description: "Handcrafted clutch featuring delicate floral embroidery in shades of pink and coral, inspired by traditional Mexican patterns.",
    image: "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&q=80&w=800",
    artisan: "María González",
    region: "Oaxaca",
    technique: "Floral embroidery",
    category: "Clutches",
  },
  {
    id: 2,
    name: "Azul Crossbody Bag",
    price: 2800,
    description: "A versatile crossbody bag featuring intricate geometric patterns in shades of blue and gold, handwoven with love.",
    image: "https://images.unsplash.com/photo-1528812969535-4bcefc3926bb?auto=format&fit=crop&q=80&w=800",
    artisan: "Ana Ramírez",
    region: "Chiapas",
    technique: "Geometric weaving",
    category: "Crossbody",
  },
  {
    id: 3,
    name: "Verde Table Runner",
    price: 1200,
    description: "Beautiful table runner with traditional Mexican motifs in emerald green and gold threads.",
    image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&q=80&w=800",
    artisan: "Isabel López",
    region: "Puebla",
    technique: "Traditional embroidery",
    category: "Table Linens",
  },
  {
    id: 4,
    name: "Mariposa Evening Clutch",
    price: 2100,
    description: "Elegant evening clutch with butterfly motifs embroidered in metallic threads.",
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=800",
    artisan: "Carmen Ortiz",
    region: "Oaxaca",
    technique: "Metallic embroidery",
    category: "Clutches",
  },
  {
    id: 5,
    name: "Sol Tote Bag",
    price: 3200,
    description: "Spacious tote featuring sun motifs and traditional patterns in vibrant colors.",
    image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&q=80&w=800",
    artisan: "Laura Mendoza",
    region: "Guerrero",
    technique: "Mixed technique",
    category: "Totes",
  },
  {
    id: 6,
    name: "Luna Napkin Set",
    price: 850,
    description: "Set of four napkins with crescent moon and star embroidery in silver thread.",
    image: "https://images.unsplash.com/photo-1603400521630-9f2de124b33b?auto=format&fit=crop&q=80&w=800",
    artisan: "Sofia Ruiz",
    region: "Yucatán",
    technique: "Fine embroidery",
    category: "Table Linens",
  },
  {
    id: 7,
    name: "Flor Mini Crossbody",
    price: 1800,
    description: "Compact crossbody bag with delicate flower embroidery perfect for everyday use.",
    image: "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&q=80&w=800",
    artisan: "Elena Torres",
    region: "Chiapas",
    technique: "Floral embroidery",
    category: "Crossbody",
  },
  {
    id: 8,
    name: "Azteca Table Runner",
    price: 1500,
    description: "Long table runner featuring ancient Aztec-inspired geometric patterns.",
    image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&q=80&w=800",
    artisan: "Rosa Hernández",
    region: "Mexico City",
    technique: "Geometric patterns",
    category: "Table Linens",
  }
];

export default function CatalogPage() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc'>('newest');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  const handleQuickView = (product: Product) => {
    setSelectedProduct(product);
  };

  const closeQuickView = () => {
    setSelectedProduct(null);
  };

  const toggleFilter = (filter: string) => {
    setActiveFilters(prev =>
      prev.includes(filter)
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
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
        product.artisan.toLowerCase().includes(query) ||
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

  return (
    <div className="min-h-screen bg-secondary-light pt-16">
      {/* Header */}
      <div className="bg-white shadow-soft sticky top-16 z-40">
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
          <div className={`sm:hidden mb-4 transition-all duration-300 ${
            isSearchVisible ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
          }`}>
            <div className="relative">
              <input
                type="text"
                placeholder={t('catalog.search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pr-10"
              />
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
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pr-10"
              />
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

              <div className="relative flex-1 sm:flex-none">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="input appearance-none pr-10 py-2 w-full"
                >
                  <option value="newest">{t('catalog.sortBy.newest')}</option>
                  <option value="price-asc">{t('catalog.sortBy.priceLowHigh')}</option>
                  <option value="price-desc">{t('catalog.sortBy.priceHighLow')}</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary/40 w-5 h-5 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Active Filters */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              <div className="w-full sm:w-auto flex flex-wrap gap-2 items-center">
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
                  onClick={() => setActiveFilters([])}
                  className="text-sm text-primary/60 hover:text-primary transition-colors duration-200"
                >
                  {t('catalog.clearAll')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredAndSortedProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
            {filteredAndSortedProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickView={() => handleQuickView(product)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-lg text-primary/80">No products found matching your criteria.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveFilters([]);
              }}
              className="mt-4 text-accent hover:text-accent/80 transition-colors duration-200"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Filter Sidebar */}
      <FilterSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeFilters={activeFilters}
        onToggleFilter={toggleFilter}
      />

      {/* Quick View Modal */}
      {selectedProduct && (
        <QuickViewModal
          product={selectedProduct}
          onClose={closeQuickView}
        />
      )}
    </div>
  );
}
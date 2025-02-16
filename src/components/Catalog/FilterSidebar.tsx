import React from 'react';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface FilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeFilters: string[];
  onToggleFilter: (filter: string) => void;
}

const filterCategories = {
  'productType': [
    'Bolso',
    "Peluche",
    "Postres",
  ],
};

export default function FilterSidebar({
  isOpen,
  onClose,
  activeFilters,
  onToggleFilter
}: FilterSidebarProps) {
  const { t } = useTranslation();

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity z-50 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="p-4 border-b border-primary/10 flex justify-between items-center">
            <h2 className="text-xl font-serif text-primary">{t('catalog.filters')}</h2>
            <button
              onClick={onClose}
              className="text-primary/80 hover:text-primary transition-colors duration-200 p-2 touch-manipulation"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {Object.entries(filterCategories).map(([category, filters]) => (
              <div key={category} className="mb-6">
                <h3 className="text-lg font-medium text-primary mb-3">
                  {t(`catalog.filterCategories.${category}`)}
                </h3>
                <div className="space-y-3">
                  {filters.map(filter => (
                    <label
                      key={filter}
                      className="flex items-center space-x-3 text-primary/80 hover:text-primary cursor-pointer touch-manipulation"
                    >
                      <input
                        type="checkbox"
                        checked={activeFilters.includes(filter)}
                        onChange={() => onToggleFilter(filter)}
                        className="form-checkbox h-5 w-5 text-accent rounded border-secondary"
                      />
                      <span className="select-none">{filter}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-primary/10">
            <button
              onClick={onClose}
              className="btn btn-primary w-full touch-manipulation"
            >
              {t('catalog.applyFilters')}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
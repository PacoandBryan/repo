import React, { useState, useCallback, useRef } from 'react';
import { ProductFormData, ProductImage, WatermarkSettings } from '../../types/product';
import { translateText } from '../../services/TranslationService';
import { addProduct } from '../../services/ProductService';
import './AddProductWizard.css';

interface AddProductWizardProps {
  onClose: () => void;
  onProductAdded: () => void;
}

const AddProductWizard: React.FC<AddProductWizardProps> = ({ onClose, onProductAdded }): JSX.Element => {
  // Form state
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ProductFormData>({
    title: { en: '', es: '' },
    description: { en: '', es: '' },
    price: 0,
    category: '',
    images: []
  });
  
  // UI state
  const [activeLanguage, setActiveLanguage] = useState<'en' | 'es'>('en');
  const [isTranslating, setIsTranslating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Watermark settings
  const [watermarkSettings, setWatermarkSettings] = useState<WatermarkSettings>({
    logo: 'diky',
    opacity: 0.5,
    scale: 0.3,
    position: 'bottomRight'
  });

  // File input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle text input changes
  const handleTextChange = async (
    field: 'title' | 'description',
    value: string,
    language: 'en' | 'es'
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        [language]: value
      }
    }));
  };

  // Handle translation
  const handleTranslate = async (field: 'title' | 'description') => {
    try {
      setIsTranslating(true);
      const sourceLanguage = activeLanguage;
      const targetLanguage = activeLanguage === 'en' ? 'es' : 'en';
      const textToTranslate = formData[field][sourceLanguage];
      
      const translatedText = await translateText(
        textToTranslate,
        sourceLanguage,
        targetLanguage
      );
      
      setFormData(prev => ({
        ...prev,
        [field]: {
          ...prev[field],
          [targetLanguage]: translatedText
        }
      }));
    } catch (error) {
      console.error('Translation error:', error);
      // TODO: Show error message to user
    } finally {
      setIsTranslating(false);
    }
  };

  // Handle image upload
  const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    setIsUploading(true);
    const newImages: ProductImage[] = Array.from(files).map(file => ({
      id: Math.random().toString(36).substring(7),
      file,
      preview: URL.createObjectURL(file),
      watermarked: '' // Will be set after watermarking
    }));

    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...newImages]
    }));
    setIsUploading(false);
  }, []);

  // Handle watermark settings change
  const handleWatermarkSettingChange = (
    setting: keyof WatermarkSettings,
    value: string | number
  ) => {
    setWatermarkSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      // Prepare image files for upload
      const imageFiles = formData.images
        .map(img => img.file)
        .filter((file): file is File => file !== null);
      
      await addProduct({
        ...formData,
        imageFiles
      });
      
      onProductAdded();
    } catch (error) {
      console.error('Submission error:', error);
      // TODO: Show error message to user
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render step indicators
  const renderStepIndicators = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3, 4].map((step) => (
        <div key={step} className="flex items-center">
          <div className={`
            w-8 h-8 rounded-full flex items-center justify-center
            ${currentStep === step 
              ? 'bg-[#f09bc0] text-white' 
              : currentStep > step 
                ? 'bg-[#fcdce4] text-gray-700' 
                : 'bg-gray-200 text-gray-400'
            }
          `}>
            {step}
          </div>
          {step < 4 && (
            <div className={`
              w-12 h-1 mx-2
              ${currentStep > step ? 'bg-[#fcdce4]' : 'bg-gray-200'}
            `} />
          )}
        </div>
      ))}
    </div>
  );

  // Render step 1: Product details
  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="flex justify-end space-x-2">
        <button
          onClick={() => setActiveLanguage('en')}
          className={`px-3 py-1 rounded-md ${
            activeLanguage === 'en' 
              ? 'bg-[#f09bc0] text-white' 
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          EN
        </button>
        <button
          onClick={() => setActiveLanguage('es')}
          className={`px-3 py-1 rounded-md ${
            activeLanguage === 'es' 
              ? 'bg-[#f09bc0] text-white' 
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          ES
        </button>
      </div>

      <div>
        <div className="flex justify-between items-center">
          <label className="block text-sm font-medium text-gray-700">
            Title
          </label>
          <button
            onClick={() => handleTranslate('title')}
            disabled={isTranslating || !formData.title[activeLanguage]}
            className="text-sm text-[#f09bc0] hover:text-[#e986b4] disabled:text-gray-400"
          >
            Translate
          </button>
        </div>
        <input
          type="text"
          value={formData.title[activeLanguage]}
          onChange={(e) => handleTextChange('title', e.target.value, activeLanguage)}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#f09bc0] focus:border-[#f09bc0]"
        />
        {activeLanguage === 'en' && formData.title.es && (
          <p className="mt-1 text-sm text-gray-500">
            Spanish: {formData.title.es}
          </p>
        )}
        {activeLanguage === 'es' && formData.title.en && (
          <p className="mt-1 text-sm text-gray-500">
            English: {formData.title.en}
          </p>
        )}
      </div>

      <div>
        <div className="flex justify-between items-center">
          <label className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <button
            onClick={() => handleTranslate('description')}
            disabled={isTranslating || !formData.description[activeLanguage]}
            className="text-sm text-[#f09bc0] hover:text-[#e986b4] disabled:text-gray-400"
          >
            Translate
          </button>
        </div>
        <textarea
          value={formData.description[activeLanguage]}
          onChange={(e) => handleTextChange('description', e.target.value, activeLanguage)}
          rows={4}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#f09bc0] focus:border-[#f09bc0]"
        />
        {activeLanguage === 'en' && formData.description.es && (
          <p className="mt-1 text-sm text-gray-500">
            Spanish: {formData.description.es}
          </p>
        )}
        {activeLanguage === 'es' && formData.description.en && (
          <p className="mt-1 text-sm text-gray-500">
            English: {formData.description.en}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Price
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">$</span>
            </div>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.price || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
              className="block w-full pl-7 pr-12 border border-gray-300 rounded-md focus:outline-none focus:ring-[#f09bc0] focus:border-[#f09bc0]"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Category
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#f09bc0] focus:border-[#f09bc0]"
          >
            <option value="">Select a category</option>
            <option value="dresses">Dresses</option>
            <option value="tops">Tops</option>
            <option value="bottoms">Bottoms</option>
            <option value="accessories">Accessories</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          onClick={onClose}
          className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
        >
          Cancel
        </button>
        <button
          onClick={() => setCurrentStep(2)}
          disabled={
            !formData.title.en || !formData.description.en || 
            !formData.title.es || !formData.description.es || 
            !formData.price || !formData.category
          }
          className="py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#f09bc0] hover:bg-[#e986b4] focus:outline-none disabled:bg-gray-300"
        >
          Next: Images
        </button>
      </div>
    </div>
  );

  // Render step 2: Image upload
  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageUpload}
          multiple
          accept="image/*"
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#f09bc0] hover:bg-[#e986b4] focus:outline-none"
        >
          <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Upload Images
        </button>
        <p className="mt-2 text-sm text-gray-500">
          Upload up to 5 images in JPG, PNG format
        </p>
      </div>

      {formData.images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {formData.images.map((image) => (
            <div key={image.id} className="relative">
              <img
                src={image.preview}
                alt="Product preview"
                className="w-full h-48 object-cover rounded-lg"
              />
              <button
                onClick={() => {
                  setFormData(prev => ({
                    ...prev,
                    images: prev.images.filter(img => img.id !== image.id)
                  }));
                }}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-between pt-4">
        <button
          onClick={() => setCurrentStep(1)}
          className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
        >
          Back
        </button>
        <button
          onClick={() => setCurrentStep(3)}
          disabled={formData.images.length === 0}
          className="py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#f09bc0] hover:bg-[#e986b4] focus:outline-none disabled:bg-gray-300"
        >
          Next: Watermark
        </button>
      </div>
    </div>
  );

  // Render step 3: Watermark settings
  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Watermark Logo
        </label>
        <div className="mt-2 grid grid-cols-3 gap-4">
          <button
            onClick={() => handleWatermarkSettingChange('logo', 'diky')}
            className={`p-4 border rounded-lg text-center ${
              watermarkSettings.logo === 'diky' 
                ? 'border-[#f09bc0] bg-[#fef4f7]' 
                : 'border-gray-300'
            }`}
          >
            Diky Logo
          </button>
          <button
            onClick={() => handleWatermarkSettingChange('logo', 'gaby')}
            className={`p-4 border rounded-lg text-center ${
              watermarkSettings.logo === 'gaby' 
                ? 'border-[#f09bc0] bg-[#fef4f7]' 
                : 'border-gray-300'
            }`}
          >
            Gaby Logo
          </button>
          <button
            onClick={() => handleWatermarkSettingChange('logo', 'custom')}
            className={`p-4 border rounded-lg text-center ${
              watermarkSettings.logo === 'custom' 
                ? 'border-[#f09bc0] bg-[#fef4f7]' 
                : 'border-gray-300'
            }`}
          >
            Custom Logo
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Opacity
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={watermarkSettings.opacity}
          onChange={(e) => handleWatermarkSettingChange('opacity', parseFloat(e.target.value))}
          className="mt-2 w-full"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Scale
        </label>
        <input
          type="range"
          min="0.1"
          max="1"
          step="0.1"
          value={watermarkSettings.scale}
          onChange={(e) => handleWatermarkSettingChange('scale', parseFloat(e.target.value))}
          className="mt-2 w-full"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Position
        </label>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {['topLeft', 'center', 'topRight', 'bottomLeft', 'bottomRight'].map((position) => (
            <button
              key={position}
              onClick={() => handleWatermarkSettingChange('position', position)}
              className={`p-2 border rounded-lg text-center text-sm ${
                watermarkSettings.position === position 
                  ? 'border-[#f09bc0] bg-[#fef4f7]' 
                  : 'border-gray-300'
              }`}
            >
              {position.replace(/([A-Z])/g, ' $1').trim()}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <button
          onClick={() => setCurrentStep(2)}
          className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
        >
          Back
        </button>
        <button
          onClick={() => setCurrentStep(4)}
          className="py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#f09bc0] hover:bg-[#e986b4] focus:outline-none"
        >
          Next: Preview
        </button>
      </div>
    </div>
  );

  // Render step 4: Preview and submit
  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-4 py-5 sm:px-6 bg-gray-50">
          <h3 className="text-lg font-medium text-gray-900">Product Preview</h3>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-gray-500">English Title</dt>
              <dd className="mt-1 text-sm text-gray-900">{formData.title.en}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Spanish Title</dt>
              <dd className="mt-1 text-sm text-gray-900">{formData.title.es}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">English Description</dt>
              <dd className="mt-1 text-sm text-gray-900">{formData.description.en}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">Spanish Description</dt>
              <dd className="mt-1 text-sm text-gray-900">{formData.description.es}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Price</dt>
              <dd className="mt-1 text-sm text-gray-900">${formData.price}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Category</dt>
              <dd className="mt-1 text-sm text-gray-900">{formData.category}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Images</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {formData.images.map((image) => (
            <img
              key={image.id}
              src={image.preview}
              alt="Product preview"
              className="w-full h-48 object-cover rounded-lg"
            />
          ))}
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <button
          onClick={() => setCurrentStep(3)}
          className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
        >
          Back
        </button>
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#f09bc0] hover:bg-[#e986b4] focus:outline-none disabled:bg-gray-300"
          >
            {isSubmitting ? 'Adding Product...' : 'Add Product'}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 overflow-y-auto z-50">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            {renderStepIndicators()}
            
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProductWizard; 
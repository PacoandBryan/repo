import React, { useState, useRef, useEffect } from 'react';
import { translateText } from '../../../services/TranslationService';
import { 
  WatermarkSettings as WatermarkSettingsType,
  applyWatermark, 
  batchProcessImages, 
  fileToDataUrl 
} from '../../../utils/ImageProcessingUtils';

// Interfaces for our component
interface MultilingualProductFormProps {
  onClose: () => void;
  onSave: (product: ProductData) => Promise<void>;
  isOpen: boolean;
}

interface ProductData {
  id?: string;
  title: {
    en: string;
    es: string;
  };
  description: {
    en: string;
    es: string;
  };
  images: string[];
  price: number;
  category: string;
  inStock: boolean;
}

// Reusing the WatermarkSettings type from our utility
type WatermarkSettings = WatermarkSettingsType;

// Step names for our multi-step form
type FormStep = 
  | 'basicInfo' 
  | 'translation' 
  | 'images' 
  | 'watermarking' 
  | 'preview';

/**
 * MultilingualProductForm Component
 * A multi-step form for adding products with bilingual support and image watermarking
 */
const MultilingualProductForm: React.FC<MultilingualProductFormProps> = ({ 
  onClose, 
  onSave,
  isOpen 
}) => {
  // Current step tracking
  const [currentStep, setCurrentStep] = useState<FormStep>('basicInfo');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  // Product data
  const [product, setProduct] = useState<ProductData>({
    title: { en: '', es: '' },
    description: { en: '', es: '' },
    images: [],
    price: 0,
    category: '',
    inStock: true
  });

  // Form state
  const [primaryLanguage, setPrimaryLanguage] = useState<'en' | 'es'>('en');
  const [translationLoading, setTranslationLoading] = useState<boolean>(false);
  
  // State for uploaded images
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [processedImages, setProcessedImages] = useState<string[]>([]);
  
  // State for watermark settings
  const [watermarkSettings, setWatermarkSettings] = useState<WatermarkSettings>({
    logo: 'diky',
    opacity: 0.3,
    scale: 0.2
  });
  
  // Refs for file inputs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const customLogoRef = useRef<HTMLInputElement>(null);

  // Form validation
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formTouched, setFormTouched] = useState<Record<string, boolean>>({});

  // Reset form when modal is opened
  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen]);

  // Reset the form to initial state
  const resetForm = () => {
    setCurrentStep('basicInfo');
    setProduct({
      title: { en: '', es: '' },
      description: { en: '', es: '' },
      images: [],
      price: 0,
      category: '',
      inStock: true
    });
    setPrimaryLanguage('en');
    setUploadedImages([]);
    setProcessedImages([]);
    setWatermarkSettings({
      logo: 'diky',
      opacity: 0.3,
      scale: 0.2,
    });
    setErrors({});
    setFormTouched({});
    setIsSubmitting(false);
  };

  // Translate all fields from selected language
  const translateAllFields = async () => {
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      setTranslationLoading(true);
      
      // Determine source and target languages
      const sourceLanguage = primaryLanguage as 'en' | 'es';
      const targetLanguage = primaryLanguage === 'en' ? 'es' : 'en';
      
      // Get fields to translate
      const titleToTranslate = product.title[sourceLanguage];
      const descriptionToTranslate = product.description[sourceLanguage];
      
      // Translate fields
      const [translatedTitle, translatedDescription] = await Promise.all([
        translateText(titleToTranslate, sourceLanguage, targetLanguage),
        translateText(descriptionToTranslate, sourceLanguage, targetLanguage)
      ]);
      
      // Update product data with translations
      setProduct(prev => ({
        ...prev,
        title: {
          ...prev.title,
          [targetLanguage]: translatedTitle
        },
        description: {
          ...prev.description,
          [targetLanguage]: translatedDescription
        }
      }));
      
      // Move to next step
      setCurrentStep('images');
    } catch (error) {
      console.error('Translation error:', error);
      setErrors(prev => ({
        ...prev,
        translation: 'Failed to translate content. Please try again or translate manually.'
      }));
    } finally {
      setIsSubmitting(false);
      setTranslationLoading(false);
    }
  };

  // Handle text input changes with translation support
  const handleTextChange = async (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: 'title' | 'description'
  ) => {
    const { value } = e.target;
    const targetLang = primaryLanguage === 'en' ? 'es' : 'en';
    
    // Mark field as touched for validation
    setFormTouched(prev => ({
      ...prev,
      [field]: true
    }));
    
    // Update the primary language field immediately
    setProduct(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        [primaryLanguage]: value
      }
    }));

    // Clear error if field is valid
    if (value.trim()) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }

    // Don't translate if empty
    if (!value.trim()) {
      setProduct(prev => ({
        ...prev,
        [field]: {
          ...prev[field],
          [targetLang]: ''
        }
      }));
      return;
    }

    // Translate after a delay (debounce)
    setTranslationLoading(true);
    try {
      const translatedText = await translateText(value, primaryLanguage, targetLang);
      setProduct(prev => ({
        ...prev,
        [field]: {
          ...prev[field],
          [targetLang]: translatedText
        }
      }));
    } catch (error) {
      console.error('Translation error:', error);
    } finally {
      setTranslationLoading(false);
    }
  };

  // Handle manual updates to the translated text
  const handleTranslatedTextChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: 'title' | 'description'
  ) => {
    const { value } = e.target;
    const targetLang = primaryLanguage === 'en' ? 'es' : 'en';
    
    setProduct(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        [targetLang]: value
      }
    }));
  };

  // Handle numeric input changes (price)
  const handleNumericChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseFloat(value);
    
    setFormTouched(prev => ({
      ...prev,
      [name]: true
    }));
    
    setProduct(prev => ({
      ...prev,
      [name]: isNaN(numValue) ? 0 : numValue
    }));
    
    // Validate price
    if (name === 'price') {
      if (isNaN(numValue) || numValue <= 0) {
        setErrors(prev => ({
          ...prev,
          price: 'Price must be a positive number'
        }));
      } else {
        setErrors(prev => ({
          ...prev,
          price: ''
        }));
      }
    }
  };

  // Handle select input changes (category, etc.)
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormTouched(prev => ({
      ...prev,
      [name]: true
    }));
    
    setProduct(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear category error if valid
    if (name === 'category' && value) {
      setErrors(prev => ({
        ...prev,
        category: ''
      }));
    }
  };

  // Handle checkbox changes (inStock, etc.)
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    
    setProduct(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  // Switch primary language
  const togglePrimaryLanguage = () => {
    setPrimaryLanguage(prev => prev === 'en' ? 'es' : 'en');
  };

  // Validate the current step
  const validateStep = (step: FormStep): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;
    
    switch (step) {
      case 'basicInfo':
        // Validate title and description in primary language
        if (!product.title[primaryLanguage].trim()) {
          newErrors.title = 'Title is required';
          isValid = false;
        }
        
        if (!product.description[primaryLanguage].trim()) {
          newErrors.description = 'Description is required';
          isValid = false;
        }
        
        if (product.price <= 0) {
          newErrors.price = 'Price must be greater than 0';
          isValid = false;
        }
        
        if (!product.category) {
          newErrors.category = 'Category is required';
          isValid = false;
        }
        break;
        
      case 'translation':
        // Validate translations are present
        const secondaryLang = primaryLanguage === 'en' ? 'es' : 'en';
        
        if (!product.title[secondaryLang].trim()) {
          newErrors.titleTranslation = `${secondaryLang === 'en' ? 'English' : 'Spanish'} title is required`;
          isValid = false;
        }
        
        if (!product.description[secondaryLang].trim()) {
          newErrors.descriptionTranslation = `${secondaryLang === 'en' ? 'English' : 'Spanish'} description is required`;
          isValid = false;
        }
        break;
        
      case 'images':
        // Validate at least one image is uploaded
        if (uploadedImages.length === 0) {
          newErrors.images = 'At least one product image is required';
          isValid = false;
        }
        break;
        
      case 'watermarking':
        // Validate watermarked images are generated
        if (processedImages.length === 0) {
          newErrors.watermarking = 'Please apply watermarks to your images';
          isValid = false;
        }
        break;
        
      case 'preview':
        // Final validation before submission
        // Check all required fields
        if (!product.title.en.trim() || !product.title.es.trim()) {
          newErrors.title = 'Title is required in both languages';
          isValid = false;
        }
        
        if (!product.description.en.trim() || !product.description.es.trim()) {
          newErrors.description = 'Description is required in both languages';
          isValid = false;
        }
        
        if (product.price <= 0) {
          newErrors.price = 'Price must be greater than 0';
          isValid = false;
        }
        
        if (!product.category) {
          newErrors.category = 'Category is required';
          isValid = false;
        }
        
        if (processedImages.length === 0) {
          newErrors.images = 'At least one watermarked product image is required';
          isValid = false;
        }
        break;
    }
    
    setErrors(newErrors);
    return isValid;
  };

  // Navigation between steps
  const goToNextStep = () => {
    const currentStepMap: Record<FormStep, FormStep> = {
      'basicInfo': 'translation',
      'translation': 'images',
      'images': 'watermarking',
      'watermarking': 'preview',
      'preview': 'preview' // Stay on preview when already there
    };
    
    const nextStep = currentStepMap[currentStep];
    
    if (validateStep(currentStep)) {
      setCurrentStep(nextStep);
    }
  };

  const goToPreviousStep = () => {
    const previousStepMap: Record<FormStep, FormStep> = {
      'basicInfo': 'basicInfo', // Stay on basic info when already there
      'translation': 'basicInfo',
      'images': 'translation',
      'watermarking': 'images',
      'preview': 'watermarking'
    };
    
    setCurrentStep(previousStepMap[currentStep]);
  };

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setUploadedImages([...uploadedImages, ...newFiles]);
      
      // Convert files to data URLs for preview
      const previewUrls = await Promise.all(
        newFiles.map(file => fileToDataUrl(file))
      );
      
      setProcessedImages([...processedImages, ...previewUrls]);
    }
  };

  // Apply watermark to all uploaded images
  const applyWatermarkToImages = async () => {
    if (uploadedImages.length === 0) return;
    
    try {
      setIsSubmitting(true);
      
      // Convert files to data URLs if not already done
      const imageUrls = await Promise.all(
        uploadedImages.map(file => fileToDataUrl(file))
      );
      
      // Process all images with watermark
      const processed = await batchProcessImages(imageUrls, watermarkSettings, {
        maxSize: 1200,
        quality: 0.8,
        format: 'jpeg'
      });
      
      setProcessedImages(processed);
      setProduct(prev => ({
        ...prev,
        images: processed
      }));
      
      setIsSubmitting(false);
      setCurrentStep('preview');
    } catch (error) {
      console.error("Error applying watermarks:", error);
      setIsSubmitting(false);
      setErrors(prev => ({
        ...prev,
        watermarking: 'Failed to process images. Please try again.'
      }));
    }
  };

  // Remove an uploaded image
  const removeImage = (index: number) => {
    setUploadedImages(prev => {
      const updated = [...prev];
      updated.splice(index, 1);
      return updated;
    });
    
    setProcessedImages(prev => {
      // Revoke object URL to avoid memory leaks
      URL.revokeObjectURL(prev[index]);
      
      const updated = [...prev];
      updated.splice(index, 1);
      return updated;
    });
    
    // Update error if no images left
    if (uploadedImages.length <= 1) {
      setErrors(prev => ({
        ...prev,
        images: 'At least one product image is required'
      }));
    }
  };

  // Handle custom logo upload
  const handleCustomLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setWatermarkSettings(prev => ({
        ...prev,
        customLogo: e.target.files![0],
        logo: 'custom'
      }));
    }
  };

  // Handle watermark setting changes
  const handleWatermarkSettingChange = (
    setting: 'logo' | 'opacity' | 'scale',
    value: string | number
  ) => {
    setWatermarkSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  // Submit the form
  const handleSubmit = async () => {
    // Final validation
    if (!validateStep('preview')) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      await onSave(product);
      onClose();
    } catch (error) {
      console.error('Error saving product:', error);
      setErrors(prev => ({
        ...prev,
        submit: 'Failed to save product'
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      // Clean up all preview URLs to avoid memory leaks
      processedImages.forEach(url => URL.revokeObjectURL(url));
      
      // Clean up custom logo URL if present
      if (watermarkSettings.customLogo) {
        URL.revokeObjectURL(URL.createObjectURL(watermarkSettings.customLogo));
      }
    };
  }, [processedImages, watermarkSettings.customLogo]);

  // Render step indicator
  const renderStepIndicator = () => {
    const steps: { name: FormStep; label: string }[] = [
      { name: 'basicInfo', label: 'Basic Info' },
      { name: 'translation', label: 'Translations' },
      { name: 'images', label: 'Images' },
      { name: 'watermarking', label: 'Watermarking' },
      { name: 'preview', label: 'Preview' }
    ];

  return (
      <div className="bg-[#fef4f7] border-b border-[#fcc4d4] px-6 py-4">
        <nav className="flex items-center">
          {steps.map((step, index) => (
            <React.Fragment key={step.name}>
              {/* Step circle */}
              <div className="flex flex-col items-center">
                <div 
                  className={`flex items-center justify-center h-8 w-8 rounded-full text-sm font-medium ${
                    currentStep === step.name
                      ? 'bg-[#f09bc0] text-white'
                      : index < steps.findIndex(s => s.name === currentStep)
                        ? 'bg-green-100 text-green-600 border border-green-600'
                        : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {index < steps.findIndex(s => s.name === currentStep) ? (
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>
                <span className={`mt-2 text-xs ${
                  currentStep === step.name
                    ? 'text-[#f09bc0] font-medium'
                    : 'text-gray-500'
                }`}>
                  {step.label}
                </span>
              </div>
              
              {/* Connector line between steps */}
              {index < steps.length - 1 && (
                <div 
                  className={`flex-1 h-0.5 mx-2 ${
                    index < steps.findIndex(s => s.name === currentStep)
                      ? 'bg-green-600'
                      : 'bg-gray-200'
                  }`}
                ></div>
              )}
            </React.Fragment>
          ))}
        </nav>
    </div>
    );
  };

  // Helper function to identify if a field has an error
  const hasError = (field: string): boolean => {
    return Object.keys(errors).includes(field) && !!errors[field];
  };

  // Helper function to get error message
  const getErrorMessage = (field: string): string => {
    return errors[field] || '';
  };

  // Main form content based on current step
  const renderFormContent = () => {
    switch (currentStep) {
      case 'basicInfo':
        return renderBasicInfoStep();
      case 'translation':
        return renderTranslationStep();
      case 'images':
        return renderImagesStep();
      case 'watermarking':
        return renderWatermarkingStep();
      case 'preview':
        return renderPreviewStep();
      default:
        return null;
    }
  };

  // Render basic info form step
  const renderBasicInfoStep = () => {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Product Information
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Enter the basic product information in your preferred language ({primaryLanguage === 'en' ? 'English' : 'Spanish'}).
            The translation will be handled in the next step.
          </p>
          
          {/* Language selector */}
          <div className="flex justify-end mb-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Primary language:</span>
              <button
                type="button"
                className={`relative inline-flex items-center px-4 py-2 rounded-l-md border ${
                  primaryLanguage === 'en'
                    ? 'bg-[#fef4f7] border-[#f09bc0] text-gray-700'
                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                }`}
                onClick={() => setPrimaryLanguage('en')}
              >
                <span className="sr-only">English</span>
                <span>English</span>
              </button>
              <button
                type="button"
                className={`relative inline-flex items-center px-4 py-2 rounded-r-md border ${
                  primaryLanguage === 'es'
                    ? 'bg-[#fef4f7] border-[#f09bc0] text-gray-700'
                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                }`}
                onClick={() => setPrimaryLanguage('es')}
              >
                <span className="sr-only">Spanish</span>
                <span>Español</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Product form fields */}
        <div className="space-y-6">
          {/* Title */}
        <div>
            <label htmlFor="product-title" className="block text-sm font-medium text-gray-700">
            {primaryLanguage === 'en' ? 'Product Title' : 'Título del Producto'} *
          </label>
            <input
              type="text"
              id="product-title"
              className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-[#f09bc0] focus:border-[#f09bc0] sm:text-sm ${
                hasError('title') ? 'border-red-300' : ''
              }`}
              value={product.title[primaryLanguage]}
              onChange={(e) => handleTextChange(e, 'title')}
              placeholder={primaryLanguage === 'en' ? 'Enter product title' : 'Ingrese el título del producto'}
            />
          {hasError('title') && (
              <p className="mt-1 text-sm text-red-600">{getErrorMessage('title')}</p>
          )}
        </div>
        
          {/* Description */}
        <div>
            <label htmlFor="product-description" className="block text-sm font-medium text-gray-700">
            {primaryLanguage === 'en' ? 'Product Description' : 'Descripción del Producto'} *
          </label>
            <textarea
              id="product-description"
              rows={4}
              className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-[#f09bc0] focus:border-[#f09bc0] sm:text-sm ${
                hasError('description') ? 'border-red-300' : ''
              }`}
              value={product.description[primaryLanguage]}
              onChange={(e) => handleTextChange(e, 'description')}
              placeholder={primaryLanguage === 'en' ? 'Enter product description' : 'Ingrese la descripción del producto'}
            />
          {hasError('description') && (
              <p className="mt-1 text-sm text-red-600">{getErrorMessage('description')}</p>
          )}
        </div>
        
          {/* Price and Category (side by side on larger screens) */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Price */}
        <div>
              <label htmlFor="product-price" className="block text-sm font-medium text-gray-700">
            {primaryLanguage === 'en' ? 'Price' : 'Precio'} *
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">$</span>
            </div>
            <input
              type="number"
              name="price"
              id="product-price"
              min="0.01"
              step="0.01"
                  className={`block w-full pl-7 pr-12 border-gray-300 rounded-md focus:ring-[#f09bc0] focus:border-[#f09bc0] sm:text-sm ${
                hasError('price') ? 'border-red-300' : ''
              }`}
              placeholder="0.00"
              value={product.price || ''}
              onChange={handleNumericChange}
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">USD</span>
            </div>
          </div>
          {hasError('price') && (
                <p className="mt-1 text-sm text-red-600">{getErrorMessage('price')}</p>
          )}
        </div>
        
            {/* Category */}
        <div>
              <label htmlFor="product-category" className="block text-sm font-medium text-gray-700">
            {primaryLanguage === 'en' ? 'Category' : 'Categoría'} *
          </label>
            <select
              id="product-category"
              name="category"
                className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 pl-3 pr-10 focus:ring-[#f09bc0] focus:border-[#f09bc0] sm:text-sm ${
                hasError('category') ? 'border-red-300' : ''
              }`}
              value={product.category}
              onChange={handleSelectChange}
            >
              <option value="">{primaryLanguage === 'en' ? 'Select category' : 'Seleccione una categoría'}</option>
              <option value="dresses">Dresses</option>
              <option value="tops">Tops</option>
              <option value="bottoms">Bottoms</option>
              <option value="accessories">Accessories</option>
              <option value="footwear">Footwear</option>
              <option value="outerwear">Outerwear</option>
            </select>
          {hasError('category') && (
                <p className="mt-1 text-sm text-red-600">{getErrorMessage('category')}</p>
          )}
            </div>
        </div>
        
          {/* In stock */}
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="product-inStock"
              name="inStock"
              type="checkbox"
              className="focus:ring-[#f09bc0] h-4 w-4 text-[#f09bc0] border-gray-300 rounded"
              checked={product.inStock}
              onChange={handleCheckboxChange}
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="product-inStock" className="font-medium text-gray-700">
              {primaryLanguage === 'en' ? 'In stock' : 'En existencia'}
            </label>
            <p className="text-gray-500">
              {primaryLanguage === 'en' 
                ? 'Mark if the product is available for purchase' 
                : 'Marque si el producto está disponible para la compra'}
            </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render the translation review step
  const renderTranslationStep = () => {
    const sourceLanguage = primaryLanguage;
    const targetLanguage = primaryLanguage === 'en' ? 'es' : 'en';
    
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            Review Translations
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Review and edit the automatic translations for your product information.
          </p>
        </div>
        
        {errors.translation && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  {errors.translation}
                </h3>
              </div>
            </div>
            </div>
          )}
        
        {/* Language toggle for primary language */}
        <div className="bg-white shadow-sm rounded-md border border-gray-200 p-4">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-sm font-medium text-gray-700">Primary Language</h4>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => setPrimaryLanguage('en')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md ${
                  primaryLanguage === 'en'
                    ? 'bg-[#f09bc0] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setPrimaryLanguage('es')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md ${
                  primaryLanguage === 'es'
                    ? 'bg-[#f09bc0] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Spanish
              </button>
            </div>
          </div>
        </div>
        
        {/* Product fields in both languages */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Source language column */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-700">
              {sourceLanguage === 'en' ? 'English' : 'Spanish'}
            </h4>
            
          <div>
              <label htmlFor={`title-${sourceLanguage}`} className="block text-sm font-medium text-gray-700">
                Title
            </label>
              <div className="mt-1">
              <input
                type="text"
                  id={`title-${sourceLanguage}`}
                  name={`title-${sourceLanguage}`}
                  value={product.title[sourceLanguage]}
                  onChange={(e) => handleInputChange('title', e.target.value, sourceLanguage)}
                  className="shadow-sm focus:ring-[#f09bc0] focus:border-[#f09bc0] block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
          </div>
          
          <div>
              <label htmlFor={`description-${sourceLanguage}`} className="block text-sm font-medium text-gray-700">
                Description
            </label>
              <div className="mt-1">
                <textarea
                  id={`description-${sourceLanguage}`}
                  name={`description-${sourceLanguage}`}
                  rows={4}
                  value={product.description[sourceLanguage]}
                  onChange={(e) => handleInputChange('description', e.target.value, sourceLanguage)}
                  className="shadow-sm focus:ring-[#f09bc0] focus:border-[#f09bc0] block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
          </div>
        </div>
        
          {/* Target language column */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-700 flex items-center justify-between">
              <span>{targetLanguage === 'en' ? 'English' : 'Spanish'}</span>
              {translationLoading && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  <svg className="mr-1.5 h-2 w-2 text-blue-400 animate-pulse" fill="currentColor" viewBox="0 0 8 8">
                    <circle cx="4" cy="4" r="3" />
                  </svg>
                  Translating...
                </span>
              )}
            </h4>
            
          <div>
              <label htmlFor={`title-${targetLanguage}`} className="block text-sm font-medium text-gray-700">
                Title
            </label>
              <div className="mt-1">
                <input
                  type="text"
                  id={`title-${targetLanguage}`}
                  name={`title-${targetLanguage}`}
                  value={product.title[targetLanguage]}
                  onChange={(e) => handleInputChange('title', e.target.value, targetLanguage)}
                  className="shadow-sm focus:ring-[#f09bc0] focus:border-[#f09bc0] block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
          </div>
          
          <div>
              <label htmlFor={`description-${targetLanguage}`} className="block text-sm font-medium text-gray-700">
                Description
            </label>
              <div className="mt-1">
              <textarea
                  id={`description-${targetLanguage}`}
                  name={`description-${targetLanguage}`}
                rows={4}
                  value={product.description[targetLanguage]}
                onChange={(e) => handleInputChange('description', e.target.value, targetLanguage)}
                  className="shadow-sm focus:ring-[#f09bc0] focus:border-[#f09bc0] block w-full sm:text-sm border-gray-300 rounded-md"
              />
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={translateAllFields}
            disabled={translationLoading || isSubmitting}
            className="py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed"
          >
            {translationLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
                Translating...
              </span>
            ) : 'Translate & Continue'}
          </button>
          <button
            type="button"
            onClick={() => setCurrentStep('images')}
            className="py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#f09bc0]"
          >
            Continue without Translating
          </button>
        </div>
      </div>
    );
  };

  // Render images upload form step
  const renderImagesStep = () => {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Product Images
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Upload one or more images for your product. You can add watermarks in the next step.
          </p>
        </div>
        
        {/* Image upload area */}
        <div 
          className={`border-2 border-dashed rounded-md ${
            hasError('images') 
              ? 'border-red-300 bg-red-50' 
              : 'border-gray-300 hover:border-[#f09bc0] hover:bg-[#fef4f7]'
          } px-6 py-8 transition duration-150 ease-in-out`}
        >
          <div className="text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
              />
            </svg>
            <div className="mt-3 flex justify-center">
              <input
                id="product-images"
                name="images"
                type="file"
                accept="image/*"
                multiple
                className="sr-only"
                ref={fileInputRef}
                onChange={handleImageUpload}
              />
              <label
                htmlFor="product-images"
                className="cursor-pointer py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#f09bc0] hover:bg-[#e986b4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#f09bc0]"
              >
                Select images
              </label>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              PNG, JPG, GIF up to 10MB
            </p>
          </div>
        </div>
        
        {/* Error message */}
        {hasError('images') && (
          <p className="mt-1 text-sm text-red-600">{getErrorMessage('images')}</p>
        )}
        
        {/* Preview uploaded images */}
        {processedImages.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Uploaded Images ({processedImages.length})
            </h3>
            <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {processedImages.map((preview, index) => (
                <li key={index} className="relative group">
                  <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-md bg-gray-200">
                    <img
                      src={preview}
                      alt={`Product preview ${index + 1}`}
                      className="object-cover object-center"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-red-100 rounded-full p-1 text-red-600 hover:bg-red-200 focus:outline-none"
                  >
                    <span className="sr-only">Remove</span>
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                  <p className="mt-1 text-xs text-gray-500 truncate text-center">
                    Image {index + 1}
                  </p>
                </li>
              ))}
              
              {/* Add more button */}
              <li className="relative">
                <div 
                  className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-md border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-[#f09bc0] hover:bg-[#fef4f7]"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <svg className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <p className="mt-1 text-xs text-gray-500 truncate text-center">
                  Add More
                </p>
              </li>
            </ul>
          </div>
        )}
        
        {/* Tips */}
        <div className="rounded-md bg-yellow-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Image tips
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <ul className="list-disc pl-5 space-y-1">
                  <li>Use high-quality images with good lighting</li>
                  <li>Show the product from multiple angles</li>
                  <li>Keep a consistent aspect ratio and style</li>
                  <li>For best results, use images with white or neutral backgrounds</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render watermarking form step
  const renderWatermarkingStep = () => {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            Watermark Your Product Images
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Add a watermark to protect your product images. You can select a logo and adjust settings.
          </p>
        </div>
        
        {errors.watermarking && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                </div>
                <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  {errors.watermarking}
                </h3>
                </div>
              </div>
            </div>
        )}
        
        <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
          {/* Logo selection */}
          <div className="sm:col-span-3">
            <label className="block text-sm font-medium text-gray-700">
              Watermark Logo
            </label>
            <div className="mt-1">
              <select
                value={watermarkSettings.logo}
                onChange={(e) => setWatermarkSettings({
                  ...watermarkSettings,
                  logo: e.target.value as 'diky' | 'gaby' | 'custom'
                })}
                className="shadow-sm focus:ring-[#f09bc0] focus:border-[#f09bc0] block w-full sm:text-sm border-gray-300 rounded-md"
              >
                <option value="diky">Diky Logo</option>
                <option value="gaby">Gaby Logo</option>
                <option value="custom">Custom Logo</option>
              </select>
              </div>
            </div>
            
          {/* Custom logo upload if selected */}
          {watermarkSettings.logo === 'custom' && (
            <div className="sm:col-span-3">
              <label className="block text-sm font-medium text-gray-700">
                Upload Custom Logo
              </label>
              <div className="mt-1 flex items-center">
                  <input
                    type="file"
                    accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setWatermarkSettings({
                        ...watermarkSettings,
                        customLogo: e.target.files[0]
                      });
                    }
                  }}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-medium
                    file:bg-[#f09bc0] file:text-white
                    hover:file:bg-[#e986b4]"
                  />
                </div>
                </div>
          )}
          
          {/* Opacity slider */}
          <div className="sm:col-span-3">
            <label className="block text-sm font-medium text-gray-700">
              Watermark Opacity: {Math.round(watermarkSettings.opacity * 100)}%
                </label>
            <div className="mt-1">
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.05"
                value={watermarkSettings.opacity}
                onChange={(e) => setWatermarkSettings({
                  ...watermarkSettings,
                  opacity: parseFloat(e.target.value)
                })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            </div>
            
          {/* Size/scale slider */}
          <div className="sm:col-span-3">
            <label className="block text-sm font-medium text-gray-700">
              Watermark Size: {Math.round(watermarkSettings.scale * 100)}%
                </label>
            <div className="mt-1">
              <input
                type="range"
                min="0.05"
                max="0.5"
                step="0.05"
                value={watermarkSettings.scale}
                onChange={(e) => setWatermarkSettings({
                  ...watermarkSettings,
                  scale: parseFloat(e.target.value)
                })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        </div>
        
        {/* Preview uploaded images */}
        {processedImages.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Uploaded Images ({processedImages.length})
            </h3>
            <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {processedImages.map((preview, index) => (
                <li key={index} className="relative group">
                  <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-md bg-gray-200">
                    <img src={preview} alt={`Product ${index + 1}`} className="object-cover" />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 p-1 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={applyWatermarkToImages}
            className="py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#f09bc0] hover:bg-[#e986b4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#f09bc0]"
          >
            Apply Watermarks and Continue
          </button>
        </div>
      </div>
    );
  };

  // Render preview form step
  const renderPreviewStep = () => {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Product Preview
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Review your product information before adding it to the catalog.
          </p>
        </div>
        
        <div className="border border-gray-200 rounded-md overflow-hidden">
          {/* Preview header */}
          <div className="bg-[#fef4f7] px-6 py-4 border-b border-[#fcc4d4]">
            <h3 className="text-base font-medium text-gray-800">
              {product.title.en}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Category: {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
            </p>
          </div>
          
          {/* Preview body */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Product images */}
              <div className="md:col-span-1">
                {processedImages.length > 0 ? (
                  <div className="space-y-4">
                    {/* Main image */}
                    <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-md bg-gray-200">
                      <img
                        src={processedImages[0]}
                        alt={product.title.en}
                        className="object-cover object-center"
                      />
                    </div>
                    
                    {/* Thumbnail images */}
                    {processedImages.length > 1 && (
                      <div className="grid grid-cols-4 gap-2">
                        {processedImages.slice(0, 4).map((image, index) => (
                          <div key={index} className="aspect-w-1 aspect-h-1 overflow-hidden rounded-md bg-gray-200">
                            <img
                              src={image}
                              alt={`${product.title.en} ${index + 1}`}
                              className="object-cover object-center"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="aspect-w-1 aspect-h-1 w-full flex items-center justify-center bg-gray-100 rounded-md">
                    <p className="text-gray-400 text-center">No images available</p>
                  </div>
                )}
              </div>
              
              {/* Product details */}
              <div className="md:col-span-2 space-y-6">
                <div>
                  <h3 className="font-medium text-gray-900 text-lg">English Details</h3>
                  <div className="mt-2 p-4 bg-white border border-gray-200 rounded-md">
                    <h4 className="text-xl font-medium text-gray-900">{product.title.en}</h4>
                    <p className="mt-2 text-gray-700 whitespace-pre-line">{product.description.en}</p>
                    <div className="mt-4 flex items-center">
                      <p className="text-lg font-medium text-gray-900">${product.price.toFixed(2)}</p>
                      <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        product.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {product.inStock ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900 text-lg">Spanish Details</h3>
                  <div className="mt-2 p-4 bg-white border border-gray-200 rounded-md">
                    <h4 className="text-xl font-medium text-gray-900">{product.title.es}</h4>
                    <p className="mt-2 text-gray-700 whitespace-pre-line">{product.description.es}</p>
                    <div className="mt-4 flex items-center">
                      <p className="text-lg font-medium text-gray-900">${product.price.toFixed(2)}</p>
                      <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        product.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {product.inStock ? 'En Existencia' : 'Agotado'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Handle input changes
  const handleInputChange = (
    field: keyof ProductData, 
    value: string,
    language: 'en' | 'es'
  ) => {
    setProduct(prev => {
      if (field === 'title' || field === 'description') {
        return {
          ...prev,
          [field]: {
            ...prev[field],
            [language]: value
          }
        };
      }
      return prev;
    });
    
    // Clear error if present
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  return (
    <>
      {/* Modal backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity z-40"
          onClick={onClose}
        ></div>
      )}
      
      {/* Modal dialog */}
      <div 
        className={`fixed inset-0 z-50 overflow-y-auto ${!isOpen ? 'hidden' : ''}`}
        aria-labelledby="modal-title" 
        role="dialog" 
        aria-modal="true"
      >
        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
          
          <div 
            className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="bg-gradient-to-r from-[#fcdce4] to-[#fcc4d4] px-6 py-4 flex justify-between items-center">
              <h3 className="text-lg leading-6 font-medium text-gray-800" id="modal-title">
                Add New Product
              </h3>
              <button
                type="button"
                className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                onClick={onClose}
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Step indicator */}
            {renderStepIndicator()}
            
            {/* Form content */}
            <div className="bg-white px-6 py-6">
              {renderFormContent()}
            </div>
            
            {/* Form errors */}
            {errors.submit && (
              <div className="px-6 py-3 bg-red-50 border-t border-red-100">
                <p className="text-sm text-red-600">{errors.submit}</p>
              </div>
            )}
            
            {/* Form actions */}
            <div className="px-6 py-4 bg-gray-50 flex justify-between">
              <button
                type="button"
                className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#f09bc0]"
                onClick={currentStep === 'basicInfo' ? onClose : goToPreviousStep}
              >
                {currentStep === 'basicInfo' ? 'Cancel' : 'Back'}
              </button>
              
              <div className="flex space-x-3">
                {currentStep === 'preview' && (
                  <button
                    type="button"
                    className="py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#f09bc0] hover:bg-[#e986b4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#f09bc0]"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Saving...' : 'Add Product'}
                  </button>
                )}
                
                {currentStep !== 'preview' && (
                  <button
                    type="button"
                    className="py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#f09bc0] hover:bg-[#e986b4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#f09bc0]"
                    onClick={goToNextStep}
                  >
                    Next
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MultilingualProductForm; 
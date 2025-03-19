import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import DikyLogo from '../../../images/Dikylogo.jpg';
import GabyLogo from '../../../images/Gabylogo.jpg';

interface ProductFormProps {
  onClose: () => void;
  onSave: (product: ProductData) => Promise<void>;
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
  createdAt?: Date;
}

interface WatermarkSettings {
  logo: 'diky' | 'gaby' | 'custom';
  opacity: number;
  scale: number;
  customLogo?: File;
  position: 'center' | 'bottomRight' | 'bottomLeft' | 'topRight' | 'topLeft';
}

const ProductForm: React.FC<ProductFormProps> = ({ onClose, onSave }) => {
  // Step tracking
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Product data
  const [product, setProduct] = useState<ProductData>({
    title: { en: '', es: '' },
    description: { en: '', es: '' },
    images: [],
    price: 0,
    category: '',
  });

  // Form state
  const [primaryLanguage, setPrimaryLanguage] = useState<'en' | 'es'>('en');
  const [translationLoading, setTranslationLoading] = useState<boolean>(false);
  const [watermarkSettings, setWatermarkSettings] = useState<WatermarkSettings>({
    logo: 'diky',
    opacity: 0.5,
    scale: 0.3,
    position: 'bottomRight',
  });
  
  // File inputs
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [watermarkedImages, setWatermarkedImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const customLogoRef = useRef<HTMLInputElement>(null);

  // Error handling
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Creating a new state for the preview image and a useEffect to update it
  const [previewWatermark, setPreviewWatermark] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  // Mock translation function (in a real app, you'd use an API)
  const translateText = async (text: string, from: 'en' | 'es', to: 'en' | 'es'): Promise<string> => {
    // Simulate API call
    setTranslationLoading(true);
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simple mock translations for demo purposes
        const mockTranslations: Record<string, string> = {
          // English to Spanish
          'Product Title': 'Título del Producto',
          'Product Description': 'Descripción del Producto',
          // Spanish to English
          'Título del Producto': 'Product Title',
          'Descripción del Producto': 'Product Description',
        };
        
        setTranslationLoading(false);
        resolve(mockTranslations[text] || `[Translated] ${text}`);
      }, 1000);
    });
  };

  // Handle text change and trigger translation
  const handleTextChange = async (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: 'title' | 'description'
  ) => {
    const { value } = e.target;
    const targetLang = primaryLanguage === 'en' ? 'es' : 'en';
    
    // Update the primary language field immediately
    setProduct((prev) => ({
      ...prev,
      [field]: {
        ...prev[field],
        [primaryLanguage]: value
      }
    }));

    // Don't translate if empty
    if (!value.trim()) {
      setProduct((prev) => ({
        ...prev,
        [field]: {
          ...prev[field],
          [targetLang]: ''
        }
      }));
      return;
    }

    // Translate after a delay (debounce)
    const timeoutId = setTimeout(async () => {
      try {
        const translatedText = await translateText(value, primaryLanguage, targetLang);
        setProduct((prev) => ({
          ...prev,
          [field]: {
            ...prev[field],
            [targetLang]: translatedText
          }
        }));
      } catch (error) {
        console.error('Translation error:', error);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newImages = Array.from(e.target.files);
      setUploadedImages((prev) => [...prev, ...newImages]);
      
      // Create preview URLs
      const newPreviews = newImages.map(file => URL.createObjectURL(file));
      setPreviewImages((prev) => [...prev, ...newPreviews]);
    }
  };

  // Handle custom logo upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setWatermarkSettings(prev => ({
        ...prev,
        customLogo: e.target.files![0],
        logo: 'custom'
      }));
    }
  };

  // Remove image
  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
    setPreviewImages(prev => {
      // Revoke the object URL to avoid memory leaks
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
    setWatermarkedImages(prev => prev.filter((_, i) => i !== index));
  };

  // Apply watermark to images
  const applyWatermark = async () => {
    // Reset watermarked images
    setWatermarkedImages([]);
    
    // Get logo source based on selection
    let logoSrc: string;
    if (watermarkSettings.logo === 'diky') {
      logoSrc = DikyLogo;
    } else if (watermarkSettings.logo === 'gaby') {
      logoSrc = GabyLogo;
    } else if (watermarkSettings.customLogo) {
      logoSrc = URL.createObjectURL(watermarkSettings.customLogo);
    } else {
      // Fallback to Diky logo if no custom logo selected
      logoSrc = DikyLogo;
    }

    // Load the logo image
    const logoImg = new Image();
    logoImg.src = logoSrc;
    
    await new Promise<void>((resolve) => {
      logoImg.onload = () => resolve();
    });

    // Process each image
    const watermarked: string[] = [];
    
    for (const image of previewImages) {
      const img = new Image();
      img.src = image;
      
      await new Promise<void>((resolve) => {
        img.onload = () => resolve();
      });
      
      // Create canvas and context
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        // Draw original image
        ctx.drawImage(img, 0, 0);
        
        // Calculate scaled logo size
        const logoWidth = img.width * watermarkSettings.scale;
        const logoHeight = (logoImg.height / logoImg.width) * logoWidth;
        
        // Set opacity
        ctx.globalAlpha = watermarkSettings.opacity;
        
        // Calculate position based on setting
        let x = 0;
        let y = 0;
        
        switch (watermarkSettings.position) {
          case 'center':
            x = (img.width - logoWidth) / 2;
            y = (img.height - logoHeight) / 2;
            break;
          case 'topLeft':
            x = 20;
            y = 20;
            break;
          case 'topRight':
            x = img.width - logoWidth - 20;
            y = 20;
            break;
          case 'bottomLeft':
            x = 20;
            y = img.height - logoHeight - 20;
            break;
          case 'bottomRight':
          default:
            x = img.width - logoWidth - 20;
            y = img.height - logoHeight - 20;
            break;
        }
        
        // Draw logo at calculated position
        ctx.drawImage(
          logoImg,
          x,
          y,
          logoWidth,
          logoHeight
        );
        
        // Reset opacity
        ctx.globalAlpha = 1.0;
        
        // Convert to data URL
        const watermarkedUrl = canvas.toDataURL('image/jpeg');
        watermarked.push(watermarkedUrl);
      }
    }
    
    setWatermarkedImages(watermarked);
  };

  // Validate current step
  const validateStep = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    switch (currentStep) {
      case 1:
        if (!product.title.en && !product.title.es) {
          newErrors.title = 'Title is required in at least one language';
        }
        if (!product.description.en && !product.description.es) {
          newErrors.description = 'Description is required in at least one language';
        }
        break;
      case 2:
        if (uploadedImages.length === 0) {
          newErrors.images = 'At least one image is required';
        }
        break;
      case 3:
        // Additional validation for price, etc.
        if (!product.price || product.price <= 0) {
          newErrors.price = 'Please enter a valid price';
        }
        if (!product.category) {
          newErrors.category = 'Please select a category';
        }
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle step navigation
  const goToNextStep = () => {
    if (validateStep()) {
      if (currentStep === 2) {
        // Apply watermark before preview
        applyWatermark();
      }
      setCurrentStep(prev => prev + 1);
    }
  };

  const goToPreviousStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (validateStep()) {
      setIsSubmitting(true);
      try {
        // In a real app, you'd upload the images to storage and get URLs
        // For this mock, we'll use the watermarked images directly
        const finalProduct = {
          ...product,
          images: watermarkedImages,
          createdAt: new Date()
        };
        
        await onSave(finalProduct);
        onClose();
      } catch (error) {
        console.error('Error saving product:', error);
        setErrors({ submit: 'Failed to save product. Please try again.' });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      previewImages.forEach(url => URL.revokeObjectURL(url));
      if (watermarkSettings.logo === 'custom' && watermarkSettings.customLogo) {
        URL.revokeObjectURL(URL.createObjectURL(watermarkSettings.customLogo));
      }
    };
  }, [previewImages, watermarkSettings]);

  // Apply watermark when settings change or images change
  useEffect(() => {
    if (currentStep === 2 && previewImages.length > 0) {
      applyWatermark();
    }
  }, [watermarkSettings, previewImages]);

  // Update preview when watermark settings change or when an image is selected
  useEffect(() => {
    const generatePreview = async () => {
      if (previewImages.length === 0) return;
      
      setPreviewLoading(true);
      
      try {
        // Use the first image for preview
        const previewImg = new Image();
        previewImg.src = previewImages[0];
        
        await new Promise<void>((resolve) => {
          previewImg.onload = () => resolve();
        });
        
        // Get logo source based on selection
        let logoSrc: string;
        if (watermarkSettings.logo === 'diky') {
          logoSrc = DikyLogo;
        } else if (watermarkSettings.logo === 'gaby') {
          logoSrc = GabyLogo;
        } else if (watermarkSettings.customLogo) {
          logoSrc = URL.createObjectURL(watermarkSettings.customLogo);
        } else {
          // Fallback to Diky logo if no custom logo selected
          logoSrc = DikyLogo;
        }
        
        // Load the logo image
        const logoImg = new Image();
        logoImg.src = logoSrc;
        
        await new Promise<void>((resolve) => {
          logoImg.onload = () => resolve();
        });
        
        // Create canvas and context
        const canvas = document.createElement('canvas');
        canvas.width = previewImg.width;
        canvas.height = previewImg.height;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          // Draw original image
          ctx.drawImage(previewImg, 0, 0);
          
          // Calculate scaled logo size
          const logoWidth = previewImg.width * watermarkSettings.scale;
          const logoHeight = (logoImg.height / logoImg.width) * logoWidth;
          
          // Set opacity
          ctx.globalAlpha = watermarkSettings.opacity;
          
          // Calculate position based on setting
          let x = 0;
          let y = 0;
          
          switch (watermarkSettings.position) {
            case 'center':
              x = (previewImg.width - logoWidth) / 2;
              y = (previewImg.height - logoHeight) / 2;
              break;
            case 'topLeft':
              x = 20;
              y = 20;
              break;
            case 'topRight':
              x = previewImg.width - logoWidth - 20;
              y = 20;
              break;
            case 'bottomLeft':
              x = 20;
              y = previewImg.height - logoHeight - 20;
              break;
            case 'bottomRight':
            default:
              x = previewImg.width - logoWidth - 20;
              y = previewImg.height - logoHeight - 20;
              break;
          }
          
          // Draw logo at calculated position
          ctx.drawImage(
            logoImg,
            x,
            y,
            logoWidth,
            logoHeight
          );
          
          // Reset opacity
          ctx.globalAlpha = 1.0;
          
          // Convert to data URL
          const watermarkedUrl = canvas.toDataURL('image/jpeg');
          setPreviewWatermark(watermarkedUrl);
        }
        
        // Clean up custom logo URL if used
        if (watermarkSettings.logo === 'custom' && watermarkSettings.customLogo) {
          URL.revokeObjectURL(logoSrc);
        }
      } catch (error) {
        console.error('Error generating preview:', error);
      } finally {
        setPreviewLoading(false);
      }
    };
    
    generatePreview();
  }, [watermarkSettings, previewImages]);

  // Step 1: Product Details with Translation
  const renderProductDetailsStep = () => (
    <div className="space-y-6">
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Product Details</h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Primary Language:</span>
            <select
              value={primaryLanguage}
              onChange={(e) => setPrimaryLanguage(e.target.value as 'en' | 'es')}
              className="border border-gray-300 rounded-md py-1 px-2 text-sm focus:ring-[#f09bc0] focus:border-[#f09bc0]"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
            </select>
          </div>
        </div>
        
        {/* Primary Language Fields */}
        <div className="mb-4">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            {primaryLanguage === 'en' ? 'Title (English)' : 'Título (Español)'}
          </label>
          <input
            type="text"
            id="title"
            value={product.title[primaryLanguage]}
            onChange={(e) => handleTextChange(e, 'title')}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#f09bc0] focus:border-[#f09bc0]"
          />
          {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
        </div>
        
        <div className="mb-6">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            {primaryLanguage === 'en' ? 'Description (English)' : 'Descripción (Español)'}
          </label>
          <textarea
            id="description"
            rows={4}
            value={product.description[primaryLanguage]}
            onChange={(e) => handleTextChange(e, 'description')}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#f09bc0] focus:border-[#f09bc0]"
          />
          {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
        </div>
        
        {/* Translation Results */}
        <div className="bg-[#fef4f7] rounded-lg p-4 border border-[#fcc4d4]">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            {primaryLanguage === 'en' ? 'Spanish Translation' : 'English Translation'}
            {translationLoading && <span className="ml-2 text-xs text-gray-500">(Translating...)</span>}
          </h4>
          
          <div className="mb-3">
            <label className="block text-xs font-medium text-gray-500">
              {primaryLanguage === 'en' ? 'Título (Español)' : 'Title (English)'}
            </label>
            <input
              type="text"
              value={product.title[primaryLanguage === 'en' ? 'es' : 'en']}
              onChange={(e) => {
                const targetLang = primaryLanguage === 'en' ? 'es' : 'en';
                setProduct(prev => ({
                  ...prev,
                  title: { ...prev.title, [targetLang]: e.target.value }
                }));
              }}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#f09bc0] focus:border-[#f09bc0] bg-white"
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-500">
              {primaryLanguage === 'en' ? 'Descripción (Español)' : 'Description (English)'}
            </label>
            <textarea
              rows={3}
              value={product.description[primaryLanguage === 'en' ? 'es' : 'en']}
              onChange={(e) => {
                const targetLang = primaryLanguage === 'en' ? 'es' : 'en';
                setProduct(prev => ({
                  ...prev,
                  description: { ...prev.description, [targetLang]: e.target.value }
                }));
              }}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#f09bc0] focus:border-[#f09bc0] bg-white"
            />
          </div>
        </div>
      </div>
    </div>
  );

  // Step 2: Image Upload and Watermarking
  const renderImageUploadStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Product Images</h3>
        
        {/* Image Upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Images
          </label>
          <div className="flex items-center">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              multiple
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#f09bc0]"
            >
              <svg className="-ml-1 mr-2 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Images
            </button>
            <span className="ml-4 text-sm text-gray-500">{uploadedImages.length} image(s) selected</span>
          </div>
          {errors.images && <p className="mt-1 text-sm text-red-600">{errors.images}</p>}
          
          {/* Preview uploaded images */}
          {previewImages.length > 0 && (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
              {previewImages.map((preview, index) => (
                <div key={index} className="relative rounded-lg overflow-hidden group border border-gray-200">
                  <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-40 object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Watermark Settings */}
        <div className="mt-6 bg-[#fef4f7] rounded-lg p-4 border border-[#fcc4d4]">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Watermark Settings</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
          {/* Logo Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Logo
            </label>
            <div className="flex flex-wrap gap-4">
              <div
                onClick={() => setWatermarkSettings(prev => ({ ...prev, logo: 'diky' }))}
                className={`cursor-pointer border rounded-lg p-2 ${
                  watermarkSettings.logo === 'diky' ? 'border-[#f09bc0] bg-[#fef4f7]' : 'border-gray-200'
                }`}
              >
                <img src={DikyLogo} alt="Diky Logo" className="h-12 w-12 object-contain" />
                <span className="text-xs text-center block mt-1">Diky</span>
              </div>
              
              <div
                onClick={() => setWatermarkSettings(prev => ({ ...prev, logo: 'gaby' }))}
                className={`cursor-pointer border rounded-lg p-2 ${
                  watermarkSettings.logo === 'gaby' ? 'border-[#f09bc0] bg-[#fef4f7]' : 'border-gray-200'
                }`}
              >
                <img src={GabyLogo} alt="Gaby Logo" className="h-12 w-12 object-contain" />
                <span className="text-xs text-center block mt-1">Gaby</span>
              </div>
              
              <div
                onClick={() => customLogoRef.current?.click()}
                className={`cursor-pointer border rounded-lg p-2 ${
                  watermarkSettings.logo === 'custom' ? 'border-[#f09bc0] bg-[#fef4f7]' : 'border-gray-200'
                }`}
              >
                <div className="h-12 w-12 flex items-center justify-center bg-gray-100 rounded">
                  {watermarkSettings.customLogo ? (
                    <img 
                      src={URL.createObjectURL(watermarkSettings.customLogo)} 
                      alt="Custom Logo" 
                      className="h-10 w-10 object-contain" 
                    />
                  ) : (
                    <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  )}
                </div>
                <span className="text-xs text-center block mt-1">Custom</span>
                <input
                  type="file"
                  ref={customLogoRef}
                  onChange={handleLogoUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>
            </div>
          </div>
              
              {/* Position Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Watermark Position
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['topLeft', 'center', 'topRight', 'bottomLeft', 'bottomRight'].map((pos) => (
                    <button
                      key={pos}
                      type="button"
                      onClick={() => setWatermarkSettings(prev => ({ 
                        ...prev, 
                        position: pos as 'center' | 'bottomRight' | 'bottomLeft' | 'topRight' | 'topLeft'
                      }))}
                      className={`p-2 text-xs border rounded ${
                        watermarkSettings.position === pos 
                          ? 'border-[#f09bc0] bg-[#fef4f7] text-[#e986b4]' 
                          : 'border-gray-200 text-gray-600'
                      }`}
                    >
                      {pos === 'topLeft' ? 'Top Left' : 
                       pos === 'topRight' ? 'Top Right' :
                       pos === 'bottomLeft' ? 'Bottom Left' :
                       pos === 'bottomRight' ? 'Bottom Right' : 'Center'}
                    </button>
                  ))}
                </div>
              </div>
          
          {/* Opacity Setting */}
          <div className="mb-4">
            <label 
              htmlFor="opacity" 
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Opacity: {Math.round(watermarkSettings.opacity * 100)}%
            </label>
            <input
              type="range"
              id="opacity"
              min="0.1"
              max="1"
              step="0.05"
              value={watermarkSettings.opacity}
              onChange={(e) => setWatermarkSettings(prev => ({ 
                ...prev, 
                opacity: parseFloat(e.target.value) 
              }))}
              className="w-full accent-[#f09bc0]"
            />
          </div>
          
          {/* Scale Setting */}
          <div>
            <label 
              htmlFor="scale" 
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Size: {Math.round(watermarkSettings.scale * 100)}%
            </label>
            <input
              type="range"
              id="scale"
              min="0.1"
              max="0.6"
              step="0.05"
              value={watermarkSettings.scale}
              onChange={(e) => setWatermarkSettings(prev => ({ 
                ...prev, 
                scale: parseFloat(e.target.value) 
              }))}
              className="w-full accent-[#f09bc0]"
            />
          </div>
        </div>
            
            {/* Live Preview */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Watermark Preview
              </label>
              <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center h-64">
                {previewImages.length === 0 ? (
                  <div className="text-center p-4">
                    <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="mt-2 text-sm text-gray-500">Upload an image to see the watermark preview</p>
                  </div>
                ) : previewLoading ? (
                  <div className="text-center">
                    <svg className="animate-spin h-8 w-8 text-[#f09bc0] mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="mt-2 text-sm text-gray-500">Generating preview...</p>
                  </div>
                ) : previewWatermark ? (
                  <img 
                    src={previewWatermark} 
                    alt="Watermark Preview" 
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <p className="text-sm text-gray-500">Error generating preview</p>
                )}
              </div>
              <p className="mt-2 text-xs text-gray-500 italic">
                Preview updates automatically as you adjust watermark settings
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Step 3: Product Preview
  const renderPreviewStep = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Product Preview</h3>
      
      {/* Image Preview */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Product Images</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {watermarkedImages.map((img, index) => (
            <div key={index} className="rounded-lg overflow-hidden border border-gray-200">
              <img src={img} alt={`Product ${index + 1}`} className="w-full h-40 object-cover" />
            </div>
          ))}
        </div>
      </div>
      
      {/* Product Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-2">English Details</h4>
          <h3 className="text-xl font-semibold mb-2">{product.title.en}</h3>
          <p className="text-gray-600">{product.description.en}</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Spanish Details</h4>
          <h3 className="text-xl font-semibold mb-2">{product.title.es}</h3>
          <p className="text-gray-600">{product.description.es}</p>
        </div>
      </div>
      
      {/* Additional Product Details */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
            Price ($)
          </label>
          <input
            type="number"
            id="price"
            value={product.price || ''}
            onChange={(e) => setProduct(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#f09bc0] focus:border-[#f09bc0]"
            placeholder="0.00"
            min="0"
            step="0.01"
          />
          {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
        </div>
        
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            id="category"
            value={product.category}
            onChange={(e) => setProduct(prev => ({ ...prev, category: e.target.value }))}
            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#f09bc0] focus:border-[#f09bc0]"
          >
            <option value="">Select a category</option>
            <option value="dresses">Dresses</option>
            <option value="tops">Tops</option>
            <option value="bottoms">Bottoms</option>
            <option value="accessories">Accessories</option>
            <option value="footwear">Footwear</option>
            <option value="outerwear">Outerwear</option>
          </select>
          {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
        </div>
      </div>
      
      {/* Submission Error */}
      {errors.submit && (
        <div className="mt-4 bg-red-50 p-4 rounded-md">
          <p className="text-sm text-red-600">{errors.submit}</p>
        </div>
      )}
    </div>
  );

  // Render different steps based on currentStep
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderProductDetailsStep();
      case 2:
        return renderImageUploadStep();
      case 3:
        return renderPreviewStep();
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#fcdce4] to-[#fcc4d4] px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800">
            {currentStep === 1 ? 'Add New Product' : 
             currentStep === 2 ? 'Upload & Watermark Images' :
             'Product Preview'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Progress Bar */}
        <div className="px-6 pt-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                currentStep >= 1 ? 'bg-[#f09bc0] text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                1
              </div>
              <div className={`h-1 w-10 mx-1 ${
                currentStep > 1 ? 'bg-[#f09bc0]' : 'bg-gray-200'
              }`}></div>
            </div>
            <div className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                currentStep >= 2 ? 'bg-[#f09bc0] text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                2
              </div>
              <div className={`h-1 w-10 mx-1 ${
                currentStep > 2 ? 'bg-[#f09bc0]' : 'bg-gray-200'
              }`}></div>
            </div>
            <div className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                currentStep >= 3 ? 'bg-[#f09bc0] text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                3
              </div>
            </div>
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>Product Details</span>
            <span>Images & Watermark</span>
            <span>Preview & Save</span>
          </div>
        </div>
        
        {/* Content */}
        <div className="px-6 py-4 flex-1 overflow-y-auto">
          {renderStepContent()}
        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 flex justify-between">
          <button
            type="button"
            onClick={currentStep === 1 ? onClose : goToPreviousStep}
            className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#f09bc0]"
            disabled={isSubmitting}
          >
            {currentStep === 1 ? 'Cancel' : 'Back'}
          </button>
          <button
            type="button"
            onClick={currentStep === 3 ? handleSubmit : goToNextStep}
            className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#f09bc0] hover:bg-[#e986b4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#f09bc0]"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : currentStep === 3 ? 'Add Product' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductForm; 
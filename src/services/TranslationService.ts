import axios from 'axios';

// Default API configuration 
const DEFAULT_CONFIG = {
  // MyMemory Translation API - Free tier allows 1000 words/day
  mymemory: {
    baseUrl: 'https://api.mymemory.translated.net/get',
    email: process.env.REACT_APP_TRANSLATION_EMAIL, // Optional: increases daily limit if provided
  },
  // LibreTranslate API - public instances available or self-host
  libretranslate: {
    baseUrl: process.env.REACT_APP_LIBRETRANSLATE_URL || 'https://libretranslate.de/translate',
    apiKey: process.env.REACT_APP_LIBRETRANSLATE_API_KEY,
  },
  // Which API to use ('mymemory', 'libretranslate', or 'mock')
  provider: process.env.REACT_APP_TRANSLATION_PROVIDER || 'mymemory',
  // Fallback to mock if real API fails
  fallbackToMock: true
};

// Get API configuration from localStorage or use defaults
const getApiConfig = () => {
  try {
    const savedSettings = localStorage.getItem('translationSettings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      
      return {
        mymemory: {
          baseUrl: 'https://api.mymemory.translated.net/get',
          email: parsed.email || DEFAULT_CONFIG.mymemory.email,
        },
        libretranslate: {
          baseUrl: parsed.libreTranslateUrl || DEFAULT_CONFIG.libretranslate.baseUrl,
          apiKey: parsed.libreTranslateApiKey || DEFAULT_CONFIG.libretranslate.apiKey,
        },
        provider: parsed.provider || DEFAULT_CONFIG.provider,
        fallbackToMock: parsed.fallbackToMock !== undefined ? parsed.fallbackToMock : DEFAULT_CONFIG.fallbackToMock
      };
    }
  } catch (e) {
    console.error('Failed to parse saved translation settings, using defaults');
  }
  
  return DEFAULT_CONFIG;
};

// Language codes mapping (ISO 639-1 for standard APIs)
const LANGUAGE_CODES = {
  en: 'en',
  es: 'es',
};

// Cache for translations to avoid redundant API calls
const translationCache: Record<string, Record<string, string>> = {
  en: {},
  es: {}
};

/**
 * Translates text from one language to another
 * 
 * @param text - The text to translate
 * @param sourceLanguage - Source language code ('en' or 'es')
 * @param targetLanguage - Target language code ('en' or 'es')
 * @returns Promise with translated text
 */
export const translateText = async (
  text: string,
  sourceLanguage: 'en' | 'es',
  targetLanguage: 'en' | 'es'
): Promise<string> => {
  // Don't translate empty text
  if (!text.trim()) {
    return '';
  }
  
  // Return original text if source and target are the same
  if (sourceLanguage === targetLanguage) {
    return text;
  }
  
  // Get current API configuration
  const API_CONFIG = getApiConfig();
  
  // Check cache first
  const cacheKey = `${text}`;
  if (translationCache[sourceLanguage][cacheKey]) {
    console.log('Translation found in cache');
    return translationCache[sourceLanguage][cacheKey];
  }

  try {
    let translatedText: string;
    
    // Select translation provider based on configuration
    switch (API_CONFIG.provider) {
      case 'mymemory':
        translatedText = await translateWithMyMemory(text, sourceLanguage, targetLanguage, API_CONFIG);
        break;
      case 'libretranslate':
        translatedText = await translateWithLibreTranslate(text, sourceLanguage, targetLanguage, API_CONFIG);
        break;
      default:
        translatedText = await mockTranslation(text, sourceLanguage, targetLanguage);
    }
    
    // Store in cache
    translationCache[sourceLanguage][cacheKey] = translatedText;
    
    return translatedText;
  } catch (error) {
    console.error('Translation error:', error);
    
    // Try fallback to mock if real API failed
    if (API_CONFIG.fallbackToMock && API_CONFIG.provider !== 'mock') {
      console.log('Falling back to mock translation');
      const mockResult = await mockTranslation(text, sourceLanguage, targetLanguage);
      translationCache[sourceLanguage][cacheKey] = mockResult;
      return mockResult;
    }
    
    throw new Error('Failed to translate text');
  }
};

/**
 * Translate text using MyMemory Translation API
 * Free tier: https://mymemory.translated.net/doc/spec.php
 */
const translateWithMyMemory = async (
  text: string,
  sourceLanguage: 'en' | 'es',
  targetLanguage: 'en' | 'es',
  config: typeof DEFAULT_CONFIG
): Promise<string> => {
  try {
    // Format: langpair=en|it
    const langPair = `${LANGUAGE_CODES[sourceLanguage]}|${LANGUAGE_CODES[targetLanguage]}`;
    
    // Construct URL with query parameters
    let url = `${config.mymemory.baseUrl}?q=${encodeURIComponent(text)}&langpair=${langPair}`;
    
    // Add email if provided (increases daily limit)
    if (config.mymemory.email) {
      url += `&de=${encodeURIComponent(config.mymemory.email)}`;
    }
    
    // Send GET request
    const response = await axios.get(url);
    
    // Check if the response contains a translation
    if (response.data && 
        response.data.responseData && 
        response.data.responseData.translatedText) {
      return response.data.responseData.translatedText;
    }
    
    // Check if there are matches we can use
    if (response.data && 
        response.data.matches && 
        response.data.matches.length > 0 &&
        response.data.matches[0].translation) {
      return response.data.matches[0].translation;
    }
    
    throw new Error('Invalid or empty translation response');
  } catch (error) {
    console.error('MyMemory Translation API error:', error);
    throw new Error('Translation service unavailable');
  }
};

/**
 * Translate text using LibreTranslate API
 * Free & open source: https://libretranslate.com/
 */
const translateWithLibreTranslate = async (
  text: string,
  sourceLanguage: 'en' | 'es',
  targetLanguage: 'en' | 'es',
  config: typeof DEFAULT_CONFIG
): Promise<string> => {
  try {
    const payload = {
      q: text,
      source: LANGUAGE_CODES[sourceLanguage],
      target: LANGUAGE_CODES[targetLanguage],
      format: 'text',
      api_key: config.libretranslate.apiKey || ''
    };
    
    const response = await axios.post(
      config.libretranslate.baseUrl,
      payload,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (response.data && response.data.translatedText) {
      return response.data.translatedText;
    }
    
    throw new Error('Invalid API response');
  } catch (error) {
    console.error('LibreTranslate API error:', error);
    throw new Error('Translation service unavailable');
  }
};

/**
 * Mock translation for development and testing
 */
const mockTranslation = async (
  text: string,
  sourceLanguage: 'en' | 'es',
  targetLanguage: 'en' | 'es'
): Promise<string> => {
  // Simulate API delay
  return new Promise((resolve) => {
    setTimeout(() => {
      // Get or create mock translations dictionary
      const mockTranslations = getMockTranslations();
      
      // Try to find a mock translation, or just append translation indicator
      const mockResult = 
        mockTranslations[sourceLanguage][text] || 
        generatePlaceholderTranslation(text, sourceLanguage, targetLanguage);
            
      resolve(mockResult);
    }, 800); // Simulate a realistic API delay
  });
};

/**
 * Generate a placeholder translation for text not in our dictionary
 */
const generatePlaceholderTranslation = (
  text: string, 
  sourceLanguage: 'en' | 'es', 
  targetLanguage: 'en' | 'es'
): string => {
  // For short texts, attempt syllable-based mock translation
  if (text.length < 50) {
    if (targetLanguage === 'es' && sourceLanguage === 'en') {
      // Basic English to Spanish mock rules
      return text
        .replace(/(\w)tion/g, '$1ción')
        .replace(/(\w)ty\b/g, '$1dad')
        .replace(/\b(\w+)y\b/g, '$1ia')
        .replace(/\b(\w+)ed\b/g, '$1ado');
    } else if (targetLanguage === 'en' && sourceLanguage === 'es') {
      // Basic Spanish to English mock rules
      return text
        .replace(/(\w)ción/g, '$1tion')
        .replace(/(\w)dad\b/g, '$1ty')
        .replace(/\b(\w+)ia\b/g, '$1y')
        .replace(/\b(\w+)ado\b/g, '$1ed');
    }
  }
  
  // Default placeholder
  return `[${targetLanguage.toUpperCase()}] ${text}`;
};

/**
 * Get dictionary of mock translations
 */
const getMockTranslations = (): Record<string, Record<string, string>> => {
  return {
    en: {
      // Product-related terms
      'Hello': 'Hola',
      'Welcome to our store': 'Bienvenido a nuestra tienda',
      'Product': 'Producto',
      'Products': 'Productos',
      'Category': 'Categoría',
      'Categories': 'Categorías',
      'Price': 'Precio',
      'Description': 'Descripción',
      'Image': 'Imagen',
      'Images': 'Imágenes',
      'Add to cart': 'Añadir al carrito',
      'Buy now': 'Comprar ahora',
      'In stock': 'En existencia',
      'Out of stock': 'Agotado',
      'Related products': 'Productos relacionados',
      
      // Common product descriptions
      'Beautiful dress with floral pattern': 'Hermoso vestido con estampado floral',
      'This elegant dress features a beautiful floral pattern and is perfect for summer.': 
        'Este elegante vestido presenta un hermoso estampado floral y es perfecto para el verano.',
      'Comfortable casual shirt': 'Camisa casual cómoda',
      'A stylish and comfortable shirt for everyday wear.': 
        'Una camisa elegante y cómoda para el uso diario.',
      'Premium quality leather shoes': 'Zapatos de cuero de primera calidad',
      'Handcrafted leather shoes with excellent durability and comfort.': 
        'Zapatos de cuero hechos a mano con excelente durabilidad y comodidad.'
    },
    es: {
      // Spanish to English
      'Hola': 'Hello',
      'Bienvenido a nuestra tienda': 'Welcome to our store',
      'Producto': 'Product',
      'Productos': 'Products',
      'Categoría': 'Category',
      'Categorías': 'Categories',
      'Precio': 'Price',
      'Descripción': 'Description',
      'Imagen': 'Image',
      'Imágenes': 'Images',
      'Añadir al carrito': 'Add to cart',
      'Comprar ahora': 'Buy now',
      'En existencia': 'In stock',
      'Agotado': 'Out of stock',
      'Productos relacionados': 'Related products',
      
      // Spanish product descriptions
      'Hermoso vestido con estampado floral': 'Beautiful dress with floral pattern',
      'Este elegante vestido presenta un hermoso estampado floral y es perfecto para el verano.':
        'This elegant dress features a beautiful floral pattern and is perfect for summer.',
      'Camisa casual cómoda': 'Comfortable casual shirt',
      'Una camisa elegante y cómoda para el uso diario.': 
        'A stylish and comfortable shirt for everyday wear.',
      'Zapatos de cuero de primera calidad': 'Premium quality leather shoes',
      'Zapatos de cuero hechos a mano con excelente durabilidad y comodidad.': 
        'Handcrafted leather shoes with excellent durability and comfort.'
    }
  };
}; 
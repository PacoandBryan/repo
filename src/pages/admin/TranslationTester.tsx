import React, { useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { translateText } from '../../services/TranslationService';

/**
 * Translation Tester Page
 * A utility page for testing the translation capabilities
 */
const TranslationTester: React.FC = () => {
  const [sourceText, setSourceText] = useState<string>('');
  const [translatedText, setTranslatedText] = useState<string>('');
  const [sourceLanguage, setSourceLanguage] = useState<'en' | 'es'>('en');
  const [targetLanguage, setTargetLanguage] = useState<'en' | 'es'>('es');
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [translationTime, setTranslationTime] = useState<number | null>(null);
  const [wordCount, setWordCount] = useState<number>(0);
  
  const handleTranslate = async () => {
    if (!sourceText.trim()) return;
    
    setIsTranslating(true);
    setError(null);
    setTranslatedText('');
    setTranslationTime(null);
    
    try {
      const startTime = performance.now();
      
      // Call the translation service
      const result = await translateText(sourceText, sourceLanguage, targetLanguage);
      
      const endTime = performance.now();
      setTranslationTime(endTime - startTime);
      setTranslatedText(result);
      
      // Calculate word count (rough estimate)
      const words = sourceText.trim().split(/\s+/).length;
      setWordCount(words);
    } catch (error) {
      console.error('Translation error:', error);
      setError(`Translation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsTranslating(false);
    }
  };
  
  const handleSwapLanguages = () => {
    setSourceLanguage(targetLanguage);
    setTargetLanguage(sourceLanguage);
    setSourceText(translatedText);
    setTranslatedText('');
  };
  
  const handleClearAll = () => {
    setSourceText('');
    setTranslatedText('');
    setError(null);
    setTranslationTime(null);
  };
  
  const loadSampleText = (language: 'en' | 'es') => {
    if (language === 'en') {
      setSourceText('This is a beautiful dress with floral pattern. It is perfect for summer and special occasions. The fabric is lightweight and comfortable to wear all day.');
      setSourceLanguage('en');
      setTargetLanguage('es');
    } else {
      setSourceText('Este es un hermoso vestido con estampado floral. Es perfecto para el verano y ocasiones especiales. La tela es ligera y cómoda para usar todo el día.');
      setSourceLanguage('es');
      setTargetLanguage('en');
    }
  };

  return (
    <AdminLayout title="Translation Tester">
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white shadow-lg rounded-lg border border-[#fcc4d4] overflow-hidden">
            <div className="px-6 py-5 bg-gradient-to-r from-[#fcdce4] to-[#fcc4d4]">
              <h2 className="text-lg font-medium text-gray-800">Translation Tester</h2>
              <p className="mt-1 text-sm text-gray-600">Test the translation functionality with different providers</p>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Language Selection */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                  <div>
                    <label htmlFor="sourceLanguage" className="block text-sm font-medium text-gray-700 mb-1">
                      From
                    </label>
                    <select
                      id="sourceLanguage"
                      value={sourceLanguage}
                      onChange={(e) => setSourceLanguage(e.target.value as 'en' | 'es')}
                      className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[#f09bc0] focus:border-[#f09bc0] sm:text-sm rounded-md"
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                    </select>
                  </div>
                  
                  <button
                    type="button"
                    onClick={handleSwapLanguages}
                    className="mt-6 p-2 rounded-full bg-gray-100 hover:bg-gray-200 focus:outline-none"
                  >
                    <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path>
                    </svg>
                  </button>
                  
                  <div>
                    <label htmlFor="targetLanguage" className="block text-sm font-medium text-gray-700 mb-1">
                      To
                    </label>
                    <select
                      id="targetLanguage"
                      value={targetLanguage}
                      onChange={(e) => setTargetLanguage(e.target.value as 'en' | 'es')}
                      className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[#f09bc0] focus:border-[#f09bc0] sm:text-sm rounded-md"
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => loadSampleText('en')}
                    className="px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none transition-colors duration-200"
                  >
                    Load English Sample
                  </button>
                  <button
                    type="button"
                    onClick={() => loadSampleText('es')}
                    className="px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none transition-colors duration-200"
                  >
                    Load Spanish Sample
                  </button>
                </div>
              </div>
              
              {/* Text Areas */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div>
                  <label htmlFor="sourceText" className="block text-sm font-medium text-gray-700 mb-1">
                    Source Text
                  </label>
                  <textarea
                    id="sourceText"
                    rows={8}
                    value={sourceText}
                    onChange={(e) => setSourceText(e.target.value)}
                    placeholder={`Enter text in ${sourceLanguage === 'en' ? 'English' : 'Spanish'}`}
                    className="block w-full border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#f09bc0] focus:border-[#f09bc0] sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="translatedText" className="block text-sm font-medium text-gray-700 mb-1 flex justify-between">
                    <span>Translated Text</span>
                    {translationTime && (
                      <span className="text-xs text-gray-500">
                        {translationTime.toFixed(0)}ms | ~{wordCount} words
                      </span>
                    )}
                  </label>
                  <textarea
                    id="translatedText"
                    rows={8}
                    value={translatedText}
                    readOnly
                    placeholder={isTranslating ? 'Translating...' : `Translation will appear here in ${targetLanguage === 'en' ? 'English' : 'Spanish'}`}
                    className="block w-full border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#f09bc0] focus:border-[#f09bc0] sm:text-sm"
                  />
                </div>
              </div>
              
              {/* Error Message */}
              {error && (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none transition-colors duration-200"
                >
                  Clear All
                </button>
                <button
                  type="button"
                  onClick={handleTranslate}
                  disabled={isTranslating || !sourceText.trim()}
                  className="py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#f09bc0] hover:bg-[#e986b4] focus:outline-none transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isTranslating ? 'Translating...' : 'Translate'}
                </button>
              </div>
              
              {/* Translation Provider Info */}
              <div className="mt-4 p-4 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-600">
                  <strong>Translation Settings:</strong> You can configure the translation provider in the Admin Dashboard under Translation Settings.
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Available providers include MyMemory API (free tier with 1000 words/day) and LibreTranslate (open source).
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default TranslationTester; 
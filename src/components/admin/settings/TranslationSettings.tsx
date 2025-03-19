import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface TranslationSettingsProps {
  onSave?: (settings: TranslationConfig) => void;
}

interface TranslationConfig {
  provider: 'mymemory' | 'libretranslate' | 'mock';
  email?: string;
  libreTranslateUrl?: string;
  libreTranslateApiKey?: string;
  fallbackToMock: boolean;
}

/**
 * Component for configuring translation settings
 */
const TranslationSettings: React.FC<TranslationSettingsProps> = ({ onSave }) => {
  const [settings, setSettings] = useState<TranslationConfig>({
    provider: 'mymemory',
    email: '',
    libreTranslateUrl: 'https://libretranslate.de/translate',
    libreTranslateApiKey: '',
    fallbackToMock: true
  });
  
  const [testResult, setTestResult] = useState<{ 
    success: boolean; 
    message: string;
    translation?: string;
  } | null>(null);
  
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('translationSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(parsed);
      } catch (e) {
        console.error('Failed to parse saved translation settings');
      }
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = () => {
    setSaving(true);
    
    // Save to localStorage
    localStorage.setItem('translationSettings', JSON.stringify(settings));
    
    // Call the onSave callback if provided
    if (onSave) {
      onSave(settings);
    }
    
    setTimeout(() => {
      setSaving(false);
    }, 500);
  };

  const testTranslation = async () => {
    setTestResult(null);
    setTesting(true);
    
    try {
      let result: any;
      const testText = "Hello, this is a test of the translation system.";
      
      if (settings.provider === 'mymemory') {
        // Build MyMemory API request
        let url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(testText)}&langpair=en|es`;
        if (settings.email) {
          url += `&de=${encodeURIComponent(settings.email)}`;
        }
        
        const response = await axios.get(url);
        
        if (response.data?.responseData?.translatedText) {
          setTestResult({
            success: true,
            message: 'Translation successful!',
            translation: response.data.responseData.translatedText
          });
        } else {
          throw new Error('No translation received from MyMemory API');
        }
      } 
      else if (settings.provider === 'libretranslate') {
        // Build LibreTranslate API request
        const payload = {
          q: testText,
          source: 'en',
          target: 'es',
          format: 'text',
          api_key: settings.libreTranslateApiKey || ''
        };
        
        const response = await axios.post(
          settings.libreTranslateUrl || 'https://libretranslate.de/translate',
          payload,
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
        
        if (response.data?.translatedText) {
          setTestResult({
            success: true,
            message: 'Translation successful!',
            translation: response.data.translatedText
          });
        } else {
          throw new Error('No translation received from LibreTranslate API');
        }
      }
      else {
        // Mock provider
        setTestResult({
          success: true,
          message: 'Using mock translation (for development only)',
          translation: 'Hola, esta es una prueba del sistema de traducción.'
        });
      }
    } catch (error) {
      console.error('Translation test error:', error);
      setTestResult({
        success: false,
        message: `Translation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-lg border border-[#fcc4d4] overflow-hidden">
      <div className="px-6 py-5 bg-gradient-to-r from-[#fcdce4] to-[#fcc4d4]">
        <h3 className="text-lg font-medium text-gray-800">Translation Settings</h3>
        <p className="mt-1 text-sm text-gray-600">Configure how product translations are generated</p>
      </div>
      
      <div className="p-6 space-y-6">
        {/* Provider selection */}
        <div>
          <label htmlFor="provider" className="block text-sm font-medium text-gray-700 mb-1">
            Translation Provider
          </label>
          <select
            id="provider"
            name="provider"
            value={settings.provider}
            onChange={handleChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[#f09bc0] focus:border-[#f09bc0] sm:text-sm rounded-md"
          >
            <option value="mymemory">MyMemory API (Free Tier)</option>
            <option value="libretranslate">LibreTranslate API</option>
            <option value="mock">Mock Translation (Development)</option>
          </select>
        </div>
        
        {/* MyMemory settings */}
        {settings.provider === 'mymemory' && (
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address (Optional - increases daily limit)
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={settings.email || ''}
              onChange={handleChange}
              placeholder="your.email@example.com"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#f09bc0] focus:border-[#f09bc0] sm:text-sm"
            />
            <p className="mt-1 text-xs text-gray-500">
              Free tier allows 1000 words/day. Adding your email increases this to 10,000 words/day.
            </p>
          </div>
        )}
        
        {/* LibreTranslate settings */}
        {settings.provider === 'libretranslate' && (
          <div className="space-y-4">
            <div>
              <label htmlFor="libreTranslateUrl" className="block text-sm font-medium text-gray-700 mb-1">
                LibreTranslate API URL
              </label>
              <input
                type="url"
                id="libreTranslateUrl"
                name="libreTranslateUrl"
                value={settings.libreTranslateUrl || ''}
                onChange={handleChange}
                placeholder="https://libretranslate.de/translate"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#f09bc0] focus:border-[#f09bc0] sm:text-sm"
              />
              <p className="mt-1 text-xs text-gray-500">
                URL of the LibreTranslate instance you want to use.
              </p>
            </div>
            
            <div>
              <label htmlFor="libreTranslateApiKey" className="block text-sm font-medium text-gray-700 mb-1">
                LibreTranslate API Key (if required)
              </label>
              <input
                type="password"
                id="libreTranslateApiKey"
                name="libreTranslateApiKey"
                value={settings.libreTranslateApiKey || ''}
                onChange={handleChange}
                placeholder="Your API key (if required by the instance)"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#f09bc0] focus:border-[#f09bc0] sm:text-sm"
              />
            </div>
          </div>
        )}
        
        {/* Fallback option */}
        {settings.provider !== 'mock' && (
          <div className="flex items-center">
            <input
              id="fallbackToMock"
              name="fallbackToMock"
              type="checkbox"
              checked={settings.fallbackToMock}
              onChange={handleChange}
              className="h-4 w-4 text-[#f09bc0] focus:ring-[#f09bc0] border-gray-300 rounded"
            />
            <label htmlFor="fallbackToMock" className="ml-2 block text-sm text-gray-700">
              Fall back to mock translations if API fails
            </label>
          </div>
        )}
        
        {/* Test results */}
        {testResult && (
          <div className={`mt-4 p-4 rounded-md ${testResult.success ? 'bg-green-50' : 'bg-red-50'}`}>
            <div className="flex">
              <div className="flex-shrink-0">
                {testResult.success ? (
                  <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="ml-3">
                <h3 className={`text-sm font-medium ${testResult.success ? 'text-green-800' : 'text-red-800'}`}>
                  {testResult.message}
                </h3>
                {testResult.translation && (
                  <div className="mt-2 text-sm">
                    <p className="font-medium">English:</p>
                    <p className="text-gray-700">Hello, this is a test of the translation system.</p>
                    <p className="font-medium mt-1">Spanish Translation:</p>
                    <p className="text-gray-700">{testResult.translation}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Action buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={testTranslation}
            disabled={testing}
            className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {testing ? 'Testing...' : 'Test Translation'}
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#f09bc0] hover:bg-[#e986b4] focus:outline-none transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TranslationSettings; 
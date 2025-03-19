/**
 * Image Processing Utilities
 * 
 * Provides utilities for image processing including watermarking
 */

/**
 * Paths to predefined logos
 */
const LOGO_PATHS = {
  diky: '/src/images/Dikylogo.jpg',
  gaby: '/src/images/Gabylogo.jpg'
};

export interface WatermarkSettings {
  logo: 'diky' | 'gaby' | 'custom';
  opacity: number;
  scale: number;
  customLogo?: File;
  position: 'center' | 'bottomRight' | 'bottomLeft' | 'topRight' | 'topLeft';
}

export interface ImageProcessorOptions {
  maxSize?: number; // Maximum size in pixels (width or height)
  quality?: number; // JPEG quality (0-1)
  format?: 'jpeg' | 'png' | 'webp';
}

/**
 * Apply watermark to an image
 * 
 * @param imageUrl - URL of the image to watermark
 * @param settings - Watermark settings
 * @param options - Image processing options
 * @returns Promise with data URL of watermarked image
 */
export const applyWatermark = async (
  imageUrl: string,
  settings: WatermarkSettings,
  options: ImageProcessorOptions = {}
): Promise<string> => {
  try {
    // Get logo source based on settings
    const logoSrc = await getLogoSource(settings);
    
    // Load the logo image
    const logoImg = await loadImage(logoSrc);
    
    // Load the source image
    const sourceImg = await loadImage(imageUrl);
    
    // Create canvas and apply watermark
    const canvas = document.createElement('canvas');
    const { width, height } = calculateDimensions(sourceImg, options.maxSize);
    canvas.width = width;
    canvas.height = height;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Canvas context not available');
    }
    
    // Draw original image (potentially resized)
    ctx.drawImage(sourceImg, 0, 0, width, height);
    
    // Calculate logo size based on scale setting
    const logoWidth = width * settings.scale;
    const logoHeight = (logoImg.height / logoImg.width) * logoWidth;
    
    // Apply opacity setting
    ctx.globalAlpha = settings.opacity;
    
    // Calculate position based on setting
    let x = 0;
    let y = 0;
    
    switch (settings.position || 'bottomRight') {
      case 'center':
        x = (width - logoWidth) / 2;
        y = (height - logoHeight) / 2;
        break;
      case 'topLeft':
        x = 20;
        y = 20;
        break;
      case 'topRight':
        x = width - logoWidth - 20;
        y = 20;
        break;
      case 'bottomLeft':
        x = 20;
        y = height - logoHeight - 20;
        break;
      case 'bottomRight':
      default:
        x = width - logoWidth - 20;
        y = height - logoHeight - 20;
        break;
    }
    
    // Draw logo at the calculated position
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
    const format = options.format || 'jpeg';
    const quality = options.quality || 0.9;
    const watermarkedUrl = canvas.toDataURL(`image/${format}`, quality);
    
    return watermarkedUrl;
  } catch (error) {
    console.error('Error applying watermark:', error);
    throw new Error('Failed to apply watermark to image');
  }
};

/**
 * Process multiple images with watermark
 * 
 * @param imageUrls - Array of image URLs to process
 * @param settings - Watermark settings
 * @param options - Image processing options
 * @returns Promise with array of processed image data URLs
 */
export const batchProcessImages = async (
  imageUrls: string[],
  settings: WatermarkSettings,
  options: ImageProcessorOptions = {}
): Promise<string[]> => {
  try {
    const promises = imageUrls.map(url => applyWatermark(url, settings, options));
    return await Promise.all(promises);
  } catch (error) {
    console.error('Error batch processing images:', error);
    throw new Error('Failed to process all images');
  }
};

/**
 * Get the source URL for the logo
 */
const getLogoSource = async (settings: WatermarkSettings): Promise<string> => {
  if (settings.logo === 'custom' && settings.customLogo) {
    return URL.createObjectURL(settings.customLogo);
  }
  
  return settings.logo === 'diky' ? LOGO_PATHS.diky : LOGO_PATHS.gaby;
};

/**
 * Load an image from URL
 */
const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
};

/**
 * Calculate new dimensions maintaining aspect ratio
 */
const calculateDimensions = (img: HTMLImageElement, maxSize?: number): { width: number, height: number } => {
  if (!maxSize || (img.width <= maxSize && img.height <= maxSize)) {
    return { width: img.width, height: img.height };
  }
  
  if (img.width > img.height) {
    const ratio = img.height / img.width;
    return { width: maxSize, height: Math.round(maxSize * ratio) };
  } else {
    const ratio = img.width / img.height;
    return { width: Math.round(maxSize * ratio), height: maxSize };
  }
};

/**
 * Convert a File object to a data URL
 */
export const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert file to data URL'));
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
};

/**
 * Compress an image to reduce file size
 */
export const compressImage = async (
  file: File, 
  options: { maxWidth?: number, maxHeight?: number, quality?: number } = {}
): Promise<Blob> => {
  const dataUrl = await fileToDataUrl(file);
  const img = await loadImage(dataUrl);
  
  const maxWidth = options.maxWidth || 1200;
  const maxHeight = options.maxHeight || 1200;
  const quality = options.quality || 0.8;
  
  const { width, height } = calculateDimensions(img, Math.max(maxWidth, maxHeight));
  
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas context not available');
  }
  
  ctx.drawImage(img, 0, 0, width, height);
  
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to compress image'));
        }
      },
      'image/jpeg',
      quality
    );
  });
}; 
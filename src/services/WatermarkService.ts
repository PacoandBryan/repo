import { WatermarkSettings } from '../types/product';

// Load watermark logos
const WATERMARK_LOGOS: Record<Exclude<WatermarkSettings['logo'], 'custom'>, string> = {
  diky: '/assets/logos/diky-watermark.png',
  gaby: '/assets/logos/gaby-watermark.png'
};

/**
 * Gets the source URL for a watermark logo
 */
const getWatermarkSource = (settings: WatermarkSettings): string => {
  if (settings.logo === 'custom' && settings.customLogo) {
    return URL.createObjectURL(settings.customLogo);
  }
  if (settings.logo === 'diky' || settings.logo === 'gaby') {
    return WATERMARK_LOGOS[settings.logo];
  }
  throw new Error('Invalid logo type');
};

/**
 * Applies a watermark to an image with the specified settings
 */
export const applyWatermark = async (
  imageFile: File,
  settings: WatermarkSettings
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const reader = new FileReader();

    reader.onload = () => {
      image.src = reader.result as string;
      image.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        // Set canvas size to match image
        canvas.width = image.width;
        canvas.height = image.height;

        // Draw original image
        ctx.drawImage(image, 0, 0);

        // Load watermark image
        const watermark = new Image();
        watermark.crossOrigin = 'anonymous';
        watermark.src = getWatermarkSource(settings);

        watermark.onload = () => {
          // Calculate watermark dimensions
          const maxSize = Math.min(canvas.width, canvas.height) * settings.scale;
          const ratio = watermark.width / watermark.height;
          let watermarkWidth = maxSize;
          let watermarkHeight = maxSize / ratio;

          // Calculate position
          let x = 0;
          let y = 0;

          switch (settings.position) {
            case 'center':
              x = (canvas.width - watermarkWidth) / 2;
              y = (canvas.height - watermarkHeight) / 2;
              break;
            case 'topLeft':
              x = 20;
              y = 20;
              break;
            case 'topRight':
              x = canvas.width - watermarkWidth - 20;
              y = 20;
              break;
            case 'bottomLeft':
              x = 20;
              y = canvas.height - watermarkHeight - 20;
              break;
            case 'bottomRight':
              x = canvas.width - watermarkWidth - 20;
              y = canvas.height - watermarkHeight - 20;
              break;
          }

          // Set global alpha for opacity
          ctx.globalAlpha = settings.opacity;

          // Draw watermark
          ctx.drawImage(watermark, x, y, watermarkWidth, watermarkHeight);

          // Reset global alpha
          ctx.globalAlpha = 1.0;

          // Convert to data URL and resolve
          resolve(canvas.toDataURL('image/jpeg', 0.9));

          // Clean up custom logo URL if used
          if (settings.logo === 'custom' && settings.customLogo) {
            URL.revokeObjectURL(watermark.src);
          }
        };

        watermark.onerror = () => {
          reject(new Error('Failed to load watermark image'));
        };
      };
    };

    reader.onerror = () => {
      reject(new Error('Failed to read image file'));
    };

    reader.readAsDataURL(imageFile);
  });
};

/**
 * Generates a preview of how the watermark will look on an image
 */
export const generateWatermarkPreview = async (
  imageUrl: string,
  settings: WatermarkSettings
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.src = imageUrl;

    image.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      // Set canvas size to match image
      canvas.width = image.width;
      canvas.height = image.height;

      // Draw original image
      ctx.drawImage(image, 0, 0);

      // Load watermark image
      const watermark = new Image();
      watermark.crossOrigin = 'anonymous';
      watermark.src = getWatermarkSource(settings);

      watermark.onload = () => {
        // Use same watermarking logic as above
        const maxSize = Math.min(canvas.width, canvas.height) * settings.scale;
        const ratio = watermark.width / watermark.height;
        let watermarkWidth = maxSize;
        let watermarkHeight = maxSize / ratio;

        let x = 0;
        let y = 0;

        switch (settings.position) {
          case 'center':
            x = (canvas.width - watermarkWidth) / 2;
            y = (canvas.height - watermarkHeight) / 2;
            break;
          case 'topLeft':
            x = 20;
            y = 20;
            break;
          case 'topRight':
            x = canvas.width - watermarkWidth - 20;
            y = 20;
            break;
          case 'bottomLeft':
            x = 20;
            y = canvas.height - watermarkHeight - 20;
            break;
          case 'bottomRight':
            x = canvas.width - watermarkWidth - 20;
            y = canvas.height - watermarkHeight - 20;
            break;
        }

        ctx.globalAlpha = settings.opacity;
        ctx.drawImage(watermark, x, y, watermarkWidth, watermarkHeight);
        ctx.globalAlpha = 1.0;

        resolve(canvas.toDataURL('image/jpeg', 0.9));

        if (settings.logo === 'custom' && settings.customLogo) {
          URL.revokeObjectURL(watermark.src);
        }
      };

      watermark.onerror = () => {
        reject(new Error('Failed to load watermark image'));
      };
    };

    image.onerror = () => {
      reject(new Error('Failed to load preview image'));
    };
  });
}; 
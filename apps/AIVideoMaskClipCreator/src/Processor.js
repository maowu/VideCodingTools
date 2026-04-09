import { Image } from 'image-js';

/**
 * ImageProcessor handles the background removal logic.
 */
export class ImageProcessor {
  /**
   * Processes a video frame to generate a side-by-side (original | mask) visual.
   * Optimized for real-time performance.
   */
  async processFrame(srcCanvas, threshold = 0.94) {
    try {
      const width = srcCanvas.width;
      const height = srcCanvas.height;
      
      const resultCanvas = document.createElement('canvas');
      resultCanvas.width = width * 2;
      resultCanvas.height = height;
      const rCtx = resultCanvas.getContext('2d');
      
      // Left: Original
      rCtx.drawImage(srcCanvas, 0, 0);
      
      // Right: Compute Mask natively (avoiding library crashes)
      const ctx = srcCanvas.getContext('2d', { willReadFrequently: true });
      const imgData = ctx.getImageData(0, 0, width, height);
      const data = imgData.data;
      
      const maskData = rCtx.createImageData(width, height);
      const mData = maskData.data;
      
      const thresholdPix = Math.floor(threshold * 255);
      
      for (let i = 0; i < data.length; i += 4) {
         // Grayscale conversion (Luminance)
         const gray = (data[i] * 299 + data[i+1] * 587 + data[i+2] * 114) / 1000;
         
         // Assuming white background. 
         // Threshold = 0.94 -> thresholdPix = 239. 
         // If a pixel is darker than 239, it's the DOLL (Foreground).
         // The user wants '黑白遮罩（娃娃是白色，背景是黑色）' 
         // => Background > 239 = Black (0), Doll < 239 = White (255)
         const isObject = gray < thresholdPix;
         const val = isObject ? 255 : 0;
         
         mData[i] = val;
         mData[i+1] = val;
         mData[i+2] = val;
         mData[i+3] = 255;
      }
      
      rCtx.putImageData(maskData, width, 0);
      return resultCanvas;
    } catch (e) {
      console.error('Frame segmentation error:', e);
      throw e;
    }
  }
}

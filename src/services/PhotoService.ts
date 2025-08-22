import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';

export interface PhotoResult {
  dataUrl: string;
  format: string;
}

export class PhotoService {
  static async takePhoto(): Promise<PhotoResult | null> {
    if (Capacitor.isNativePlatform()) {
      return this.takeNativePhoto();
    } else {
      return this.takeWebPhoto();
    }
  }

  private static async takeNativePhoto(): Promise<PhotoResult | null> {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
        correctOrientation: true,
        saveToGallery: false,
      });

      if (image.dataUrl) {
        return {
          dataUrl: image.dataUrl,
          format: image.format || 'jpeg'
        };
      }
      return null;
    } catch (error) {
      console.warn('Camera access failed:', error);
      return null;
    }
  }

  static async selectFromGallery(): Promise<PhotoResult | null> {
    if (Capacitor.isNativePlatform()) {
      return this.selectNativeGallery();
    } else {
      return this.selectWebGallery();
    }
  }

  private static async selectNativeGallery(): Promise<PhotoResult | null> {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Photos,
        correctOrientation: true,
      });

      if (image.dataUrl) {
        return {
          dataUrl: image.dataUrl,
          format: image.format || 'jpeg'
        };
      }
      return null;
    } catch (error) {
      console.warn('Gallery access failed:', error);
      return null;
    }
  }

  private static takeWebPhoto(): Promise<PhotoResult | null> {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.capture = 'environment';
      
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) {
          resolve(null);
          return;
        }
        
        const reader = new FileReader();
        reader.onload = () => {
          if (reader.result) {
            resolve({
              dataUrl: reader.result as string,
              format: file.type.split('/')[1] || 'jpeg'
            });
          } else {
            resolve(null);
          }
        };
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(file);
      };
      
      input.oncancel = () => resolve(null);
      input.click();
    });
  }

  private static selectWebGallery(): Promise<PhotoResult | null> {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) {
          resolve(null);
          return;
        }
        
        const reader = new FileReader();
        reader.onload = () => {
          if (reader.result) {
            resolve({
              dataUrl: reader.result as string,
              format: file.type.split('/')[1] || 'jpeg'
            });
          } else {
            resolve(null);
          }
        };
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(file);
      };
      
      input.oncancel = () => resolve(null);
      input.click();
    });
  }
}
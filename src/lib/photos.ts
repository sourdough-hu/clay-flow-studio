/**
 * Photo utilities for consistent thumbnail and multi-photo handling
 */

export interface PhotoItem {
  url: string;
  id?: string;
  width?: number;
  height?: number;
  createdAt?: string;
}

/**
 * Get the thumbnail URL from a photos array or fallback
 */
export function getThumbnailUrl(photos?: string[], fallback = "/placeholder.svg"): string {
  return photos?.[0] || fallback;
}

/**
 * Migrate single image_url to photos array format
 */
export function migrateToPhotosArray(imageUrl?: string, photos?: string[]): string[] {
  // If photos array exists and has content, use it
  if (photos && photos.length > 0) {
    return photos;
  }
  
  // If only image_url exists, migrate it to photos array
  if (imageUrl) {
    return [imageUrl];
  }
  
  // No photos at all
  return [];
}

/**
 * Validate photo URL (basic check)
 */
export function isValidPhotoUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return url.startsWith('data:image/');
  }
}

/**
 * Limit photos array to maximum count
 */
export function limitPhotos(photos: string[], maxCount = 10): string[] {
  return photos.slice(0, maxCount);
}
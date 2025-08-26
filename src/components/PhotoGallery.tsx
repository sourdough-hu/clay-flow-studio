import React, { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface PhotoGalleryProps {
  photos: string[];
  initialIndex?: number;
  className?: string;
  autoOpen?: boolean;
  onClose?: () => void;
}

// Photo gallery with carousel and fullscreen viewer
const PhotoGallery: React.FC<PhotoGalleryProps> = ({ 
  photos, 
  initialIndex = 0, 
  className,
  autoOpen = false,
  onClose
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(autoOpen ? initialIndex : null);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const openFullscreen = (index: number) => {
    setCurrentIndex(index);
    setSelectedIndex(index);
  };

  const closeFullscreen = () => {
    setSelectedIndex(null);
    onClose?.();
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
  };

  if (photos.length === 0) {
    return (
      <div className={cn("w-full aspect-[4/3] bg-muted rounded-md flex items-center justify-center", className)}>
        <div className="text-center text-muted-foreground">
          <div className="w-16 h-16 mx-auto mb-2 bg-muted-foreground/20 rounded-md flex items-center justify-center">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-sm">No photos</p>
        </div>
      </div>
    );
  }

  if (photos.length === 1) {
    return (
      <div className={cn("w-full", className)}>
        <img 
          src={photos[0]} 
          alt="Photo"
          className="w-full aspect-[4/3] object-cover rounded-md border cursor-pointer hover:opacity-90 transition-opacity"
          onClick={() => openFullscreen(0)}
        />
        
        {/* Fullscreen viewer */}
        <Dialog open={selectedIndex !== null} onOpenChange={closeFullscreen}>
          <DialogContent className="max-w-screen max-h-screen w-screen h-screen p-0 bg-black/95 photo-viewer-safe">
            <div className="relative w-full h-full flex items-center justify-center">
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
                onClick={closeFullscreen}
              >
                <X className="h-4 w-4" />
              </Button>
              <img 
                src={photos[0]}
                alt="Full size photo"
                className="max-w-full max-h-full object-contain"
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      {/* Horizontal carousel */}
      <div className="w-full overflow-x-auto">
        <div className="flex gap-2 pb-2" style={{ width: `${photos.length * 120}px` }}>
          {photos.map((photo, index) => (
            <div
              key={index}
              className={cn(
                "flex-shrink-0 w-28 h-28 rounded-md border cursor-pointer transition-all",
                index === 0 && "ring-2 ring-primary ring-offset-2"
              )}
              onClick={() => openFullscreen(index)}
            >
              <img 
                src={photo} 
                alt={`Photo ${index + 1}`}
                className="w-full h-full object-cover rounded-md hover:opacity-90 transition-opacity"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Fullscreen viewer with navigation */}
      <Dialog open={selectedIndex !== null} onOpenChange={closeFullscreen}>
        <DialogContent className="max-w-screen max-h-screen w-screen h-screen p-0 bg-black/95 photo-viewer-safe">
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Close button */}
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
              onClick={closeFullscreen}
            >
              <X className="h-4 w-4" />
            </Button>

            {/* Navigation buttons */}
            {photos.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20"
                  onClick={goToPrevious}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20"
                  onClick={goToNext}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </>
            )}

            {/* Photo counter */}
            {photos.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                {currentIndex + 1} / {photos.length}
              </div>
            )}

            {/* Current photo */}
            <img 
              src={photos[currentIndex]}
              alt={`Photo ${currentIndex + 1}`}
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PhotoGallery;
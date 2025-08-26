import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PhotoService } from "@/services/PhotoService";
import { Camera, ImageIcon, X, Crown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import DragDropPhotos from "./DragDropPhotos";

interface Photo {
  id: string;
  url: string;
  isNew?: boolean;
}

interface MultiPhotoPickerProps {
  photos: string[];
  onChange: (photos: string[]) => void;
  className?: string;
  label?: string;
  maxPhotos?: number;
  showButtons?: boolean;
}

const MultiPhotoPicker: React.FC<MultiPhotoPickerProps> = ({ 
  photos, 
  onChange, 
  className, 
  label,
  maxPhotos = 10,
  showButtons = true 
}) => {
  const { toast } = useToast();

  const showPhotoOptions = () => {
    if (photos.length >= maxPhotos) {
      toast({
        title: "Photo limit reached",
        description: `You can add up to ${maxPhotos} photos.`,
        variant: "destructive",
      });
      return;
    }

    // Create action sheet for Camera/Gallery options
    const actionSheet = document.createElement('div');
    actionSheet.className = 'fixed inset-0 z-50 bg-black/50 flex items-end';
    actionSheet.innerHTML = `
      <div class="bg-background rounded-t-lg w-full p-4 space-y-3">
        <div class="text-center text-sm font-medium">Add Photo</div>
        <button id="camera-option" class="w-full p-4 text-left bg-muted rounded-lg hover:bg-muted/80">
          📷 Camera
        </button>
        <button id="gallery-option" class="w-full p-4 text-left bg-muted rounded-lg hover:bg-muted/80">
          🖼️ My Photos
        </button>
        <button id="cancel-option" class="w-full p-4 text-left bg-secondary rounded-lg hover:bg-secondary/80">
          Cancel
        </button>
      </div>
    `;
    
    document.body.appendChild(actionSheet);
    
    const removeSheet = () => {
      document.body.removeChild(actionSheet);
    };
    
    actionSheet.addEventListener('click', (e) => {
      if (e.target === actionSheet) removeSheet();
    });
    
    document.getElementById('camera-option')?.addEventListener('click', async () => {
      removeSheet();
      await addPhoto('camera');
    });
    
    document.getElementById('gallery-option')?.addEventListener('click', async () => {
      removeSheet();
      await addPhoto('gallery');
    });
    
    document.getElementById('cancel-option')?.addEventListener('click', removeSheet);
  };

  const addPhoto = async (source: 'camera' | 'gallery') => {
    if (photos.length >= maxPhotos) {
      toast({
        title: "Photo limit reached",
        description: `You can add up to ${maxPhotos} photos.`,
        variant: "destructive",
      });
      return;
    }

    try {
      const result = source === 'camera' 
        ? await PhotoService.takePhoto()
        : await PhotoService.selectFromGallery();
      
      if (result) {
        onChange([...photos, result.dataUrl]);
      }
    } catch (error) {
      toast({
        title: "Error adding photo",
        description: "Failed to add photo. Please try again.",
        variant: "destructive",
      });
    }
  };


  return (
    <div className={cn("w-full", className)}>
      {label && <div className="mb-2 text-sm font-medium text-foreground">{label}</div>}
      
      {/* Add Photo Buttons - only show if showButtons is true */}
      {showButtons && (
        <div className="grid grid-cols-2 gap-2 mb-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => addPhoto('camera')}
            className="h-20 flex-col gap-1"
            disabled={photos.length >= maxPhotos}
          >
            <Camera className="h-5 w-5" />
            <span className="text-xs">Camera</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => addPhoto('gallery')}
            className="h-20 flex-col gap-1"
            disabled={photos.length >= maxPhotos}
          >
            <ImageIcon className="h-5 w-5" />
            <span className="text-xs">Gallery</span>
          </Button>
        </div>
      )}

      {/* Horizontal Photo Strip */}
      {!showButtons && (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {/* Photo Thumbnails */}
          {photos.map((photo, index) => (
            <div
              key={`${photo}-${index}`}
              className="relative flex-shrink-0 w-20 h-20 rounded-md border bg-muted group"
            >
              <img 
                src={photo} 
                alt={`Photo ${index + 1}`}
                className="w-full h-full object-cover rounded-md cursor-pointer"
                onClick={() => {
                  // Open full screen viewer - for now just a simple modal
                  const modal = document.createElement('div');
                  modal.className = 'fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4';
                  modal.innerHTML = `
                    <div class="relative max-w-full max-h-full">
                      <img src="${photo}" alt="Full size" class="max-w-full max-h-full object-contain rounded-lg" />
                      <button id="close-modal" class="absolute top-2 right-2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70">
                        ✕
                      </button>
                    </div>
                  `;
                  document.body.appendChild(modal);
                  
                  const closeModal = () => document.body.removeChild(modal);
                  modal.addEventListener('click', (e) => {
                    if (e.target === modal) closeModal();
                  });
                  document.getElementById('close-modal')?.addEventListener('click', closeModal);
                }}
              />
              
              {/* Thumbnail indicator - crown for first photo */}
              {index === 0 && (
                <div className="absolute -top-1 -left-1 bg-primary text-primary-foreground rounded-full p-1 shadow-sm">
                  <Crown className="h-3 w-3" />
                </div>
              )}

              {/* Delete button */}
              <button
                type="button"
                className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => {
                  const newPhotos = photos.filter((_, i) => i !== index);
                  onChange(newPhotos);
                }}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          
          {/* Add Photo Button - always visible at end until max reached */}
          {photos.length < maxPhotos && (
            <div
              className="flex-shrink-0 w-20 h-20 border-2 border-dashed border-muted-foreground/25 rounded-md flex items-center justify-center cursor-pointer hover:border-muted-foreground/50 transition-colors"
              onClick={showPhotoOptions}
            >
              <div className="text-center">
                <ImageIcon className="h-6 w-6 mx-auto mb-1 opacity-50" />
                <span className="text-xs text-muted-foreground">Add</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Photo Grid (for showButtons mode) */}
      {showButtons && photos.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">
            {photos.length} / {maxPhotos} photos • First image is the thumbnail
          </div>
          <DragDropPhotos photos={photos} onChange={onChange} />
        </div>
      )}

      {/* Empty state for showButtons mode */}
      {showButtons && photos.length === 0 && (
        <div className="border-2 border-dashed border-muted-foreground/25 rounded-md p-8 text-center text-muted-foreground">
          <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No photos added yet</p>
          <p className="text-xs">Use the buttons above to add photos</p>
        </div>
      )}
    </div>
  );
};

export default MultiPhotoPicker;
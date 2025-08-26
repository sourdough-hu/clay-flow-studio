import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PhotoService } from "@/services/PhotoService";
import { Camera, ImageIcon, X, Crown, Images } from "lucide-react";
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

    // Create React-based action sheet
    const actionSheetContainer = document.createElement('div');
    actionSheetContainer.className = 'fixed inset-0 z-50 bg-black/50 flex items-end';
    
    const actionSheetContent = document.createElement('div');
    actionSheetContent.className = 'bg-background rounded-t-lg w-full p-4 space-y-3';
    
    // Header
    const header = document.createElement('div');
    header.className = 'text-center text-sm font-medium text-foreground';
    header.textContent = 'Add Photo';
    actionSheetContent.appendChild(header);
    
    // Camera option
    const cameraOption = document.createElement('button');
    cameraOption.className = 'w-full p-4 text-left bg-muted rounded-lg hover:bg-muted/80 flex items-center gap-3 text-foreground';
    cameraOption.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
        <circle cx="12" cy="13" r="3"/>
      </svg>
      <span>Camera</span>
    `;
    
    // My Photos option
    const galleryOption = document.createElement('button');
    galleryOption.className = 'w-full p-4 text-left bg-muted rounded-lg hover:bg-muted/80 flex items-center gap-3 text-foreground';
    galleryOption.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M18 22H4a2 2 0 0 1-2-2V6"/>
        <path d="m22 13-1.296-1.296a2.41 2.41 0 0 0-3.408 0L11 18"/>
        <circle cx="12" cy="8" r="2"/>
        <rect width="16" height="16" x="6" y="2" rx="2"/>
      </svg>
      <span>My Photos</span>
    `;
    
    // Cancel option
    const cancelOption = document.createElement('button');
    cancelOption.className = 'w-full p-4 text-left bg-secondary rounded-lg hover:bg-secondary/80 flex items-center gap-3 text-foreground';
    cancelOption.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="m18 6-12 12"/>
        <path d="m6 6 12 12"/>
      </svg>
      <span>Cancel</span>
    `;
    
    actionSheetContent.appendChild(cameraOption);
    actionSheetContent.appendChild(galleryOption);
    actionSheetContent.appendChild(cancelOption);
    actionSheetContainer.appendChild(actionSheetContent);
    document.body.appendChild(actionSheetContainer);
    
    const removeSheet = () => {
      document.body.removeChild(actionSheetContainer);
    };
    
    // Event listeners
    actionSheetContainer.addEventListener('click', (e) => {
      if (e.target === actionSheetContainer) removeSheet();
    });
    
    cameraOption.addEventListener('click', async () => {
      removeSheet();
      await addPhoto('camera');
    });
    
    galleryOption.addEventListener('click', async () => {
      removeSheet();
      await addPhoto('gallery');
    });
    
    cancelOption.addEventListener('click', removeSheet);
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
        <div className="flex gap-3 overflow-x-auto pb-2 px-1">
          {/* Photo Thumbnails */}
          {photos.map((photo, index) => (
            <div
              key={`${photo}-${index}`}
              className="relative flex-shrink-0 w-20 h-20 overflow-visible group"
            >
              <div className="w-full h-full rounded-xl border bg-muted overflow-hidden">
                <img 
                  src={photo} 
                  alt={`Photo ${index + 1}`}
                  className="w-full h-full object-cover cursor-pointer"
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
              </div>
              
              {/* Thumbnail indicator - crown for first photo */}
              {index === 0 && (
                <div className="absolute -top-1.5 -left-1.5 z-10 bg-primary text-primary-foreground rounded-full p-1.5 shadow-lg pointer-events-none">
                  <Crown className="h-3 w-3" />
                </div>
              )}

              {/* Delete button */}
              <button
                type="button"
                className="absolute -top-1.5 -right-1.5 z-10 bg-destructive text-destructive-foreground rounded-full p-1.5 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
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
              className="flex-shrink-0 w-20 h-20 border-2 border-dashed border-muted-foreground/25 rounded-xl flex items-center justify-center cursor-pointer hover:border-muted-foreground/50 transition-colors"
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
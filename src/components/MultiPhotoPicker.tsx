import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PhotoService } from "@/services/PhotoService";
import { Camera, ImageIcon } from "lucide-react";
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

      {/* Photo Grid */}
      {photos.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">
            {photos.length} / {maxPhotos} photos • First image is the thumbnail
          </div>
          <DragDropPhotos photos={photos} onChange={onChange} />
        </div>
      )}

      {photos.length === 0 && (
        <div 
          className="border-2 border-dashed border-muted-foreground/25 rounded-md p-8 text-center text-muted-foreground cursor-pointer hover:border-muted-foreground/50 transition-colors"
          onClick={showButtons ? undefined : showPhotoOptions}
        >
          <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm">
            {showButtons ? "No photos added yet" : "Add photo"}
          </p>
          {showButtons && <p className="text-xs">Use the buttons above to add photos</p>}
          {!showButtons && <p className="text-xs">Tap to choose Camera or My Photos</p>}
        </div>
      )}
    </div>
  );
};

export default MultiPhotoPicker;
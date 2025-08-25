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
}

// Multi-photo picker with reorder, delete, and thumbnail selection
const MultiPhotoPicker: React.FC<MultiPhotoPickerProps> = ({ 
  photos, 
  onChange, 
  className, 
  label,
  maxPhotos = 10 
}) => {
  const { toast } = useToast();

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
      
      {/* Add Photo Buttons */}
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
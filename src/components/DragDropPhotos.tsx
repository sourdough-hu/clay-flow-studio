import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { GripVertical, X, Crown } from "lucide-react";

interface DragDropPhotosProps {
  photos: string[];
  onChange: (photos: string[]) => void;
  className?: string;
}

// Enhanced photo reordering with better drag and drop
const DragDropPhotos: React.FC<DragDropPhotosProps> = ({ 
  photos, 
  onChange, 
  className 
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", index.toString());
  };

  const handleDragEnter = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only clear if we're leaving the container entirely
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverIndex(null);
    }
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newPhotos = [...photos];
    const draggedPhoto = newPhotos[draggedIndex];
    
    // Remove from old position
    newPhotos.splice(draggedIndex, 1);
    
    // Insert at new position
    newPhotos.splice(dropIndex, 0, draggedPhoto);
    
    onChange(newPhotos);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    onChange(newPhotos);
  };

  const makeThumnail = (index: number) => {
    if (index === 0) return; // Already thumbnail
    const newPhotos = [...photos];
    const [photo] = newPhotos.splice(index, 1);
    newPhotos.unshift(photo);
    onChange(newPhotos);
  };

  if (photos.length === 0) {
    return null;
  }

  return (
    <div className={cn("grid grid-cols-3 gap-2", className)}>
      {photos.map((photo, index) => (
        <div
          key={`${photo}-${index}`}
          className={cn(
            "relative aspect-square rounded-md border bg-muted group transition-all",
            draggedIndex === index && "opacity-50 scale-95",
            dragOverIndex === index && draggedIndex !== index && "ring-2 ring-primary",
          )}
          draggable
          onDragStart={(e) => handleDragStart(e, index)}
          onDragEnter={(e) => handleDragEnter(e, index)}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, index)}
          onDragEnd={handleDragEnd}
        >
          <img 
            src={photo} 
            alt={`Photo ${index + 1}`}
            className="w-full h-full object-cover rounded-md"
          />
          
          {/* Thumbnail indicator */}
          {index === 0 && (
            <div className="absolute top-2 left-2 bg-primary text-primary-foreground rounded-full p-1 shadow-sm">
              <Crown className="h-3 w-3" />
            </div>
          )}

          {/* Controls overlay */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center gap-1">
            {/* Remove button */}
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="h-7 w-7 p-0 shadow-sm"
              onClick={() => removePhoto(index)}
            >
              <X className="h-3 w-3" />
            </Button>
            
            {/* Make thumbnail button */}
            {index !== 0 && (
              <Button
                type="button"
                size="sm"
                variant="secondary"
                className="h-7 w-7 p-0 shadow-sm"
                onClick={() => makeThumnail(index)}
                title="Make thumbnail"
              >
                <Crown className="h-3 w-3" />
              </Button>
            )}
            
            {/* Drag handle */}
            <div className="cursor-move p-1 text-white">
              <GripVertical className="h-4 w-4" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DragDropPhotos;
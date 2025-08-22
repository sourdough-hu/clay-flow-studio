import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PhotoService } from "@/services/PhotoService";
import { Camera, ImageIcon } from "lucide-react";

interface CameraCaptureProps {
  value?: string | null;
  onChange: (dataUrl: string | null) => void;
  className?: string;
  label?: string;
}

// Lightweight camera/gallery capture with preview
const CameraCapture: React.FC<CameraCaptureProps> = ({ value, onChange, className, label }) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const openPicker = () => {
    inputRef.current?.click();
  };

  const takePhoto = async () => {
    const result = await PhotoService.takePhoto();
    if (result) {
      onChange(result.dataUrl);
    }
  };

  const selectGallery = async () => {
    const result = await PhotoService.selectFromGallery();
    if (result) {
      onChange(result.dataUrl);
    }
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      onChange(result);
    };
    reader.readAsDataURL(file);
    // clear value so selecting same file again triggers change
    e.target.value = "";
  };

  return (
    <div className={cn("w-full", className)}>
      {label && <div className="mb-2 text-sm font-medium text-foreground">{label}</div>}
      {!value ? (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={takePhoto}
              className="h-20 flex-col gap-1"
            >
              <Camera className="h-5 w-5" />
              <span className="text-xs">Camera</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={selectGallery}
              className="h-20 flex-col gap-1"
            >
              <ImageIcon className="h-5 w-5" />
              <span className="text-xs">Gallery</span>
            </Button>
          </div>
          <button
            type="button"
            onClick={openPicker}
            className={cn(
              "w-full h-16 rounded-md border border-dashed flex items-center justify-center",
              "bg-muted/30 hover:bg-muted text-muted-foreground text-sm"
            )}
            aria-label="Or select file"
          >
            Or select file
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <img src={value} alt="Selected preview" className="w-full rounded-md border object-cover" />
          <div className="flex gap-2">
            <Button type="button" variant="secondary" onClick={selectGallery}>Replace</Button>
            <Button type="button" variant="outline" onClick={() => onChange(null)}>Remove</Button>
          </div>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={onFile}
      />
    </div>
  );
};

export default CameraCapture;

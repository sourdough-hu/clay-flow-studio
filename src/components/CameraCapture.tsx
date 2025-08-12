import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
        <button
          type="button"
          onClick={openPicker}
          className={cn(
            "w-full aspect-video rounded-md border border-dashed flex items-center justify-center",
            "bg-muted/30 hover:bg-muted text-muted-foreground"
          )}
          aria-label="Add photo"
       >
          <span className="text-4xl leading-none">+</span>
        </button>
      ) : (
        <div className="space-y-2">
          <img src={value} alt="Selected preview" className="w-full rounded-md border object-cover" />
          <div className="flex gap-2">
            <Button type="button" variant="secondary" onClick={openPicker}>Replace</Button>
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

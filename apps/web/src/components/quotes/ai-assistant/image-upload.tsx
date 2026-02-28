/* eslint-disable @next/next/no-img-element */
"use client";

import { useRef, useState, useCallback } from "react";
import { ImagePlus, X, Loader2, AlertCircle, Check } from "lucide-react";
import { Button } from "@fieldpro/ui/components/button";

interface ImageUploadProps {
  onImagesSelected: (
    images: { mimeType: string; data: string; preview: string }[]
  ) => void;
  selectedImages: { mimeType: string; data: string; preview: string }[];
  onRemoveImage: (index: number) => void;
  disabled?: boolean;
}

interface ProcessingImage {
  name: string;
  status: "compressing" | "done" | "error";
  originalSize: number;
  compressedSize?: number;
  error?: string;
}

// Compress image using canvas
async function compressImage(
  file: File,
  maxWidth: number = 1024,
  maxHeight: number = 1024,
  quality: number = 0.85
): Promise<{ dataUrl: string; size: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      reject(new Error("Could not get canvas context"));
      return;
    }

    img.onload = () => {
      // Calculate new dimensions maintaining aspect ratio
      let { width, height } = img;

      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width *= ratio;
        height *= ratio;
      }

      canvas.width = width;
      canvas.height = height;

      // Draw image with white background (for transparent images)
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      // Convert to JPEG with specified quality
      const dataUrl = canvas.toDataURL("image/jpeg", quality);
      const size = Math.round((dataUrl.length * 3) / 4); // Approximate base64 size in bytes

      resolve({ dataUrl, size });
    };

    img.onerror = () => reject(new Error("Failed to load image"));

    // Read file as data URL
    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

// Format file size for display
function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function ImageUpload({
  onImagesSelected,
  selectedImages,
  onRemoveImage,
  disabled,
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [processing, setProcessing] = useState<ProcessingImage[]>([]);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB before compression
  const MAX_IMAGES = 4;

  const processFiles = useCallback(
    async (files: FileList | null) => {
      if (!files) return;

      setGlobalError(null);
      const filesArray = Array.from(files);

      // Check if adding these would exceed the limit
      if (selectedImages.length + filesArray.length > MAX_IMAGES) {
        setGlobalError(
          `Máximo ${MAX_IMAGES} imágenes permitidas. Ya tienes ${selectedImages.length}.`
        );
        setTimeout(() => setGlobalError(null), 5000);
        return;
      }

      const newImages: { mimeType: string; data: string; preview: string }[] =
        [];
      const processingStates: ProcessingImage[] = [];

      // Initialize processing states
      for (const file of filesArray) {
        if (!file.type.startsWith("image/")) continue;

        processingStates.push({
          name: file.name,
          status: "compressing",
          originalSize: file.size,
        });
      }
      setProcessing(processingStates);

      // Process each file
      for (let i = 0; i < filesArray.length; i++) {
        const file = filesArray[i];

        if (!file.type.startsWith("image/")) {
          processingStates[i].status = "error";
          processingStates[i].error = "No es una imagen válida";
          setProcessing([...processingStates]);
          continue;
        }

        // Check max file size before compression
        if (file.size > MAX_FILE_SIZE) {
          processingStates[i].status = "error";
          processingStates[i].error =
            `Muy grande (${formatSize(file.size)}). Máx: ${formatSize(MAX_FILE_SIZE)}`;
          setProcessing([...processingStates]);
          continue;
        }

        try {
          // Compress image
          const { dataUrl, size } = await compressImage(file, 1024, 1024, 0.85);
          const base64 = dataUrl.split(",")[1];

          processingStates[i].status = "done";
          processingStates[i].compressedSize = size;
          setProcessing([...processingStates]);

          newImages.push({
            mimeType: "image/jpeg",
            data: base64,
            preview: dataUrl,
          });
        } catch (error) {
          console.error("Error processing image:", error);
          processingStates[i].status = "error";
          processingStates[i].error = "Error al procesar";
          setProcessing([...processingStates]);
        }
      }

      // Send processed images
      if (newImages.length > 0) {
        onImagesSelected(newImages);
      }

      // Clear processing states after a delay
      setTimeout(() => setProcessing([]), 2000);
    },
    [selectedImages.length, onImagesSelected, MAX_FILE_SIZE]
  );

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    processFiles(e.dataTransfer.files);
  };

  const hasProcessing = processing.length > 0;
  const isAtLimit = selectedImages.length >= MAX_IMAGES;

  return (
    <div className="space-y-3">
      {/* Global Error */}
      {globalError && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 px-3 py-2 animate-in fade-in">
          <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
          <span className="text-sm text-red-700 dark:text-red-300">
            {globalError}
          </span>
          <button
            onClick={() => setGlobalError(null)}
            className="ml-auto text-red-400 hover:text-red-600"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}

      {/* Image Previews */}
      {selectedImages.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {selectedImages.map((img, idx) => (
            <div
              key={idx}
              className="relative group rounded-lg overflow-hidden border border-border h-20 w-20 shadow-sm"
            >
              <img
                src={img.preview}
                alt={`Upload ${idx + 1}`}
                className="h-full w-full object-cover"
              />
              {/* Size badge */}
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[8px] px-1 py-0.5 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                {formatSize(img.data.length * 0.75)}
              </div>
              <button
                type="button"
                onClick={() => onRemoveImage(idx)}
                className="absolute top-0.5 right-0.5 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                title="Remover imagen"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Processing Indicator */}
      {hasProcessing && (
        <div className="space-y-2 animate-in fade-in">
          {processing.map((proc, idx) => (
            <div
              key={idx}
              className={`flex items-center gap-2 text-sm rounded-lg px-3 py-2 ${
                proc.status === "error"
                  ? "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300"
                  : proc.status === "done"
                    ? "bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300"
                    : "bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300"
              }`}
            >
              {proc.status === "compressing" && (
                <Loader2 className="h-4 w-4 animate-spin flex-shrink-0" />
              )}
              {proc.status === "done" && (
                <Check className="h-4 w-4 flex-shrink-0" />
              )}
              {proc.status === "error" && (
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
              )}
              <span className="truncate flex-1">{proc.name}</span>
              {proc.status === "compressing" && (
                <span className="text-xs opacity-70">Comprimiendo...</span>
              )}
              {proc.status === "done" && proc.compressedSize && (
                <span className="text-xs opacity-70">
                  {formatSize(proc.originalSize)} →{" "}
                  {formatSize(proc.compressedSize)}
                </span>
              )}
              {proc.status === "error" && proc.error && (
                <span className="text-xs opacity-70">{proc.error}</span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload Area */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled && !isAtLimit) {
            setIsDragOver(true);
          }
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        className={
          isDragOver ? "ring-2 ring-primary ring-offset-2 rounded-lg" : ""
        }
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => processFiles(e.target.files)}
        />
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className={`h-10 w-10 rounded-full transition-colors relative ${
            isAtLimit
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-primary/10 text-muted-foreground hover:text-primary"
          }`}
          onClick={() => !isAtLimit && fileInputRef.current?.click()}
          disabled={disabled || isAtLimit || hasProcessing}
          title={
            isAtLimit
              ? `Máximo ${MAX_IMAGES} imágenes`
              : "Subir imagen del proyecto"
          }
        >
          <ImagePlus className="h-5 w-5" />
          {selectedImages.length > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[10px] font-medium flex items-center justify-center">
              {selectedImages.length}
            </span>
          )}
        </Button>
      </div>

      {/* Helper Text */}
      {selectedImages.length === 0 && !hasProcessing && (
        <p className="text-[10px] text-muted-foreground">
          Arrastra imágenes o haz clic. Se comprimen automáticamente.
        </p>
      )}
      {isAtLimit && (
        <p className="text-[10px] text-orange-600 dark:text-orange-400">
          Máximo {MAX_IMAGES} imágenes. Remueve una para agregar más.
        </p>
      )}
    </div>
  );
}

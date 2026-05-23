"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { CloudUpload, X, Loader2, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api-client";

interface ImageUploadProps {
  value: string[];
  onChange: (value: string[]) => void;
  maxFiles?: number;
}

export function ImageUpload({ value, onChange, maxFiles = 5 }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (value.length + acceptedFiles.length > maxFiles) {
      toast.error(`Bạn chỉ có thể tải lên tối đa ${maxFiles} ảnh`);
      return;
    }

    setIsUploading(true);
    
    try {
      const uploadPromises = acceptedFiles.map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);

        const data = await apiClient.fetch<any>(`/upload`, {
          method: "POST",
          body: formData,
        });

        return data.url;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      onChange([...value, ...uploadedUrls]);
      toast.success(`Đã tải lên ${uploadedUrls.length} ảnh`);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Có lỗi xảy ra khi tải ảnh lên");
    } finally {
      setIsUploading(false);
    }
  }, [value, onChange, maxFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp"]
    },
    disabled: isUploading || value.length >= maxFiles
  });

  const removeImage = (url: string) => {
    onChange(value.filter((item) => item !== url));
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {value.map((url) => (
          <div key={url} className="relative aspect-square rounded-xl overflow-hidden border border-border group shadow-sm">
            <img src={url} alt="Product" className="w-full h-full object-cover" />
            <button
              onClick={() => removeImage(url)}
              className="absolute top-2 right-2 p-1.5 bg-destructive text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
              type="button"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
        
        {value.length < maxFiles && (
          <div
            {...getRootProps()}
            className={cn(
              "aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all gap-2",
              isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/50",
              isUploading && "opacity-50 cursor-not-allowed"
            )}
          >
            <input {...getInputProps()} />
            {isUploading ? (
              <>
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <p className="text-xs text-muted-foreground font-medium">Đang tải...</p>
              </>
            ) : (
              <>
                <CloudUpload className={cn("w-8 h-8 transition-colors", isDragActive ? "text-primary" : "text-muted-foreground")} />
                <div className="text-center px-2">
                  <p className="text-[10px] font-bold text-foreground uppercase tracking-tight">Tải ảnh lên</p>
                  <p className="text-[9px] text-muted-foreground mt-0.5">{value.length}/{maxFiles} ảnh</p>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

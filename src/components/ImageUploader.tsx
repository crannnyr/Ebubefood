import { useState, useCallback } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { useStore } from '@/store/useStore';

interface Props {
  onImageSelect: (file: File, previewUrl: string) => void;
  accept?: string;
  maxSizeMB?: number;
}

export async function compressImage(file: File): Promise<{ blob: Blob; previewUrl: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const maxWidth = 1200;
      const scale = Math.min(1, maxWidth / img.width);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => {
          if (!blob) { reject(new Error('Canvas to Blob failed')); return; }
          const url = URL.createObjectURL(blob);
          resolve({ blob, previewUrl: url });
        },
        'image/webp',
        0.8
      );
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    const url = URL.createObjectURL(file);
    img.src = url;
  });
}

export default function ImageUploader({ onImageSelect, accept = 'image/*', maxSizeMB = 5 }: Props) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const addToast = useStore(s => s.addToast);

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      addToast('error', 'Please select an image file');
      return;
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      addToast('error', `File too large. Max ${maxSizeMB}MB`);
      return;
    }
    setIsCompressing(true);
    try {
      const localPreview = URL.createObjectURL(file);
      setPreview(localPreview);
      const { blob, previewUrl } = await compressImage(file);
      const compressedFile = new File([blob], file.name.replace(/\.[^.]+$/, '.webp'), { type: 'image/webp' });
      onImageSelect(compressedFile, previewUrl);
      addToast('success', 'Image compressed and ready');
    } catch (err) {
      addToast('error', 'Failed to process image');
    } finally {
      setIsCompressing(false);
    }
  }, [onImageSelect, maxSizeMB, addToast]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  return (
    <div className="w-full">
      {preview ? (
        <div className="relative rounded-xl overflow-hidden aspect-video">
          <img src={preview} alt="Preview" className="w-full h-full object-cover" />
          <button
            onClick={() => setPreview(null)}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
          >
            <X size={16} />
          </button>
          {isCompressing && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="flex items-center gap-2 text-white">
                <Loader2 size={18} className="animate-spin" />
                <span className="text-sm">Compressing...</span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <label
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          className="flex flex-col items-center justify-center w-full aspect-video rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200"
          style={{
            borderColor: isDragging ? 'var(--primary)' : 'var(--border)',
            background: isDragging ? 'var(--primary-light)' : 'transparent',
          }}
        >
          <Upload size={28} style={{ color: 'var(--text-muted)' }} />
          <p className="mt-2 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
            {isDragging ? 'Drop image here' : 'Click or drag image here'}
          </p>
          <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
            Max {maxSizeMB}MB. Auto-compressed to WebP.
          </p>
          <input type="file" accept={accept} onChange={onChange} className="hidden" />
        </label>
      )}
    </div>
  );
}

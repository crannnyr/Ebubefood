import { useState, useCallback } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { useStore } from '@/store/useStore';

interface Props {
  onImageSelect: (file: File, previewUrl: string) => void;
  accept?: string;
  maxSizeMB?: number;
}

export async function compressImage(file: File, targetKB = 80): Promise<{ blob: Blob; previewUrl: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = async () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const maxWidth = 900;
      const scale = Math.min(1, maxWidth / img.width);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      let quality = 0.75;
      let blob: Blob | null = null;

      while (quality >= 0.3) {
        blob = await new Promise<Blob | null>(res =>
          canvas.toBlob(res, 'image/webp', quality)
        );
        if (!blob) break;
        if (blob.size <= targetKB * 1024) break;
        quality -= 0.1;
      }

      if (!blob) { reject(new Error('Compression failed')); return; }
      const url = URL.createObjectURL(blob);
      resolve({ blob, previewUrl: url });
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

export default function ImageUploader({ onImageSelect, accept = 'image/*', maxSizeMB = 5 }: Props) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [sizeInfo, setSizeInfo] = useState<string | null>(null);
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
    setSizeInfo(null);
    try {
      const localPreview = URL.createObjectURL(file);
      setPreview(localPreview);
      const { blob, previewUrl } = await compressImage(file);
      const kb = Math.round(blob.size / 1024);
      setSizeInfo(`${kb}KB`);
      const compressedFile = new File([blob], file.name.replace(/\.[^.]+$/, '.webp'), { type: 'image/webp' });
      onImageSelect(compressedFile, previewUrl);
      addToast('success', `Image ready — ${kb}KB`);
    } catch {
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
            onClick={() => { setPreview(null); setSizeInfo(null); }}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
          >
            <X size={16} />
          </button>
          {sizeInfo && !isCompressing && (
            <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-medium bg-black/60 text-green-400">
              {sizeInfo}
            </span>
          )}
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
            Auto-compressed to WebP under 80KB
          </p>
          <input type="file" accept={accept} onChange={onChange} className="hidden" />
        </label>
      )}
    </div>
  );
}
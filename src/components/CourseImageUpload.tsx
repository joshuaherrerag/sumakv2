import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Upload, ImageIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CourseImageUploadProps {
  currentImageUrl?: string | null;
  cursoId: string;
  onUploadComplete: (url: string) => void;
}

export default function CourseImageUpload({ currentImageUrl, cursoId, onUploadComplete }: CourseImageUploadProps) {
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(currentImageUrl ?? null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Solo se permiten imágenes', variant: 'destructive' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'La imagen no puede superar los 5MB', variant: 'destructive' });
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `${cursoId}/cover-${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('course-covers')
        .upload(path, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('course-covers').getPublicUrl(path);
      const publicUrl = data.publicUrl;

      setPreview(publicUrl);
      onUploadComplete(publicUrl);
      toast({ title: 'Portada subida' });
    } catch (e: any) {
      toast({ title: 'Error al subir la portada', description: e.message, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <div
        className="relative w-full aspect-video rounded-xl border-2 border-dashed border-border overflow-hidden cursor-pointer group bg-muted/30"
        onClick={() => !uploading && inputRef.current?.click()}
      >
        {preview ? (
          <img src={preview} alt="Portada" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
            <ImageIcon className="h-10 w-10" />
            <span className="text-sm">Portada del curso (16:9, máx 5MB)</span>
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          </div>
        )}
        {!uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex flex-col items-center gap-2 text-white">
              <Upload className="h-8 w-8" />
              <span className="text-sm font-medium">Cambiar portada</span>
            </div>
          </div>
        )}
      </div>
      <Button type="button" variant="outline" size="sm" disabled={uploading} onClick={() => inputRef.current?.click()}>
        {uploading ? (
          <><Loader2 className="mr-2 h-3 w-3 animate-spin" />Subiendo...</>
        ) : (
          <><Upload className="mr-2 h-3 w-3" />Subir portada</>
        )}
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />
    </div>
  );
}

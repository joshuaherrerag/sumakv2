import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Upload, ImageIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface BannerUploadProps {
  currentBannerUrl?: string | null;
  profileId: string;
  onUploadComplete: (url: string) => void;
}

export default function BannerUpload({ currentBannerUrl, profileId, onUploadComplete }: BannerUploadProps) {
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(currentBannerUrl ?? null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Solo se permiten imágenes', variant: 'destructive' });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: 'La imagen no puede superar los 10MB', variant: 'destructive' });
      return;
    }

    setUploading(true);
    try {
      // Get mentor id from profile_id
      const { data: mentorData, error: mentorError } = await supabase
        .from('mentores')
        .select('id')
        .eq('profile_id', profileId)
        .single();

      if (mentorError || !mentorData) throw new Error('No se encontró el perfil de mentor');

      const ext = file.name.split('.').pop();
      const path = `${mentorData.id}/banner-${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('avatars').getPublicUrl(path);
      const publicUrl = data.publicUrl;

      // Get current redes_sociales to merge
      const { data: profileData } = await supabase
        .from('profiles')
        .select('redes_sociales')
        .eq('id', profileId)
        .single();

      const currentRedes = (profileData?.redes_sociales as Record<string, string>) ?? {};

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ redes_sociales: { ...currentRedes, banner_url: publicUrl } })
        .eq('id', profileId);

      if (updateError) throw updateError;

      setPreview(publicUrl);
      onUploadComplete(publicUrl);
      toast({ title: 'Banner actualizado' });
    } catch (e: any) {
      toast({ title: 'Error al subir el banner', description: e.message, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <div
        className="relative h-48 w-full rounded-xl border-2 border-dashed border-border overflow-hidden cursor-pointer group"
        onClick={() => !uploading && inputRef.current?.click()}
      >
        {preview ? (
          <img src={preview} alt="Banner" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
            <ImageIcon className="h-10 w-10" />
            <span className="text-sm">Subir banner (recomendado 1200×400px)</span>
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
              <span className="text-sm font-medium">Cambiar banner</span>
            </div>
          </div>
        )}
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
      >
        {uploading ? (
          <><Loader2 className="mr-2 h-3 w-3 animate-spin" />Subiendo...</>
        ) : (
          <><Upload className="mr-2 h-3 w-3" />Subir banner</>
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

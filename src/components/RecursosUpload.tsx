import { useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Loader2, Upload, FileText, Trash2, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface RecursosUploadProps {
  leccionId: string;
}

const TIPOS_PERMITIDOS = ['.pdf', '.epub', '.zip'];
const MAX_SIZE = 50 * 1024 * 1024; // 50MB

export default function RecursosUpload({ leccionId }: RecursosUploadProps) {
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();

  const { data: recursos } = useQuery({
    queryKey: ['recursos', leccionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('recursos_descargables')
        .select('*')
        .eq('leccion_id', leccionId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });

  const deleteRecurso = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('recursos_descargables').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recursos', leccionId] });
      toast({ title: 'Recurso eliminado' });
    },
  });

  const handleFile = async (file: File) => {
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!TIPOS_PERMITIDOS.includes(ext)) {
      toast({ title: 'Tipo no permitido', description: 'Solo PDF, EPUB y ZIP', variant: 'destructive' });
      return;
    }
    if (file.size > MAX_SIZE) {
      toast({ title: 'El archivo no puede superar los 50MB', variant: 'destructive' });
      return;
    }

    setUploading(true);
    try {
      const path = `${leccionId}/recurso-${Date.now()}${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('resources')
        .upload(path, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('resources').getPublicUrl(path);

      const { error: insertError } = await supabase.from('recursos_descargables').insert({
        leccion_id: leccionId,
        nombre: file.name,
        tipo: ext.replace('.', '').toUpperCase(),
        url: data.publicUrl,
      });

      if (insertError) throw insertError;

      queryClient.invalidateQueries({ queryKey: ['recursos', leccionId] });
      toast({ title: 'Recurso subido' });
    } catch (e: any) {
      toast({ title: 'Error al subir el recurso', description: e.message, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      {(recursos || []).length > 0 && (
        <div className="space-y-1">
          {(recursos || []).map((r: any) => (
            <div key={r.id} className="flex items-center justify-between rounded-md bg-muted/30 px-3 py-2 text-sm">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="truncate max-w-[160px]">{r.nombre}</span>
                <span className="text-xs text-muted-foreground">{r.tipo}</span>
              </div>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0" asChild>
                  <a href={r.url} download target="_blank" rel="noreferrer">
                    <Download className="h-3 w-3" />
                  </a>
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                  onClick={() => deleteRecurso.mutate(r.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
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
          <><Upload className="mr-2 h-3 w-3" />Agregar recurso (PDF/EPUB/ZIP)</>
        )}
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.epub,.zip"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />
    </div>
  );
}

import { useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Image, Loader2, Trash2, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { ComentariosPost } from '@/components/comunidad/ComentariosPost';

const REACCIONES = [
  { tipo: 'like', emoji: '👍' },
  { tipo: 'love', emoji: '❤️' },
  { tipo: 'fire', emoji: '🔥' },
] as const;

export default function ComunidadPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [contenido, setContenido] = useState('');
  const [imagenFile, setImagenFile] = useState<File | null>(null);
  const [imagenPreview, setImagenPreview] = useState<string | null>(null);

  // Profile id del usuario actual
  const { data: miProfile } = useQuery({
    queryKey: ['my-profile', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, nombre, apellido, avatar_url')
        .eq('user_id', user!.id)
        .single();
      return data;
    },
  });

  // Posts con autor, reacciones y conteo de comentarios
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['posts-comunidad'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles!autor_id(id, nombre, apellido, avatar_url),
          post_reacciones(tipo, usuario_id),
          post_comentarios(id)
        `)
        .order('created_at', { ascending: false })
        .limit(30);
      if (error) throw error;
      return data || [];
    },
  });

  // Publicar post
  const publicar = useMutation({
    mutationFn: async () => {
      if (!miProfile || !contenido.trim()) return;

      let imagen_url: string | null = null;

      if (imagenFile) {
        const ext = imagenFile.name.split('.').pop();
        const path = `${miProfile.id}/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from('posts-media')
          .upload(path, imagenFile, { upsert: true });
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage
          .from('posts-media')
          .getPublicUrl(path);
        imagen_url = urlData.publicUrl;
      }

      const { error } = await supabase
        .from('posts')
        .insert({ autor_id: miProfile.id, contenido: contenido.trim(), imagen_url });
      if (error) throw error;
    },
    onSuccess: () => {
      setContenido('');
      setImagenFile(null);
      setImagenPreview(null);
      queryClient.invalidateQueries({ queryKey: ['posts-comunidad'] });
      toast({ title: '¡Post publicado!' });
    },
    onError: (e: Error) => {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    },
  });

  // Reaccionar a un post
  const reaccionar = useMutation({
    mutationFn: async ({ postId, tipo }: { postId: string; tipo: string }) => {
      if (!miProfile) return;

      // Buscar reacción existente del usuario en este post
      const { data: existente } = await supabase
        .from('post_reacciones')
        .select('id, tipo')
        .eq('post_id', postId)
        .eq('usuario_id', miProfile.id)
        .maybeSingle();

      if (existente) {
        if (existente.tipo === tipo) {
          // Mismo tipo → quitar reacción
          await supabase.from('post_reacciones').delete().eq('id', existente.id);
        } else {
          // Tipo distinto → cambiar reacción
          await supabase
            .from('post_reacciones')
            .update({ tipo })
            .eq('id', existente.id);
        }
      } else {
        await supabase
          .from('post_reacciones')
          .insert({ post_id: postId, usuario_id: miProfile.id, tipo });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts-comunidad'] });
    },
  });

  // Borrar post propio
  const borrarPost = useMutation({
    mutationFn: async (postId: string) => {
      const { error } = await supabase.from('posts').delete().eq('id', postId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts-comunidad'] });
      toast({ title: 'Post eliminado' });
    },
  });

  const handleImagenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: 'La imagen no puede superar 10 MB', variant: 'destructive' });
      return;
    }
    setImagenFile(file);
    setImagenPreview(URL.createObjectURL(file));
  };

  const miInitials = miProfile
    ? `${miProfile.nombre?.[0] || ''}${miProfile.apellido?.[0] || ''}`.toUpperCase()
    : '?';

  return (
    <div className="container max-w-2xl py-10 px-4 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">
          Comunidad <span className="gradient-text">Sumak</span>
        </h1>
        <p className="text-muted-foreground mt-1">
          Compartí experiencias, aprendizajes y momentos con la comunidad
        </p>
      </div>

      {/* Compositor de post */}
      {user ? (
        <Card className="border-border/50">
          <CardContent className="p-4 space-y-3">
            <div className="flex gap-3">
              <Avatar className="h-9 w-9 shrink-0">
                <AvatarImage src={miProfile?.avatar_url || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                  {miInitials}
                </AvatarFallback>
              </Avatar>
              <Textarea
                placeholder="¿Qué querés compartir hoy?"
                value={contenido}
                onChange={(e) => setContenido(e.target.value)}
                rows={3}
                className="resize-none border-0 bg-muted/50 focus-visible:ring-0 rounded-xl"
              />
            </div>

            {imagenPreview && (
              <div className="relative ml-12">
                <img
                  src={imagenPreview}
                  alt="Preview"
                  className="rounded-xl max-h-48 object-cover"
                />
                <button
                  className="absolute top-2 right-2 bg-background/80 rounded-full p-1 hover:bg-background"
                  onClick={() => { setImagenFile(null); setImagenPreview(null); }}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            <div className="flex items-center justify-between ml-12">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-muted-foreground gap-1.5"
                onClick={() => fileInputRef.current?.click()}
              >
                <Image className="h-4 w-4" />
                Imagen
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImagenChange}
              />
              <Button
                size="sm"
                className="gradient-sumak text-white border-0 rounded-full px-5"
                disabled={!contenido.trim() || publicar.isPending}
                onClick={() => publicar.mutate()}
              >
                {publicar.isPending ? (
                  <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" />Publicando...</>
                ) : (
                  'Publicar'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border/50">
          <CardContent className="p-6 text-center space-y-3">
            <p className="text-muted-foreground">
              <a href="/login" className="text-primary hover:underline font-medium">Iniciá sesión</a>
              {' '}para participar en la comunidad
            </p>
          </CardContent>
        </Card>
      )}

      {/* Feed */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-border/50 animate-pulse">
              <CardContent className="p-5 space-y-3">
                <div className="flex gap-3">
                  <div className="h-10 w-10 rounded-full bg-muted shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-32 bg-muted rounded" />
                    <div className="h-3 w-full bg-muted rounded" />
                    <div className="h-3 w-3/4 bg-muted rounded" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg">Aún no hay posts en la comunidad.</p>
          <p className="text-sm mt-1">¡Sé el primero en compartir algo!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post: any) => {
            const autor = post.profiles;
            const reacciones: any[] = post.post_reacciones || [];
            const autorInitials = `${autor.nombre?.[0] || ''}${autor.apellido?.[0] || ''}`.toUpperCase();
            const esMio = miProfile?.id === autor.id;
            const miReaccion = reacciones.find((r) => r.usuario_id === miProfile?.id);

            return (
              <Card key={post.id} className="border-border/50">
                <CardContent className="p-5 space-y-4">
                  {/* Header del post */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 shrink-0">
                        <AvatarImage src={autor.avatar_url || undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                          {autorInitials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-sm">
                          {autor.nombre} {autor.apellido}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(post.created_at), {
                            addSuffix: true,
                            locale: es,
                          })}
                        </p>
                      </div>
                    </div>
                    {esMio && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => {
                          if (confirm('¿Eliminar este post?')) borrarPost.mutate(post.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  {/* Contenido */}
                  <p className="text-sm leading-relaxed whitespace-pre-line">{post.contenido}</p>

                  {/* Imagen */}
                  {post.imagen_url && (
                    <img
                      src={post.imagen_url}
                      alt="Post"
                      className="rounded-xl w-full max-h-80 object-cover"
                    />
                  )}

                  {/* Reacciones */}
                  <div className="flex items-center gap-1 pt-1 border-t border-border/40">
                    {REACCIONES.map(({ tipo, emoji }) => {
                      const count = reacciones.filter((r) => r.tipo === tipo).length;
                      const activa = miReaccion?.tipo === tipo;
                      return (
                        <button
                          key={tipo}
                          disabled={!user}
                          onClick={() => reaccionar.mutate({ postId: post.id, tipo })}
                          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-sm transition-all ${
                            activa
                              ? 'bg-primary/10 text-primary font-medium'
                              : 'hover:bg-muted text-muted-foreground'
                          } disabled:opacity-40 disabled:cursor-default`}
                        >
                          <span>{emoji}</span>
                          {count > 0 && <span className="text-xs">{count}</span>}
                        </button>
                      );
                    })}

                    <div className="ml-auto">
                      <ComentariosPost postId={post.id} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

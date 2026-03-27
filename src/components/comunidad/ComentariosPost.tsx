import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageCircle, Send, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface ComentariosPostProps {
  postId: string;
}

export function ComentariosPost({ postId }: ComentariosPostProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [abierto, setAbierto] = useState(false);
  const [texto, setTexto] = useState('');

  const { data: miProfileId } = useQuery({
    queryKey: ['my-profile-id', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user!.id)
        .single();
      return data?.id ?? null;
    },
  });

  const { data: comentarios = [] } = useQuery({
    queryKey: ['comentarios', postId],
    enabled: abierto,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('post_comentarios')
        .select('*, profiles!autor_id(nombre, apellido, avatar_url)')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });

  const { data: totalComentarios = 0 } = useQuery({
    queryKey: ['comentarios-count', postId],
    queryFn: async () => {
      const { count } = await supabase
        .from('post_comentarios')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', postId);
      return count ?? 0;
    },
  });

  const agregarComentario = useMutation({
    mutationFn: async () => {
      if (!miProfileId || !texto.trim()) return;
      const { error } = await supabase
        .from('post_comentarios')
        .insert({ post_id: postId, autor_id: miProfileId, contenido: texto.trim() });
      if (error) throw error;
    },
    onSuccess: () => {
      setTexto('');
      queryClient.invalidateQueries({ queryKey: ['comentarios', postId] });
      queryClient.invalidateQueries({ queryKey: ['comentarios-count', postId] });
    },
  });

  const borrarComentario = useMutation({
    mutationFn: async (comentarioId: string) => {
      const { error } = await supabase
        .from('post_comentarios')
        .delete()
        .eq('id', comentarioId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comentarios', postId] });
      queryClient.invalidateQueries({ queryKey: ['comentarios-count', postId] });
    },
  });

  return (
    <div>
      <Button
        variant="ghost"
        size="sm"
        className="gap-1.5 text-muted-foreground hover:text-foreground"
        onClick={() => setAbierto(!abierto)}
      >
        <MessageCircle className="h-4 w-4" />
        {totalComentarios > 0 && <span>{totalComentarios}</span>}
        <span className="text-xs">{abierto ? 'Ocultar' : 'Comentarios'}</span>
      </Button>

      {abierto && (
        <div className="mt-3 space-y-3 border-t border-border/50 pt-3">
          {comentarios.map((c: any) => {
            const prof = c.profiles;
            const initials = `${prof.nombre?.[0] || ''}${prof.apellido?.[0] || ''}`.toUpperCase();
            const esMio = c.autor_id === miProfileId;
            return (
              <div key={c.id} className="flex gap-2">
                <Avatar className="h-7 w-7 shrink-0">
                  <AvatarImage src={prof.avatar_url || undefined} />
                  <AvatarFallback className="text-xs bg-primary/10 text-primary">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="bg-muted rounded-xl px-3 py-2">
                    <p className="text-xs font-semibold mb-0.5">
                      {prof.nombre} {prof.apellido}
                    </p>
                    <p className="text-sm">{c.contenido}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 px-1">
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(c.created_at), { addSuffix: true, locale: es })}
                    </span>
                    {esMio && (
                      <button
                        className="text-xs text-destructive hover:underline"
                        onClick={() => borrarComentario.mutate(c.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {user ? (
            <div className="flex gap-2">
              <Textarea
                placeholder="Escribí un comentario..."
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                rows={1}
                className="resize-none text-sm min-h-0 py-2"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    agregarComentario.mutate();
                  }
                }}
              />
              <Button
                size="icon"
                className="shrink-0 gradient-sumak text-white border-0"
                disabled={!texto.trim() || agregarComentario.isPending}
                onClick={() => agregarComentario.mutate()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-2">
              <a href="/login" className="text-primary hover:underline">Iniciá sesión</a> para comentar
            </p>
          )}
        </div>
      )}
    </div>
  );
}

import { useQuery } from '@tanstack/react-query';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Rss } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export function FeedPersonalizado() {
  const { user } = useAuth();
  const navigate = useNavigate();

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

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['feed-personalizado', miProfileId],
    enabled: !!miProfileId,
    queryFn: async () => {
      // Obtener IDs de perfiles que sigo
      const { data: seguidos } = await supabase
        .from('seguimientos')
        .select('seguido_id')
        .eq('seguidor_id', miProfileId!);

      if (!seguidos || seguidos.length === 0) return [];

      const seguidoIds = seguidos.map((s) => s.seguido_id);

      const { data, error } = await supabase
        .from('posts')
        .select('*, profiles!autor_id(nombre, apellido, avatar_url)')
        .in('autor_id', seguidoIds)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data || [];
    },
  });

  if (!user) return null;

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-base flex items-center gap-2">
          <Rss className="h-4 w-4 text-primary" />
          Feed de la comunidad
        </CardTitle>
        <Button variant="ghost" size="icon" asChild>
          <Link to="/comunidad"><ArrowRight className="h-4 w-4" /></Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="flex gap-2 animate-pulse">
                <div className="h-8 w-8 rounded-full bg-muted shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-24 bg-muted rounded" />
                  <div className="h-3 w-full bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-4 space-y-2">
            <p className="text-sm text-muted-foreground">
              Seguí a mentores para ver su contenido aquí
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate('/mentores')}
            >
              Explorar mentores
            </Button>
          </div>
        ) : (
          posts.map((post: any) => {
            const prof = post.profiles;
            const initials = `${prof.nombre?.[0] || ''}${prof.apellido?.[0] || ''}`.toUpperCase();
            return (
              <div key={post.id} className="flex gap-2">
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarImage src={prof.avatar_url || undefined} />
                  <AvatarFallback className="text-xs bg-primary/10 text-primary">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {prof.nombre} {prof.apellido}
                  </p>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {post.contenido}
                  </p>
                  <p className="text-xs text-muted-foreground/60 mt-0.5">
                    {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: es })}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}

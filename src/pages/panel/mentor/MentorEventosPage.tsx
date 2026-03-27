import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, MapPin, Plus, Trash2, Video } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export default function MentorEventosPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: mentor } = useQuery({
    queryKey: ['current-mentor', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user!.id)
        .single();
      if (!profile) return null;
      const { data: mentorRow } = await supabase
        .from('mentores')
        .select('id')
        .eq('profile_id', profile.id)
        .single();
      return mentorRow ?? null;
    },
  });

  const mentorId = mentor?.id ?? null;

  const { data: eventos, isLoading } = useQuery({
    queryKey: ['mentor-eventos', mentorId],
    enabled: !!mentorId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('eventos')
        .select(`*, evento_mentores!inner(rol)`)
        .eq('evento_mentores.mentor_id', mentorId!)
        .order('fecha_inicio', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const borrarEvento = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('eventos').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mentor-eventos', mentorId] });
      toast({ title: 'Evento eliminado' });
    },
    onError: (e: Error) => {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    },
  });

  const handleDelete = (id: string, titulo: string) => {
    if (confirm(`¿Eliminar el evento "${titulo}"?`)) {
      borrarEvento.mutate(id);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Mis eventos</h1>
          <p className="text-muted-foreground">Eventos que organizás para tu comunidad</p>
        </div>
        <Button className="gradient-primary" onClick={() => navigate('/panel/mentor/eventos/nuevo')}>
          <Plus className="mr-2 h-4 w-4" /> Nuevo evento
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardContent className="p-5 space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (eventos || []).length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Calendar className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>Aún no creaste ningún evento.</p>
          <Button
            className="mt-4 gradient-primary"
            onClick={() => navigate('/panel/mentor/eventos/nuevo')}
          >
            Crear primer evento
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {(eventos || []).map((evento: any) => (
            <Card key={evento.id} className="border-border/50">
              <CardContent className="p-5 flex items-start gap-4">
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="flex items-center gap-1 text-xs">
                      {evento.tipo === 'online' ? (
                        <Video className="h-3 w-3" />
                      ) : (
                        <MapPin className="h-3 w-3" />
                      )}
                      {evento.tipo === 'hibrido'
                        ? 'Híbrido'
                        : evento.tipo === 'online'
                        ? 'Online'
                        : 'Presencial'}
                    </Badge>
                    {evento.modalidad_acceso === 'incluido' ? (
                      <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
                        Incluido
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">
                        ${Number(evento.precio).toLocaleString('es-AR')}
                      </Badge>
                    )}
                  </div>
                  <h3 className="font-semibold truncate">{evento.titulo}</h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {format(new Date(evento.fecha_inicio), "d 'de' MMMM, yyyy — HH:mm", {
                      locale: es,
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate(`/eventos/${evento.id}`)}
                  >
                    Ver
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDelete(evento.id, evento.titulo)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

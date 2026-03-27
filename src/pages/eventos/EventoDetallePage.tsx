import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, Clock, Loader2, MapPin, Users, Video } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export default function EventoDetallePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: evento, isLoading: eventoLoading } = useQuery({
    queryKey: ['evento', id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('eventos').select('*').eq('id', id!).single();
      if (error) throw error;
      return data;
    },
  });

  const { data: ponentes } = useQuery({
    queryKey: ['evento-ponentes', id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('evento_mentores')
        .select('rol, mentores!inner(id, profiles!inner(nombre, apellido, avatar_url, especialidad))')
        .eq('evento_id', id!);
      if (error) throw error;
      return data || [];
    },
  });

  const { data: inscripcion } = useQuery({
    queryKey: ['evento-inscripcion', id, user?.id],
    enabled: !!id && !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from('inscripciones_evento')
        .select('id')
        .eq('evento_id', id!)
        .eq('usuario_id', user!.id)
        .maybeSingle();
      return data;
    },
  });

  const inscribirse = useMutation({
    mutationFn: async () => {
      if (!user) { navigate('/login'); return; }

      const { error } = await supabase
        .from('inscripciones_evento')
        .insert({ evento_id: id!, usuario_id: user.id, estado: 'confirmada' });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evento-inscripcion', id, user?.id] });
      toast({ title: '¡Inscripto!', description: 'Te inscribiste exitosamente al evento.' });
    },
    onError: (e: Error) => {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    },
  });

  if (eventoLoading) {
    return (
      <div className="container max-w-4xl py-8 space-y-6">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-4 w-64" />
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-4">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  if (!evento) {
    return (
      <div className="container max-w-4xl py-8 text-center">
        <p className="text-muted-foreground">Evento no encontrado.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/eventos')}>
          Ver todos los eventos
        </Button>
      </div>
    );
  }

  const estaInscrito = !!inscripcion;

  return (
    <div className="container max-w-4xl py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="flex items-center gap-1">
            {evento.tipo === 'online' ? <Video className="h-3 w-3" /> : <MapPin className="h-3 w-3" />}
            {evento.tipo === 'hibrido' ? 'Híbrido' : evento.tipo === 'online' ? 'Online' : 'Presencial'}
          </Badge>
          {evento.modalidad_acceso === 'incluido' ? (
            <Badge className="bg-primary/10 text-primary border-primary/20">Incluido en suscripción</Badge>
          ) : (
            <Badge variant="secondary">Premium</Badge>
          )}
        </div>

        <h1 className="text-3xl font-bold">{evento.titulo}</h1>

        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            {format(new Date(evento.fecha_inicio), "d 'de' MMMM, yyyy", { locale: es })}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            {format(new Date(evento.fecha_inicio), 'HH:mm')} – {format(new Date(evento.fecha_fin), 'HH:mm')}
          </span>
          {evento.ubicacion && (
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" />
              {evento.ubicacion}
            </span>
          )}
          {evento.aforo && (
            <span className="flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              Aforo: {evento.aforo} personas
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Columna principal */}
        <div className="md:col-span-2 space-y-6">
          <Card className="border-border/50">
            <CardContent className="p-6 space-y-3">
              <h2 className="text-xl font-semibold">Sobre el evento</h2>
              <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                {evento.descripcion}
              </p>
            </CardContent>
          </Card>

          {(ponentes || []).length > 0 && (
            <Card className="border-border/50">
              <CardContent className="p-6 space-y-4">
                <h2 className="text-xl font-semibold">Ponentes</h2>
                {(ponentes || []).map((p: any) => {
                  const prof = p.mentores.profiles;
                  const initials = `${prof.nombre?.[0] || ''}${prof.apellido?.[0] || ''}`.toUpperCase();
                  return (
                    <div key={p.mentores.id} className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={prof.avatar_url || undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">{prof.nombre} {prof.apellido}</p>
                        {prof.especialidad && (
                          <p className="text-sm text-muted-foreground">{prof.especialidad}</p>
                        )}
                      </div>
                      <Badge variant="outline" className="capitalize">{p.rol}</Badge>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar sticky */}
        <div>
          <Card className="border-primary/20 bg-primary/5 sticky top-24">
            <CardContent className="p-6 space-y-4">
              {evento.modalidad_acceso === 'premium' ? (
                <div>
                  <div className="text-3xl font-bold gradient-text">
                    ${Number(evento.precio).toLocaleString('es-AR')}
                  </div>
                  <p className="text-sm text-muted-foreground">por persona</p>
                </div>
              ) : (
                <Badge className="bg-primary/10 text-primary border-primary/20 text-sm">
                  Incluido en suscripción
                </Badge>
              )}

              {estaInscrito ? (
                <Button className="w-full" variant="outline" disabled>
                  ✓ Ya estás inscripto
                </Button>
              ) : (
                <Button
                  className="w-full gradient-primary"
                  onClick={() => user ? inscribirse.mutate() : navigate('/login')}
                  disabled={inscribirse.isPending}
                >
                  {inscribirse.isPending ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Inscribiendo...</>
                  ) : (
                    'Inscribirme ahora'
                  )}
                </Button>
              )}

              {!user && (
                <p className="text-xs text-center text-muted-foreground">
                  Necesitás una cuenta para inscribirte
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

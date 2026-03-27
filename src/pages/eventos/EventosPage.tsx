import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, MapPin, Users, Video } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';

export default function EventosPage() {
  const navigate = useNavigate();
  const [filtroTipo, setFiltroTipo] = useState('todos');

  const { data: eventos, isLoading } = useQuery({
    queryKey: ['eventos', filtroTipo],
    queryFn: async () => {
      let query = supabase
        .from('eventos')
        .select('*')
        .gte('fecha_inicio', new Date().toISOString())
        .order('fecha_inicio', { ascending: true });

      if (filtroTipo !== 'todos') {
        query = query.eq('tipo', filtroTipo);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  return (
    <div className="container max-w-6xl py-12 px-4 space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">Próximos <span className="gradient-text">Eventos</span></h1>
        <p className="text-muted-foreground mt-1">Online, presenciales e híbridos para toda la comunidad</p>
      </div>

      <Select value={filtroTipo} onValueChange={setFiltroTipo}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Todos los eventos" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todos los eventos</SelectItem>
          <SelectItem value="online">Online</SelectItem>
          <SelectItem value="presencial">Presenciales</SelectItem>
          <SelectItem value="hibrido">Híbridos</SelectItem>
        </SelectContent>
      </Select>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}><CardContent className="p-6 space-y-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-4 w-32" />
            </CardContent></Card>
          ))}
        </div>
      ) : (eventos || []).length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          No hay eventos próximos en esta categoría.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(eventos || []).map((evento) => (
            <Card
              key={evento.id}
              className="border-border/50 hover:border-primary/40 transition-all hover:shadow-lg cursor-pointer group"
              onClick={() => navigate(`/eventos/${evento.id}`)}
            >
              <CardContent className="p-6 space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className="flex items-center gap-1">
                    {evento.tipo === 'online' ? <Video className="h-3 w-3" /> : <MapPin className="h-3 w-3" />}
                    {evento.tipo === 'hibrido' ? 'Híbrido' : evento.tipo === 'online' ? 'Online' : 'Presencial'}
                  </Badge>
                  {evento.modalidad_acceso === 'incluido' ? (
                    <Badge className="bg-primary/10 text-primary border-primary/20">Incluido</Badge>
                  ) : (
                    <Badge variant="secondary">${Number(evento.precio).toLocaleString('es-AR')}</Badge>
                  )}
                </div>

                <h3 className="font-semibold text-lg group-hover:text-primary transition-colors line-clamp-2">
                  {evento.titulo}
                </h3>

                <p className="text-sm text-muted-foreground line-clamp-3">{evento.descripcion}</p>

                <div className="space-y-1.5 text-sm text-muted-foreground pt-1">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 shrink-0" />
                    {format(new Date(evento.fecha_inicio), "d 'de' MMMM, yyyy — HH:mm", { locale: es })}
                  </div>
                  {evento.ubicacion && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 shrink-0" />
                      {evento.ubicacion}
                    </div>
                  )}
                  {evento.aforo && (
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 shrink-0" />
                      Aforo: {evento.aforo} personas
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

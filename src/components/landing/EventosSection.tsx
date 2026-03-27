import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Video } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { supabase } from '@/integrations/supabase/client';

type TabTipo = 'todos' | 'online' | 'presencial';

export function EventosSection() {
  const ref = useScrollReveal();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabTipo>('todos');

  const { data: eventosDB } = useQuery({
    queryKey: ['eventos-landing'],
    queryFn: async () => {
      const { data } = await supabase
        .from('eventos')
        .select('*')
        .gte('fecha_inicio', new Date().toISOString())
        .order('fecha_inicio', { ascending: true })
        .limit(6);
      return data || [];
    },
  });

  const eventos = eventosDB || [];

  const filtered = activeTab === 'todos'
    ? eventos
    : eventos.filter((e) => e.tipo === activeTab);

  // No renderizar la sección si no hay eventos
  if (eventos.length === 0) return null;

  const tabs: { key: TabTipo; label: string }[] = [
    { key: 'todos', label: 'Todos' },
    { key: 'online', label: 'Online' },
    { key: 'presencial', label: 'Presenciales' },
  ];

  return (
    <section id="eventos" className="py-24 relative">
      <div className="container px-4" ref={ref} style={{ opacity: 0 }}>
        <div className="text-center mb-12">
          <h2 className="font-display font-bold text-3xl sm:text-4xl mb-4">
            Eventos que{' '}
            <span className="gradient-text">transforman</span>
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Online y presenciales — encontrá el que resuena con vos
          </p>
          <div className="gradient-separator max-w-xs mx-auto mt-6" />
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-2 mb-10">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? 'gradient-sumak text-white'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filtered.slice(0, 3).map((evento) => (
            <div
              key={evento.id}
              className="group rounded-2xl border border-border/50 bg-card/50 overflow-hidden hover:border-accent/40 transition-all duration-300 hover:scale-[1.02] cursor-pointer"
              onClick={() => navigate(`/eventos/${evento.id}`)}
            >
              {/* Image / tipo banner */}
              <div className="aspect-video relative bg-muted">
                <div className="absolute inset-0 gradient-sumak opacity-20" />
                <Badge
                  className={`absolute top-3 left-3 ${
                    evento.tipo === 'online'
                      ? 'bg-primary/90 text-primary-foreground'
                      : 'bg-sumak-naranja/90 text-white'
                  }`}
                >
                  {evento.tipo === 'online' ? (
                    <><Video className="h-3 w-3 mr-1" />Online</>
                  ) : (
                    <><MapPin className="h-3 w-3 mr-1" />Presencial</>
                  )}
                </Badge>
                {evento.modalidad_acceso === 'incluido' && (
                  <Badge className="absolute top-3 right-3 bg-primary/10 text-primary border-primary/20">
                    Incluido
                  </Badge>
                )}
              </div>

              <div className="p-5">
                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {format(new Date(evento.fecha_inicio), "d MMM", { locale: es })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {format(new Date(evento.fecha_inicio), 'HH:mm')}hs
                  </span>
                </div>

                <h3 className="font-display font-semibold text-base mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                  {evento.titulo}
                </h3>

                {evento.ubicacion && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-4">
                    <MapPin className="h-3.5 w-3.5" />
                    {evento.ubicacion}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="font-semibold">
                    {evento.modalidad_acceso === 'incluido' ? (
                      <span className="text-primary text-sm">Incluido en suscripción</span>
                    ) : Number(evento.precio) === 0 ? (
                      <span className="text-green-400">Gratis</span>
                    ) : (
                      <span>${Number(evento.precio).toLocaleString('es-AR')}</span>
                    )}
                  </span>
                  <Button size="sm" className="gradient-sumak text-white rounded-full border-0">
                    Ver más
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button
            variant="outline"
            size="lg"
            className="rounded-full gradient-border bg-transparent hover:bg-card px-8"
            onClick={() => navigate('/eventos')}
          >
            Ver todos los eventos →
          </Button>
        </div>
      </div>
    </section>
  );
}

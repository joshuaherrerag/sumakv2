import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, MapPin, Search, Video } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { CATEGORIAS } from '@/types';

type Tab = 'todo' | 'cursos' | 'eventos';

export default function CatalogoPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('todo');
  const [busqueda, setBusqueda] = useState('');
  const [categoria, setCategoria] = useState('todas');
  const [modalidad, setModalidad] = useState('todas');

  const { data: cursos, isLoading: cursosLoading } = useQuery({
    queryKey: ['catalogo-cursos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cursos')
        .select('*')
        .eq('estado', 'publicado')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const { data: eventos, isLoading: eventosLoading } = useQuery({
    queryKey: ['catalogo-eventos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('eventos')
        .select('*')
        .gte('fecha_inicio', new Date().toISOString())
        .order('fecha_inicio', { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });

  const isLoading = cursosLoading || eventosLoading;

  const cursosFiltrados = useMemo(() => {
    return (cursos || []).filter((c) => {
      const matchBusqueda =
        !busqueda ||
        c.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
        (c.descripcion || '').toLowerCase().includes(busqueda.toLowerCase());
      const matchCategoria = categoria === 'todas' || c.categoria === categoria;
      const matchModalidad =
        modalidad === 'todas' ||
        (modalidad === 'incluido' && c.es_incluido_en_suscripcion) ||
        (modalidad === 'pago' && !c.es_incluido_en_suscripcion);
      return matchBusqueda && matchCategoria && matchModalidad;
    });
  }, [cursos, busqueda, categoria, modalidad]);

  const eventosFiltrados = useMemo(() => {
    return (eventos || []).filter((e) => {
      const matchBusqueda =
        !busqueda ||
        e.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
        (e.descripcion || '').toLowerCase().includes(busqueda.toLowerCase());
      const matchModalidad =
        modalidad === 'todas' ||
        (modalidad === 'incluido' && e.modalidad_acceso === 'incluido') ||
        (modalidad === 'pago' && e.modalidad_acceso !== 'incluido');
      return matchBusqueda && matchModalidad;
    });
  }, [eventos, busqueda, modalidad]);

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'todo', label: 'Todo', count: cursosFiltrados.length + eventosFiltrados.length },
    { key: 'cursos', label: 'Cursos', count: cursosFiltrados.length },
    { key: 'eventos', label: 'Eventos', count: eventosFiltrados.length },
  ];

  const mostrarCursos = tab === 'todo' || tab === 'cursos';
  const mostrarEventos = tab === 'todo' || tab === 'eventos';

  return (
    <div className="container max-w-6xl py-12 px-4 space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">
          Catálogo de <span className="gradient-text">transformación</span>
        </h1>
        <p className="text-muted-foreground mt-1">
          Explorá todos los cursos y eventos de la comunidad Sumak
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
              tab === t.key
                ? 'gradient-sumak text-white'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            {t.label}
            <span
              className={`text-xs rounded-full px-1.5 py-0.5 ${
                tab === t.key ? 'bg-white/20' : 'bg-background'
              }`}
            >
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar cursos o eventos..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="pl-9"
          />
        </div>
        {(tab === 'todo' || tab === 'cursos') && (
          <Select value={categoria} onValueChange={setCategoria}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas las categorías</SelectItem>
              {CATEGORIAS.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <Select value={modalidad} onValueChange={setModalidad}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Modalidad" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas</SelectItem>
            <SelectItem value="incluido">Incluido en suscripción</SelectItem>
            <SelectItem value="pago">Pago</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="rounded-2xl border border-border/50 overflow-hidden">
              <Skeleton className="aspect-video w-full" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          {/* Cursos */}
          {mostrarCursos && cursosFiltrados.length > 0 && (
            <div className="space-y-4">
              {tab === 'todo' && (
                <h2 className="text-lg font-semibold">Cursos</h2>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cursosFiltrados.map((curso) => (
                  <div
                    key={curso.id}
                    className="group rounded-2xl border border-border/50 bg-card/50 overflow-hidden hover:border-primary/40 transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                    onClick={() => navigate(`/cursos/${curso.id}`)}
                  >
                    <div className="aspect-video bg-muted relative overflow-hidden">
                      {curso.imagen_url ? (
                        <img
                          src={curso.imagen_url}
                          alt={curso.titulo}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 gradient-sumak opacity-20" />
                      )}
                      <Badge className="absolute top-3 left-3 bg-background/80 text-foreground border-0 backdrop-blur-sm text-xs">
                        Curso
                      </Badge>
                    </div>
                    <div className="p-4 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="secondary" className="text-xs">{curso.categoria}</Badge>
                        {curso.es_incluido_en_suscripcion ? (
                          <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">Incluido</Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">${Number(curso.precio).toLocaleString('es-AR')}</Badge>
                        )}
                      </div>
                      <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                        {curso.titulo}
                      </h3>
                      {curso.descripcion && (
                        <p className="text-sm text-muted-foreground line-clamp-2">{curso.descripcion}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Eventos */}
          {mostrarEventos && eventosFiltrados.length > 0 && (
            <div className="space-y-4">
              {tab === 'todo' && (
                <h2 className="text-lg font-semibold">Eventos próximos</h2>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {eventosFiltrados.map((evento) => (
                  <div
                    key={evento.id}
                    className="group rounded-2xl border border-border/50 bg-card/50 overflow-hidden hover:border-accent/40 transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                    onClick={() => navigate(`/eventos/${evento.id}`)}
                  >
                    <div className="aspect-video bg-muted relative">
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
                    <div className="p-4 space-y-2">
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {format(new Date(evento.fecha_inicio), "d 'de' MMMM, yyyy — HH:mm", { locale: es })}
                      </p>
                      <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                        {evento.titulo}
                      </h3>
                      {evento.ubicacion && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />{evento.ubicacion}
                        </p>
                      )}
                      <div className="pt-1">
                        {evento.modalidad_acceso === 'incluido' ? (
                          <span className="text-sm text-primary font-medium">Incluido en suscripción</span>
                        ) : Number(evento.precio) === 0 ? (
                          <span className="text-sm text-green-400 font-medium">Gratis</span>
                        ) : (
                          <span className="text-sm font-medium">${Number(evento.precio).toLocaleString('es-AR')}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {((tab === 'todo' && cursosFiltrados.length === 0 && eventosFiltrados.length === 0) ||
            (tab === 'cursos' && cursosFiltrados.length === 0) ||
            (tab === 'eventos' && eventosFiltrados.length === 0)) && (
            <div className="text-center py-16 text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No se encontraron resultados para tu búsqueda.</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => { setBusqueda(''); setCategoria('todas'); setModalidad('todas'); }}
              >
                Limpiar filtros
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

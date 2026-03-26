import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PlayCircle, FileText, BookOpen, Download, ChevronRight, ChevronLeft, Menu, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import VideoPlayer from '@/components/VideoPlayer';
import PDFViewer from '@/components/PDFViewer';

export default function CursoVerPage() {
  const { id: cursoId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [leccionActual, setLeccionActual] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Verificar acceso
  useEffect(() => {
    if (!user || !cursoId) return;
    supabase
      .from('inscripciones')
      .select('id')
      .eq('alumno_id', user.id)
      .eq('curso_id', cursoId)
      .eq('estado', 'activa')
      .maybeSingle()
      .then(({ data }) => {
        if (!data) {
          toast({ title: 'Acceso denegado', description: 'Debés inscribirte al curso primero.', variant: 'destructive' });
          navigate(`/cursos/${cursoId}`);
        }
      });
  }, [user, cursoId]);

  const { data: curso, isLoading: cursoCargando } = useQuery({
    queryKey: ['curso-ver', cursoId],
    enabled: !!cursoId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cursos')
        .select('titulo')
        .eq('id', cursoId!)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const { data: modulos, isLoading: modulosCargando } = useQuery({
    queryKey: ['curso-ver-modulos', cursoId],
    enabled: !!cursoId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('modulos')
        .select('*, lecciones(*)')
        .eq('curso_id', cursoId!)
        .order('orden', { ascending: true });
      if (error) throw error;
      const mods = (data || []).map((m: any) => ({
        ...m,
        lecciones: (m.lecciones || []).sort((a: any, b: any) => a.orden - b.orden),
      }));
      // Seleccionar primera lección automáticamente
      if (mods.length > 0 && mods[0].lecciones?.length > 0 && !leccionActual) {
        setLeccionActual(mods[0].lecciones[0]);
      }
      return mods;
    },
  });

  const { data: recursos } = useQuery({
    queryKey: ['recursos-ver', leccionActual?.id],
    enabled: !!leccionActual?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from('recursos_descargables')
        .select('*')
        .eq('leccion_id', leccionActual.id)
        .order('created_at', { ascending: true });
      return data || [];
    },
  });

  // Lista plana de lecciones para navegación
  const todasLasLecciones = (modulos || []).flatMap((m: any) => m.lecciones || []);
  const indexActual = todasLasLecciones.findIndex((l: any) => l.id === leccionActual?.id);

  const irAnterior = () => {
    if (indexActual > 0) setLeccionActual(todasLasLecciones[indexActual - 1]);
  };

  const irSiguiente = () => {
    if (indexActual < todasLasLecciones.length - 1) setLeccionActual(todasLasLecciones[indexActual + 1]);
  };

  const tipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'video': return <PlayCircle className="h-4 w-4 shrink-0" />;
      case 'pdf': return <FileText className="h-4 w-4 shrink-0" />;
      default: return <BookOpen className="h-4 w-4 shrink-0" />;
    }
  };

  if (cursoCargando || modulosCargando) {
    return (
      <div className="flex h-screen">
        <div className="w-80 border-r p-4 space-y-3">
          <Skeleton className="h-6 w-48" />
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
        </div>
        <div className="flex-1 p-8 space-y-4">
          <Skeleton className="w-full aspect-video" />
          <Skeleton className="h-6 w-64" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`${sidebarOpen ? 'w-80' : 'w-0'} shrink-0 border-r overflow-y-auto transition-all duration-300 bg-card`}
      >
        <div className="p-4 space-y-1 min-w-[320px]">
          <h2 className="font-bold text-sm mb-4 text-foreground line-clamp-2">{curso?.titulo}</h2>
          {(modulos || []).map((mod: any) => (
            <div key={mod.id} className="mb-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-1">
                {mod.titulo}
              </p>
              {(mod.lecciones || []).map((lec: any) => (
                <button
                  key={lec.id}
                  onClick={() => setLeccionActual(lec)}
                  className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-left transition-colors ${
                    leccionActual?.id === lec.id
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'hover:bg-muted text-foreground'
                  }`}
                >
                  <span className={leccionActual?.id === lec.id ? 'text-primary' : 'text-muted-foreground'}>
                    {tipoIcon(lec.tipo)}
                  </span>
                  <span className="flex-1 truncate">{lec.titulo}</span>
                  {lec.duracion_min && (
                    <span className="text-xs text-muted-foreground shrink-0">{lec.duracion_min}m</span>
                  )}
                </button>
              ))}
            </div>
          ))}
        </div>
      </aside>

      {/* Contenido principal */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 max-w-4xl mx-auto space-y-6">
          {/* Toggle sidebar + título */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="shrink-0"
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            {leccionActual && (
              <h1 className="text-xl font-bold truncate">{leccionActual.titulo}</h1>
            )}
          </div>

          {leccionActual ? (
            <>
              {/* Reproductor de contenido */}
              {leccionActual.tipo === 'video' && leccionActual.contenido_url && (
                <VideoPlayer url={leccionActual.contenido_url} />
              )}

              {leccionActual.tipo === 'pdf' && leccionActual.contenido_url && (
                <PDFViewer url={leccionActual.contenido_url} />
              )}

              {leccionActual.tipo === 'texto' && leccionActual.contenido_url && (
                <div
                  className="prose prose-invert max-w-none rounded-xl border border-border p-6 bg-card"
                  dangerouslySetInnerHTML={{ __html: leccionActual.contenido_url }}
                />
              )}

              {/* Recursos descargables */}
              {(recursos || []).length > 0 && (
                <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                  <h3 className="font-semibold text-sm">Recursos de esta lección</h3>
                  <div className="space-y-2">
                    {(recursos || []).map((r: any) => (
                      <a
                        key={r.id}
                        href={r.url}
                        download
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-3 rounded-lg px-3 py-2 bg-muted/50 hover:bg-muted transition-colors text-sm"
                      >
                        <Download className="h-4 w-4 text-muted-foreground" />
                        <span className="flex-1">{r.nombre}</span>
                        <span className="text-xs text-muted-foreground">{r.tipo}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Navegación entre lecciones */}
              <div className="flex items-center justify-between pt-2">
                <Button
                  variant="outline"
                  onClick={irAnterior}
                  disabled={indexActual <= 0}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Lección anterior
                </Button>
                <span className="text-sm text-muted-foreground">
                  {indexActual + 1} / {todasLasLecciones.length}
                </span>
                <Button
                  className="gradient-primary"
                  onClick={irSiguiente}
                  disabled={indexActual >= todasLasLecciones.length - 1}
                >
                  Siguiente lección
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-3">
              <BookOpen className="h-12 w-12 opacity-40" />
              <p>Seleccioná una lección del panel izquierdo para comenzar.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

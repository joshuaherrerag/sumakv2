import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, ChevronRight, BookOpen, Eye, Trash2, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

const estadoVariant = (estado: string): 'default' | 'secondary' | 'outline' | 'destructive' => {
  switch (estado) {
    case 'publicado': return 'default';
    case 'borrador': return 'secondary';
    case 'pendiente': return 'outline';
    default: return 'destructive';
  }
};

export default function MentorCursosPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: mentorData } = useQuery({
    queryKey: ['my-mentor-data', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data: prof } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user!.id)
        .single();
      if (!prof) return null;
      const { data: mentor } = await supabase
        .from('mentores')
        .select('id')
        .eq('profile_id', prof.id)
        .single();
      return mentor ? { mentorId: mentor.id, profileId: prof.id } : null;
    },
  });

  const mentorId = mentorData?.mentorId;

  const invalidar = () => queryClient.invalidateQueries({ queryKey: ['my-cursos', mentorId] });

  const publicarCurso = async (cursoId: string) => {
    const { error } = await supabase.from('cursos').update({ estado: 'publicado' }).eq('id', cursoId);
    if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Curso publicado', description: 'Ahora es visible para los alumnos.' });
    invalidar();
  };

  const despublicarCurso = async (cursoId: string) => {
    const { error } = await supabase.from('cursos').update({ estado: 'borrador' }).eq('id', cursoId);
    if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Curso despublicado', description: 'Ya no es visible para los alumnos.' });
    invalidar();
  };

  const borrarCurso = async (cursoId: string) => {
    if (!confirm('¿Seguro que querés borrar este curso? Esta acción no se puede deshacer.')) return;
    const { error } = await supabase.from('cursos').delete().eq('id', cursoId);
    if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Curso eliminado' });
    invalidar();
  };

  const { data: cursos, isLoading } = useQuery({
    queryKey: ['my-cursos', mentorId],
    enabled: !!mentorId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cursos')
        .select('*')
        .eq('mentor_id', mentorId!)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Mis Cursos</h1>
          <p className="text-muted-foreground">Gestioná tus formaciones</p>
        </div>
        <Button className="gradient-primary" asChild>
          <Link to="/panel/mentor/cursos/nuevo">
            <Plus className="mr-2 h-4 w-4" /> Nuevo Curso
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="mis-cursos">
        <TabsList>
          <TabsTrigger value="mis-cursos">Mis formaciones</TabsTrigger>
          <TabsTrigger value="colaboraciones">Colaboraciones</TabsTrigger>
        </TabsList>

        <TabsContent value="mis-cursos" className="mt-4">
          {isLoading ? (
            <p className="text-muted-foreground">Cargando...</p>
          ) : (cursos || []).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3 border-2 border-dashed border-border rounded-xl">
              <BookOpen className="h-10 w-10 opacity-40" />
              <p>Aún no tenés cursos. ¡Creá el primero!</p>
              <Button className="gradient-primary mt-2" asChild>
                <Link to="/panel/mentor/cursos/nuevo"><Plus className="mr-2 h-4 w-4" />Crear mi primer curso</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {(cursos || []).map((curso) => (
                <Card key={curso.id} className="border-border/50 overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex items-stretch gap-0">
                      {/* Thumbnail */}
                      <div className="w-40 shrink-0 bg-muted">
                        {curso.imagen_url ? (
                          <img
                            src={curso.imagen_url}
                            alt={curso.titulo}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center min-h-[90px]">
                            <BookOpen className="h-8 w-8 text-muted-foreground/40" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex flex-1 items-center justify-between gap-4 p-4">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold">{curso.titulo}</h3>
                            <Badge variant={estadoVariant(curso.estado)}>{curso.estado}</Badge>
                            <Badge variant="outline">{curso.categoria}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {curso.es_incluido_en_suscripcion
                              ? 'Incluido en suscripción'
                              : `$${Number(curso.precio).toLocaleString('es-AR')}`}
                          </p>
                        </div>

                        <div className="flex gap-2 shrink-0 flex-wrap justify-end">
                          <Button size="sm" variant="ghost" asChild>
                            <Link to={`/cursos/${curso.id}`}>
                              <Eye className="mr-1 h-3 w-3" /> Ver
                            </Link>
                          </Button>
                          <Button size="sm" variant="outline" asChild>
                            <Link to={`/panel/mentor/cursos/${curso.id}`}>
                              <Edit className="mr-1 h-3 w-3" /> Editar
                              <ChevronRight className="ml-1 h-3 w-3" />
                            </Link>
                          </Button>
                          {curso.estado === 'publicado' ? (
                            <Button size="sm" variant="outline" onClick={() => despublicarCurso(curso.id)}>
                              <EyeOff className="mr-1 h-3 w-3" /> Despublicar
                            </Button>
                          ) : (
                            <Button size="sm" className="gradient-primary" onClick={() => publicarCurso(curso.id)}>
                              <Eye className="mr-1 h-3 w-3" /> Publicar
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => borrarCurso(curso.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="colaboraciones" className="mt-4">
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3 border-2 border-dashed border-border rounded-xl">
            <BookOpen className="h-10 w-10 opacity-40" />
            <p className="text-center">
              Las colaboraciones con otros mentores estarán disponibles próximamente.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

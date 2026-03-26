import { useParams, Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, BookOpen, ArrowLeft } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useMentor, useMentorCursos } from '@/hooks/useMentores';
import { SuscripcionButton } from '@/components/SuscripcionButton';
import { supabase } from '@/integrations/supabase/client';

function CursoCard({ curso, rol }: { curso: any; rol?: string }) {
  return (
    <Card className="border-border/50 hover:border-primary/30 transition-colors">
      <CardContent className="p-0 overflow-hidden">
        {curso.imagen_url && (
          <img
            src={curso.imagen_url}
            alt={curso.titulo}
            className="w-full aspect-video object-cover"
          />
        )}
        <div className="p-4 space-y-2">
          {rol && (
            <Badge variant="outline" className="text-xs capitalize">{rol}</Badge>
          )}
          <h3 className="font-semibold line-clamp-2">{curso.titulo}</h3>
          {curso.descripcion && (
            <p className="text-sm text-muted-foreground line-clamp-2">{curso.descripcion}</p>
          )}
          <div className="flex items-center justify-between pt-1">
            <Badge variant="secondary" className="text-xs">{curso.categoria}</Badge>
            <span className="text-sm font-medium">
              {curso.es_incluido_en_suscripcion ? (
                <span className="text-success">Incluido</span>
              ) : (
                `$${Number(curso.precio).toLocaleString('es-AR')}`
              )}
            </span>
          </div>
          <Button size="sm" variant="outline" className="w-full mt-1" asChild>
            <Link to={`/cursos/${curso.id}`}>Ver formación</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function MentorPerfilPage() {
  const { id } = useParams();
  const { data: mentor, isLoading } = useMentor(id);
  const { data: cursosCreados } = useMentorCursos(id);

  const { data: colaboraciones } = useQuery({
    queryKey: ['mentor-colaboraciones', id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('curso_mentores')
        .select('rol, cursos!inner(*)')
        .eq('mentor_id', id!);
      if (error) throw error;
      return (data || []).map((r: any) => ({ ...r.cursos, rol: r.rol }));
    },
  });

  if (isLoading) {
    return (
      <div className="container max-w-4xl py-8 space-y-8">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="w-full h-48" />
        <div className="flex gap-6">
          <Skeleton className="h-32 w-32 rounded-full" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-16 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!mentor) {
    return (
      <div className="container max-w-4xl py-8 text-center">
        <p className="text-muted-foreground">Mentor no encontrado.</p>
        <Button variant="outline" className="mt-4" asChild>
          <Link to="/mentores">Volver a mentores</Link>
        </Button>
      </div>
    );
  }

  const initials = `${mentor.profiles.nombre?.[0] || ''}${mentor.profiles.apellido?.[0] || ''}`.toUpperCase();
  const redes = (mentor.profiles.redes_sociales as Record<string, string> | null) ?? {};

  return (
    <div className="animate-fade-in">
      {/* Banner */}
      <div className="relative w-full h-52 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/10">
        {redes.banner_url && (
          <img
            src={redes.banner_url}
            alt="Banner"
            className="w-full h-full object-cover"
          />
        )}
      </div>

      <div className="container max-w-4xl px-4">
        {/* Avatar superpuesto al banner */}
        <div className="flex flex-col sm:flex-row items-start gap-6 -mt-16 relative z-10">
          <Avatar className="h-32 w-32 border-4 border-background shrink-0 shadow-lg">
            <AvatarImage src={mentor.profiles.avatar_url || undefined} />
            <AvatarFallback className="bg-primary/10 text-primary text-3xl font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 pt-16 sm:pt-20 space-y-2 pb-2">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold">{mentor.profiles.nombre} {mentor.profiles.apellido}</h1>
              {mentor.featured && <Star className="h-5 w-5 text-warning fill-warning" />}
            </div>
            <p className="text-primary font-medium">{mentor.profiles.especialidad}</p>
            <div className="flex flex-wrap gap-2">
              {(mentor.categorias || []).map((cat) => (
                <Badge key={cat} variant="secondary">{cat}</Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="py-8 space-y-8">
          <Link to="/mentores" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-1 h-4 w-4" /> Volver a mentores
          </Link>

          {/* Bio */}
          {(mentor.profiles.bio || mentor.descripcion) && (
            <p className="text-muted-foreground leading-relaxed">
              {mentor.profiles.bio || mentor.descripcion}
            </p>
          )}

          {/* Card suscripción */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-lg">Suscribite a {mentor.profiles.nombre}</h3>
                <p className="text-sm text-muted-foreground">
                  Accedé a todos sus cursos incluidos y contenido exclusivo
                </p>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <div className="text-right">
                  <span className="text-2xl font-bold">${Number(mentor.precio_suscripcion).toLocaleString('es-AR')}</span>
                  <span className="text-sm text-muted-foreground">/mes</span>
                </div>
                <SuscripcionButton
                  mentorId={mentor.id}
                  mentorNombre={mentor.profiles.nombre}
                  precioSuscripcion={Number(mentor.precio_suscripcion)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Tabs de cursos */}
          <Tabs defaultValue="creadas">
            <TabsList>
              <TabsTrigger value="creadas" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Formaciones creadas
                {(cursosCreados || []).length > 0 && (
                  <Badge variant="secondary" className="ml-1 text-xs">{(cursosCreados || []).length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="colaboraciones">
                Colaboraciones
                {(colaboraciones || []).length > 0 && (
                  <Badge variant="secondary" className="ml-1 text-xs">{(colaboraciones || []).length}</Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="creadas" className="mt-4">
              {(cursosCreados || []).length === 0 ? (
                <p className="text-muted-foreground py-8 text-center">
                  Este mentor aún no tiene formaciones publicadas.
                </p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {(cursosCreados || []).map((curso) => (
                    <CursoCard key={curso.id} curso={curso} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="colaboraciones" className="mt-4">
              {(colaboraciones || []).length === 0 ? (
                <p className="text-muted-foreground py-8 text-center">
                  No participa como co-mentor en ninguna formación.
                </p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {(colaboraciones || []).map((curso: any) => (
                    <CursoCard key={curso.id} curso={curso} rol={curso.rol} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

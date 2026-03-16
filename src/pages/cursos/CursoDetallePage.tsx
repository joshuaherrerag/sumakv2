import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, BookOpen, Clock, PlayCircle, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCurso, useCursoModulos } from '@/hooks/useCursos';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export default function CursoDetallePage() {
  const { id } = useParams();
  const { toast } = useToast();
  const { data: curso, isLoading } = useCurso(id);
  const { data: modulos } = useCursoModulos(id);

  const totalLecciones = (modulos || []).reduce(
    (acc, m: any) => acc + (m.lecciones?.length || 0), 0
  );
  const totalDuracion = (modulos || []).reduce(
    (acc, m: any) => acc + (m.lecciones || []).reduce((a: number, l: any) => a + (l.duracion_min || 0), 0),
    0
  );

  const handleInscribirse = () => {
    toast({
      title: 'Inscripción simulada',
      description: 'La inscripción se conectará con pagos próximamente.',
    });
  };

  const tipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'video': return <PlayCircle className="h-4 w-4 text-primary" />;
      case 'pdf': return <FileText className="h-4 w-4 text-blue-400" />;
      default: return <BookOpen className="h-4 w-4 text-muted-foreground" />;
    }
  };

  if (isLoading) {
    return (
      <div className="container max-w-4xl py-8 space-y-8">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!curso) {
    return (
      <div className="container max-w-4xl py-8 text-center">
        <p className="text-muted-foreground">Curso no encontrado.</p>
        <Button variant="outline" className="mt-4" asChild>
          <Link to="/cursos">Volver a cursos</Link>
        </Button>
      </div>
    );
  }

  const mentorName = `${curso.mentores.profiles.nombre} ${curso.mentores.profiles.apellido}`;

  return (
    <div className="container max-w-4xl py-8 space-y-8 animate-fade-in">
      <Link to="/cursos" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="mr-1 h-4 w-4" /> Volver a cursos
      </Link>

      <div className="space-y-4">
        <Badge variant="secondary">{curso.categoria}</Badge>
        <h1 className="text-3xl font-bold">{curso.titulo}</h1>
        <p className="text-muted-foreground">{curso.descripcion}</p>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" /> {totalLecciones} lecciones
          </span>
          {totalDuracion > 0 && (
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" /> {totalDuracion} min
            </span>
          )}
          <Link to={`/mentores/${curso.mentores.id}`} className="text-primary hover:underline">
            por {mentorName}
          </Link>
        </div>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold">
              {curso.es_incluido_en_suscripcion ? 'Incluido en la suscripción' : `Precio: $${Number(curso.precio).toLocaleString('es-AR')}`}
            </h3>
            <p className="text-sm text-muted-foreground">
              {curso.es_incluido_en_suscripcion
                ? 'Suscribite al mentor para acceder'
                : 'Comprá el curso para acceder al contenido completo'}
            </p>
          </div>
          <Button className="gradient-primary glow" onClick={handleInscribirse}>
            {curso.es_incluido_en_suscripcion ? 'Suscribirse al mentor' : 'Inscribirse'}
          </Button>
        </CardContent>
      </Card>

      {(modulos || []).length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4">Programa del curso</h2>
          <Accordion type="multiple" className="space-y-2">
            {(modulos || []).map((modulo: any) => (
              <AccordionItem key={modulo.id} value={modulo.id} className="border border-border/50 rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-muted-foreground">
                      Módulo {modulo.orden}
                    </span>
                    <span className="font-medium">{modulo.titulo}</span>
                    <Badge variant="outline" className="text-xs">
                      {modulo.lecciones?.length || 0} lecciones
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-2 pb-2">
                    {(modulo.lecciones || []).map((leccion: any) => (
                      <li
                        key={leccion.id}
                        className="flex items-center justify-between rounded-md p-3 bg-muted/30"
                      >
                        <div className="flex items-center gap-3">
                          {tipoIcon(leccion.tipo)}
                          <span className="text-sm">{leccion.titulo}</span>
                        </div>
                        {leccion.duracion_min && (
                          <span className="text-xs text-muted-foreground">{leccion.duracion_min} min</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      )}
    </div>
  );
}

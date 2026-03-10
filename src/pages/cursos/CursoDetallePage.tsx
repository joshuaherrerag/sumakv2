import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, BookOpen, Clock, PlayCircle, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const MOCK_CURSO = {
  id: 'c1',
  titulo: 'Introducción al Mindfulness',
  descripcion: 'Aprendé las bases de la meditación y el mindfulness para mejorar tu bienestar diario. En este curso vas a descubrir técnicas prácticas que podés aplicar desde el primer día.',
  categoria: 'Mindfulness',
  mentor: 'María García',
  mentor_id: '1',
  precio: 0,
  es_incluido: true,
  modulos: [
    {
      id: 'm1',
      titulo: '¿Qué es el Mindfulness?',
      orden: 1,
      lecciones: [
        { id: 'l1', titulo: 'Bienvenida al curso', tipo: 'video', duracion: 5 },
        { id: 'l2', titulo: 'Orígenes del Mindfulness', tipo: 'video', duracion: 12 },
        { id: 'l3', titulo: 'Material complementario', tipo: 'pdf', duracion: null },
      ],
    },
    {
      id: 'm2',
      titulo: 'Primeras Prácticas',
      orden: 2,
      lecciones: [
        { id: 'l4', titulo: 'Respiración consciente', tipo: 'video', duracion: 15 },
        { id: 'l5', titulo: 'Body scan guiado', tipo: 'video', duracion: 20 },
        { id: 'l6', titulo: 'Diario de práctica', tipo: 'texto', duracion: null },
      ],
    },
  ],
};

export default function CursoDetallePage() {
  const { id } = useParams();
  const { toast } = useToast();
  const curso = MOCK_CURSO;

  const totalLecciones = curso.modulos.reduce((acc, m) => acc + m.lecciones.length, 0);
  const totalDuracion = curso.modulos.reduce(
    (acc, m) => acc + m.lecciones.reduce((a, l) => a + (l.duracion || 0), 0),
    0
  );

  const handleInscribirse = () => {
    toast({
      title: 'Inscripción simulada',
      description: 'La inscripción se conectará con la base de datos próximamente.',
    });
  };

  const tipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'video': return <PlayCircle className="h-4 w-4 text-primary" />;
      case 'pdf': return <FileText className="h-4 w-4 text-info" />;
      default: return <BookOpen className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="container max-w-4xl py-8 space-y-8 animate-fade-in">
      <Link to="/cursos" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="mr-1 h-4 w-4" /> Volver a cursos
      </Link>

      {/* Header */}
      <div className="space-y-4">
        <Badge variant="secondary">{curso.categoria}</Badge>
        <h1 className="text-3xl font-bold">{curso.titulo}</h1>
        <p className="text-muted-foreground">{curso.descripcion}</p>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" /> {totalLecciones} lecciones
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" /> {totalDuracion} min
          </span>
          <Link to={`/mentores/${curso.mentor_id}`} className="text-primary hover:underline">
            por {curso.mentor}
          </Link>
        </div>
      </div>

      {/* CTA */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold">
              {curso.es_incluido ? 'Incluido en la suscripción' : `Precio: $${curso.precio.toLocaleString('es-AR')}`}
            </h3>
            <p className="text-sm text-muted-foreground">
              {curso.es_incluido
                ? 'Suscribite al mentor para acceder'
                : 'Comprá el curso para acceder al contenido completo'}
            </p>
          </div>
          <Button className="gradient-primary glow" onClick={handleInscribirse}>
            {curso.es_incluido ? 'Suscribirse al mentor' : 'Inscribirse'}
          </Button>
        </CardContent>
      </Card>

      {/* Program */}
      <div>
        <h2 className="text-xl font-bold mb-4">Programa del curso</h2>
        <Accordion type="multiple" className="space-y-2">
          {curso.modulos.map((modulo) => (
            <AccordionItem key={modulo.id} value={modulo.id} className="border border-border/50 rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-muted-foreground">
                    Módulo {modulo.orden}
                  </span>
                  <span className="font-medium">{modulo.titulo}</span>
                  <Badge variant="outline" className="text-xs">
                    {modulo.lecciones.length} lecciones
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-2 pb-2">
                  {modulo.lecciones.map((leccion) => (
                    <li
                      key={leccion.id}
                      className="flex items-center justify-between rounded-md p-3 bg-muted/30"
                    >
                      <div className="flex items-center gap-3">
                        {tipoIcon(leccion.tipo)}
                        <span className="text-sm">{leccion.titulo}</span>
                      </div>
                      {leccion.duracion && (
                        <span className="text-xs text-muted-foreground">{leccion.duracion} min</span>
                      )}
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}

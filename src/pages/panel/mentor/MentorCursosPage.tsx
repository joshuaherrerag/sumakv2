import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const MOCK_CURSOS = [
  { id: '1', titulo: 'Introducción al Mindfulness', estado: 'publicado', alumnos: 18, categoria: 'Mindfulness' },
  { id: '2', titulo: 'Transformación Personal 360°', estado: 'publicado', alumnos: 6, categoria: 'Desarrollo Personal' },
  { id: '3', titulo: 'Meditación Avanzada', estado: 'borrador', alumnos: 0, categoria: 'Mindfulness' },
];

export default function MentorCursosPage() {
  const { toast } = useToast();

  const estadoColor = (estado: string) => {
    switch (estado) {
      case 'publicado': return 'default';
      case 'borrador': return 'secondary';
      case 'pendiente': return 'outline';
      default: return 'destructive' as const;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Mis Cursos</h1>
          <p className="text-muted-foreground">Gestioná tus formaciones</p>
        </div>
        <Button className="gradient-primary" onClick={() => toast({ title: 'Próximamente', description: 'El formulario de creación se habilitará con la DB.' })}>
          <Plus className="mr-2 h-4 w-4" /> Nuevo Curso
        </Button>
      </div>

      <div className="space-y-4">
        {MOCK_CURSOS.map((curso) => (
          <Card key={curso.id} className="border-border/50">
            <CardContent className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{curso.titulo}</h3>
                  <Badge variant={estadoColor(curso.estado)}>{curso.estado}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {curso.categoria} · {curso.alumnos} alumnos inscriptos
                </p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <Edit className="mr-1 h-3 w-3" /> Editar
                </Button>
                <Button size="sm" variant="ghost">
                  {curso.estado === 'publicado' ? (
                    <><EyeOff className="mr-1 h-3 w-3" /> Despublicar</>
                  ) : (
                    <><Eye className="mr-1 h-3 w-3" /> Publicar</>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

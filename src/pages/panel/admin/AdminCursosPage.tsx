import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const MOCK = [
  { id: '1', titulo: 'Introducción al Mindfulness', mentor: 'María García', estado: 'publicado', categoria: 'Mindfulness' },
  { id: '2', titulo: 'Meditación Avanzada', mentor: 'María García', estado: 'pendiente', categoria: 'Mindfulness' },
  { id: '3', titulo: 'Liderazgo Consciente', mentor: 'Carlos López', estado: 'publicado', categoria: 'Liderazgo' },
  { id: '4', titulo: 'Finanzas para Todos', mentor: 'Diego Martínez', estado: 'pendiente', categoria: 'Finanzas' },
];

export default function AdminCursosPage() {
  const { toast } = useToast();

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Gestión de Cursos</h1>
        <p className="text-muted-foreground">Aprobá o rechazá cursos pendientes</p>
      </div>

      <div className="space-y-4">
        {MOCK.map((c) => (
          <Card key={c.id} className="border-border/50">
            <CardContent className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{c.titulo}</h3>
                  <Badge variant={c.estado === 'publicado' ? 'default' : 'outline'}>{c.estado}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{c.mentor} · {c.categoria}</p>
              </div>
              {c.estado === 'pendiente' && (
                <div className="flex gap-2">
                  <Button size="sm" className="gradient-primary" onClick={() => toast({ title: 'Aprobado (simulado)' })}>
                    <Check className="mr-1 h-3 w-3" /> Aprobar
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => toast({ title: 'Rechazado (simulado)' })}>
                    <X className="mr-1 h-3 w-3" /> Rechazar
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

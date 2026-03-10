import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Star, StarOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const MOCK = [
  { id: '1', nombre: 'María García', especialidad: 'Desarrollo Personal', featured: true, activo: true, alumnos: 18 },
  { id: '2', nombre: 'Carlos López', especialidad: 'Negocios', featured: true, activo: true, alumnos: 12 },
  { id: '3', nombre: 'Ana Rodríguez', especialidad: 'Salud y Bienestar', featured: false, activo: true, alumnos: 8 },
];

export default function AdminMentoresPage() {
  const { toast } = useToast();

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Gestión de Mentores</h1>
        <p className="text-muted-foreground">{MOCK.length} mentores registrados</p>
      </div>

      <div className="space-y-4">
        {MOCK.map((m) => (
          <Card key={m.id} className="border-border/50">
            <CardContent className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{m.nombre}</h3>
                  {m.featured && <Star className="h-4 w-4 text-warning fill-warning" />}
                </div>
                <p className="text-sm text-muted-foreground">{m.especialidad} · {m.alumnos} alumnos</p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => toast({ title: 'Simulado', description: `${m.featured ? 'Quitado de' : 'Agregado a'} destacados.` })}
                >
                  {m.featured ? <StarOff className="mr-1 h-3 w-3" /> : <Star className="mr-1 h-3 w-3" />}
                  {m.featured ? 'Quitar destacado' : 'Destacar'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

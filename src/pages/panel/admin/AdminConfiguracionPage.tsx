import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { CATEGORIAS } from '@/types';

export default function AdminConfiguracionPage() {
  const { toast } = useToast();
  const [comision, setComision] = useState('15');

  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Configuración</h1>
        <p className="text-muted-foreground">Ajustes globales de la plataforma</p>
      </div>

      <Card className="border-border/50">
        <CardHeader><CardTitle className="text-lg">Comisión de la plataforma</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-end gap-3">
            <div className="space-y-2 flex-1">
              <Label>Porcentaje de comisión</Label>
              <Input type="number" min="0" max="100" value={comision} onChange={(e) => setComision(e.target.value)} />
            </div>
            <Button onClick={() => toast({ title: 'Guardado (simulado)', description: `Comisión: ${comision}%` })}>
              Guardar
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader><CardTitle className="text-lg">Categorías disponibles</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {CATEGORIAS.map((cat) => (
              <Badge key={cat} variant="secondary">{cat}</Badge>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">La edición de categorías se habilitará con la DB.</p>
        </CardContent>
      </Card>
    </div>
  );
}

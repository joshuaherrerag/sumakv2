import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const MOCK_USERS = [
  { id: '1', nombre: 'María García', email: 'maria@example.com', rol: 'mentor', activo: true },
  { id: '2', nombre: 'Juan Pérez', email: 'juan@example.com', rol: 'alumno', activo: true },
  { id: '3', nombre: 'Carlos López', email: 'carlos@example.com', rol: 'mentor', activo: true },
  { id: '4', nombre: 'Ana Rodríguez', email: 'ana@example.com', rol: 'alumno', activo: false },
  { id: '5', nombre: 'Admin Principal', email: 'admin@mentorhub.com', rol: 'admin', activo: true },
];

export default function AdminUsuariosPage() {
  const [search, setSearch] = useState('');
  const { toast } = useToast();

  const filtered = MOCK_USERS.filter(
    (u) =>
      u.nombre.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const rolColor = (rol: string) => {
    switch (rol) {
      case 'admin': return 'destructive' as const;
      case 'mentor': return 'default' as const;
      default: return 'secondary' as const;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gestión de Usuarios</h1>
          <p className="text-muted-foreground">{MOCK_USERS.length} usuarios registrados</p>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar usuarios..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <Card className="border-border/50">
        <CardContent className="p-0">
          <div className="divide-y divide-border/50">
            {filtered.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{user.nombre}</span>
                    <Badge variant={rolColor(user.rol)}>{user.rol}</Badge>
                    {!user.activo && <Badge variant="outline" className="text-destructive">Suspendido</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toast({ title: 'Simulado', description: 'Cambio de rol se implementará con la DB.' })}
                  >
                    Cambiar rol
                  </Button>
                  <Button
                    size="sm"
                    variant={user.activo ? 'ghost' : 'default'}
                    onClick={() => toast({ title: 'Simulado', description: `${user.activo ? 'Suspensión' : 'Activación'} simulada.` })}
                  >
                    {user.activo ? 'Suspender' : 'Activar'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

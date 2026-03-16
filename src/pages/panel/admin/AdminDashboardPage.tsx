import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, User, BookOpen, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export default function AdminDashboardPage() {
  const { data: usersCount } = useQuery({
    queryKey: ['admin-users-count'],
    queryFn: async () => {
      const { count } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      return count || 0;
    },
  });

  const { data: mentoresCount } = useQuery({
    queryKey: ['admin-mentores-count'],
    queryFn: async () => {
      const { count } = await supabase.from('mentores').select('*', { count: 'exact', head: true }).eq('activo', true);
      return count || 0;
    },
  });

  const { data: cursosCount } = useQuery({
    queryKey: ['admin-cursos-count'],
    queryFn: async () => {
      const { count } = await supabase.from('cursos').select('*', { count: 'exact', head: true }).eq('estado', 'publicado');
      return count || 0;
    },
  });

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Panel de Administración</h1>
        <p className="text-muted-foreground">Resumen general de la plataforma</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">Usuarios Totales</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usersCount ?? 0}</div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">Mentores Activos</CardTitle>
            <User className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mentoresCount ?? 0}</div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">Cursos Publicados</CardTitle>
            <BookOpen className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cursosCount ?? 0}</div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">Ingresos del Mes</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$0</div>
            <p className="text-xs text-muted-foreground">Pagos simulados</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

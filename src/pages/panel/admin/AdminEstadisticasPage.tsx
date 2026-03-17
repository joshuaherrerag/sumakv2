import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['hsl(270, 70%, 60%)', 'hsl(270, 50%, 45%)', 'hsl(200, 60%, 50%)', 'hsl(150, 50%, 45%)', 'hsl(40, 70%, 50%)'];

export default function AdminEstadisticasPage() {
  const { data: cursosPorCategoria, isLoading: loadingCursos } = useQuery({
    queryKey: ['admin-stats-cursos-cat'],
    queryFn: async () => {
      const { data, error } = await supabase.from('cursos').select('categoria');
      if (error) throw error;
      const counts: Record<string, number> = {};
      (data || []).forEach((c) => {
        counts[c.categoria || 'Sin categoría'] = (counts[c.categoria || 'Sin categoría'] || 0) + 1;
      });
      return Object.entries(counts).map(([name, value]) => ({ name, value }));
    },
  });

  const { data: usersPorMes, isLoading: loadingUsers } = useQuery({
    queryKey: ['admin-stats-users-month'],
    queryFn: async () => {
      const { data, error } = await supabase.from('profiles').select('created_at');
      if (error) throw error;
      const months: Record<string, number> = {};
      (data || []).forEach((p) => {
        const d = new Date(p.created_at);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        months[key] = (months[key] || 0) + 1;
      });
      return Object.entries(months)
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-6)
        .map(([mes, total]) => ({ mes, total }));
    },
  });

  const { data: cursosPorEstado } = useQuery({
    queryKey: ['admin-stats-cursos-estado'],
    queryFn: async () => {
      const { data, error } = await supabase.from('cursos').select('estado');
      if (error) throw error;
      const counts: Record<string, number> = {};
      (data || []).forEach((c) => {
        counts[c.estado] = (counts[c.estado] || 0) + 1;
      });
      return Object.entries(counts).map(([name, value]) => ({ name, value }));
    },
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Estadísticas</h1>
        <p className="text-muted-foreground">Métricas de la plataforma</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/50">
          <CardHeader><CardTitle className="text-lg">Registros por mes</CardTitle></CardHeader>
          <CardContent className="h-64">
            {loadingUsers ? <Skeleton className="h-full w-full" /> : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={usersPorMes || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="mes" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                  <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Bar dataKey="total" fill="hsl(270, 70%, 60%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader><CardTitle className="text-lg">Cursos por categoría</CardTitle></CardHeader>
          <CardContent className="h-64">
            {loadingCursos ? <Skeleton className="h-full w-full" /> : (cursosPorCategoria || []).length === 0 ? (
              <div className="h-full flex items-center justify-center text-muted-foreground">Sin datos</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={cursosPorCategoria} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name}: ${value}`}>
                    {(cursosPorCategoria || []).map((_: any, i: number) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader><CardTitle className="text-lg">Cursos por estado</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cursosPorEstado || []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} allowDecimals={false} />
                <YAxis dataKey="name" type="category" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} width={90} />
                <Tooltip
                  contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }}
                />
                <Bar dataKey="value" fill="hsl(270, 50%, 45%)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

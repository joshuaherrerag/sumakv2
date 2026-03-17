import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Wallet, Users, TrendingUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export default function MentorFinanzasPage() {
  const { user } = useAuth();

  const { data: mentorData } = useQuery({
    queryKey: ['my-mentor-finanzas', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data: prof } = await supabase.from('profiles').select('id').eq('user_id', user!.id).single();
      if (!prof) return null;
      const { data: mentor } = await supabase.from('mentores').select('id, precio_suscripcion').eq('profile_id', prof.id).single();
      return mentor;
    },
  });

  const { data: suscriptores, isLoading } = useQuery({
    queryKey: ['my-suscriptores', mentorData?.id],
    enabled: !!mentorData,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('suscripciones_mentor')
        .select('*, profiles:alumno_id(nombre, apellido)')
        .eq('mentor_id', mentorData!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const activos = (suscriptores || []).filter((s: any) => s.estado === 'activa').length;
  const ingresosEstimados = activos * (mentorData?.precio_suscripcion || 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Finanzas</h1>
        <p className="text-muted-foreground">Resumen de tus ingresos y suscriptores</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">Ingresos mensuales estimados</CardTitle>
            <Wallet className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${ingresosEstimados.toLocaleString('es-AR')}</div>
            <p className="text-xs text-muted-foreground">basado en suscriptores activos</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">Suscriptores activos</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activos}</div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">Precio suscripción</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(mentorData?.precio_suscripcion || 0).toLocaleString('es-AR')}</div>
            <p className="text-xs text-muted-foreground">por mes</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Suscriptores</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : (suscriptores || []).length === 0 ? (
            <p className="text-muted-foreground text-sm">Aún no tenés suscriptores.</p>
          ) : (
            <div className="space-y-3">
              {(suscriptores || []).map((s: any) => (
                <div key={s.id} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                  <div>
                    <p className="text-sm font-medium">
                      {(s.profiles as any)?.nombre || 'Alumno'} {(s.profiles as any)?.apellido || ''}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Desde {new Date(s.fecha_inicio).toLocaleDateString('es-AR')}
                    </p>
                  </div>
                  <Badge variant={s.estado === 'activa' ? 'default' : 'secondary'}>{s.estado}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

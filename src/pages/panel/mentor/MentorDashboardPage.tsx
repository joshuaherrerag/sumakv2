import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { BookOpen, Users, Wallet, TrendingUp } from 'lucide-react';

export default function MentorDashboardPage() {
  const { profile, user } = useAuth();

  const { data: mentorData } = useQuery({
    queryKey: ['my-mentor', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data: prof } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user!.id)
        .single();
      if (!prof) return null;

      const { data: mentor } = await supabase
        .from('mentores')
        .select('id')
        .eq('profile_id', prof.id)
        .single();
      return mentor;
    },
  });

  const { data: cursosCount } = useQuery({
    queryKey: ['my-cursos-count', mentorData?.id],
    enabled: !!mentorData,
    queryFn: async () => {
      const { count } = await supabase
        .from('cursos')
        .select('*', { count: 'exact', head: true })
        .eq('mentor_id', mentorData!.id);
      return count || 0;
    },
  });

  const { data: suscriptoresCount } = useQuery({
    queryKey: ['my-suscriptores-count', mentorData?.id],
    enabled: !!mentorData,
    queryFn: async () => {
      const { count } = await supabase
        .from('suscripciones_mentor')
        .select('*', { count: 'exact', head: true })
        .eq('mentor_id', mentorData!.id)
        .eq('estado', 'activa');
      return count || 0;
    },
  });

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Panel del Mentor</h1>
        <p className="text-muted-foreground">
          Bienvenido, {profile?.nombre || 'Mentor'}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Suscriptores Activos</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{suscriptoresCount ?? 0}</div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Cursos</CardTitle>
            <BookOpen className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cursosCount ?? 0}</div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ingresos del Mes</CardTitle>
            <Wallet className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$0</div>
            <p className="text-xs text-muted-foreground">Pagos simulados</p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tasa de Retención</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">—</div>
            <p className="text-xs text-muted-foreground">Próximamente</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useDashboardStats() {
  const { user } = useAuth();

  const inscripciones = useQuery({
    queryKey: ['mis-inscripciones', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inscripciones')
        .select('*, cursos(*)')
        .eq('alumno_id', user!.id)
        .eq('estado', 'activa');
      if (error) throw error;
      return data || [];
    },
  });

  const suscripciones = useQuery({
    queryKey: ['mis-suscripciones', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('suscripciones_mentor')
        .select('*')
        .eq('alumno_id', user!.id)
        .eq('estado', 'activa');
      if (error) throw error;
      return data || [];
    },
  });

  const notificaciones = useQuery({
    queryKey: ['mis-notificaciones', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notificaciones')
        .select('*')
        .eq('usuario_id', user!.id)
        .eq('leida', false);
      if (error) throw error;
      return data || [];
    },
  });

  return {
    cursosActivos: inscripciones.data?.length || 0,
    mentoresActivos: suscripciones.data?.length || 0,
    notificacionesSinLeer: notificaciones.data?.length || 0,
    loading: inscripciones.isLoading || suscripciones.isLoading || notificaciones.isLoading,
  };
}

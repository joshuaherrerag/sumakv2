import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface MentorWithProfile {
  id: string;
  profile_id: string;
  descripcion: string | null;
  categorias: string[] | null;
  precio_suscripcion: number;
  activo: boolean;
  featured: boolean;
  profiles: {
    id: string;
    user_id: string;
    nombre: string;
    apellido: string;
    avatar_url: string | null;
    bio: string | null;
    especialidad: string | null;
    redes_sociales: Record<string, string> | null;
  };
}

export function useMentores() {
  return useQuery({
    queryKey: ['mentores'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mentores')
        .select(`
          *,
          profiles!inner (
            id, user_id, nombre, apellido, avatar_url, bio, especialidad, redes_sociales
          )
        `)
        .eq('activo', true)
        .order('featured', { ascending: false });

      if (error) throw error;
      return (data || []) as unknown as MentorWithProfile[];
    },
  });
}

export function useMentor(id: string | undefined) {
  return useQuery({
    queryKey: ['mentor', id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mentores')
        .select(`
          *,
          profiles!inner (
            id, user_id, nombre, apellido, avatar_url, bio, especialidad, redes_sociales
          )
        `)
        .eq('id', id!)
        .single();

      if (error) throw error;
      return data as unknown as MentorWithProfile;
    },
  });
}

export function useMentorCursos(mentorId: string | undefined) {
  return useQuery({
    queryKey: ['mentor-cursos', mentorId],
    enabled: !!mentorId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cursos')
        .select('*')
        .eq('mentor_id', mentorId!)
        .eq('estado', 'publicado');

      if (error) throw error;
      return data || [];
    },
  });
}

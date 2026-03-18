import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { MentorWithProfile } from './useMentores';

export interface CursoWithMentor {
  id: string;
  mentor_id: string;
  titulo: string;
  descripcion: string | null;
  imagen_url: string | null;
  precio: number;
  es_incluido_en_suscripcion: boolean;
  estado: string;
  categoria: string;
  created_at: string;
  mentores: {
    id: string;
    precio_suscripcion: number;
    profiles: {
      nombre: string;
      apellido: string;
    };
  };
}

export function useCursos() {
  return useQuery({
    queryKey: ['cursos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cursos')
        .select(`
          *,
          mentores!inner (
            id,
            precio_suscripcion,
            profiles!inner (nombre, apellido)
          )
        `)
        .eq('estado', 'publicado')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as unknown as CursoWithMentor[];
    },
  });
}

export function useCurso(id: string | undefined) {
  return useQuery({
    queryKey: ['curso', id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cursos')
        .select(`
          *,
          mentores!inner (
            id,
            precio_suscripcion,
            profiles!inner (nombre, apellido)
          )
        `)
        .eq('id', id!)
        .single();

      if (error) throw error;
      return data as unknown as CursoWithMentor;
    },
  });
}

export function useCursoModulos(cursoId: string | undefined) {
  return useQuery({
    queryKey: ['curso-modulos', cursoId],
    enabled: !!cursoId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('modulos')
        .select(`
          *,
          lecciones (*)
        `)
        .eq('curso_id', cursoId!)
        .order('orden', { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });
}

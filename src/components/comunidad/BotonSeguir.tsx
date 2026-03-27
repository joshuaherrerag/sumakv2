import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { UserCheck, UserPlus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface BotonSeguirProps {
  profileId: string; // profiles.id del perfil a seguir
}

export function BotonSeguir({ profileId }: BotonSeguirProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Obtener profile id del usuario actual
  const { data: miProfileId } = useQuery({
    queryKey: ['my-profile-id', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user!.id)
        .single();
      return data?.id ?? null;
    },
  });

  const { data: seguimiento } = useQuery({
    queryKey: ['seguimiento', miProfileId, profileId],
    enabled: !!miProfileId && miProfileId !== profileId,
    queryFn: async () => {
      const { data } = await supabase
        .from('seguimientos')
        .select('id')
        .eq('seguidor_id', miProfileId!)
        .eq('seguido_id', profileId)
        .maybeSingle();
      return data;
    },
  });

  const toggle = useMutation({
    mutationFn: async () => {
      if (!user) { navigate('/login'); return; }
      if (!miProfileId) return;

      if (seguimiento) {
        await supabase
          .from('seguimientos')
          .delete()
          .eq('id', seguimiento.id);
      } else {
        await supabase
          .from('seguimientos')
          .insert({ seguidor_id: miProfileId, seguido_id: profileId });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seguimiento', miProfileId, profileId] });
      queryClient.invalidateQueries({ queryKey: ['feed-personalizado'] });
    },
  });

  // No mostrar si es el propio perfil
  if (miProfileId === profileId) return null;

  const siguiendo = !!seguimiento;

  return (
    <Button
      size="sm"
      variant={siguiendo ? 'outline' : 'default'}
      className={siguiendo ? '' : 'gradient-sumak text-white border-0'}
      onClick={() => toggle.mutate()}
      disabled={toggle.isPending}
    >
      {siguiendo ? (
        <><UserCheck className="h-4 w-4 mr-1.5" />Siguiendo</>
      ) : (
        <><UserPlus className="h-4 w-4 mr-1.5" />Seguir</>
      )}
    </Button>
  );
}

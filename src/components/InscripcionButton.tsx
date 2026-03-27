import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Loader2, PlayCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckoutModal } from '@/components/CheckoutModal';

interface InscripcionButtonProps {
  cursoId: string;
  precio: number;
  esIncluidoEnSuscripcion: boolean;
  titulosCurso: string;
}

export function InscripcionButton({
  cursoId,
  precio,
  esIncluidoEnSuscripcion,
  titulosCurso,
}: InscripcionButtonProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  // Verificar inscripción directa
  const { data: inscripcion } = useQuery({
    queryKey: ['inscripcion', cursoId, user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from('inscripciones')
        .select('id')
        .eq('curso_id', cursoId)
        .eq('alumno_id', user.id)
        .eq('estado', 'activa')
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  // Verificar suscripción a la plataforma Sumak (mentor_id IS NULL)
  const { data: suscripcion } = useQuery({
    queryKey: ['suscripcion-sumak', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from('suscripciones_mentor')
        .select('id')
        .eq('alumno_id', user.id)
        .is('mentor_id', null)
        .eq('estado', 'activa')
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const isInscribed = !!inscripcion;
  const hasPlatformSub = !!suscripcion;
  const canAccess = isInscribed || (esIncluidoEnSuscripcion && hasPlatformSub);

  const handleInscribirse = async () => {
    if (!user) { navigate('/login'); return; }
    setLoading(true);
    try {
      const { error } = await supabase
        .from('inscripciones')
        .insert({ alumno_id: user.id, curso_id: cursoId });
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['inscripcion', cursoId] });
      toast({ title: '¡Te inscribiste al curso!', description: 'Ya podés acceder al contenido.' });
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (canAccess) {
    return (
      <Button className="gradient-primary" onClick={() => navigate(`/cursos/${cursoId}/ver`)}>
        <PlayCircle className="mr-2 h-4 w-4" /> Ver curso
      </Button>
    );
  }

  if (esIncluidoEnSuscripcion) {
    return (
      <>
        <Button
          className="gradient-primary glow"
          onClick={() => user ? setCheckoutOpen(true) : navigate('/login')}
        >
          Suscribirse a Sumak
        </Button>
        <CheckoutModal
          open={checkoutOpen}
          onClose={() => setCheckoutOpen(false)}
          tipo="suscripcion"
          titulo="Suscripción mensual a Sumak — accedé a todos los cursos incluidos"
        />
      </>
    );
  }

  return (
    <>
      <Button
        className="gradient-primary glow"
        onClick={() => user ? (precio === 0 ? handleInscribirse() : setCheckoutOpen(true)) : navigate('/login')}
        disabled={loading}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {precio === 0 ? 'Inscribirse gratis' : 'Comprar curso'}
      </Button>
      <CheckoutModal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        tipo="curso"
        itemId={cursoId}
        precio={precio}
        titulo={titulosCurso}
      />
    </>
  );
}

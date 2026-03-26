import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2, Check, CreditCard, PlayCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface InscripcionButtonProps {
  cursoId: string;
  precio: number;
  esIncluidoEnSuscripcion: boolean;
  mentorId: string;
  mentorNombre: string;
  precioSuscripcion?: number;
}

export function InscripcionButton({
  cursoId,
  precio,
  esIncluidoEnSuscripcion,
  mentorId,
  mentorNombre,
  precioSuscripcion,
}: InscripcionButtonProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check if already inscribed
  const { data: inscripcion } = useQuery({
    queryKey: ['inscripcion', cursoId, user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from('inscripciones')
        .select('id, estado')
        .eq('curso_id', cursoId)
        .eq('alumno_id', user.id)
        .eq('estado', 'activa')
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  // Check if subscribed to mentor
  const { data: suscripcion } = useQuery({
    queryKey: ['suscripcion-mentor', mentorId, user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from('suscripciones_mentor')
        .select('id, estado')
        .eq('mentor_id', mentorId)
        .eq('alumno_id', user.id)
        .eq('estado', 'activa')
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const isInscribed = !!inscripcion;
  const isSubscribed = !!suscripcion;

  const handleInscribirse = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase
        .from('inscripciones')
        .insert({ alumno_id: user.id, curso_id: cursoId });
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['inscripcion', cursoId] });
      toast({ title: '¡Te inscribiste al curso!', description: 'Ya podés acceder al contenido.' });
      setDialogOpen(false);
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSuscribirse = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase
        .from('suscripciones_mentor')
        .insert({ alumno_id: user.id, mentor_id: mentorId });
      if (error) throw error;

      // Also inscribe to the course
      await supabase
        .from('inscripciones')
        .insert({ alumno_id: user.id, curso_id: cursoId });

      queryClient.invalidateQueries({ queryKey: ['suscripcion-mentor', mentorId] });
      queryClient.invalidateQueries({ queryKey: ['inscripcion', cursoId] });
      toast({ title: '¡Suscripción activada!', description: `Ahora sos suscriptor de ${mentorNombre}.` });
      setDialogOpen(false);
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (isInscribed || (esIncluidoEnSuscripcion && isSubscribed)) {
    return (
      <Button className="gradient-primary" onClick={() => navigate(`/cursos/${cursoId}/ver`)}>
        <PlayCircle className="mr-2 h-4 w-4" /> Ver curso
      </Button>
    );
  }

  return (
    <>
      <Button className="gradient-primary glow" onClick={() => user ? setDialogOpen(true) : navigate('/login')}>
        {esIncluidoEnSuscripcion ? 'Suscribirse al mentor' : 'Inscribirse'}
      </Button>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {esIncluidoEnSuscripcion ? 'Suscribirse al mentor' : 'Confirmar inscripción'}
            </DialogTitle>
            <DialogDescription>
              {esIncluidoEnSuscripcion
                ? `Suscribite a ${mentorNombre} para acceder a este curso y todo su contenido incluido.`
                : 'Confirmá tu inscripción para acceder al contenido del curso.'}
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-lg border border-border/50 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {esIncluidoEnSuscripcion ? 'Suscripción mensual' : 'Precio del curso'}
              </span>
              <span className="text-lg font-bold">
                ${Number(esIncluidoEnSuscripcion ? precioSuscripcion : precio).toLocaleString('es-AR')}
                {esIncluidoEnSuscripcion && <span className="text-sm font-normal text-muted-foreground">/mes</span>}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              <CreditCard className="inline mr-1 h-3 w-3" />
              Pago simulado — la integración con pasarela de pago estará disponible próximamente
            </p>
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button
              className="gradient-primary"
              onClick={esIncluidoEnSuscripcion ? handleSuscribirse : handleInscribirse}
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirmar {esIncluidoEnSuscripcion ? 'suscripción' : 'inscripción'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

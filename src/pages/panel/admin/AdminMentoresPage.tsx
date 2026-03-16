import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Star, StarOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export default function AdminMentoresPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: mentores, isLoading } = useQuery({
    queryKey: ['admin-mentores'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mentores')
        .select('*, profiles!inner(nombre, apellido, especialidad)')
        .order('featured', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const toggleFeatured = useMutation({
    mutationFn: async ({ id, featured }: { id: string; featured: boolean }) => {
      const { error } = await supabase.from('mentores').update({ featured: !featured }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-mentores'] });
      toast({ title: 'Actualizado' });
    },
  });

  const toggleActivo = useMutation({
    mutationFn: async ({ id, activo }: { id: string; activo: boolean }) => {
      const { error } = await supabase.from('mentores').update({ activo: !activo }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-mentores'] });
      toast({ title: 'Actualizado' });
    },
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Gestión de Mentores</h1>
        <p className="text-muted-foreground">{(mentores || []).length} mentores registrados</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
        </div>
      ) : (mentores || []).length === 0 ? (
        <p className="text-muted-foreground">No hay mentores registrados.</p>
      ) : (
        <div className="space-y-4">
          {(mentores || []).map((m: any) => (
            <Card key={m.id} className="border-border/50">
              <CardContent className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{m.profiles.nombre} {m.profiles.apellido}</h3>
                    {m.featured && <Star className="h-4 w-4 text-warning fill-warning" />}
                    <Badge variant={m.activo ? 'default' : 'secondary'}>{m.activo ? 'Activo' : 'Inactivo'}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{m.profiles.especialidad}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleActivo.mutate({ id: m.id, activo: m.activo })}
                  >
                    {m.activo ? 'Desactivar' : 'Activar'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleFeatured.mutate({ id: m.id, featured: m.featured })}
                  >
                    {m.featured ? <StarOff className="mr-1 h-3 w-3" /> : <Star className="mr-1 h-3 w-3" />}
                    {m.featured ? 'Quitar destacado' : 'Destacar'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

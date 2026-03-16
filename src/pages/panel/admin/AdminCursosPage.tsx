import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export default function AdminCursosPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: cursos, isLoading } = useQuery({
    queryKey: ['admin-cursos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cursos')
        .select('*, mentores!inner(profiles!inner(nombre, apellido))')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const updateEstado = useMutation({
    mutationFn: async ({ id, estado }: { id: string; estado: string }) => {
      const { error } = await supabase.from('cursos').update({ estado: estado as any }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-cursos'] });
      toast({ title: 'Curso actualizado' });
    },
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Gestión de Cursos</h1>
        <p className="text-muted-foreground">Aprobá o rechazá cursos pendientes</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
        </div>
      ) : (cursos || []).length === 0 ? (
        <p className="text-muted-foreground">No hay cursos.</p>
      ) : (
        <div className="space-y-4">
          {(cursos || []).map((c: any) => (
            <Card key={c.id} className="border-border/50">
              <CardContent className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{c.titulo}</h3>
                    <Badge variant={c.estado === 'publicado' ? 'default' : c.estado === 'pendiente' ? 'outline' : 'secondary'}>{c.estado}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {c.mentores.profiles.nombre} {c.mentores.profiles.apellido} · {c.categoria}
                  </p>
                </div>
                {c.estado === 'pendiente' && (
                  <div className="flex gap-2">
                    <Button size="sm" className="gradient-primary" onClick={() => updateEstado.mutate({ id: c.id, estado: 'publicado' })}>
                      <Check className="mr-1 h-3 w-3" /> Aprobar
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => updateEstado.mutate({ id: c.id, estado: 'rechazado' })}>
                      <X className="mr-1 h-3 w-3" /> Rechazar
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Eye, EyeOff, Loader2, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { CATEGORIAS } from '@/types';
import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function MentorCursosPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ titulo: '', descripcion: '', categoria: '', precio: '0' });

  const { data: mentorId } = useQuery({
    queryKey: ['my-mentor-id', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data: prof } = await supabase.from('profiles').select('id').eq('user_id', user!.id).single();
      if (!prof) return null;
      const { data: mentor } = await supabase.from('mentores').select('id').eq('profile_id', prof.id).single();
      return mentor?.id || null;
    },
  });

  const { data: cursos, isLoading } = useQuery({
    queryKey: ['my-cursos', mentorId],
    enabled: !!mentorId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cursos')
        .select('*')
        .eq('mentor_id', mentorId!)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const createCurso = useMutation({
    mutationFn: async () => {
      if (!mentorId) throw new Error('No mentor ID');
      const { error } = await supabase.from('cursos').insert({
        mentor_id: mentorId,
        titulo: form.titulo,
        descripcion: form.descripcion,
        categoria: form.categoria,
        precio: parseFloat(form.precio) || 0,
        estado: 'borrador',
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-cursos'] });
      setOpen(false);
      setForm({ titulo: '', descripcion: '', categoria: '', precio: '0' });
      toast({ title: 'Curso creado', description: 'Tu curso fue creado como borrador.' });
    },
    onError: (err: Error) => {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    },
  });

  const toggleEstado = useMutation({
    mutationFn: async ({ id, estado }: { id: string; estado: string }) => {
      const nuevoEstado = estado === 'publicado' ? 'borrador' : 'pendiente';
      const { error } = await supabase.from('cursos').update({ estado: nuevoEstado as any }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-cursos'] });
      toast({ title: 'Estado actualizado' });
    },
  });

  const estadoColor = (estado: string) => {
    switch (estado) {
      case 'publicado': return 'default';
      case 'borrador': return 'secondary';
      case 'pendiente': return 'outline';
      default: return 'destructive' as const;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Mis Cursos</h1>
          <p className="text-muted-foreground">Gestioná tus formaciones</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary">
              <Plus className="mr-2 h-4 w-4" /> Nuevo Curso
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear nuevo curso</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); createCurso.mutate(); }} className="space-y-4">
              <div className="space-y-2">
                <Label>Título</Label>
                <Input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Descripción</Label>
                <Textarea value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} rows={3} />
              </div>
              <div className="space-y-2">
                <Label>Categoría</Label>
                <Select value={form.categoria} onValueChange={(v) => setForm({ ...form, categoria: v })}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIAS.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Precio (ARS)</Label>
                <Input type="number" min="0" value={form.precio} onChange={(e) => setForm({ ...form, precio: e.target.value })} />
              </div>
              <Button type="submit" className="w-full gradient-primary" disabled={createCurso.isPending}>
                {createCurso.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Crear curso
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Cargando...</p>
      ) : (cursos || []).length === 0 ? (
        <p className="text-muted-foreground">Aún no tenés cursos. ¡Creá el primero!</p>
      ) : (
        <div className="space-y-4">
          {(cursos || []).map((curso) => (
            <Card key={curso.id} className="border-border/50">
              <CardContent className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{curso.titulo}</h3>
                    <Badge variant={estadoColor(curso.estado)}>{curso.estado}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {curso.categoria} · ${Number(curso.precio).toLocaleString('es-AR')}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" asChild>
                    <Link to={`/panel/mentor/cursos/${curso.id}`}>
                      <Edit className="mr-1 h-3 w-3" /> Editar contenido <ChevronRight className="ml-1 h-3 w-3" />
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => toggleEstado.mutate({ id: curso.id, estado: curso.estado })}
                  >
                    {curso.estado === 'publicado' ? (
                      <><EyeOff className="mr-1 h-3 w-3" /> Despublicar</>
                    ) : (
                      <><Eye className="mr-1 h-3 w-3" /> Enviar a revisión</>
                    )}
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

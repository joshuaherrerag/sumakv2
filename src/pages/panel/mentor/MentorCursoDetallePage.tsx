import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import {
  ArrowLeft, Plus, Trash2, Edit, GripVertical, PlayCircle, FileText, BookOpen, Loader2, Save,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CATEGORIAS } from '@/types';

export default function MentorCursoDetallePage() {
  const { cursoId } = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch curso
  const { data: curso, isLoading } = useQuery({
    queryKey: ['mentor-curso', cursoId],
    enabled: !!cursoId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cursos')
        .select('*')
        .eq('id', cursoId!)
        .single();
      if (error) throw error;
      return data;
    },
  });

  // Fetch modulos with lecciones
  const { data: modulos } = useQuery({
    queryKey: ['mentor-curso-modulos', cursoId],
    enabled: !!cursoId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('modulos')
        .select('*, lecciones(*)')
        .eq('curso_id', cursoId!)
        .order('orden', { ascending: true });
      if (error) throw error;
      return (data || []).map((m: any) => ({
        ...m,
        lecciones: (m.lecciones || []).sort((a: any, b: any) => a.orden - b.orden),
      }));
    },
  });

  // --- Course Edit ---
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    titulo: '', descripcion: '', categoria: '', precio: '0', es_incluido_en_suscripcion: true,
  });

  const openEdit = () => {
    if (curso) {
      setEditForm({
        titulo: curso.titulo,
        descripcion: curso.descripcion || '',
        categoria: curso.categoria,
        precio: String(curso.precio),
        es_incluido_en_suscripcion: curso.es_incluido_en_suscripcion,
      });
      setEditOpen(true);
    }
  };

  const updateCurso = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('cursos').update({
        titulo: editForm.titulo,
        descripcion: editForm.descripcion,
        categoria: editForm.categoria,
        precio: parseFloat(editForm.precio) || 0,
        es_incluido_en_suscripcion: editForm.es_incluido_en_suscripcion,
      }).eq('id', cursoId!);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mentor-curso', cursoId] });
      setEditOpen(false);
      toast({ title: 'Curso actualizado' });
    },
    onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  // --- Module CRUD ---
  const [moduloForm, setModuloForm] = useState({ titulo: '' });
  const [moduloOpen, setModuloOpen] = useState(false);

  const createModulo = useMutation({
    mutationFn: async () => {
      const nextOrden = (modulos?.length || 0) + 1;
      const { error } = await supabase.from('modulos').insert({
        curso_id: cursoId!,
        titulo: moduloForm.titulo,
        orden: nextOrden,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mentor-curso-modulos'] });
      setModuloOpen(false);
      setModuloForm({ titulo: '' });
      toast({ title: 'Módulo creado' });
    },
    onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const deleteModulo = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('modulos').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mentor-curso-modulos'] });
      toast({ title: 'Módulo eliminado' });
    },
  });

  // --- Lesson CRUD ---
  const [leccionOpen, setLeccionOpen] = useState<string | null>(null);
  const [leccionForm, setLeccionForm] = useState({
    titulo: '', tipo: 'video' as 'video' | 'pdf' | 'texto', contenido_url: '', duracion_min: '',
  });

  const createLeccion = useMutation({
    mutationFn: async (moduloId: string) => {
      const mod = modulos?.find((m: any) => m.id === moduloId);
      const nextOrden = (mod?.lecciones?.length || 0) + 1;
      const { error } = await supabase.from('lecciones').insert({
        modulo_id: moduloId,
        titulo: leccionForm.titulo,
        tipo: leccionForm.tipo,
        contenido_url: leccionForm.contenido_url || null,
        duracion_min: leccionForm.duracion_min ? parseInt(leccionForm.duracion_min) : null,
        orden: nextOrden,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mentor-curso-modulos'] });
      setLeccionOpen(null);
      setLeccionForm({ titulo: '', tipo: 'video', contenido_url: '', duracion_min: '' });
      toast({ title: 'Lección creada' });
    },
    onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const deleteLeccion = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('lecciones').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mentor-curso-modulos'] });
      toast({ title: 'Lección eliminada' });
    },
  });

  const tipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'video': return <PlayCircle className="h-4 w-4 text-primary" />;
      case 'pdf': return <FileText className="h-4 w-4 text-blue-400" />;
      default: return <BookOpen className="h-4 w-4 text-muted-foreground" />;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!curso) {
    return (
      <div className="space-y-4">
        <p className="text-muted-foreground">Curso no encontrado.</p>
        <Button variant="outline" asChild>
          <Link to="/panel/mentor/cursos">Volver</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/panel/mentor/cursos"><ArrowLeft className="h-5 w-5" /></Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{curso.titulo}</h1>
            <Badge variant={curso.estado === 'publicado' ? 'default' : 'secondary'}>{curso.estado}</Badge>
          </div>
          <p className="text-muted-foreground text-sm">{curso.categoria} · ${Number(curso.precio).toLocaleString('es-AR')}</p>
        </div>
        <Button variant="outline" onClick={openEdit}>
          <Edit className="mr-2 h-4 w-4" /> Editar info
        </Button>
      </div>

      {/* Edit Course Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Editar curso</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); updateCurso.mutate(); }} className="space-y-4">
            <div className="space-y-2">
              <Label>Título</Label>
              <Input value={editForm.titulo} onChange={(e) => setEditForm({ ...editForm, titulo: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>Descripción</Label>
              <Textarea value={editForm.descripcion} onChange={(e) => setEditForm({ ...editForm, descripcion: e.target.value })} rows={3} />
            </div>
            <div className="space-y-2">
              <Label>Categoría</Label>
              <Select value={editForm.categoria} onValueChange={(v) => setEditForm({ ...editForm, categoria: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIAS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Precio (ARS)</Label>
              <Input type="number" min="0" value={editForm.precio} onChange={(e) => setEditForm({ ...editForm, precio: e.target.value })} />
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={editForm.es_incluido_en_suscripcion} onCheckedChange={(v) => setEditForm({ ...editForm, es_incluido_en_suscripcion: v })} />
              <Label>Incluido en suscripción al mentor</Label>
            </div>
            <Button type="submit" className="w-full gradient-primary" disabled={updateCurso.isPending}>
              {updateCurso.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar cambios
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modules Section */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Módulos y Lecciones</h2>
        <Dialog open={moduloOpen} onOpenChange={setModuloOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gradient-primary">
              <Plus className="mr-1 h-4 w-4" /> Agregar módulo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nuevo módulo</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); createModulo.mutate(); }} className="space-y-4">
              <div className="space-y-2">
                <Label>Título del módulo</Label>
                <Input value={moduloForm.titulo} onChange={(e) => setModuloForm({ titulo: e.target.value })} required placeholder="Ej: Introducción" />
              </div>
              <Button type="submit" className="w-full gradient-primary" disabled={createModulo.isPending}>
                {createModulo.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Crear módulo
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {(modulos || []).length === 0 ? (
        <Card className="border-dashed border-2 border-border/50">
          <CardContent className="py-12 text-center text-muted-foreground">
            <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-50" />
            <p>Aún no hay módulos. Agregá el primero para empezar a crear contenido.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {(modulos || []).map((modulo: any) => (
            <Card key={modulo.id} className="border-border/50">
              <CardHeader className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <GripVertical className="h-4 w-4 text-muted-foreground/50" />
                    <CardTitle className="text-base">
                      <span className="text-xs font-mono text-muted-foreground mr-2">#{modulo.orden}</span>
                      {modulo.titulo}
                    </CardTitle>
                    <Badge variant="outline" className="text-xs">{modulo.lecciones?.length || 0} lecciones</Badge>
                  </div>
                  <div className="flex gap-1">
                    <Dialog open={leccionOpen === modulo.id} onOpenChange={(o) => setLeccionOpen(o ? modulo.id : null)}>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="ghost"><Plus className="h-3 w-3 mr-1" /> Lección</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader><DialogTitle>Nueva lección</DialogTitle></DialogHeader>
                        <form onSubmit={(e) => { e.preventDefault(); createLeccion.mutate(modulo.id); }} className="space-y-4">
                          <div className="space-y-2">
                            <Label>Título</Label>
                            <Input value={leccionForm.titulo} onChange={(e) => setLeccionForm({ ...leccionForm, titulo: e.target.value })} required />
                          </div>
                          <div className="space-y-2">
                            <Label>Tipo</Label>
                            <Select value={leccionForm.tipo} onValueChange={(v: any) => setLeccionForm({ ...leccionForm, tipo: v })}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="video">Video</SelectItem>
                                <SelectItem value="pdf">PDF</SelectItem>
                                <SelectItem value="texto">Texto</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>URL del contenido</Label>
                            <Input value={leccionForm.contenido_url} onChange={(e) => setLeccionForm({ ...leccionForm, contenido_url: e.target.value })} placeholder="https://..." />
                          </div>
                          <div className="space-y-2">
                            <Label>Duración (minutos)</Label>
                            <Input type="number" min="0" value={leccionForm.duracion_min} onChange={(e) => setLeccionForm({ ...leccionForm, duracion_min: e.target.value })} />
                          </div>
                          <Button type="submit" className="w-full gradient-primary" disabled={createLeccion.isPending}>
                            {createLeccion.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Crear lección
                          </Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                    <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => deleteModulo.mutate(modulo.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {modulo.lecciones?.length > 0 && (
                <CardContent className="pt-0 pb-4">
                  <div className="space-y-1">
                    {modulo.lecciones.map((leccion: any) => (
                      <div key={leccion.id} className="flex items-center justify-between rounded-md px-3 py-2 bg-muted/30 group">
                        <div className="flex items-center gap-3">
                          {tipoIcon(leccion.tipo)}
                          <span className="text-sm">{leccion.titulo}</span>
                          {leccion.duracion_min && (
                            <span className="text-xs text-muted-foreground">{leccion.duracion_min} min</span>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive h-7 w-7 p-0"
                          onClick={() => deleteLeccion.mutate(leccion.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

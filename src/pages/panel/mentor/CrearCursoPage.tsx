import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Loader2, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { CATEGORIAS } from '@/types';
import CourseImageUpload from '@/components/CourseImageUpload';

export default function CrearCursoPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [busquedaMentor, setBusquedaMentor] = useState('');
  const [resultadosBusqueda, setResultadosBusqueda] = useState<any[]>([]);
  const [coMentores, setCoMentores] = useState<Array<{
    id: string; nombre: string; apellido: string; rol: string; porcentaje: number;
  }>>([]);

  const [form, setForm] = useState({
    titulo: '',
    descripcion: '',
    categoria: '',
    tipo_acceso: 'incluido' as 'incluido' | 'pago',
    precio: '0',
    imagen_url: '',
  });

  // Obtener mentorId a partir del userId
  const { data: mentorId } = useQuery({
    queryKey: ['my-mentor-id', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data: prof } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user!.id)
        .single();
      if (!prof) return null;
      const { data: mentor } = await supabase
        .from('mentores')
        .select('id')
        .eq('profile_id', prof.id)
        .single();
      return mentor?.id ?? null;
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mentorId) {
      toast({ title: 'Error', description: 'No se encontró tu perfil de mentor.', variant: 'destructive' });
      return;
    }
    if (!form.titulo || !form.descripcion || !form.categoria) {
      toast({ title: 'Completá los campos requeridos', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('cursos')
        .insert({
          mentor_id: mentorId,
          titulo: form.titulo,
          descripcion: form.descripcion,
          imagen_url: form.imagen_url || null,
          precio: form.tipo_acceso === 'pago' ? parseFloat(form.precio) || 0 : 0,
          es_incluido_en_suscripcion: form.tipo_acceso === 'incluido',
          estado: 'publicado',
          categoria: form.categoria,
        })
        .select('id')
        .single();

      if (error) throw error;

      if (coMentores.length > 0) {
        await supabase.from('curso_mentores').insert(
          coMentores.map((cm) => ({
            curso_id: data.id,
            mentor_id: cm.id,
            rol: cm.rol,
            pct_ingreso: cm.porcentaje,
          }))
        );
      }

      toast({ title: '¡Curso publicado!', description: 'Ahora podés agregar módulos y lecciones.' });
      navigate(`/panel/mentor/cursos/${data.id}`);
    } catch (e: any) {
      toast({ title: 'Error al crear el curso', description: e.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const buscarMentores = async (query: string) => {
    if (query.length < 2) { setResultadosBusqueda([]); return; }
    const { data } = await supabase
      .from('mentores')
      .select('id, profiles!inner(nombre, apellido, especialidad)')
      .ilike('profiles.nombre', `%${query}%`)
      .limit(5);
    setResultadosBusqueda(data || []);
  };

  const agregarCoMentor = (mentor: any) => {
    if (coMentores.some((cm) => cm.id === mentor.id)) return;
    setCoMentores([...coMentores, {
      id: mentor.id,
      nombre: mentor.profiles.nombre,
      apellido: mentor.profiles.apellido,
      rol: 'colaborador',
      porcentaje: 0,
    }]);
    setBusquedaMentor('');
    setResultadosBusqueda([]);
  };

  const totalPorcentaje = coMentores.reduce((s, c) => s + c.porcentaje, 0);

  // El ID temporal para la portada (usamos uno placeholder hasta tener el ID real)
  const tempCursoId = `temp-${user?.id ?? 'curso'}`;

  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/panel/mentor/cursos"><ArrowLeft className="h-5 w-5" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Nuevo curso</h1>
          <p className="text-muted-foreground">Completá la información para publicar tu formación</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Portada */}
        <Card className="border-border/50">
          <CardHeader><CardTitle className="text-lg">Portada del curso</CardTitle></CardHeader>
          <CardContent>
            <CourseImageUpload
              cursoId={tempCursoId}
              currentImageUrl={form.imagen_url || null}
              onUploadComplete={(url) => setForm({ ...form, imagen_url: url })}
            />
          </CardContent>
        </Card>

        {/* Información básica */}
        <Card className="border-border/50">
          <CardHeader><CardTitle className="text-lg">Información del curso</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Título <span className="text-destructive">*</span></Label>
              <Input
                value={form.titulo}
                onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                placeholder="Ej: Meditación para principiantes"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Descripción <span className="text-destructive">*</span></Label>
              <Textarea
                value={form.descripcion}
                onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                rows={5}
                placeholder="Describí qué van a aprender, a quién está dirigido y qué resultados pueden esperar..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Categoría <span className="text-destructive">*</span></Label>
              <Select value={form.categoria} onValueChange={(v) => setForm({ ...form, categoria: v })}>
                <SelectTrigger><SelectValue placeholder="Seleccioná..." /></SelectTrigger>
                <SelectContent>
                  {CATEGORIAS.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Acceso y precio */}
        <Card className="border-border/50">
          <CardHeader><CardTitle className="text-lg">Acceso y precio</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Tipo de acceso</Label>
              <Select value={form.tipo_acceso} onValueChange={(v: 'incluido' | 'pago') => setForm({ ...form, tipo_acceso: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="incluido">Incluido en suscripción al mentor</SelectItem>
                  <SelectItem value="pago">Pago por separado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {form.tipo_acceso === 'pago' && (
              <div className="space-y-2">
                <Label>Precio (ARS)</Label>
                <Input
                  type="number"
                  min="0"
                  step="100"
                  value={form.precio}
                  onChange={(e) => setForm({ ...form, precio: e.target.value })}
                  placeholder="0"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Co-mentores */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Co-mentores</CardTitle>
            <CardDescription>Opcional — agregá mentores colaboradores a este curso</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Buscar mentor</Label>
              <Input
                placeholder="Nombre del mentor..."
                value={busquedaMentor}
                onChange={(e) => { setBusquedaMentor(e.target.value); buscarMentores(e.target.value); }}
              />
            </div>

            {resultadosBusqueda.length > 0 && (
              <div className="border rounded-lg divide-y overflow-hidden">
                {resultadosBusqueda.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    className="w-full p-3 text-left hover:bg-muted flex items-center justify-between transition-colors"
                    onClick={() => agregarCoMentor(m)}
                  >
                    <div>
                      <div className="text-sm font-medium">{m.profiles.nombre} {m.profiles.apellido}</div>
                      {m.profiles.especialidad && (
                        <div className="text-xs text-muted-foreground">{m.profiles.especialidad}</div>
                      )}
                    </div>
                    <Plus className="h-4 w-4 text-muted-foreground" />
                  </button>
                ))}
              </div>
            )}

            {coMentores.length > 0 && (
              <div className="space-y-2">
                {coMentores.map((cm, idx) => (
                  <div key={cm.id} className="flex items-center gap-2 p-3 border rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{cm.nombre} {cm.apellido}</p>
                    </div>
                    <Select
                      value={cm.rol}
                      onValueChange={(v) => {
                        const updated = [...coMentores];
                        updated[idx] = { ...updated[idx], rol: v };
                        setCoMentores(updated);
                      }}
                    >
                      <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="colaborador">Colaborador</SelectItem>
                        <SelectItem value="invitado">Invitado</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      className="w-20"
                      placeholder="%"
                      value={cm.porcentaje || ''}
                      onChange={(e) => {
                        const updated = [...coMentores];
                        updated[idx] = { ...updated[idx], porcentaje: parseInt(e.target.value) || 0 };
                        setCoMentores(updated);
                      }}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setCoMentores(coMentores.filter((_, i) => i !== idx))}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <p className={`text-sm ${totalPorcentaje !== 100 ? 'text-destructive' : 'text-muted-foreground'}`}>
                  Total repartido: {totalPorcentaje}%
                  {totalPorcentaje !== 100 && ' (debe sumar 100%)'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Button
          type="submit"
          className="w-full gradient-primary"
          disabled={loading || !form.titulo || !form.descripcion || !form.categoria || (coMentores.length > 0 && totalPorcentaje !== 100)}
        >
          {loading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Publicando...</>
          ) : (
            'Publicar curso'
          )}
        </Button>
      </form>
    </div>
  );
}

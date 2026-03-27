import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Calendar, Loader2, MapPin, Plus, Trash2, Users, Video, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface CoPonente {
  id: string;
  nombre: string;
  apellido: string;
  rol: string;
}

export default function CrearEventoPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    titulo: '',
    descripcion: '',
    tipo: 'online' as 'online' | 'presencial' | 'hibrido',
    modalidad_acceso: 'incluido' as 'incluido' | 'premium',
    precio: '0',
    fecha_inicio: '',
    fecha_fin: '',
    aforo: '',
    url_streaming: '',
    ubicacion: '',
  });

  const [coPonentes, setCoPonentes] = useState<CoPonente[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [resultados, setResultados] = useState<any[]>([]);

  // Obtener mentorId
  const { data: mentorId } = useQuery({
    queryKey: ['my-mentor-id', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data: prof } = await supabase
        .from('profiles').select('id').eq('user_id', user!.id).single();
      if (!prof) return null;
      const { data: mentor } = await supabase
        .from('mentores').select('id').eq('profile_id', prof.id).single();
      return mentor?.id ?? null;
    },
  });

  const buscarMentores = async (query: string) => {
    if (query.length < 2) { setResultados([]); return; }
    const { data } = await supabase
      .from('mentores')
      .select('id, profiles!inner(nombre, apellido, especialidad)')
      .ilike('profiles.nombre', `%${query}%`)
      .limit(5);
    setResultados(data || []);
  };

  const agregarCoPonente = (mentor: any) => {
    if (coPonentes.some((cp) => cp.id === mentor.id)) {
      toast({ title: 'Este mentor ya fue agregado', variant: 'destructive' });
      return;
    }
    setCoPonentes([...coPonentes, {
      id: mentor.id,
      nombre: mentor.profiles.nombre,
      apellido: mentor.profiles.apellido,
      rol: 'invitado',
    }]);
    setBusqueda('');
    setResultados([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mentorId) {
      toast({ title: 'Error', description: 'No se encontró tu perfil de mentor.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      const { data: evento, error } = await supabase
        .from('eventos')
        .insert({
          titulo: form.titulo,
          descripcion: form.descripcion,
          tipo: form.tipo,
          modalidad_acceso: form.modalidad_acceso,
          precio: form.modalidad_acceso === 'premium' ? parseFloat(form.precio) || 0 : 0,
          fecha_inicio: form.fecha_inicio,
          fecha_fin: form.fecha_fin,
          aforo: form.aforo ? parseInt(form.aforo) : null,
          url_streaming: form.url_streaming || null,
          ubicacion: form.ubicacion || null,
        })
        .select('id')
        .single();

      if (error) throw error;

      // Mentor creador como ponente principal
      await supabase.from('evento_mentores').insert({
        evento_id: evento.id,
        mentor_id: mentorId,
        rol: 'principal',
      });

      // Co-ponentes
      if (coPonentes.length > 0) {
        await supabase.from('evento_mentores').insert(
          coPonentes.map((cp) => ({
            evento_id: evento.id,
            mentor_id: cp.id,
            rol: cp.rol,
          }))
        );
      }

      toast({ title: '¡Evento publicado!', description: 'Tu evento ya es visible para la comunidad.' });
      navigate('/panel/mentor/eventos');
    } catch (e: any) {
      toast({ title: 'Error al crear el evento', description: e.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const showOnline = form.tipo === 'online' || form.tipo === 'hibrido';
  const showPresencial = form.tipo === 'presencial' || form.tipo === 'hibrido';

  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/panel/mentor/eventos"><ArrowLeft className="h-5 w-5" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Nuevo evento</h1>
          <p className="text-muted-foreground">Creá un evento para tu comunidad</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Info básica */}
        <Card className="border-border/50">
          <CardHeader><CardTitle className="text-lg">Información del evento</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Título <span className="text-destructive">*</span></Label>
              <Input
                required
                placeholder="Ej: Retiro de Mindfulness en Córdoba"
                value={form.titulo}
                onChange={(e) => setForm({ ...form, titulo: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Descripción <span className="text-destructive">*</span></Label>
              <Textarea
                required
                rows={4}
                placeholder="Describí el evento, qué van a vivir, qué incluye..."
                value={form.descripcion}
                onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo <span className="text-destructive">*</span></Label>
                <Select value={form.tipo} onValueChange={(v: typeof form.tipo) => setForm({ ...form, tipo: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="online">
                      <span className="flex items-center gap-2"><Video className="h-4 w-4" /> Online</span>
                    </SelectItem>
                    <SelectItem value="presencial">
                      <span className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Presencial</span>
                    </SelectItem>
                    <SelectItem value="hibrido">Híbrido</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Modalidad de acceso</Label>
                <Select value={form.modalidad_acceso} onValueChange={(v: typeof form.modalidad_acceso) => setForm({ ...form, modalidad_acceso: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="incluido">Incluido en suscripción</SelectItem>
                    <SelectItem value="premium">Premium (pago aparte)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {form.modalidad_acceso === 'premium' && (
              <div className="space-y-2">
                <Label>Precio (ARS) <span className="text-destructive">*</span></Label>
                <Input
                  type="number"
                  min="0"
                  step="100"
                  value={form.precio}
                  onChange={(e) => setForm({ ...form, precio: e.target.value })}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Fecha y logística */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5" /> Fecha y logística
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Fecha y hora de inicio <span className="text-destructive">*</span></Label>
                <Input
                  type="datetime-local"
                  required
                  value={form.fecha_inicio}
                  onChange={(e) => setForm({ ...form, fecha_inicio: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Fecha y hora de fin <span className="text-destructive">*</span></Label>
                <Input
                  type="datetime-local"
                  required
                  value={form.fecha_fin}
                  onChange={(e) => setForm({ ...form, fecha_fin: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Aforo máximo (opcional)</Label>
              <Input
                type="number"
                min="1"
                placeholder="Número máximo de asistentes"
                value={form.aforo}
                onChange={(e) => setForm({ ...form, aforo: e.target.value })}
              />
            </div>

            {showOnline && (
              <div className="space-y-2">
                <Label>URL de streaming</Label>
                <Input
                  type="url"
                  placeholder="https://zoom.us/j/..."
                  value={form.url_streaming}
                  onChange={(e) => setForm({ ...form, url_streaming: e.target.value })}
                />
              </div>
            )}

            {showPresencial && (
              <div className="space-y-2">
                <Label>Ubicación</Label>
                <Input
                  placeholder="Ej: Centro Sumak, Córdoba Capital"
                  value={form.ubicacion}
                  onChange={(e) => setForm({ ...form, ubicacion: e.target.value })}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Co-ponentes */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5" /> Co-ponentes (opcional)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Buscar mentor</Label>
              <Input
                placeholder="Nombre del mentor..."
                value={busqueda}
                onChange={(e) => { setBusqueda(e.target.value); buscarMentores(e.target.value); }}
              />
            </div>

            {resultados.length > 0 && (
              <div className="border rounded-lg divide-y overflow-hidden">
                {resultados.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    className="w-full p-3 text-left hover:bg-muted flex items-center justify-between transition-colors"
                    onClick={() => agregarCoPonente(m)}
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

            {coPonentes.length > 0 && (
              <div className="space-y-2">
                {coPonentes.map((cp, idx) => (
                  <div key={cp.id} className="flex items-center gap-2 p-3 border rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{cp.nombre} {cp.apellido}</p>
                    </div>
                    <Select
                      value={cp.rol}
                      onValueChange={(v) => {
                        const updated = [...coPonentes];
                        updated[idx] = { ...updated[idx], rol: v };
                        setCoPonentes(updated);
                      }}
                    >
                      <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="invitado">Invitado</SelectItem>
                        <SelectItem value="moderador">Moderador</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setCoPonentes(coPonentes.filter((_, i) => i !== idx))}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Button
          type="submit"
          className="w-full gradient-primary"
          disabled={loading || !form.titulo || !form.descripcion || !form.fecha_inicio || !form.fecha_fin}
        >
          {loading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Publicando...</>
          ) : (
            'Publicar evento'
          )}
        </Button>
      </form>
    </div>
  );
}

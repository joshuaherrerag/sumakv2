import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

export default function MentorPerfilPage() {
  const { profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    bio: '',
    especialidad: '',
    instagram: '',
    linkedin: '',
    website: '',
  });

  useEffect(() => {
    if (profile) {
      const redes = (profile.redes_sociales || {}) as Record<string, string>;
      setForm({
        nombre: profile.nombre || '',
        apellido: profile.apellido || '',
        bio: profile.bio || '',
        especialidad: profile.especialidad || '',
        instagram: redes.instagram || '',
        linkedin: redes.linkedin || '',
        website: redes.website || '',
      });
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setLoading(true);

    const { error } = await supabase
      .from('profiles')
      .update({
        nombre: form.nombre,
        apellido: form.apellido,
        bio: form.bio,
        especialidad: form.especialidad,
        redes_sociales: {
          instagram: form.instagram,
          linkedin: form.linkedin,
          website: form.website,
        },
      })
      .eq('id', profile.id);

    setLoading(false);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      await refreshProfile();
      toast({ title: 'Perfil actualizado', description: 'Los cambios se guardaron correctamente.' });
    }
  };

  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Mi Perfil</h1>
        <p className="text-muted-foreground">Editá tu información pública</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Información personal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nombre</Label>
                <Input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Apellido</Label>
                <Input value={form.apellido} onChange={(e) => setForm({ ...form, apellido: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Especialidad</Label>
              <Input value={form.especialidad} onChange={(e) => setForm({ ...form, especialidad: e.target.value })} placeholder="Ej: Desarrollo Personal" />
            </div>
            <div className="space-y-2">
              <Label>Biografía</Label>
              <Textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={4} placeholder="Contá sobre vos y tu experiencia..." />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Redes sociales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Instagram</Label>
              <Input value={form.instagram} onChange={(e) => setForm({ ...form, instagram: e.target.value })} placeholder="@usuario" />
            </div>
            <div className="space-y-2">
              <Label>LinkedIn</Label>
              <Input value={form.linkedin} onChange={(e) => setForm({ ...form, linkedin: e.target.value })} placeholder="URL de LinkedIn" />
            </div>
            <div className="space-y-2">
              <Label>Sitio web</Label>
              <Input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://..." />
            </div>
          </CardContent>
        </Card>

        <Button type="submit" className="gradient-primary" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Guardar cambios
        </Button>
      </form>
    </div>
  );
}

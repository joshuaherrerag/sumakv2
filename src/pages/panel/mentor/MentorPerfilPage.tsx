import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { CATEGORIAS } from '@/types';
import AvatarUpload from '@/components/AvatarUpload';
import BannerUpload from '@/components/BannerUpload';

const PAISES = [
  'Argentina', 'Bolivia', 'Brasil', 'Chile', 'Colombia', 'Costa Rica',
  'Cuba', 'Ecuador', 'El Salvador', 'Guatemala', 'Honduras', 'México',
  'Nicaragua', 'Panamá', 'Paraguay', 'Perú', 'República Dominicana',
  'Uruguay', 'Venezuela',
];

export default function MentorPerfilPage() {
  const { profile, user, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    pais: '',
    especialidad: '',
    bio: '',
    categorias: [] as string[],
    instagram: '',
    linkedin: '',
    website: '',
    bannerUrl: '',
    avatarUrl: '',
  });

  useEffect(() => {
    if (!profile) return;

    const redes = (profile.redes_sociales || {}) as Record<string, string>;

    setForm({
      nombre: profile.nombre || '',
      apellido: profile.apellido || '',
      pais: redes.pais || '',
      especialidad: profile.especialidad || '',
      bio: profile.bio || '',
      categorias: [],
      instagram: redes.instagram || '',
      linkedin: redes.linkedin || '',
      website: redes.website || '',
      bannerUrl: redes.banner_url || '',
      avatarUrl: profile.avatar_url || '',
    });

    // Cargar categorías actuales del mentor
    supabase
      .from('mentores')
      .select('categorias')
      .eq('profile_id', profile.id)
      .single()
      .then(({ data }) => {
        if (data?.categorias) {
          setForm((prev) => ({ ...prev, categorias: data.categorias as string[] }));
        }
      });
  }, [profile]);

  const toggleCategoria = (cat: string) => {
    setForm((prev) => ({
      ...prev,
      categorias: prev.categorias.includes(cat)
        ? prev.categorias.filter((c) => c !== cat)
        : [...prev.categorias, cat],
    }));
  };

  const canSave = form.pais && form.categorias.length >= 1;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setLoading(true);

    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          nombre: form.nombre,
          apellido: form.apellido,
          bio: form.bio,
          especialidad: form.especialidad,
          redes_sociales: {
            pais: form.pais,
            instagram: form.instagram,
            linkedin: form.linkedin,
            website: form.website,
            banner_url: form.bannerUrl,
          },
        })
        .eq('id', profile.id);

      if (profileError) throw profileError;

      const { error: mentorError } = await supabase
        .from('mentores')
        .update({ categorias: form.categorias })
        .eq('profile_id', profile.id);

      if (mentorError) throw mentorError;

      await refreshProfile();
      toast({ title: 'Perfil actualizado', description: 'Tus cambios se guardaron correctamente.' });
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Mi Perfil</h1>
        <p className="text-muted-foreground">Editá tu información pública</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Fotos */}
        <Card className="border-border/50 overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg">Fotos de perfil</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Banner</Label>
              <BannerUpload
                currentBannerUrl={form.bannerUrl || null}
                profileId={profile?.id ?? ''}
                onUploadComplete={(url) => setForm((prev) => ({ ...prev, bannerUrl: url }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Foto de perfil</Label>
              <AvatarUpload
                currentAvatarUrl={form.avatarUrl || null}
                userId={user?.id ?? ''}
                onUploadComplete={(url) => setForm((prev) => ({ ...prev, avatarUrl: url }))}
                size="lg"
              />
            </div>
          </CardContent>
        </Card>

        {/* Información personal */}
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
              <Label>País <span className="text-destructive">*</span></Label>
              <Select value={form.pais} onValueChange={(v) => setForm({ ...form, pais: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccioná tu país" />
                </SelectTrigger>
                <SelectContent>
                  {PAISES.map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Especialidad</Label>
              <Input
                value={form.especialidad}
                onChange={(e) => setForm({ ...form, especialidad: e.target.value })}
                placeholder="Ej: Desarrollo Personal, Coach de vida..."
              />
            </div>

            <div className="space-y-2">
              <Label>Biografía</Label>
              <Textarea
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                rows={4}
                placeholder="Contá sobre vos y tu experiencia..."
              />
            </div>

            {/* Categorías */}
            <div className="space-y-2">
              <Label>
                Categorías donde enseñás <span className="text-destructive">*</span>
              </Label>
              <p className="text-sm text-muted-foreground">Seleccioná al menos 1 categoría</p>
              <div className="flex flex-wrap gap-2">
                {CATEGORIAS.map((cat) => (
                  <Badge
                    key={cat}
                    variant={form.categorias.includes(cat) ? 'default' : 'secondary'}
                    className="cursor-pointer transition-all hover:scale-105"
                    onClick={() => toggleCategoria(cat)}
                  >
                    {cat}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                {form.categorias.length} seleccionada{form.categorias.length !== 1 ? 's' : ''}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Redes sociales */}
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

        <Button
          type="submit"
          className="gradient-primary"
          disabled={loading || !canSave}
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Guardar cambios
        </Button>
        {!canSave && (
          <p className="text-xs text-muted-foreground">
            Completá el país y seleccioná al menos una categoría para guardar.
          </p>
        )}
      </form>
    </div>
  );
}

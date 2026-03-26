import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GraduationCap, Loader2, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { CATEGORIAS } from '@/types';
import AvatarUpload from '@/components/AvatarUpload';
import BannerUpload from '@/components/BannerUpload';

const PAISES = [
  'Argentina', 'Bolivia', 'Brasil', 'Chile', 'Colombia', 'Costa Rica',
  'Cuba', 'Ecuador', 'El Salvador', 'Guatemala', 'Honduras', 'México',
  'Nicaragua', 'Panamá', 'Paraguay', 'Perú', 'República Dominicana',
  'Uruguay', 'Venezuela',
];

const TOTAL_STEPS = 4;

export default function OnboardingPage() {
  const { profile, roles, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMentor = roles.includes('mentor');

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Paso 1 - Básico
  const [nombre, setNombre] = useState(profile?.nombre ?? '');
  const [apellido, setApellido] = useState(profile?.apellido ?? '');
  const [pais, setPais] = useState('');

  // Paso 2 - Fotos
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url ?? '');
  const [bannerUrl, setBannerUrl] = useState(
    (profile?.redes_sociales as Record<string, string> | null)?.banner_url ?? ''
  );

  // Paso 3 - Bio
  const [bio, setBio] = useState(profile?.bio ?? '');
  const [especialidad, setEspecialidad] = useState(profile?.especialidad ?? '');

  // Paso 4 - Intereses/Categorías
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [mentorCats, setMentorCats] = useState<string[]>([]);

  const toggleCat = (cat: string, list: string[], setter: (v: string[]) => void) => {
    setter(list.includes(cat) ? list.filter((c) => c !== cat) : [...list, cat]);
  };

  const canAdvance = () => {
    if (step === 1) return nombre.trim() && apellido.trim() && pais;
    if (step === 2) return true; // fotos son opcionales
    if (step === 3) return isMentor ? (especialidad.trim() && bio.trim()) : bio.trim();
    if (step === 4) return isMentor ? mentorCats.length >= 1 : selectedCats.length >= 3;
    return false;
  };

  const handleNext = () => {
    if (step < TOTAL_STEPS) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const currentRedes = (profile?.redes_sociales as Record<string, string> | null) ?? {};

      // Armar redes_sociales con pais, intereses y banner
      const redesActualizadas: Record<string, string | string[]> = {
        ...currentRedes,
        pais,
      };

      if (!isMentor) {
        redesActualizadas.intereses = selectedCats;
      }

      if (isMentor && bannerUrl) {
        redesActualizadas.banner_url = bannerUrl;
      }

      await supabase
        .from('profiles')
        .update({
          nombre,
          apellido,
          bio: bio || null,
          especialidad: isMentor ? (especialidad || null) : null,
          redes_sociales: redesActualizadas,
        })
        .eq('user_id', profile!.user_id);

      if (isMentor) {
        const { data: mentorData } = await supabase
          .from('mentores')
          .select('id')
          .eq('profile_id', profile!.id)
          .single();

        if (mentorData) {
          await supabase
            .from('mentores')
            .update({ categorias: mentorCats, descripcion: bio })
            .eq('id', mentorData.id);
        }
      }

      await refreshProfile();
      toast({ title: '¡Perfil completado!' });
      navigate(isMentor ? '/panel/mentor' : '/dashboard', { replace: true });
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const stepTitles = [
    'Información básica',
    'Tus fotos',
    isMentor ? 'Tu perfil profesional' : 'Sobre vos',
    isMentor ? 'Áreas de enseñanza' : 'Tus intereses',
  ];

  const stepDescriptions = [
    'Completá tus datos personales',
    'Agregá una foto de perfil' + (isMentor ? ' y banner' : ''),
    isMentor ? 'Contanos tu especialidad y experiencia' : 'Escribí una breve bio',
    isMentor ? 'Elegí al menos una categoría en la que enseñás' : 'Elegí al menos 3 temas que te interesan',
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-lg animate-fade-in">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
            <div className="gradient-primary rounded-xl p-2.5">
              <GraduationCap className="h-7 w-7 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold gradient-text">Sumak</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            {Array.from({ length: TOTAL_STEPS }, (_, i) => (
              <div
                key={i}
                className={`flex items-center justify-center h-8 w-8 rounded-full text-sm font-semibold transition-all ${
                  i + 1 < step
                    ? 'gradient-primary text-primary-foreground'
                    : i + 1 === step
                    ? 'gradient-primary text-primary-foreground ring-2 ring-offset-2 ring-primary'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {i + 1 < step ? <Check className="h-4 w-4" /> : i + 1}
              </div>
            ))}
          </div>
          <div className="relative h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 gradient-primary rounded-full transition-all duration-500"
              style={{ width: `${((step - 1) / (TOTAL_STEPS - 1)) * 100}%` }}
            />
          </div>
        </div>

        <Card className="border-border/50 shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">{stepTitles[step - 1]}</CardTitle>
            <CardDescription>{stepDescriptions[step - 1]}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">

            {/* Paso 1 - Básico */}
            {step === 1 && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nombre</Label>
                    <Input
                      placeholder="Tu nombre"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Apellido</Label>
                    <Input
                      placeholder="Tu apellido"
                      value={apellido}
                      onChange={(e) => setApellido(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>País</Label>
                  <Select value={pais} onValueChange={setPais}>
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
              </>
            )}

            {/* Paso 2 - Fotos */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="flex flex-col items-center gap-2">
                  <Label className="self-start">Foto de perfil</Label>
                  <AvatarUpload
                    currentAvatarUrl={avatarUrl || null}
                    userId={profile!.user_id}
                    onUploadComplete={setAvatarUrl}
                    size="lg"
                  />
                </div>
                {isMentor && (
                  <div className="space-y-2">
                    <Label>Banner de perfil</Label>
                    <BannerUpload
                      currentBannerUrl={bannerUrl || null}
                      profileId={profile!.id}
                      onUploadComplete={setBannerUrl}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Paso 3 - Bio */}
            {step === 3 && (
              <>
                {isMentor && (
                  <div className="space-y-2">
                    <Label>Especialidad</Label>
                    <Input
                      placeholder="Ej: Coach de vida, Mentor de negocios..."
                      value={especialidad}
                      onChange={(e) => setEspecialidad(e.target.value)}
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label>Biografía</Label>
                  <Textarea
                    placeholder={
                      isMentor
                        ? 'Contá tu experiencia y qué ofrecés a tus alumnos...'
                        : 'Contanos un poco sobre vos, tus objetivos...'
                    }
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={5}
                  />
                </div>
              </>
            )}

            {/* Paso 4 - Intereses */}
            {step === 4 && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  {isMentor
                    ? 'Seleccioná las categorías en las que enseñás (mínimo 1)'
                    : 'Seleccioná los temas que te interesan (mínimo 3)'}
                </p>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIAS.map((cat) => {
                    const list = isMentor ? mentorCats : selectedCats;
                    const setter = isMentor ? setMentorCats : setSelectedCats;
                    const selected = list.includes(cat);
                    return (
                      <Badge
                        key={cat}
                        variant={selected ? 'default' : 'outline'}
                        className="cursor-pointer transition-all hover:scale-105 text-sm py-1.5 px-3"
                        onClick={() => toggleCat(cat, list, setter)}
                      >
                        {selected && <Check className="mr-1 h-3 w-3" />}
                        {cat}
                      </Badge>
                    );
                  })}
                </div>
                <p className="text-xs text-muted-foreground">
                  {isMentor
                    ? `${mentorCats.length} seleccionada${mentorCats.length !== 1 ? 's' : ''}`
                    : `${selectedCats.length} de 3 mínimo`}
                </p>
              </div>
            )}

            {/* Navegación */}
            <div className="flex gap-3 pt-2">
              {step > 1 ? (
                <Button variant="outline" className="flex-1" onClick={handleBack} disabled={loading}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Atrás
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  className="flex-1"
                  onClick={() => navigate(isMentor ? '/panel/mentor' : '/dashboard', { replace: true })}
                >
                  Omitir
                </Button>
              )}

              {step < TOTAL_STEPS ? (
                <Button
                  className="flex-1 gradient-primary"
                  onClick={handleNext}
                  disabled={!canAdvance()}
                >
                  Siguiente
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  className="flex-1 gradient-primary"
                  onClick={handleSubmit}
                  disabled={loading || !canAdvance()}
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="mr-2 h-4 w-4" />
                  )}
                  Finalizar
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-4">
          Paso {step} de {TOTAL_STEPS}
        </p>
      </div>
    </div>
  );
}

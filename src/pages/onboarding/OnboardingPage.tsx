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
import { GraduationCap, Loader2, ArrowRight, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { CATEGORIAS } from '@/types';

export default function OnboardingPage() {
  const { profile, roles, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMentor = roles.includes('mentor');

  // Alumno state
  const [selectedCats, setSelectedCats] = useState<string[]>([]);

  // Mentor state
  const [bio, setBio] = useState('');
  const [especialidad, setEspecialidad] = useState('');
  const [mentorCats, setMentorCats] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);

  const toggleCat = (cat: string, list: string[], setter: (v: string[]) => void) => {
    setter(list.includes(cat) ? list.filter((c) => c !== cat) : [...list, cat]);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (isMentor) {
        // Update profile
        await supabase
          .from('profiles')
          .update({ bio, especialidad })
          .eq('user_id', profile!.user_id);

        // Update mentor record
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

      // Mark onboarding complete via profile update (we use especialidad or bio as signal)
      if (!isMentor) {
        // For alumnos, just save their interests in a notification or directly navigate
        // We'll store interests as a JSON in redes_sociales temporarily (or just navigate)
        await supabase
          .from('profiles')
          .update({ redes_sociales: { intereses: selectedCats } })
          .eq('user_id', profile!.user_id);
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-lg animate-fade-in">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
            <div className="gradient-primary rounded-xl p-2.5">
              <GraduationCap className="h-7 w-7 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold gradient-text">MentorHub</span>
          </div>
        </div>

        <Card className="border-border/50 shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">
              {isMentor ? 'Completá tu perfil de mentor' : '¿Qué te interesa aprender?'}
            </CardTitle>
            <CardDescription>
              {isMentor
                ? 'Contanos sobre vos para que tus alumnos te conozcan'
                : 'Seleccioná las categorías que más te interesan'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isMentor ? (
              <>
                <div className="space-y-2">
                  <Label>Especialidad</Label>
                  <Input
                    placeholder="Ej: Coach de vida, Mentor de negocios..."
                    value={especialidad}
                    onChange={(e) => setEspecialidad(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Biografía</Label>
                  <Textarea
                    placeholder="Contá tu experiencia y qué ofrecés a tus alumnos..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Categorías en las que enseñás</Label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIAS.map((cat) => (
                      <Badge
                        key={cat}
                        variant={mentorCats.includes(cat) ? 'default' : 'outline'}
                        className="cursor-pointer transition-all hover:scale-105"
                        onClick={() => toggleCat(cat, mentorCats, setMentorCats)}
                      >
                        {mentorCats.includes(cat) && <Check className="mr-1 h-3 w-3" />}
                        {cat}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-wrap gap-2">
                {CATEGORIAS.map((cat) => (
                  <Badge
                    key={cat}
                    variant={selectedCats.includes(cat) ? 'default' : 'outline'}
                    className="cursor-pointer transition-all hover:scale-105 text-sm py-1.5 px-3"
                    onClick={() => toggleCat(cat, selectedCats, setSelectedCats)}
                  >
                    {selectedCats.includes(cat) && <Check className="mr-1 h-3 w-3" />}
                    {cat}
                  </Badge>
                ))}
              </div>
            )}

            <div className="flex gap-3">
              <Button
                variant="ghost"
                className="flex-1"
                onClick={() => navigate(isMentor ? '/panel/mentor' : '/dashboard', { replace: true })}
              >
                Omitir
              </Button>
              <Button
                className="flex-1 gradient-primary"
                onClick={handleSubmit}
                disabled={loading || (isMentor ? !especialidad : selectedCats.length === 0)}
              >
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRight className="mr-2 h-4 w-4" />}
                Continuar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

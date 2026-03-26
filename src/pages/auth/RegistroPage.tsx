import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, Loader2, User, BookOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function RegistroPage() {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState<'alumno' | 'mentor'>('alumno');
  const [loading, setLoading] = useState(false);
  const { signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast({
        title: 'Contraseña muy corta',
        description: 'La contraseña debe tener al menos 6 caracteres',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      // rol_inicial solo se envía cuando es 'mentor'; el trigger lo usa para asignar el rol.
      // Si no está presente, el trigger asigna 'alumno' por defecto.
      const metadata: Record<string, string> = { nombre, apellido };
      if (rol === 'mentor') metadata.rol_inicial = 'mentor';

      console.log('[Registro] Enviando signUp:', {
        email,
        metadata,
        supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
        keyPresent: !!import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      });

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: metadata },
      });

      console.log('[Registro] Respuesta de Supabase:', { data, error });

      if (error) {
        console.error('[Registro] Error completo:', error);
        toast({
          title: 'Error al registrarse',
          description: error.message || JSON.stringify(error),
          variant: 'destructive',
        });
        return;
      }

      // Si Supabase devuelve un usuario sin sesión, significa que necesita confirmar el email
      if (data.user && !data.session) {
        toast({
          title: '¡Cuenta creada!',
          description: 'Revisá tu email para confirmar tu cuenta.',
        });
        navigate('/login');
        return;
      }

      // Si el email ya existe (Supabase puede retornar user sin error en ese caso)
      if (!data.user) {
        toast({
          title: 'No se pudo crear la cuenta',
          description: 'Intentá con otro email o iniciá sesión.',
          variant: 'destructive',
        });
        return;
      }

      toast({ title: '¡Cuenta creada!' });
      navigate('/login');
    } catch (e: any) {
      console.error('[Registro] Excepción capturada:', e);
      toast({
        title: 'Error de conexión',
        description: e?.message ?? JSON.stringify(e) ?? 'No se pudo conectar con el servidor.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-md animate-fade-in">
        <div className="flex justify-center mb-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="gradient-primary rounded-xl p-2.5">
              <GraduationCap className="h-7 w-7 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold gradient-text">MentorHub</span>
          </Link>
        </div>

        <Card className="border-border/50 shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Crear cuenta</CardTitle>
            <CardDescription>Elegí tu rol y completá tus datos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Role selector */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRol('alumno')}
                className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all ${
                  rol === 'alumno'
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-muted-foreground/30'
                }`}
              >
                <BookOpen className={`h-6 w-6 ${rol === 'alumno' ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className={`text-sm font-medium ${rol === 'alumno' ? 'text-primary' : 'text-muted-foreground'}`}>
                  Alumno
                </span>
                <span className="text-xs text-muted-foreground text-center">
                  Quiero aprender
                </span>
              </button>
              <button
                type="button"
                onClick={() => setRol('mentor')}
                className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all ${
                  rol === 'mentor'
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-muted-foreground/30'
                }`}
              >
                <User className={`h-6 w-6 ${rol === 'mentor' ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className={`text-sm font-medium ${rol === 'mentor' ? 'text-primary' : 'text-muted-foreground'}`}>
                  Mentor
                </span>
                <span className="text-xs text-muted-foreground text-center">
                  Quiero enseñar
                </span>
              </button>
            </div>

            {/* Google */}
            <Button
              variant="outline"
              className="w-full"
              onClick={async () => {
                const { error } = await signInWithGoogle();
                if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
              }}
              type="button"
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continuar con Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">o</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre</Label>
                  <Input
                    id="nombre"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    required
                    maxLength={50}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apellido">Apellido</Label>
                  <Input
                    id="apellido"
                    value={apellido}
                    onChange={(e) => setApellido(e.target.value)}
                    required
                    maxLength={50}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <Button
                type="submit"
                className="w-full gradient-primary"
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Crear cuenta como {rol === 'alumno' ? 'Alumno' : 'Mentor'}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground">
              ¿Ya tenés cuenta?{' '}
              <Link to="/login" className="text-primary hover:underline">
                Iniciá sesión
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

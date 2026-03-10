import { useParams, Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, BookOpen, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Mock — se reemplaza con Supabase query
const MOCK_MENTOR = {
  id: '1',
  nombre: 'María García',
  apellido: '',
  especialidad: 'Desarrollo Personal',
  avatar: null,
  categorias: ['Desarrollo Personal', 'Mindfulness'],
  precio: 2500,
  bio: 'Coach certificada con más de 10 años de experiencia en transformación personal y mindfulness. He acompañado a más de 500 personas en su camino de crecimiento personal, ayudándoles a descubrir su potencial y alcanzar sus metas.',
  featured: true,
  cursos: [
    { id: 'c1', titulo: 'Introducción al Mindfulness', categoria: 'Mindfulness', precio: 0 },
    { id: 'c2', titulo: 'Transformación Personal 360°', categoria: 'Desarrollo Personal', precio: 5000 },
  ],
};

export default function MentorPerfilPage() {
  const { id } = useParams();
  const { toast } = useToast();
  const mentor = MOCK_MENTOR; // TODO: fetch from Supabase

  const handleSuscribirse = () => {
    toast({
      title: 'Suscripción simulada',
      description: 'Los pagos se integrarán con MercadoPago/PayPal próximamente.',
    });
  };

  const initials = mentor.nombre.split(' ').map((n) => n[0]).join('');

  return (
    <div className="container max-w-4xl py-8 space-y-8 animate-fade-in">
      <Link to="/mentores" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="mr-1 h-4 w-4" /> Volver a mentores
      </Link>

      {/* Profile header */}
      <div className="flex flex-col sm:flex-row items-start gap-6">
        <Avatar className="h-24 w-24 border-2 border-primary/30">
          <AvatarImage src={mentor.avatar || undefined} />
          <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{mentor.nombre}</h1>
            {mentor.featured && <Star className="h-5 w-5 text-warning fill-warning" />}
          </div>
          <p className="text-primary font-medium">{mentor.especialidad}</p>
          <div className="flex flex-wrap gap-2">
            {mentor.categorias.map((cat) => (
              <Badge key={cat} variant="secondary">{cat}</Badge>
            ))}
          </div>
          <p className="text-muted-foreground">{mentor.bio}</p>
        </div>
      </div>

      {/* Subscribe CTA */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold text-lg">Suscribite a {mentor.nombre.split(' ')[0]}</h3>
            <p className="text-sm text-muted-foreground">
              Accedé a todos sus cursos incluidos y contenido exclusivo
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-2xl font-bold">${mentor.precio.toLocaleString('es-AR')}</span>
              <span className="text-sm text-muted-foreground">/mes</span>
            </div>
            <Button className="gradient-primary glow" onClick={handleSuscribirse}>
              Suscribirse
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Cursos */}
      <div>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" /> Cursos
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {mentor.cursos.map((curso) => (
            <Card key={curso.id} className="border-border/50 hover:border-primary/30 transition-colors">
              <CardContent className="p-5">
                <h3 className="font-semibold">{curso.titulo}</h3>
                <Badge variant="secondary" className="mt-2 text-xs">{curso.categoria}</Badge>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {curso.precio === 0 ? (
                      <span className="text-success">Incluido en suscripción</span>
                    ) : (
                      `$${curso.precio.toLocaleString('es-AR')}`
                    )}
                  </span>
                  <Button size="sm" variant="outline" asChild>
                    <Link to={`/cursos/${curso.id}`}>Ver curso</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

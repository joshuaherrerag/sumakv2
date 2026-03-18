import { useParams, Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Star, BookOpen, ArrowLeft } from 'lucide-react';
import { useMentor, useMentorCursos } from '@/hooks/useMentores';
import { SuscripcionButton } from '@/components/SuscripcionButton';

export default function MentorPerfilPage() {
  const { id } = useParams();
  const { toast } = useToast();
  const { data: mentor, isLoading } = useMentor(id);
  const { data: cursos } = useMentorCursos(id);

  const handleSuscribirse = () => {
    toast({
      title: 'Suscripción simulada',
      description: 'Los pagos se integrarán con MercadoPago/PayPal próximamente.',
    });
  };

  if (isLoading) {
    return (
      <div className="container max-w-4xl py-8 space-y-8">
        <Skeleton className="h-4 w-32" />
        <div className="flex gap-6">
          <Skeleton className="h-24 w-24 rounded-full" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-16 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!mentor) {
    return (
      <div className="container max-w-4xl py-8 text-center">
        <p className="text-muted-foreground">Mentor no encontrado.</p>
        <Button variant="outline" className="mt-4" asChild>
          <Link to="/mentores">Volver a mentores</Link>
        </Button>
      </div>
    );
  }

  const initials = `${mentor.profiles.nombre?.[0] || ''}${mentor.profiles.apellido?.[0] || ''}`.toUpperCase();

  return (
    <div className="container max-w-4xl py-8 space-y-8 animate-fade-in">
      <Link to="/mentores" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="mr-1 h-4 w-4" /> Volver a mentores
      </Link>

      <div className="flex flex-col sm:flex-row items-start gap-6">
        <Avatar className="h-24 w-24 border-2 border-primary/30">
          <AvatarImage src={mentor.profiles.avatar_url || undefined} />
          <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{mentor.profiles.nombre} {mentor.profiles.apellido}</h1>
            {mentor.featured && <Star className="h-5 w-5 text-warning fill-warning" />}
          </div>
          <p className="text-primary font-medium">{mentor.profiles.especialidad}</p>
          <div className="flex flex-wrap gap-2">
            {(mentor.categorias || []).map((cat) => (
              <Badge key={cat} variant="secondary">{cat}</Badge>
            ))}
          </div>
          <p className="text-muted-foreground">{mentor.profiles.bio || mentor.descripcion}</p>
        </div>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold text-lg">Suscribite a {mentor.profiles.nombre}</h3>
            <p className="text-sm text-muted-foreground">
              Accedé a todos sus cursos incluidos y contenido exclusivo
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-2xl font-bold">${Number(mentor.precio_suscripcion).toLocaleString('es-AR')}</span>
              <span className="text-sm text-muted-foreground">/mes</span>
            </div>
            <Button className="gradient-primary glow" onClick={handleSuscribirse}>
              Suscribirse
            </Button>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" /> Cursos
        </h2>
        {(cursos || []).length === 0 ? (
          <p className="text-muted-foreground">Este mentor aún no tiene cursos publicados.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {(cursos || []).map((curso) => (
              <Card key={curso.id} className="border-border/50 hover:border-primary/30 transition-colors">
                <CardContent className="p-5">
                  <h3 className="font-semibold">{curso.titulo}</h3>
                  <Badge variant="secondary" className="mt-2 text-xs">{curso.categoria}</Badge>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {curso.es_incluido_en_suscripcion ? (
                        <span className="text-success">Incluido en suscripción</span>
                      ) : (
                        `$${Number(curso.precio).toLocaleString('es-AR')}`
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
        )}
      </div>
    </div>
  );
}

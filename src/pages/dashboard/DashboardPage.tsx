import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Users, Bell, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DashboardPage() {
  const { profile, roles } = useAuth();

  return (
    <div className="container max-w-6xl py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">
          ¡Hola, <span className="gradient-text">{profile?.nombre || 'Alumno'}</span>!
        </h1>
        <p className="text-muted-foreground mt-1">
          Bienvenido a tu panel de aprendizaje
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Mis Cursos
            </CardTitle>
            <BookOpen className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">cursos activos</p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Suscripciones
            </CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">mentores activos</p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Notificaciones
            </CardTitle>
            <Bell className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">sin leer</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="border-border/50 hover:border-primary/30 transition-colors">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Explorar Mentores</h3>
              <p className="text-sm text-muted-foreground">
                Descubrí mentores que se alineen con tus objetivos
              </p>
            </div>
            <Button variant="ghost" size="icon" asChild>
              <Link to="/mentores">
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border/50 hover:border-primary/30 transition-colors">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Ver Cursos</h3>
              <p className="text-sm text-muted-foreground">
                Explorá formaciones disponibles
              </p>
            </div>
            <Button variant="ghost" size="icon" asChild>
              <Link to="/cursos">
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Mentor/Admin shortcuts */}
      {roles.includes('mentor') && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-primary">Panel del Mentor</h3>
              <p className="text-sm text-muted-foreground">Gestioná tus cursos y suscriptores</p>
            </div>
            <Button className="gradient-primary" asChild>
              <Link to="/panel/mentor">Ir al panel</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {roles.includes('admin') && (
        <Card className="border-accent/20 bg-accent/5">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-accent">Panel de Administración</h3>
              <p className="text-sm text-muted-foreground">Gestioná la plataforma</p>
            </div>
            <Button variant="outline" asChild>
              <Link to="/panel/admin">Ir al panel</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

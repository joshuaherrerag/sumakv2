import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function SuscripcionExitoPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-md">
        <CheckCircle className="h-16 w-16 text-emerald-500 mx-auto" />
        <div>
          <h1 className="text-2xl font-bold">¡Suscripción activada!</h1>
          <p className="text-muted-foreground mt-2">
            Ya tenés acceso a todo el contenido del mentor. ¡Empezá a aprender!
          </p>
        </div>
        <div className="flex gap-3 justify-center">
          <Button asChild>
            <Link to="/dashboard">Ir al dashboard</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/mentores">Ver mentores</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

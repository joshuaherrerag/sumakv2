import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function PagoExitoPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-md">
        <CheckCircle className="h-16 w-16 text-emerald-500 mx-auto" />
        <div>
          <h1 className="text-2xl font-bold">¡Pago exitoso!</h1>
          <p className="text-muted-foreground mt-2">
            Tu pago fue procesado correctamente. Ya tenés acceso al contenido.
          </p>
        </div>
        <div className="flex gap-3 justify-center">
          <Button asChild>
            <Link to="/dashboard">Ir al dashboard</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/cursos">Ver cursos</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

import { XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';

export default function SuscripcionFalloPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-md">
        <XCircle className="h-16 w-16 text-destructive mx-auto" />
        <div>
          <h1 className="text-2xl font-bold">No pudimos procesar el pago</h1>
          <p className="text-muted-foreground mt-2">
            Hubo un problema al procesar tu suscripción. Verificá los datos de tu tarjeta e intentá nuevamente.
          </p>
        </div>
        <div className="flex gap-3 justify-center">
          <Button onClick={() => navigate(-1)}>Reintentar</Button>
          <Button variant="outline" asChild>
            <Link to="/mentores">Explorar mentores</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

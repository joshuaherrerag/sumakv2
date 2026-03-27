import { XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';

export default function PagoCanceladoPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-md">
        <XCircle className="h-16 w-16 text-muted-foreground mx-auto" />
        <div>
          <h1 className="text-2xl font-bold">Pago cancelado</h1>
          <p className="text-muted-foreground mt-2">
            No se realizó ningún cobro. Podés intentarlo nuevamente cuando quieras.
          </p>
        </div>
        <div className="flex gap-3 justify-center">
          <Button onClick={() => navigate(-1)}>Volver</Button>
          <Button variant="outline" asChild>
            <Link to="/mentores">Explorar mentores</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminEstadisticasPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Estadísticas</h1>
        <p className="text-muted-foreground">Métricas de la plataforma</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="border-border/50">
          <CardHeader><CardTitle className="text-lg">Registros por mes</CardTitle></CardHeader>
          <CardContent className="h-48 flex items-center justify-center text-muted-foreground">
            Gráfico próximamente (Recharts)
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardHeader><CardTitle className="text-lg">Ingresos por mes</CardTitle></CardHeader>
          <CardContent className="h-48 flex items-center justify-center text-muted-foreground">
            Gráfico próximamente (Recharts)
          </CardContent>
        </Card>
      </div>

      <p className="text-sm text-muted-foreground italic">Los gráficos se implementarán al conectar datos reales.</p>
    </div>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wallet, Users, TrendingUp } from 'lucide-react';

export default function MentorFinanzasPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Finanzas</h1>
        <p className="text-muted-foreground">Resumen de tus ingresos y suscriptores</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">Ingresos totales</CardTitle>
            <Wallet className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$180.000</div>
            <p className="text-xs text-muted-foreground">últimos 3 meses</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">Suscriptores activos</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">Comisión plataforma</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15%</div>
          </CardContent>
        </Card>
      </div>

      {/* Mock transactions */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Últimas transacciones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { desc: 'Suscripción - Juan Pérez', monto: 2500, fecha: '10 Mar 2026', tipo: 'suscripcion' },
              { desc: 'Curso: Mindfulness - Laura M.', monto: 5000, fecha: '8 Mar 2026', tipo: 'curso' },
              { desc: 'Suscripción - Ana López', monto: 2500, fecha: '5 Mar 2026', tipo: 'suscripcion' },
              { desc: 'Suscripción - Diego R.', monto: 2500, fecha: '1 Mar 2026', tipo: 'suscripcion' },
            ].map((tx, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                <div>
                  <p className="text-sm font-medium">{tx.desc}</p>
                  <p className="text-xs text-muted-foreground">{tx.fecha}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">{tx.tipo}</Badge>
                  <span className="font-semibold text-success">+${tx.monto.toLocaleString('es-AR')}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground italic">Datos simulados. Se conectarán con pagos reales próximamente.</p>
    </div>
  );
}

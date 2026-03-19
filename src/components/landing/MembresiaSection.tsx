import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Check, Sparkles } from 'lucide-react';
import { useScrollReveal } from '@/hooks/useScrollReveal';

const planes = [
  {
    nombre: 'Membresía Esencial',
    precio: '2.990',
    badge: null,
    beneficios: [
      'Acceso a formaciones incluidas',
      'Comunidad y foros de discusión',
      'Eventos online gratuitos',
      'Contenido exclusivo mensual',
      'Soporte por email',
    ],
    destacado: false,
  },
  {
    nombre: 'Membresía Premium',
    precio: '6.990',
    badge: 'Más popular',
    beneficios: [
      'Todo lo de Esencial',
      'Acceso a TODOS los mentores',
      'Sesiones 1:1 mensuales',
      'Descuento en eventos presenciales',
      'Acceso anticipado a retiros',
      'Certificados de formación',
      'Soporte prioritario 24/7',
    ],
    destacado: true,
  },
];

export function MembresiaSection() {
  const navigate = useNavigate();
  const ref = useScrollReveal();

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 gradient-sumak opacity-[0.06]" />
      <div className="absolute inset-0 bg-background/80" />

      <div className="container relative z-10 px-4" ref={ref} style={{ opacity: 0 }}>
        <div className="text-center mb-16">
          <h2 className="font-display font-bold text-3xl sm:text-4xl mb-4">
            Empezá hoy tu{' '}
            <span className="gradient-text">transformación</span>
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Unite a la comunidad de bienestar consciente más grande de LATAM
          </p>
          <div className="gradient-separator max-w-xs mx-auto mt-6" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {planes.map((plan) => (
            <div
              key={plan.nombre}
              className={`rounded-2xl p-8 transition-all duration-300 ${
                plan.destacado
                  ? 'border-2 border-accent/50 bg-card relative glow-strong'
                  : 'border border-border/50 bg-card/50'
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="gradient-sumak text-white text-xs font-semibold px-4 py-1 rounded-full inline-flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    {plan.badge}
                  </span>
                </div>
              )}

              <h3 className="font-display font-bold text-xl mb-2">{plan.nombre}</h3>
              <div className="mb-6">
                <span className="text-4xl font-extrabold gradient-text">${plan.precio}</span>
                <span className="text-muted-foreground text-sm">/mes</span>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.beneficios.map((b) => (
                  <li key={b} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                    <span className="text-foreground/80">{b}</span>
                  </li>
                ))}
              </ul>

              <Button
                className={`w-full rounded-full py-5 font-semibold border-0 ${
                  plan.destacado
                    ? 'gradient-sumak text-white glow-pulse'
                    : 'bg-muted hover:bg-muted/80 text-foreground'
                }`}
                onClick={() => navigate('/registro')}
              >
                Comenzar ahora
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

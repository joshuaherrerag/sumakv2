import { useScrollReveal } from '@/hooks/useScrollReveal';
import { Sprout, FlaskConical, Globe, Rocket } from 'lucide-react';

const reasons = [
  {
    icon: Sprout,
    titulo: 'Comunidad real',
    descripcion: 'Personas comprometidas con su evolución personal y colectiva.',
  },
  {
    icon: FlaskConical,
    titulo: 'Ciencia + consciencia',
    descripcion: 'Contenido validado por expertos y transformador en la práctica.',
  },
  {
    icon: Globe,
    titulo: 'Ecosistema integral',
    descripcion: 'Mente, cuerpo, espíritu y entorno — todo conectado.',
  },
  {
    icon: Rocket,
    titulo: 'Tecnología al servicio del ser',
    descripcion: 'Herramientas digitales que simplifican tu camino de crecimiento.',
  },
];

export function PorQueSection() {
  const ref = useScrollReveal();

  return (
    <section className="py-24 relative">
      <div className="container px-4" ref={ref} style={{ opacity: 0 }}>
        <div className="text-center mb-16">
          <h2 className="font-display font-bold text-3xl sm:text-4xl mb-4 max-w-2xl mx-auto">
            No somos una plataforma más.{' '}
            <span className="gradient-text">Somos un movimiento.</span>
          </h2>
          <div className="gradient-separator max-w-xs mx-auto mt-6" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {reasons.map((r) => (
            <div
              key={r.titulo}
              className="rounded-2xl border border-border/50 bg-card/50 p-8 text-center hover:border-accent/40 transition-all duration-300 group"
            >
              <div className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                <r.icon className="h-7 w-7 text-accent" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-3">{r.titulo}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{r.descripcion}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

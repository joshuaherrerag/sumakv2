import { useScrollReveal } from '@/hooks/useScrollReveal';
import { Sparkles, DollarSign, Target, Heart, Leaf } from 'lucide-react';

const categorias = [
  {
    icon: Sparkles,
    nombre: 'Espiritualidad Elevada',
    descripcion: 'Prácticas ancestrales y consciencia plena',
    color: 'from-purple-500/20 to-violet-600/20',
  },
  {
    icon: DollarSign,
    nombre: 'Finanzas Conscientes',
    descripcion: 'Abundancia con propósito',
    color: 'from-amber-500/20 to-orange-600/20',
  },
  {
    icon: Target,
    nombre: 'Propósito y Autodesarrollo',
    descripcion: 'Diseñá la vida que merecés',
    color: 'from-pink-500/20 to-rose-600/20',
  },
  {
    icon: Heart,
    nombre: 'Relaciones Humanas',
    descripcion: 'Vínculos que nutren y elevan',
    color: 'from-red-500/20 to-pink-600/20',
  },
  {
    icon: Leaf,
    nombre: 'Salud Física y Vitalidad',
    descripcion: 'Cuerpo, energía y movimiento',
    color: 'from-green-500/20 to-emerald-600/20',
  },
];

export function CategoriasSection() {
  const ref = useScrollReveal();

  return (
    <section className="py-24 relative">
      <div className="container px-4" ref={ref} style={{ opacity: 0 }}>
        <div className="text-center mb-16">
          <h2 className="font-display font-bold text-3xl sm:text-4xl mb-4">
            Explorá las áreas de{' '}
            <span className="gradient-text">transformación</span>
          </h2>
          <div className="gradient-separator max-w-xs mx-auto mt-6" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {categorias.map((cat) => (
            <div
              key={cat.nombre}
              className="group relative rounded-2xl border border-border/50 bg-card/50 p-6 text-center hover:border-accent/40 transition-all duration-300 hover:scale-[1.02] cursor-pointer"
            >
              <div
                className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${cat.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
              />
              <div className="relative z-10">
                <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-muted flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                  <cat.icon className="h-6 w-6 text-accent" />
                </div>
                <h3 className="font-display font-semibold text-sm mb-2">{cat.nombre}</h3>
                <p className="text-xs text-muted-foreground">{cat.descripcion}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

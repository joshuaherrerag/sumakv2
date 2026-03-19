import { useScrollReveal } from '@/hooks/useScrollReveal';
import { Star } from 'lucide-react';

const testimonios = [
  {
    nombre: 'Luciana Paz',
    ciudad: 'Buenos Aires',
    texto: 'Sumak transformó mi manera de ver la vida. Los mentores son excepcionales y la comunidad te sostiene en cada paso.',
    avatar: 'https://i.pravatar.cc/80?img=20',
    rating: 5,
  },
  {
    nombre: 'Martín Cabrera',
    ciudad: 'Medellín',
    texto: 'Gracias al programa de finanzas conscientes logré ordenar mi economía y conectar con mi propósito. Recomiendo 100%.',
    avatar: 'https://i.pravatar.cc/80?img=33',
    rating: 5,
  },
  {
    nombre: 'Sofía Arévalo',
    ciudad: 'Santiago de Chile',
    texto: 'Los retiros presenciales fueron una experiencia que me cambió por dentro. La calidad humana de Sumak es única.',
    avatar: 'https://i.pravatar.cc/80?img=25',
    rating: 5,
  },
];

export function TestimoniosSection() {
  const ref = useScrollReveal();

  return (
    <section className="py-24 relative">
      <div className="container px-4" ref={ref} style={{ opacity: 0 }}>
        <div className="text-center mb-16">
          <h2 className="font-display font-bold text-3xl sm:text-4xl mb-4">
            Lo que dicen quienes ya eligieron{' '}
            <span className="gradient-text">transformarse</span>
          </h2>
          <div className="gradient-separator max-w-xs mx-auto mt-6" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonios.map((t) => (
            <div
              key={t.nombre}
              className="rounded-2xl border border-border/50 bg-card/50 p-8 hover:border-accent/40 transition-all duration-300"
            >
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-foreground/90 leading-relaxed mb-6 italic">
                "{t.texto}"
              </p>
              <div className="flex items-center gap-3">
                <img src={t.avatar} alt={t.nombre} className="w-10 h-10 rounded-full" loading="lazy" />
                <div>
                  <p className="font-semibold text-sm">{t.nombre}</p>
                  <p className="text-xs text-muted-foreground">{t.ciudad}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

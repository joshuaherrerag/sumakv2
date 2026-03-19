import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Users } from 'lucide-react';
import { useScrollReveal } from '@/hooks/useScrollReveal';

const mentoresMock = [
  {
    id: '1',
    nombre: 'María Elena',
    apellido: 'Torres',
    especialidad: 'Meditación y Mindfulness',
    categoria: 'Espiritualidad',
    avatar: 'https://i.pravatar.cc/200?img=5',
    rating: 4.9,
    alumnos: 1200,
    precio: 2500,
  },
  {
    id: '2',
    nombre: 'Carlos',
    apellido: 'Mendoza',
    especialidad: 'Coaching Financiero',
    categoria: 'Finanzas',
    avatar: 'https://i.pravatar.cc/200?img=12',
    rating: 4.8,
    alumnos: 890,
    precio: 3200,
  },
  {
    id: '3',
    nombre: 'Valentina',
    apellido: 'Ruiz',
    especialidad: 'Yoga y Bienestar Integral',
    categoria: 'Salud',
    avatar: 'https://i.pravatar.cc/200?img=9',
    rating: 5.0,
    alumnos: 1540,
    precio: 2800,
  },
  {
    id: '4',
    nombre: 'Diego',
    apellido: 'Herrera',
    especialidad: 'Propósito de Vida',
    categoria: 'Autodesarrollo',
    avatar: 'https://i.pravatar.cc/200?img=15',
    rating: 4.7,
    alumnos: 670,
    precio: 3500,
  },
];

export function MentoresSection() {
  const navigate = useNavigate();
  const ref = useScrollReveal();

  return (
    <section className="py-24 relative">
      <div className="container px-4" ref={ref} style={{ opacity: 0 }}>
        <div className="text-center mb-16">
          <h2 className="font-display font-bold text-3xl sm:text-4xl mb-4">
            Conocé a nuestros{' '}
            <span className="gradient-text">guías</span>
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Expertos seleccionados por su trayectoria, ética y transformación comprobada
          </p>
          <div className="gradient-separator max-w-xs mx-auto mt-6" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {mentoresMock.map((m) => (
            <div
              key={m.id}
              className="group rounded-2xl border border-border/50 bg-card/50 p-6 text-center hover:border-accent/40 transition-all duration-300 hover:scale-[1.02]"
            >
              {/* Avatar with gradient border */}
              <div className="mx-auto w-24 h-24 rounded-full p-[2px] gradient-sumak mb-4">
                <img
                  src={m.avatar}
                  alt={`${m.nombre} ${m.apellido}`}
                  className="w-full h-full rounded-full object-cover"
                  loading="lazy"
                />
              </div>

              <h3 className="font-display font-semibold text-lg">
                {m.nombre} {m.apellido}
              </h3>
              <p className="text-sm text-muted-foreground mb-3">{m.especialidad}</p>
              <Badge className="mb-4 bg-accent/10 text-accent border-accent/20 hover:bg-accent/20">
                {m.categoria}
              </Badge>

              <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground mb-4">
                <span className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  {m.rating}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  {m.alumnos >= 1000 ? `${(m.alumnos / 1000).toFixed(1)}k` : m.alumnos} alumnos
                </span>
              </div>

              <p className="text-sm font-semibold text-foreground mb-4">
                Suscripción: <span className="gradient-text">${m.precio.toLocaleString()}/mes</span>
              </p>

              <Button
                variant="outline"
                className="w-full rounded-full gradient-border bg-transparent hover:bg-card"
                onClick={() => navigate(`/mentores/${m.id}`)}
              >
                Ver perfil
              </Button>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button
            variant="outline"
            size="lg"
            className="rounded-full gradient-border bg-transparent hover:bg-card px-8"
            onClick={() => navigate('/mentores')}
          >
            Ver todos los mentores →
          </Button>
        </div>
      </div>
    </section>
  );
}

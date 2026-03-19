import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { useState } from 'react';

const eventosMock = [
  {
    id: '1',
    titulo: 'Retiro de Meditación Profunda',
    tipo: 'presencial',
    fecha: '15 Mar 2025',
    hora: '09:00',
    mentor: 'María Elena Torres',
    mentorAvatar: 'https://i.pravatar.cc/40?img=5',
    precio: 4500,
    imagen: '',
    ubicacion: 'Buenos Aires, Argentina',
  },
  {
    id: '2',
    titulo: 'Masterclass: Abundancia Financiera',
    tipo: 'online',
    fecha: '22 Mar 2025',
    hora: '19:00',
    mentor: 'Carlos Mendoza',
    mentorAvatar: 'https://i.pravatar.cc/40?img=12',
    precio: 0,
    imagen: '',
    ubicacion: 'Zoom',
  },
  {
    id: '3',
    titulo: 'Workshop: Yoga y Respiración Consciente',
    tipo: 'online',
    fecha: '28 Mar 2025',
    hora: '18:00',
    mentor: 'Valentina Ruiz',
    mentorAvatar: 'https://i.pravatar.cc/40?img=9',
    precio: 1500,
    imagen: '',
    ubicacion: 'Google Meet',
  },
];

type Tab = 'todos' | 'online' | 'presencial';

export function EventosSection() {
  const ref = useScrollReveal();
  const [activeTab, setActiveTab] = useState<Tab>('todos');

  const filtered = activeTab === 'todos'
    ? eventosMock
    : eventosMock.filter((e) => e.tipo === activeTab);

  const tabs: { key: Tab; label: string }[] = [
    { key: 'todos', label: 'Todos' },
    { key: 'online', label: 'Online' },
    { key: 'presencial', label: 'Presenciales' },
  ];

  return (
    <section id="eventos" className="py-24 relative">
      <div className="container px-4" ref={ref} style={{ opacity: 0 }}>
        <div className="text-center mb-12">
          <h2 className="font-display font-bold text-3xl sm:text-4xl mb-4">
            Eventos que{' '}
            <span className="gradient-text">transforman</span>
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Online y presenciales — encontrá el que resuena con vos
          </p>
          <div className="gradient-separator max-w-xs mx-auto mt-6" />
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-2 mb-10">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? 'gradient-sumak text-white'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filtered.map((evento) => (
            <div
              key={evento.id}
              className="group rounded-2xl border border-border/50 bg-card/50 overflow-hidden hover:border-accent/40 transition-all duration-300 hover:scale-[1.02]"
            >
              {/* Image placeholder */}
              <div className="aspect-video relative bg-muted">
                <div className="absolute inset-0 gradient-sumak opacity-20" />
                <Badge
                  className={`absolute top-3 left-3 ${
                    evento.tipo === 'online'
                      ? 'bg-primary/90 text-primary-foreground'
                      : 'bg-sumak-naranja/90 text-white'
                  }`}
                >
                  {evento.tipo === 'online' ? '🟣 Online' : '🟠 Presencial'}
                </Badge>
              </div>

              <div className="p-5">
                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {evento.fecha}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {evento.hora}hs
                  </span>
                </div>

                <h3 className="font-display font-semibold text-base mb-3">{evento.titulo}</h3>

                <div className="flex items-center gap-2 mb-4">
                  <img src={evento.mentorAvatar} alt="" className="w-6 h-6 rounded-full" loading="lazy" />
                  <span className="text-sm text-muted-foreground">{evento.mentor}</span>
                </div>

                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-4">
                  <MapPin className="h-3.5 w-3.5" />
                  {evento.ubicacion}
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-semibold">
                    {evento.precio === 0 ? (
                      <span className="text-green-400">Gratis</span>
                    ) : (
                      <span>${evento.precio.toLocaleString()}</span>
                    )}
                  </span>
                  <Button size="sm" className="gradient-sumak text-white rounded-full border-0">
                    Inscribirme
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button
            variant="outline"
            size="lg"
            className="rounded-full gradient-border bg-transparent hover:bg-card px-8"
          >
            Ver todos los eventos →
          </Button>
        </div>
      </div>
    </section>
  );
}

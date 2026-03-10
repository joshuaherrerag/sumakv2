import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Star, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CATEGORIAS } from '@/types';

// Mock data for now
const MOCK_MENTORES = [
  {
    id: '1',
    nombre: 'María García',
    especialidad: 'Desarrollo Personal',
    avatar: null,
    categorias: ['Desarrollo Personal', 'Mindfulness'],
    precio: 2500,
    bio: 'Coach certificada con más de 10 años de experiencia en transformación personal.',
    featured: true,
  },
  {
    id: '2',
    nombre: 'Carlos López',
    especialidad: 'Negocios',
    avatar: null,
    categorias: ['Negocios', 'Liderazgo'],
    precio: 3500,
    bio: 'Emprendedor serial y consultor de startups en Latinoamérica.',
    featured: true,
  },
  {
    id: '3',
    nombre: 'Ana Rodríguez',
    especialidad: 'Salud y Bienestar',
    avatar: null,
    categorias: ['Salud y Bienestar', 'Espiritualidad'],
    precio: 2000,
    bio: 'Especialista en nutrición holística y bienestar integral.',
    featured: false,
  },
  {
    id: '4',
    nombre: 'Diego Martínez',
    especialidad: 'Finanzas',
    avatar: null,
    categorias: ['Finanzas', 'Productividad'],
    precio: 4000,
    bio: 'Educador financiero y asesor de inversiones personales.',
    featured: false,
  },
];

export default function MentoresPage() {
  const [search, setSearch] = useState('');
  const [categoriaFilter, setCategoriaFilter] = useState<string | null>(null);

  const filtered = MOCK_MENTORES.filter((m) => {
    const matchSearch = m.nombre.toLowerCase().includes(search.toLowerCase()) ||
      m.especialidad.toLowerCase().includes(search.toLowerCase());
    const matchCat = !categoriaFilter || m.categorias.includes(categoriaFilter);
    return matchSearch && matchCat;
  });

  return (
    <div className="container max-w-6xl py-8 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">Explorá <span className="gradient-text">Mentores</span></h1>
        <p className="text-muted-foreground mt-1">Encontrá al mentor ideal para tu crecimiento</p>
      </div>

      {/* Search + filters */}
      <div className="space-y-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o especialidad..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge
            variant={!categoriaFilter ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setCategoriaFilter(null)}
          >
            Todas
          </Badge>
          {CATEGORIAS.map((cat) => (
            <Badge
              key={cat}
              variant={categoriaFilter === cat ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setCategoriaFilter(cat === categoriaFilter ? null : cat)}
            >
              {cat}
            </Badge>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((mentor) => (
          <Card
            key={mentor.id}
            className="border-border/50 hover:border-primary/30 transition-all hover:shadow-lg group"
          >
            <CardContent className="p-6 space-y-4">
              <div className="flex items-start gap-4">
                <Avatar className="h-14 w-14 border-2 border-primary/20">
                  <AvatarImage src={mentor.avatar || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {mentor.nombre.split(' ').map((n) => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold truncate">{mentor.nombre}</h3>
                    {mentor.featured && (
                      <Star className="h-4 w-4 text-warning fill-warning flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-sm text-primary">{mentor.especialidad}</p>
                </div>
              </div>

              <p className="text-sm text-muted-foreground line-clamp-2">{mentor.bio}</p>

              <div className="flex flex-wrap gap-1">
                {mentor.categorias.map((cat) => (
                  <Badge key={cat} variant="secondary" className="text-xs">
                    {cat}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border/50">
                <div>
                  <span className="text-lg font-bold">${mentor.precio.toLocaleString('es-AR')}</span>
                  <span className="text-xs text-muted-foreground">/mes</span>
                </div>
                <Button size="sm" className="gradient-primary group-hover:glow" asChild>
                  <Link to={`/mentores/${mentor.id}`}>
                    Ver perfil <ArrowRight className="ml-1 h-3 w-3" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No se encontraron mentores con esos filtros.</p>
        </div>
      )}
    </div>
  );
}

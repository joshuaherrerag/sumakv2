import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Star, ArrowRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CATEGORIAS } from '@/types';
import { useMentores } from '@/hooks/useMentores';
import { Skeleton } from '@/components/ui/skeleton';

export default function MentoresPage() {
  const [search, setSearch] = useState('');
  const [categoriaFilter, setCategoriaFilter] = useState<string | null>(null);
  const { data: mentores, isLoading } = useMentores();

  const filtered = (mentores || []).filter((m) => {
    const fullName = `${m.profiles.nombre} ${m.profiles.apellido}`.toLowerCase();
    const matchSearch = fullName.includes(search.toLowerCase()) ||
      (m.profiles.especialidad || '').toLowerCase().includes(search.toLowerCase());
    const matchCat = !categoriaFilter || (m.categorias || []).includes(categoriaFilter);
    return matchSearch && matchCat;
  });

  return (
    <div className="container max-w-6xl py-8 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">Explorá <span className="gradient-text">Mentores</span></h1>
        <p className="text-muted-foreground mt-1">Encontrá al mentor ideal para tu crecimiento</p>
      </div>

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

      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-border/50">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start gap-4">
                  <Skeleton className="h-14 w-14 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-8 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((mentor) => {
            const initials = `${mentor.profiles.nombre?.[0] || ''}${mentor.profiles.apellido?.[0] || ''}`.toUpperCase();
            return (
              <Card
                key={mentor.id}
                className="border-border/50 hover:border-primary/30 transition-all hover:shadow-lg group"
              >
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-14 w-14 border-2 border-primary/20">
                      <AvatarImage src={mentor.profiles.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold truncate">
                          {mentor.profiles.nombre} {mentor.profiles.apellido}
                        </h3>
                        {mentor.featured && (
                          <Star className="h-4 w-4 text-warning fill-warning flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-primary">{mentor.profiles.especialidad}</p>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {mentor.profiles.bio || mentor.descripcion || 'Sin descripción'}
                  </p>

                  <div className="flex flex-wrap gap-1">
                    {(mentor.categorias || []).map((cat) => (
                      <Badge key={cat} variant="secondary" className="text-xs">
                        {cat}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border/50">
                    <div>
                      <span className="text-lg font-bold">
                        ${Number(mentor.precio_suscripcion).toLocaleString('es-AR')}
                      </span>
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
            );
          })}
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {(mentores || []).length === 0
              ? 'Aún no hay mentores registrados. ¡Sé el primero!'
              : 'No se encontraron mentores con esos filtros.'}
          </p>
        </div>
      )}
    </div>
  );
}

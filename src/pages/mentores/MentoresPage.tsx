import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Star, ArrowRight, LayoutGrid, List } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CATEGORIAS, PAISES_LATAM } from '@/types';
import { useMentores } from '@/hooks/useMentores';
import { Skeleton } from '@/components/ui/skeleton';

export default function MentoresPage() {
  const [search, setSearch] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('todas');
  const [filtroPais, setFiltroPais] = useState('todos');
  const [ordenar, setOrdenar] = useState('recientes');
  const [vista, setVista] = useState<'grid' | 'list'>('grid');

  const { data: mentores, isLoading } = useMentores();

  const filtered = useMemo(() => {
    let list = (mentores || []).filter((m) => {
      const fullName = `${m.profiles.nombre} ${m.profiles.apellido}`.toLowerCase();
      const matchSearch =
        search === '' ||
        fullName.includes(search.toLowerCase()) ||
        (m.profiles.especialidad || '').toLowerCase().includes(search.toLowerCase());

      const matchCat =
        filtroCategoria === 'todas' || (m.categorias || []).includes(filtroCategoria);

      const pais = (m.profiles.redes_sociales as Record<string, string> | null)?.pais ?? '';
      const matchPais = filtroPais === 'todos' || pais === filtroPais;

      return matchSearch && matchCat && matchPais;
    });

    if (ordenar === 'recientes') {
      list = [...list].sort((a, b) =>
        ((b as any).created_at ?? '').localeCompare((a as any).created_at ?? '')
      );
    }
    // ordenar por formaciones y seguidos: requiere datos extra, se aplica en futura versión

    return list;
  }, [mentores, search, filtroCategoria, filtroPais, ordenar]);

  const initials = (m: typeof filtered[0]) =>
    `${m.profiles.nombre?.[0] || ''}${m.profiles.apellido?.[0] || ''}`.toUpperCase();

  return (
    <div className="container max-w-6xl py-8 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">Explorá <span className="gradient-text">Mentores</span></h1>
        <p className="text-muted-foreground mt-1">Encontrá al mentor ideal para tu crecimiento</p>
      </div>

      {/* Barra de búsqueda */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre o especialidad..."
          className="pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Filtros + toggle vista */}
      <div className="flex flex-wrap items-center gap-3">
        <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Todas las categorías" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas las categorías</SelectItem>
            {CATEGORIAS.map((cat) => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filtroPais} onValueChange={setFiltroPais}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Todos los países" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los países</SelectItem>
            {PAISES_LATAM.map((pais) => (
              <SelectItem key={pais} value={pais}>{pais}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={ordenar} onValueChange={setOrdenar}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Ordenar por..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recientes">Más recientes</SelectItem>
            <SelectItem value="formaciones">Más formaciones</SelectItem>
            <SelectItem value="seguidos">Más seguidos</SelectItem>
          </SelectContent>
        </Select>

        <div className="ml-auto flex gap-1">
          <Button
            variant={vista === 'grid' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setVista('grid')}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={vista === 'list' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setVista('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Resultados */}
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
      ) : vista === 'grid' ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((mentor) => (
            <Card
              key={mentor.id}
              className="border-border/50 hover:border-primary/30 transition-all hover:shadow-lg group"
            >
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start gap-4">
                  <Avatar className="h-14 w-14 border-2 border-primary/20">
                    <AvatarImage src={mentor.profiles.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {initials(mentor)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold truncate">
                        {mentor.profiles.nombre} {mentor.profiles.apellido}
                      </h3>
                      {mentor.featured && <Star className="h-4 w-4 text-warning fill-warning shrink-0" />}
                    </div>
                    <p className="text-sm text-primary">{mentor.profiles.especialidad}</p>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2">
                  {mentor.profiles.bio || mentor.descripcion || 'Sin descripción'}
                </p>

                <div className="flex flex-wrap gap-1">
                  {(mentor.categorias || []).slice(0, 3).map((cat) => (
                    <Badge key={cat} variant="secondary" className="text-xs">{cat}</Badge>
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
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((mentor) => (
            <Card key={mentor.id} className="border-border/50 hover:border-primary/30 transition-colors group">
              <CardContent className="p-4 flex items-center gap-4">
                <Avatar className="h-16 w-16 border-2 border-primary/20 shrink-0">
                  <AvatarImage src={mentor.profiles.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
                    {initials(mentor)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{mentor.profiles.nombre} {mentor.profiles.apellido}</h3>
                    {mentor.featured && <Star className="h-4 w-4 text-warning fill-warning shrink-0" />}
                  </div>
                  <p className="text-sm text-primary">{mentor.profiles.especialidad}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {(mentor.categorias || []).slice(0, 3).map((cat) => (
                      <Badge key={cat} variant="secondary" className="text-xs">{cat}</Badge>
                    ))}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xl font-bold">
                    ${Number(mentor.precio_suscripcion).toLocaleString('es-AR')}
                    <span className="text-xs font-normal text-muted-foreground">/mes</span>
                  </div>
                  <Button size="sm" className="mt-2 gradient-primary" asChild>
                    <Link to={`/mentores/${mentor.id}`}>Ver perfil</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
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

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CATEGORIAS } from '@/types';
import { useCursos } from '@/hooks/useCursos';

export default function CursosPage() {
  const [search, setSearch] = useState('');
  const [categoriaFilter, setCategoriaFilter] = useState<string | null>(null);
  const { data: cursos, isLoading } = useCursos();

  const filtered = (cursos || []).filter((c) => {
    const mentorName = `${c.mentores.profiles.nombre} ${c.mentores.profiles.apellido}`.toLowerCase();
    const matchSearch = c.titulo.toLowerCase().includes(search.toLowerCase()) ||
      mentorName.includes(search.toLowerCase());
    const matchCat = !categoriaFilter || c.categoria === categoriaFilter;
    return matchSearch && matchCat;
  });

  return (
    <div className="container max-w-6xl py-8 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">Explorá <span className="gradient-text">Cursos</span></h1>
        <p className="text-muted-foreground mt-1">Formaciones para impulsar tu crecimiento</p>
      </div>

      <div className="space-y-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar cursos..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant={!categoriaFilter ? 'default' : 'outline'} className="cursor-pointer" onClick={() => setCategoriaFilter(null)}>
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
            <Card key={i} className="border-border/50 overflow-hidden">
              <Skeleton className="h-40 w-full" />
              <CardContent className="p-5 space-y-3">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-8 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((curso) => (
            <Card key={curso.id} className="border-border/50 hover:border-primary/30 transition-all hover:shadow-lg group overflow-hidden">
              <div className="h-40 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                {curso.imagen_url ? (
                  <img src={curso.imagen_url} alt={curso.titulo} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl opacity-30">📚</span>
                )}
              </div>
              <CardContent className="p-5 space-y-3">
                <div>
                  <Badge variant="secondary" className="text-xs mb-2">{curso.categoria}</Badge>
                  <h3 className="font-semibold line-clamp-1">{curso.titulo}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{curso.descripcion}</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  por <span className="text-foreground">{curso.mentores.profiles.nombre} {curso.mentores.profiles.apellido}</span>
                </p>
                <div className="flex items-center justify-between pt-2 border-t border-border/50">
                  <span className="font-bold">
                    {curso.es_incluido_en_suscripcion ? (
                      <span className="text-success text-sm">Incluido</span>
                    ) : (
                      `$${Number(curso.precio).toLocaleString('es-AR')}`
                    )}
                  </span>
                  <Button size="sm" variant="outline" className="group-hover:border-primary/50" asChild>
                    <Link to={`/cursos/${curso.id}`}>
                      Ver curso <ArrowRight className="ml-1 h-3 w-3" />
                    </Link>
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
            {(cursos || []).length === 0
              ? 'Aún no hay cursos publicados.'
              : 'No se encontraron cursos con esos filtros.'}
          </p>
        </div>
      )}
    </div>
  );
}

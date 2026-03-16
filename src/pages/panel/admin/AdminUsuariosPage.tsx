import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export default function AdminUsuariosPage() {
  const [search, setSearch] = useState('');

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*, user_roles(role)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const filtered = (users || []).filter((u: any) => {
    const fullName = `${u.nombre} ${u.apellido}`.toLowerCase();
    return fullName.includes(search.toLowerCase());
  });

  const rolColor = (rol: string) => {
    switch (rol) {
      case 'admin': return 'destructive' as const;
      case 'mentor': return 'default' as const;
      default: return 'secondary' as const;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Gestión de Usuarios</h1>
        <p className="text-muted-foreground">{(users || []).length} usuarios registrados</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar usuarios..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
        </div>
      ) : (
        <Card className="border-border/50">
          <CardContent className="p-0">
            <div className="divide-y divide-border/50">
              {filtered.map((user: any) => (
                <div key={user.id} className="flex items-center justify-between p-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{user.nombre} {user.apellido}</span>
                      {(user.user_roles || []).map((r: any) => (
                        <Badge key={r.role} variant={rolColor(r.role)}>{r.role}</Badge>
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground">{user.user_id}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

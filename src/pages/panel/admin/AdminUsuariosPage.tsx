import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, Shield, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { AppRole } from '@/types';

const ALL_ROLES: AppRole[] = ['admin', 'mentor', 'alumno', 'finanzas'];

const rolColor = (rol: string) => {
  switch (rol) {
    case 'admin': return 'destructive' as const;
    case 'mentor': return 'default' as const;
    case 'finanzas': return 'outline' as const;
    default: return 'secondary' as const;
  }
};

export default function AdminUsuariosPage() {
  const [search, setSearch] = useState('');
  const [editUser, setEditUser] = useState<any>(null);
  const [selectedRoles, setSelectedRoles] = useState<AppRole[]>([]);
  const queryClient = useQueryClient();
  const { toast } = useToast();

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

  const roleMutation = useMutation({
    mutationFn: async ({ userId, roles }: { userId: string; roles: AppRole[] }) => {
      // Get current roles
      const { data: current } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);
      const currentRoles = (current || []).map((r) => r.role as AppRole);

      // Roles to add
      const toAdd = roles.filter((r) => !currentRoles.includes(r));
      // Roles to remove
      const toRemove = currentRoles.filter((r) => !roles.includes(r));

      for (const role of toAdd) {
        const { error } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role });
        if (error) throw error;

        // If adding mentor role, create mentor record if not exists
        if (role === 'mentor') {
          const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('user_id', userId)
            .single();
          if (profile) {
            const { data: existingMentor } = await supabase
              .from('mentores')
              .select('id')
              .eq('profile_id', profile.id)
              .maybeSingle();
            if (!existingMentor) {
              await supabase.from('mentores').insert({ profile_id: profile.id, activo: false });
            }
          }
        }
      }

      for (const role of toRemove) {
        const { error } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId)
          .eq('role', role);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({ title: 'Roles actualizados' });
      setEditUser(null);
    },
    onError: (e: any) => {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    },
  });

  const openRoleEditor = (user: any) => {
    setEditUser(user);
    setSelectedRoles((user.user_roles || []).map((r: any) => r.role as AppRole));
  };

  const toggleRole = (role: AppRole) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  const filtered = (users || []).filter((u: any) => {
    const fullName = `${u.nombre} ${u.apellido}`.toLowerCase();
    return fullName.includes(search.toLowerCase());
  });

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
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium">{user.nombre} {user.apellido}</span>
                      {(user.user_roles || []).map((r: any) => (
                        <Badge key={r.role} variant={rolColor(r.role)}>{r.role}</Badge>
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground truncate max-w-xs">{user.user_id}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => openRoleEditor(user)}>
                    <Shield className="mr-1.5 h-3.5 w-3.5" /> Roles
                  </Button>
                </div>
              ))}
              {filtered.length === 0 && (
                <p className="p-6 text-center text-muted-foreground">No se encontraron usuarios</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={!!editUser} onOpenChange={(open) => !open && setEditUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gestionar Roles</DialogTitle>
            <DialogDescription>
              {editUser?.nombre} {editUser?.apellido}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {ALL_ROLES.map((role) => (
              <label key={role} className="flex items-center gap-3 cursor-pointer">
                <Checkbox
                  checked={selectedRoles.includes(role)}
                  onCheckedChange={() => toggleRole(role)}
                />
                <div>
                  <span className="font-medium capitalize">{role}</span>
                  <p className="text-xs text-muted-foreground">
                    {role === 'admin' && 'Acceso completo a la plataforma'}
                    {role === 'mentor' && 'Puede crear y gestionar cursos'}
                    {role === 'alumno' && 'Puede inscribirse a cursos'}
                    {role === 'finanzas' && 'Acceso a reportes financieros'}
                  </p>
                </div>
              </label>
            ))}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setEditUser(null)}>Cancelar</Button>
            <Button
              className="gradient-primary"
              disabled={roleMutation.isPending}
              onClick={() => editUser && roleMutation.mutate({ userId: editUser.user_id, roles: selectedRoles })}
            >
              {roleMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

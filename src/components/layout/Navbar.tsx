import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { BookOpen, GraduationCap, LogOut, Settings, User, Menu } from 'lucide-react';
import { useState } from 'react';

export function Navbar() {
  const { user, profile, roles, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const initials = profile
    ? `${profile.nombre?.[0] || ''}${profile.apellido?.[0] || ''}`.toUpperCase()
    : user?.email?.[0]?.toUpperCase() || '?';

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 glass border-b border-border/50">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="gradient-primary rounded-lg p-1.5">
            <GraduationCap className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold gradient-text">MentorHub</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          <Link
            to="/mentores"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Mentores
          </Link>
          <Link
            to="/cursos"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Cursos
          </Link>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9 border border-primary/30">
                    <AvatarImage src={profile?.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary/20 text-primary text-xs">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">
                    {profile?.nombre} {profile?.apellido}
                  </p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                  <BookOpen className="mr-2 h-4 w-4" />
                  Mi Dashboard
                </DropdownMenuItem>
                {roles.includes('mentor') && (
                  <DropdownMenuItem onClick={() => navigate('/panel/mentor')}>
                    <User className="mr-2 h-4 w-4" />
                    Panel Mentor
                  </DropdownMenuItem>
                )}
                {roles.includes('admin') && (
                  <DropdownMenuItem onClick={() => navigate('/panel/admin')}>
                    <Settings className="mr-2 h-4 w-4" />
                    Administración
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
                Ingresar
              </Button>
              <Button size="sm" className="gradient-primary" onClick={() => navigate('/registro')}>
                Registrarse
              </Button>
            </div>
          )}

          {/* Mobile menu */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border/50 px-4 py-3 space-y-2 animate-fade-in">
          <Link
            to="/mentores"
            className="block py-2 text-sm text-muted-foreground hover:text-foreground"
            onClick={() => setMobileOpen(false)}
          >
            Mentores
          </Link>
          <Link
            to="/cursos"
            className="block py-2 text-sm text-muted-foreground hover:text-foreground"
            onClick={() => setMobileOpen(false)}
          >
            Cursos
          </Link>
        </div>
      )}
    </nav>
  );
}

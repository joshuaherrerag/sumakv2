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
import { BookOpen, LogOut, Settings, User, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';

export function Navbar() {
  const { user, profile, roles, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const initials = profile
    ? `${profile.nombre?.[0] || ''}${profile.apellido?.[0] || ''}`.toUpperCase()
    : user?.email?.[0]?.toUpperCase() || '?';

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const navLinks = [
    { label: 'Mentores', href: '/mentores' },
    { label: 'Catálogo', href: '/catalogo' },
    { label: 'Eventos', href: '/eventos' },
    { label: 'Comunidad', href: '/comunidad' },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-lg'
            : 'bg-transparent'
        }`}
      >
        <div className="container flex h-16 lg:h-20 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <img
              src="https://bu-cdn.tiendup.com/business/68423/images/logo_69627c253df9c_medium.png"
              alt="Sumak"
              className="h-8 lg:h-10"
            />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 gradient-sumak transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9 gradient-border rounded-full">
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
              <div className="hidden sm:flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground"
                  onClick={() => navigate('/login')}
                >
                  Iniciar sesión
                </Button>
                <Button
                  size="sm"
                  className="gradient-sumak text-white rounded-full px-6 glow-pulse border-0"
                  onClick={() => navigate('/registro')}
                >
                  Comenzar
                </Button>
              </div>
            )}

            {/* Mobile menu toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-72 bg-card border-l border-border/50 p-6 pt-20 space-y-1 animate-slide-in-right">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="block py-3 text-base font-medium text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="gradient-separator my-4" />
            {!user && (
              <div className="space-y-3 pt-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => { navigate('/login'); setMobileOpen(false); }}
                >
                  Iniciar sesión
                </Button>
                <Button
                  className="w-full gradient-sumak text-white rounded-full border-0"
                  onClick={() => { navigate('/registro'); setMobileOpen(false); }}
                >
                  Comenzar
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

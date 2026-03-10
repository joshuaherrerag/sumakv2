import {
  BarChart3,
  BookOpen,
  GraduationCap,
  Home,
  Settings,
  User,
  Users,
  Wallet,
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useLocation, Link } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';

const mentorItems = [
  { title: 'Dashboard', url: '/panel/mentor', icon: Home },
  { title: 'Mis Cursos', url: '/panel/mentor/cursos', icon: BookOpen },
  { title: 'Mi Perfil', url: '/panel/mentor/perfil', icon: User },
  { title: 'Finanzas', url: '/panel/mentor/finanzas', icon: Wallet },
];

const adminItems = [
  { title: 'Dashboard', url: '/panel/admin', icon: Home },
  { title: 'Usuarios', url: '/panel/admin/usuarios', icon: Users },
  { title: 'Mentores', url: '/panel/admin/mentores', icon: User },
  { title: 'Cursos', url: '/panel/admin/cursos', icon: BookOpen },
  { title: 'Estadísticas', url: '/panel/admin/estadisticas', icon: BarChart3 },
  { title: 'Configuración', url: '/panel/admin/configuracion', icon: Settings },
];

interface PanelSidebarProps {
  variant: 'mentor' | 'admin';
}

export function PanelSidebar({ variant }: PanelSidebarProps) {
  const items = variant === 'mentor' ? mentorItems : adminItems;
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        {/* Logo */}
        <div className="p-4 flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2">
            <div className="gradient-primary rounded-lg p-1.5">
              <GraduationCap className="h-4 w-4 text-primary-foreground" />
            </div>
            {!collapsed && (
              <span className="text-sm font-bold gradient-text">MentorHub</span>
            )}
          </Link>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>
            {variant === 'mentor' ? 'Mentor' : 'Admin'}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === `/panel/${variant}`}
                      className="hover:bg-muted/50"
                      activeClassName="bg-primary/10 text-primary font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

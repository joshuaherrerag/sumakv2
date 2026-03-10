import { Outlet } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { PanelSidebar } from './PanelSidebar';

interface PanelLayoutProps {
  variant: 'mentor' | 'admin';
}

export function PanelLayout({ variant }: PanelLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <PanelSidebar variant={variant} />
        <div className="flex-1 flex flex-col">
          <header className="h-14 flex items-center border-b border-border/50 glass sticky top-0 z-40">
            <SidebarTrigger className="ml-3" />
            <span className="ml-3 text-sm font-medium text-muted-foreground">
              {variant === 'mentor' ? 'Panel del Mentor' : 'Administración'}
            </span>
          </header>
          <main className="flex-1 p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

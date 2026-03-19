import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from '@/components/landing/Footer';

export function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-20">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

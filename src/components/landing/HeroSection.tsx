import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated background shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-accent/10 blur-[120px] animate-float" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full bg-primary/10 blur-[120px] animate-float-delayed" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-sumak-naranja/5 blur-[150px]" />
        
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className="container relative z-10 text-center px-4 pt-20">
        {/* Social proof */}
        <div className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full border border-border/50 bg-card/50 backdrop-blur-sm">
          <div className="flex -space-x-2">
            {[1, 2, 3, 4].map((i) => (
              <img
                key={i}
                src={`https://i.pravatar.cc/40?img=${i + 10}`}
                alt=""
                className="w-7 h-7 rounded-full border-2 border-background"
              />
            ))}
          </div>
          <span className="text-sm text-muted-foreground">
            +2.500 personas ya transformando su vida
          </span>
        </div>

        {/* Main headline */}
        <h1 className="font-display font-extrabold text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-tight mb-6 max-w-4xl mx-auto">
          Tu transformación{' '}
          <span className="gradient-text">comienza aquí</span>
        </h1>

        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
          La primera plataforma de bienestar consciente de LATAM. Mentores, formaciones, 
          comunidad y eventos — todo en un solo lugar.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Button
            size="lg"
            className="gradient-sumak text-white rounded-full px-8 py-6 text-base font-semibold glow-pulse border-0 hover:opacity-90 transition-opacity"
            onClick={() => navigate('/registro')}
          >
            Quiero ser parte
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="rounded-full px-8 py-6 text-base font-semibold gradient-border bg-transparent hover:bg-card/50"
            onClick={() => navigate('/mentores')}
          >
            Conocer mentores
          </Button>
        </div>

        {/* Platform mockup placeholder */}
        <div className="relative max-w-4xl mx-auto">
          <div className="rounded-2xl overflow-hidden border border-border/30 bg-card/40 backdrop-blur-sm shadow-2xl">
            <div className="aspect-video gradient-sumak opacity-10" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <img
                  src="https://bu-cdn.tiendup.com/business/68423/images/logo_69627c253df9c_medium.png"
                  alt="Sumak"
                  className="h-16 mx-auto mb-4 opacity-60"
                />
                <p className="text-muted-foreground text-sm">Plataforma de bienestar consciente</p>
              </div>
            </div>
          </div>
          {/* Glow under mockup */}
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-3/4 h-16 gradient-sumak opacity-20 blur-3xl rounded-full" />
        </div>
      </div>
    </section>
  );
}

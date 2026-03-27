import { Link } from 'react-router-dom';
import { Instagram, Youtube, Twitter } from 'lucide-react';

export function Footer() {
  const linkGroups = [
    {
      title: 'Plataforma',
      links: [
        { label: 'Mentores', href: '/mentores' },
        { label: 'Catálogo', href: '/catalogo' },
        { label: 'Eventos', href: '/eventos' },
        { label: 'Comunidad', href: '/comunidad' },
      ],
    },
    {
      title: 'Recursos',
      links: [
        { label: 'Blog', href: '#' },
        { label: 'Ser mentor', href: '#' },
        { label: 'Soporte', href: '#' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Términos', href: '#' },
        { label: 'Privacidad', href: '#' },
        { label: 'Cookies', href: '#' },
      ],
    },
  ];

  return (
    <footer className="relative">
      <div className="gradient-separator" />
      <div className="bg-card/50 py-16">
        <div className="container px-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            {/* Logo */}
            <div className="col-span-2">
              <img
                src="https://bu-cdn.tiendup.com/business/68423/images/logo_69627c253df9c_medium.png"
                alt="Sumak"
                className="h-10 mb-4"
              />
              <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
                La primera plataforma de bienestar consciente de LATAM. Tu transformación comienza aquí.
              </p>
              <div className="flex gap-3 mt-5">
                {[Instagram, Youtube, Twitter].map((Icon, i) => (
                  <a
                    key={i}
                    href="#"
                    className="w-9 h-9 rounded-full bg-muted flex items-center justify-center hover:bg-accent/20 transition-colors"
                  >
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </a>
                ))}
              </div>
            </div>

            {linkGroups.map((group) => (
              <div key={group.title}>
                <h4 className="font-display font-semibold text-sm mb-4">{group.title}</h4>
                <ul className="space-y-2.5">
                  {group.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        to={link.href}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="gradient-separator mb-6" />
          <p className="text-center text-xs text-muted-foreground">
            © 2025 Sumak. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}

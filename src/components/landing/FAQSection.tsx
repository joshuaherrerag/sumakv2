import { useScrollReveal } from '@/hooks/useScrollReveal';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    q: '¿Qué es Sumak?',
    a: 'Sumak es la primera plataforma de bienestar consciente de LATAM. Conectamos personas con mentores expertos en áreas como espiritualidad, finanzas conscientes, salud y autodesarrollo.',
  },
  {
    q: '¿Cómo me suscribo a un mentor?',
    a: 'Entrá al perfil del mentor que te interese y hacé clic en "Suscribirme". Podés elegir un plan mensual y acceder a todo su contenido y sesiones.',
  },
  {
    q: '¿Puedo cancelar mi membresía en cualquier momento?',
    a: 'Sí, podés cancelar tu membresía cuando quieras. No hay compromisos de permanencia ni penalizaciones.',
  },
  {
    q: '¿Los eventos presenciales están disponibles en toda LATAM?',
    a: 'Sí, organizamos eventos presenciales en distintas ciudades de Argentina, Colombia, México, Chile y más. Consultá el calendario para ver los eventos cercanos a tu ubicación.',
  },
  {
    q: '¿Cómo puedo ser mentor en Sumak?',
    a: 'Si sos experto en alguna de nuestras áreas de transformación, podés aplicar desde la sección "Ser mentor". Nuestro equipo evalúa cada solicitud para garantizar la calidad de la plataforma.',
  },
  {
    q: '¿Qué incluye la membresía gratuita?',
    a: 'Con la cuenta gratuita podés explorar mentores, ver contenido introductorio y participar en eventos online seleccionados. Para acceso completo, te recomendamos una membresía.',
  },
];

export function FAQSection() {
  const ref = useScrollReveal();

  return (
    <section className="py-24 relative">
      <div className="container px-4 max-w-3xl" ref={ref} style={{ opacity: 0 }}>
        <div className="text-center mb-16">
          <h2 className="font-display font-bold text-3xl sm:text-4xl mb-4">
            Preguntas{' '}
            <span className="gradient-text">frecuentes</span>
          </h2>
          <div className="gradient-separator max-w-xs mx-auto mt-6" />
        </div>

        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((faq, i) => (
            <AccordionItem
              key={i}
              value={`faq-${i}`}
              className="rounded-xl border border-border/50 bg-card/50 px-6 data-[state=open]:border-accent/30"
            >
              <AccordionTrigger className="text-left font-display font-semibold text-sm sm:text-base hover:no-underline py-5">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-sm leading-relaxed pb-5">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

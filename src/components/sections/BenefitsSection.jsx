// src/components/sections/BenefitsSection.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Check, ArrowRight, MapPin, Crown } from 'lucide-react';

export default function BenefitsSection({ onBookClick }) {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.15 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const scrollToLocation = () => {
    document.getElementById('ubicacion')?.scrollIntoView({ behavior: 'smooth' });
  };

  const vipWhatsappUrl = `https://wa.me/59899123456?text=${encodeURIComponent(
    '¡Hola Tu Estilo Studio! Me gustaría recibir información para unirme al Club de Socios VIP.'
  )}`;

  const pillars = [
    {
      num: "01",
      tag: "SIMPLE & SIN REGISTROS",
      title: "Reserva Online Inmediata",
      desc: "Elegí tu servicio, barbero y horario en menos de 30 segundos. Sistema en tiempo real que confirma tu cita sin llamadas ni esperas.",
      perks: ["Horarios 100% en vivo", "Cancelación y reprogramación fácil", "Recordatorio por WhatsApp"],
      action: {
        label: "Solicitar turno",
        icon: ArrowRight,
        onClick: () => onBookClick?.(),
        isLink: false
      }
    },
    {
      num: "02",
      tag: "FLEXIBILIDAD DIARIA",
      title: "Atención Walk-In (Sin Agenda)",
      desc: "¿Estás cerca de Barrios Amorín y precisás un corte ya? Pasá directo por el local y te atendemos por orden de llegada con la misma calidad de siempre.",
      perks: ["Sillón disponible al paso", "Lunes a Sábados 09:00 a 21:00 hs", "Sin recargos adicionales"],
      action: {
        label: "Ver ubicación",
        icon: MapPin,
        onClick: scrollToLocation,
        isLink: false
      }
    },
    {
      num: "03",
      tag: "EXPERIENCIA EXCLUSIVA",
      title: "Socios & Clientes VIP",
      desc: "Para quienes valoran el cuidado constante. Accedé a beneficios especiales, descuentos en productos de styling y prioridad en horarios pico.",
      perks: ["Tarifas con descuento", "Café o bebida en cada visita", "Prioridad en fines de semana"],
      action: {
        label: "Unirme al Club",
        icon: Crown,
        href: vipWhatsappUrl,
        isLink: true
      }
    }
  ];

  return (
    <section 
      id="beneficios" 
      ref={sectionRef}
      className="py-8 sm:py-10 px-4 max-w-7xl mx-auto scroll-mt-20 overflow-hidden"
    >
      <div className={`mb-6 sm:mb-8 transition-all duration-700 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      }`}>
        <span className="text-[10px] font-bold tracking-[0.3em] text-[#d4af37] uppercase block mb-1">
          LA DIFERENCIA TU STUDIO
        </span>
        <h2 className="text-2xl sm:text-4xl font-serif font-bold text-white tracking-tight">
          Por qué elegirnos
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {pillars.map((item, idx) => {
          const delays = ['delay-100', 'delay-200', 'delay-300'];
          const ActionIcon = item.action.icon;

          return (
            <div
              key={idx}
              className={`group relative bg-[#121212] border border-[#222222] hover:border-[#d4af37]/60 p-6 sm:p-7 rounded-3xl shadow-xl flex flex-col justify-between overflow-hidden transition-all duration-700 ease-out ${
                delays[idx]
              } ${
                isVisible 
                  ? 'opacity-100 translate-y-0 hover:-translate-y-1' 
                  : 'opacity-0 translate-y-12 pointer-events-none'
              }`}
            >
              <span className="absolute top-4 right-6 font-serif italic text-5xl font-bold text-[#1a1a1a] group-hover:text-[#d4af37]/15 transition-colors select-none">
                {item.num}
              </span>

              <div>
                <span className="text-[9px] font-bold tracking-widest text-[#d4af37] uppercase block mb-2">
                  {item.tag}
                </span>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#d4af37] transition-colors leading-snug">
                  {item.title}
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed mb-5">
                  {item.desc}
                </p>
              </div>

              <div>
                <div className="border-t border-[#1f1f1f] pt-4 mb-5 space-y-1.5">
                  {item.perks.map((perk, pIdx) => (
                    <div key={pIdx} className="flex items-center gap-2 text-xs text-gray-300">
                      <div className="w-4 h-4 rounded-full bg-[#d4af37]/20 flex items-center justify-center shrink-0">
                        <Check size={10} className="text-[#d4af37]" />
                      </div>
                      <span>{perk}</span>
                    </div>
                  ))}
                </div>

                <div>
                  {item.action.isLink ? (
                    <a
                      href={item.action.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#d4af37] hover:text-white bg-[#181818] hover:bg-[#222222] border border-[#2a2a2a] hover:border-[#d4af37]/60 py-2 px-3.5 rounded-xl transition-all active:scale-95"
                    >
                      <span>{item.action.label}</span>
                      <ActionIcon size={13} />
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={item.action.onClick}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#d4af37] hover:text-white bg-[#181818] hover:bg-[#222222] border border-[#2a2a2a] hover:border-[#d4af37]/60 py-2 px-3.5 rounded-xl transition-all active:scale-95"
                    >
                      <span>{item.action.label}</span>
                      <ActionIcon size={13} />
                    </button>
                  )}
                </div>
              </div>

              <div className="absolute bottom-0 inset-x-0 h-1 bg-[#d4af37] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
            </div>
          );
        })}
      </div>
    </section>
  );
}
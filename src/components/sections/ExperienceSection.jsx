// src/components/sections/ExperienceSection.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Trophy, ArrowUpRight } from 'lucide-react';

import studio1 from '../../assets/studio-1.jpg';
import studio2 from '../../assets/studio-2.jpg';
import studio3 from '../../assets/studio-3.jpg';

export default function ExperienceSection() {
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

  return (
    <section 
      id="studio" 
      ref={sectionRef}
      className="py-8 sm:py-10 px-4 max-w-7xl mx-auto scroll-mt-20 overflow-hidden"
    >
      {/* Encabezado ajustado */}
      <div className={`flex flex-col md:flex-row md:items-end justify-between mb-6 gap-3 border-b border-[#222222] pb-4 transition-all duration-700 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      }`}>
        <div>
          <span className="text-[10px] font-bold tracking-[0.3em] text-[#d4af37] uppercase block mb-1">
            EL ESPACIO · MONTEVIDEO
          </span>
          <h2 className="text-2xl sm:text-4xl font-serif font-bold text-white tracking-tight">
            Más que una barbería
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-gray-400 max-w-md leading-relaxed">
          Un punto de encuentro pensado para desconectar: pool profesional, café de especialidad y la mejor música.
        </p>
      </div>

      {/* Bento Grid con altura y gaps optimizados */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 min-h-[420px] lg:min-h-[460px]">
        
        {/* Imagen Principal */}
        <div className={`lg:col-span-7 group relative rounded-3xl overflow-hidden border border-[#222222] hover:border-[#d4af37]/70 bg-[#121212] min-h-[320px] lg:min-h-[440px] shadow-2xl flex flex-col justify-between p-6 sm:p-7 transition-all duration-1000 ease-out ${
          isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-16'
        }`}>
          <img
            src={studio1}
            alt="Zona Pool & Lounge"
            className="absolute inset-0 w-full h-full object-cover object-center filter brightness-90 transition-transform duration-700 ease-out group-hover:scale-105"
            onError={(e) => {
              e.target.src = "https://images.unsplash.com/photo-1512690459411-b9245aed614b?auto=format&fit=crop&q=80&w=1200";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/20 group-hover:via-black/30 transition-all duration-500" />

          <div className="relative z-10 flex items-center justify-between">
            <div className="inline-flex items-center gap-2 bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full">
              <Trophy size={13} className="text-[#d4af37]" />
              <span className="text-[10px] font-bold tracking-wider text-white uppercase">Zona Lounge & Pool</span>
            </div>
            <span className="w-7 h-7 rounded-full bg-black/40 border border-white/10 flex items-center justify-center text-[#d4af37] opacity-0 group-hover:opacity-100 transition-opacity">
              <ArrowUpRight size={15} />
            </span>
          </div>

          <div className="relative z-10 max-w-lg">
            <span className="text-[11px] font-serif italic text-[#d4af37] block mb-0.5">
              Desconectá de la rutina
            </span>
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-1.5 leading-tight">
              Mesa de pool, café y buena energía
            </h3>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed line-clamp-2">
              Vení unos minutos antes o quedate después de tu corte. El salón está diseñado para una experiencia completa.
            </p>
          </div>
        </div>

        {/* Columna Derecha */}
        <div className={`lg:col-span-5 flex flex-col gap-4 sm:gap-5 transition-all duration-1000 delay-150 ease-out ${
          isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-16'
        }`}>
          <div className="group relative flex-1 rounded-3xl overflow-hidden border border-[#222222] hover:border-[#d4af37]/70 bg-[#121212] min-h-[200px] shadow-xl flex flex-col justify-end p-5 transition-all duration-500">
            <img
              src={studio2}
              alt="Estaciones de Trabajo"
              className="absolute inset-0 w-full h-full object-cover object-center filter brightness-90 transition-transform duration-700 ease-out group-hover:scale-105"
              onError={(e) => {
                e.target.src = "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=800";
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
            <div className="relative z-10">
              <span className="text-[10px] font-bold tracking-widest text-[#d4af37] uppercase block mb-0.5">
                EQUIPAMIENTO
              </span>
              <h4 className="text-base font-bold text-white mb-0.5">
                Sillones ergonómicos y herramientas de precisión
              </h4>
              <p className="text-xs text-gray-300">
                Máximo confort para que tu corte sea un momento de relax.
              </p>
            </div>
          </div>

          <div className="group relative flex-1 rounded-3xl overflow-hidden border border-[#222222] hover:border-[#d4af37]/70 bg-[#121212] min-h-[200px] shadow-xl flex flex-col justify-end p-5 transition-all duration-500">
            <img
              src={studio3}
              alt="Ritual de Afeitado"
              className="absolute inset-0 w-full h-full object-cover object-center filter brightness-90 transition-transform duration-700 ease-out group-hover:scale-105"
              onError={(e) => {
                e.target.src = "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=800";
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
            <div className="relative z-10">
              <span className="text-[10px] font-bold tracking-widest text-[#d4af37] uppercase block mb-0.5">
                TRADICIÓN & DETALLE
              </span>
              <h4 className="text-base font-bold text-white mb-0.5">
                Ritual clásico de toalla caliente y navaja
              </h4>
              <p className="text-xs text-gray-300">
                Tratamientos faciales e hidratación de barba con aceites seleccionados.
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
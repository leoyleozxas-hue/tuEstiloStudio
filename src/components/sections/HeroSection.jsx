// src/components/sections/HeroSection.jsx
import React, { useState, useEffect } from 'react';
import { MapPin, Clock, Scissors, ArrowRight } from 'lucide-react';
import { studioData } from '../../data/mockData';
import logoImg from '../../assets/logo.png';
import heroImg from '../../assets/hero.jpg';

export default function HeroSection({ onBookClick }) {
  const [offsetY, setOffsetY] = useState(0);

  // Parallax suave optimizado
  useEffect(() => {
    let animationFrameId;

    const handleScroll = () => {
      animationFrameId = requestAnimationFrame(() => {
        setOffsetY(window.scrollY * 0.3);
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <section className="relative min-h-[92vh] sm:min-h-screen w-full flex flex-col justify-between pt-28 sm:pt-36 pb-8 overflow-hidden">
      
      {/* Fondo con Imagen y Parallax */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none will-change-transform"
        style={{
          transform: `translate3d(0, ${offsetY}px, 0)`,
        }}
      >
        <img 
          src={heroImg} 
          alt="Tu Estilo Studio"
          className="w-full h-[120%] object-cover object-center filter brightness-90 scale-105 origin-top transition-transform duration-75 ease-out"
        />
        {/* Overlays adaptativos (degradado lateral para mobile, centrado/vertical para desktop) */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/30 sm:bg-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0c] via-black/40 to-black/70" />
      </div>

      {/* Contenido Principal: A la izquierda en Mobile, Centrado en Desktop */}
      <div className="relative z-10 max-w-5xl mx-auto w-full px-5 sm:px-8 my-auto flex flex-col items-start sm:items-center text-left sm:text-center">
        
        {/* Emblema y Tagline */}
        <div className="flex items-center sm:flex-col sm:items-center gap-3 sm:gap-3 mb-4 sm:mb-6">
          <div className="w-12 h-12 sm:w-20 sm:h-20 rounded-full border border-[#d4af37]/60 p-1 bg-black/70 shadow-2xl backdrop-blur-sm shrink-0">
            <img 
              src={logoImg} 
              alt="Logo Tu Estilo" 
              className="w-full h-full object-contain rounded-full"
            />
          </div>
          <div className="flex flex-col items-start sm:items-center">
            <span className="text-[10px] sm:text-xs font-bold tracking-[0.3em] text-[#d4af37] uppercase block">
              {studioData.name}
            </span>
            <span className="text-[9px] sm:text-[11px] text-gray-400 tracking-widest uppercase block mt-0.5">
              {studioData.tagline}
            </span>
          </div>
        </div>

        {/* Título Monumental: Izquierda en mobile, Centrado en desktop */}
        <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tight mb-4 sm:mb-6 leading-[0.95] drop-shadow-2xl text-left sm:text-center">
          <span className="block text-white uppercase font-sans">
            Tu corte.
          </span>
          <span className="block font-serif italic font-normal text-[#d4af37] mt-1 sm:mt-2">
            Tu momento.
          </span>
        </h1>

        {/* Bajada Descriptiva */}
        <p className="max-w-xl sm:max-w-2xl text-sm sm:text-base md:text-lg text-gray-300 mb-8 sm:mb-10 font-normal leading-relaxed text-left sm:text-center sm:mx-auto">
          Una barbería pensada para que vengas a renovarte, relajarte y disfrutar el momento. Atención de autor, ambiente exclusivo y reserva en tiempo real.
        </p>

        {/* Botones de Acción (Full width apilados en Mobile, Centrados en Desktop) */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-start sm:justify-center gap-3 sm:gap-4 w-full sm:w-auto mb-8 sm:mb-12">
          <button 
            onClick={onBookClick}
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 bg-[#d4af37] hover:bg-[#b89628] text-black font-bold py-4 px-8 rounded-full text-xs tracking-widest uppercase transition-all shadow-xl shadow-[#d4af37]/20 active:scale-95"
          >
            <span>RESERVAR TURNO</span>
            <ArrowRight size={15} />
          </button>
          
          <a 
            href="#studio"
            className="w-full sm:w-auto flex items-center justify-center gap-2 border border-white/20 hover:border-[#d4af37] text-white hover:text-[#d4af37] font-semibold py-4 px-8 rounded-full text-xs tracking-widest uppercase transition-all bg-black/40 hover:bg-black/70 backdrop-blur-sm active:scale-95"
          >
            <span>CONOCER EL STUDIO</span>
          </a>
        </div>

      </div>

      {/* Bloque Inferior de Información: Columna a la izquierda en Mobile, Fila centrada en Desktop */}
      <div className="relative z-10 max-w-7xl mx-auto w-full px-5 sm:px-8 pt-6 border-t border-white/10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-start sm:justify-center gap-3.5 sm:gap-8 text-xs text-gray-300">
          
          {/* Dirección */}
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-full bg-[#d4af37]/15 flex items-center justify-center text-[#d4af37] shrink-0">
              <MapPin size={13} />
            </div>
            <span>
              <strong className="text-white">{studioData.address}</strong> · {studioData.city}
            </span>
          </div>

          {/* Horario */}
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-full bg-[#d4af37]/15 flex items-center justify-center text-[#d4af37] shrink-0">
              <Clock size={13} />
            </div>
            <span>
              <strong className="text-white">{studioData.hours}</strong> · {studioData.hoursRange}
            </span>
          </div>

          {/* Atención sin agenda */}
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-full bg-[#d4af37]/15 flex items-center justify-center text-[#d4af37] shrink-0">
              <Scissors size={13} />
            </div>
            <span className="text-[#d4af37] font-medium">
              {studioData.walkIn}
            </span>
          </div>

        </div>
      </div>

    </section>
  );
}
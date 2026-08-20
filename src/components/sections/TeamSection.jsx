// src/components/sections/TeamSection.jsx
import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, User, Scissors, Sparkles, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

const fallbackBarbers = [
  {
    id: '1',
    nombre: 'Mateo Benítez',
    descripcion: 'Master Barber • Especialista en Fade, degradés modernos y perfilado de barba.',
    avatar_url: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=600',
    badge: 'Master Barber',
    horario: '10:00 - 20:00 hs'
  },
  {
    id: '2',
    nombre: 'Santiago Silva',
    descripcion: 'Estilista Creativo • Diseños urbanos, texturas y colorimetría masculina.',
    avatar_url: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&q=80&w=600',
    badge: 'Estilista',
    horario: '10:00 - 20:00 hs'
  },
  {
    id: '3',
    nombre: 'Joaquín Rodríguez',
    descripcion: 'Barbero Tradicional • Ritual de afeitado a navaja clásica y toalla caliente.',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600',
    badge: 'Tradicional',
    horario: '10:00 - 20:00 hs'
  },
  {
    id: '4',
    nombre: 'Lucas Morales',
    descripcion: 'Especialista en corte clásico a tijera y tratamiento capilar.',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600',
    badge: 'Especialista',
    horario: '14:00 - 20:00 hs'
  }
];

export default function TeamSection() {
  const [barbers, setBarbers] = useState(fallbackBarbers);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardsPerPage, setCardsPerPage] = useState(3);
  const [isPaused, setIsPaused] = useState(false);

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Cargar barberos reales de Supabase
  useEffect(() => {
    async function loadBarbers() {
      try {
        const { data, error } = await supabase
          .from('barberos')
          .select('id, nombre, avatar_url, descripcion, hora_inicio, hora_fin, activo')
          .eq('activo', true)
          .order('nombre', { ascending: true });

        if (!error && data && data.length > 0) {
          const formatted = data.map((b, idx) => ({
            ...b,
            badge: idx === 0 ? 'Master Barber' : 'Profesional',
            horario: b.hora_inicio && b.hora_fin ? `${b.hora_inicio.slice(0, 5)} - ${b.hora_fin.slice(0, 5)} hs` : '10:00 - 20:00 hs'
          }));
          setBarbers(formatted);
        }
      } catch (_) {}
    }
    loadBarbers();
  }, []);

  // Adaptabilidad según pantalla
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setCardsPerPage(1);
      } else if (window.innerWidth < 1024) {
        setCardsPerPage(2);
      } else {
        setCardsPerPage(3);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const maxIndex = Math.max(0, barbers.length - cardsPerPage);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  // Auto-play cada 4.5 segundos
  useEffect(() => {
    if (isPaused || barbers.length <= cardsPerPage) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 4500);
    return () => clearInterval(timer);
  }, [currentIndex, isPaused, maxIndex, barbers.length, cardsPerPage]);

  // Touch Swipe para celulares
  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    if (distance > 50) {
      nextSlide();
    } else if (distance < -50) {
      prevSlide();
    }
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  return (
    <section id="equipo" className="py-8 sm:py-10 px-4 max-w-7xl mx-auto scroll-mt-20 overflow-hidden relative">
      
      {/* Encabezado */}
      <div className="text-center max-w-xl mx-auto mb-6 sm:mb-8">
        <span className="text-[10px] font-bold tracking-[0.3em] text-[#d4af37] uppercase block mb-1">
          NUESTRO EQUIPO
        </span>
        <h2 className="text-2xl sm:text-4xl font-serif font-bold text-white tracking-tight">
          Maestros del Corte y Estilo
        </h2>
        <p className="text-xs sm:text-sm text-gray-400 mt-1.5">
          Profesionales apasionados por la técnica, el detalle y la excelencia en cada servicio.
        </p>
      </div>

      {/* Contenedor del Carrusel con Flechas */}
      <div className="relative">
        
        {barbers.length > cardsPerPage && (
          <>
            <button
              onClick={prevSlide}
              className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full border border-[#333333] bg-[#121212]/90 backdrop-blur-md hover:border-[#d4af37] text-white hover:text-[#d4af37] items-center justify-center transition-all shadow-xl active:scale-90"
              aria-label="Anterior"
            >
              <ChevronLeft size={20} />
            </button>

            <button
              onClick={nextSlide}
              className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full border border-[#333333] bg-[#121212]/90 backdrop-blur-md hover:border-[#d4af37] text-white hover:text-[#d4af37] items-center justify-center transition-all shadow-xl active:scale-90"
              aria-label="Siguiente"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}

        <div 
          className="relative overflow-hidden"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className="flex transition-transform duration-500 ease-out"
            style={{
              transform: `translateX(-${currentIndex * (100 / cardsPerPage)}%)`,
            }}
          >
            {barbers.map((barber) => (
              <div
                key={barber.id}
                className="w-full sm:w-1/2 lg:w-1/3 shrink-0 p-2 sm:p-2.5"
              >
                <div className="bg-[#121212] border border-[#222222] hover:border-[#d4af37]/60 rounded-3xl overflow-hidden h-full flex flex-col justify-between transition-all duration-300 group hover:-translate-y-1 shadow-xl">
                  
                  {/* Foto del Barbero */}
                  <div className="relative h-56 sm:h-64 w-full overflow-hidden bg-black flex items-center justify-center">
                    {barber.avatar_url ? (
                      <img
                        src={barber.avatar_url}
                        alt={barber.nombre}
                        className="w-full h-full object-cover object-center filter brightness-90 transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-[#1e190d] border border-[#d4af37] text-[#d4af37] font-serif font-bold text-2xl flex items-center justify-center">
                        {barber.nombre ? barber.nombre.charAt(0).toUpperCase() : <User size={36} />}
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-transparent" />

                    {barber.badge && (
                      <span className="absolute top-3 left-3 bg-[#d4af37] text-black font-bold text-[9px] tracking-wider uppercase px-2.5 py-0.5 rounded-full shadow-lg">
                        {barber.badge}
                      </span>
                    )}

                    <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-sm border border-white/10 px-2.5 py-0.5 rounded-full flex items-center gap-1.5 text-[10px] text-gray-200">
                      <Clock size={11} className="text-[#d4af37]" />
                      <span>{barber.horario}</span>
                    </div>
                  </div>

                  {/* Datos del Barbero */}
                  <div className="p-5 flex flex-col flex-grow justify-between items-center text-center">
                    <div className="w-full space-y-1.5">
                      <h3 className="text-base font-bold text-white group-hover:text-[#d4af37] transition-colors leading-snug">
                        {barber.nombre}
                      </h3>
                      
                      <p className="text-xs text-[#a3a3a3] leading-relaxed line-clamp-2 max-w-xs mx-auto">
                        {barber.descripcion || 'Especialista en cortes clásicos, degradés modernos y cuidado de barba.'}
                      </p>
                    </div>

                    <div className="w-full mt-4 pt-3 border-t border-[#1f1f1f] flex items-center justify-center gap-1.5 text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                      <Sparkles size={11} className="text-[#d4af37]" />
                      <span>Atención de Excelencia</span>
                    </div>
                  </div>

                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Barritas / Puntos de Navegación Inferiores */}
      {barbers.length > cardsPerPage && (
        <div className="flex items-center justify-center gap-1.5 mt-5">
          {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Ir al grupo ${idx + 1}`}
              className={`transition-all duration-300 rounded-full ${
                currentIndex === idx
                  ? 'w-6 h-1.5 bg-[#d4af37]'
                  : 'w-1.5 h-1.5 bg-[#2a2a2a] hover:bg-[#444444]'
              }`}
            />
          ))}
        </div>
      )}

    </section>
  );
}
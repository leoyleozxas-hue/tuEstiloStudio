// src/components/sections/ServicesSection.jsx
import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Clock, Check, ArrowRight } from 'lucide-react';
import { servicesData } from '../../data/mockData';

export default function ServicesSection({ onSelectService }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardsPerPage, setCardsPerPage] = useState(3);
  const [isPaused, setIsPaused] = useState(false);

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

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

  const maxIndex = Math.max(0, servicesData.length - cardsPerPage);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 4500);
    return () => clearInterval(timer);
  }, [currentIndex, isPaused, maxIndex]);

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
    <section id="servicios" className="py-8 sm:py-10 px-4 max-w-7xl mx-auto scroll-mt-20 overflow-hidden relative">
      
      <div className="text-center max-w-xl mx-auto mb-6 sm:mb-8">
        <span className="text-[10px] font-bold tracking-[0.3em] text-[#d4af37] uppercase block mb-1">
          LO QUE HACEMOS
        </span>
        <h2 className="text-2xl sm:text-4xl font-serif font-bold text-white tracking-tight">
          Nuestros Servicios
        </h2>
        <p className="text-xs sm:text-sm text-gray-400 mt-1.5">
          Técnicas tradicionales y de autor para renovar tu imagen y estilo.
        </p>
      </div>

      <div className="relative">
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
            {servicesData.map((service) => (
              <div
                key={service.id}
                className="w-full sm:w-1/2 lg:w-1/3 shrink-0 p-2 sm:p-2.5"
              >
                <div className="bg-[#121212] border border-[#222222] hover:border-[#d4af37]/60 rounded-3xl overflow-hidden h-full flex flex-col justify-between transition-all duration-300 group hover:-translate-y-1 shadow-xl">
                  
                  <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-black">
                    <img
                      src={service.image}
                      alt={service.name}
                      className="w-full h-full object-cover object-center filter brightness-90 transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-transparent" />

                    {service.badge && (
                      <span className="absolute top-3 left-3 bg-[#d4af37] text-black font-bold text-[9px] tracking-wider uppercase px-2.5 py-0.5 rounded-full shadow-lg">
                        {service.badge}
                      </span>
                    )}

                    <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-sm border border-white/10 px-2.5 py-0.5 rounded-full flex items-center gap-1.5 text-[10px] text-gray-200">
                      <Clock size={11} className="text-[#d4af37]" />
                      <span>{service.duration}</span>
                    </div>
                  </div>

                  <div className="p-5 flex flex-col flex-grow justify-between items-center text-center">
                    <div className="w-full">
                      <h3 className="text-base font-bold text-white group-hover:text-[#d4af37] transition-colors leading-snug">
                        {service.name}
                      </h3>
                      <div className="text-xl font-serif font-bold text-[#d4af37] my-1">
                        ${service.price}
                      </div>

                      <p className="text-xs text-[#a3a3a3] leading-relaxed mb-3.5 line-clamp-2 max-w-xs mx-auto">
                        {service.desc}
                      </p>

                      {service.features && (
                        <div className="space-y-1 mb-4 border-t border-[#1f1f1f] pt-2.5 flex flex-col items-center">
                          {service.features.slice(0, 2).map((feat, idx) => (
                            <div key={idx} className="flex items-center justify-center gap-1.5 text-[11px] text-gray-300">
                              <Check size={11} className="text-[#d4af37] shrink-0" />
                              <span className="truncate">{feat}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => onSelectService(service.id)}
                      className="w-full flex items-center justify-center gap-1.5 bg-[#1c1c1c] group-hover:bg-[#d4af37] text-white group-hover:text-black font-bold py-2.5 px-4 rounded-xl text-xs tracking-wider uppercase border border-[#2a2a2a] group-hover:border-[#d4af37] transition-all duration-300 shadow-md active:scale-95"
                    >
                      <span>Elegir servicio</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>

                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

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

    </section>
  );
}
// src/components/sections/LocationSection.jsx
import React from 'react';
import { MapPin, Clock, Navigation, ArrowUpRight } from 'lucide-react';
import { studioData } from '../../data/mockData';

function InstagramIcon({ size = 16, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

export default function LocationSection() {
  return (
    <section id="ubicacion" className="py-8 sm:py-10 px-4 max-w-7xl mx-auto scroll-mt-20">
      <div className="mb-6 sm:mb-8 text-center max-w-xl mx-auto">
        <span className="text-[10px] font-bold tracking-[0.3em] text-[#d4af37] uppercase block mb-1">
          DÓNDE ESTAMOS
        </span>
        <h2 className="text-2xl sm:text-4xl font-serif font-bold text-white tracking-tight">
          Vení a Conocernos
        </h2>
        <p className="text-xs sm:text-sm text-gray-400 mt-1.5">
          Ubicados en el corazón de Montevideo, con fácil acceso y espacio para desconectar.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-5 flex flex-col justify-between gap-4">
          <div className="bg-[#121212] border border-[#222222] rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-[#d4af37]/15 border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37] shrink-0">
                <MapPin size={16} />
              </div>
              <div>
                <span className="text-[9px] font-bold tracking-widest text-[#d4af37] uppercase block mb-0.5">
                  DIRECCIÓN
                </span>
                <h3 className="text-sm font-bold text-white">{studioData.address}</h3>
                <p className="text-xs text-gray-400">{studioData.neighborhood} · {studioData.city}, Uruguay</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 border-t border-[#1f1f1f] pt-4">
              <div className="w-9 h-9 rounded-xl bg-[#d4af37]/15 border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37] shrink-0">
                <Clock size={16} />
              </div>
              <div>
                <span className="text-[9px] font-bold tracking-widest text-[#d4af37] uppercase block mb-0.5">
                  HORARIO DE ATENCIÓN
                </span>
                <h3 className="text-sm font-bold text-white">{studioData.hours}</h3>
                <p className="text-xs text-gray-400">{studioData.hoursRange}</p>
                <span className="inline-block mt-0.5 text-[10px] text-[#d4af37] font-semibold">
                  {studioData.walkIn}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3.5 border-t border-[#1f1f1f] pt-4">
              <div className="w-9 h-9 rounded-xl bg-[#d4af37]/15 border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37] shrink-0">
                <InstagramIcon size={16} />
              </div>
              <div>
                <span className="text-[9px] font-bold tracking-widest text-[#d4af37] uppercase block mb-0.5">
                  SEGUINOS EN INSTAGRAM
                </span>
                <a
                  href={studioData.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-white hover:text-[#d4af37] flex items-center gap-1 transition-colors"
                >
                  <span>@{studioData.instagram}</span>
                  <ArrowUpRight size={13} />
                </a>
              </div>
            </div>
          </div>

          <a
            href={studioData.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 bg-[#d4af37] hover:bg-[#b89628] text-black font-bold py-3.5 px-6 rounded-2xl text-xs tracking-widest uppercase transition-all shadow-xl shadow-[#d4af37]/20 active:scale-95"
          >
            <Navigation size={15} />
            <span>CÓMO LLEGAR CON GOOGLE MAPS</span>
          </a>
        </div>

        <div className="lg:col-span-7 bg-[#121212] border border-[#222222] rounded-3xl overflow-hidden shadow-2xl min-h-[320px] lg:min-h-[360px] relative">
          <iframe
            title="Mapa de Tu Estilo Studio"
            src={studioData.googleMapsEmbed}
            width="100%"
            height="100%"
            style={{ border: 0, filter: 'grayscale(0%) invert(90%) contrast(120%)' }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="w-full h-full min-h-[320px]"
          />
        </div>
      </div>
    </section>
  );
}
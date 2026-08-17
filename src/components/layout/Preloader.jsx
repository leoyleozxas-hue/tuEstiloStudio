import React, { useState, useEffect } from 'react';
import logoImg from '../../assets/logo.png';
import { studioData } from '../../data/mockData';

export default function Preloader() {
  const [loading, setLoading] = useState(true);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    // A los 1.2s inicia el desvanecimiento suave
    const timerFade = setTimeout(() => {
      setFade(true);
    }, 1200);

    // A los 1.8s se desmonta por completo
    const timerComplete = setTimeout(() => {
      setLoading(false);
    }, 1800);

    return () => {
      clearTimeout(timerFade);
      clearTimeout(timerComplete);
    };
  }, []);

  if (!loading) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] bg-[#0c0c0c] flex flex-col items-center justify-center transition-all duration-700 ease-in-out ${
        fade ? 'opacity-0 pointer-events-none scale-105' : 'opacity-100 scale-100'
      }`}
    >
      {/* Resplandor ambiental de fondo */}
      <div className="absolute w-72 h-72 bg-[#d4af37]/10 rounded-full blur-3xl pointer-events-none animate-pulse" />

      {/* Logo con respiración suave */}
      <div className="relative z-10 flex flex-col items-center">
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border border-[#d4af37]/60 p-1 bg-[#121212] shadow-2xl mb-5 animate-pulse">
          <img
            src={logoImg}
            alt="Tu Estilo Studio"
            className="w-full h-full object-contain rounded-full"
          />
        </div>

        {/* Nombre de la marca */}
        <h2 className="text-sm sm:text-base font-bold tracking-[0.35em] text-white uppercase font-sans mb-1">
          {studioData.name}
        </h2>
        <span className="text-[10px] font-bold tracking-[0.25em] text-[#d4af37] uppercase">
          BARBERÍA · ESTILO · EXPERIENCIA
        </span>

        {/* Línea dorada de carga progresiva */}
        <div className="w-40 h-[2px] bg-[#222222] rounded-full mt-6 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[#d4af37] via-[#f3e5ab] to-[#d4af37] animate-[marquee_1.2s_ease-in-out_infinite] w-full" />
        </div>
      </div>
    </div>
  );
}
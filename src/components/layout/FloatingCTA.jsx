// src/components/layout/FloatingCTA.jsx
import React, { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';

export default function FloatingCTA({ onClick }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Aparece recién cuando el usuario pasa el Hero (65% del alto de la ventana)
      const heroThreshold = window.innerHeight * 0.65;
      setVisible(window.scrollY > heroThreshold);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Verificación inicial por si la página carga ya scrolleada
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      className={`fixed bottom-6 right-6 z-40 transition-all duration-500 ease-out ${
        visible
          ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
          : 'opacity-0 translate-y-8 scale-90 pointer-events-none'
      }`}
    >
      <button 
        onClick={onClick}
        className="flex items-center gap-2 bg-[#d4af37] hover:bg-[#b89628] text-black font-bold py-3.5 px-6 rounded-full text-xs tracking-widest uppercase shadow-2xl shadow-[#d4af37]/30 transition-transform active:scale-95 hover:scale-105"
      >
        <Calendar size={16} />
        <span>RESERVAR TURNO</span>
      </button>
    </div>
  );
}
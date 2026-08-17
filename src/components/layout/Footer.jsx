// src/components/layout/Footer.jsx
import React from 'react';
import { studioData } from '../../data/mockData';

export default function Footer() {
  return (
    <footer className="border-t border-[#222222] bg-black py-8 px-4 text-center">
      <div className="max-w-6xl mx-auto space-y-2">
        <p className="text-xs sm:text-sm font-bold text-white tracking-widest uppercase">{studioData.name}</p>
        <p className="text-xs text-gray-400">{studioData.address} · {studioData.city} · {studioData.hours}</p>
        <p className="text-[10px] text-gray-600 pt-2">
          © {new Date().getFullYear()} {studioData.name}. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
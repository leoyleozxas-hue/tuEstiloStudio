// src/components/admin/layout/AdminHeader.jsx
import React from 'react';
import { Menu, X, Eye, LogOut } from 'lucide-react';
import { studioData } from '../../../data/mockData';
import logoImg from '../../../assets/logo.png';

export function AdminHeader({ isMobileMenuOpen, setIsMobileMenuOpen, onLogout }) {
  return (
    <header className="border-b border-[#222222] bg-[#0c0c0c]/95 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-8 py-2.5 sm:py-3 flex items-center justify-between shadow-xl">
      <div className="flex items-center gap-3">
        {/* Botón Hamburguesa Mobile */}
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-xl bg-[#181818] border border-[#282828] text-gray-300 hover:text-white lg:hidden"
          title="Abrir Menú Lateral"
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Logo y Título */}
        <a href="/" className="flex items-center gap-3 shrink-0 group">
          <img 
            src={logoImg} 
            alt={studioData?.name || 'Studio'} 
            className="w-9 h-9 object-contain rounded-full border border-[#d4af37]/60 p-0.5 bg-black/60 group-hover:scale-105 transition-transform"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs sm:text-sm tracking-[0.15em] uppercase text-white font-sans whitespace-nowrap">
                {studioData?.name || 'Studio Barber'}
              </span>
              <span className="text-[9px] bg-[#d4af37] text-black font-extrabold px-1.5 py-0.2 rounded uppercase tracking-wider">
                Admin
              </span>
            </div>
            <span className="text-[10px] text-gray-400 flex items-center gap-1 group-hover:text-[#d4af37] transition-colors">
              <Eye size={10} />
              <span>Ver sitio web público</span>
            </span>
          </div>
        </a>
      </div>

      <button
        onClick={onLogout}
        className="flex items-center gap-1.5 bg-[#171717] hover:bg-[#222222] text-gray-300 hover:text-red-400 border border-[#2a2a2a] hover:border-red-500/40 px-3.5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all active:scale-95"
      >
        <LogOut size={13} />
        <span className="hidden sm:inline">Cerrar Sesión</span>
      </button>
    </header>
  );
}
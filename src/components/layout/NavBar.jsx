// src/components/layout/NavBar.jsx
import React, { useState, useEffect } from 'react';
import { Menu, X, User, Calendar, ShieldCheck, Crown, ChevronDown } from 'lucide-react';
import { studioData } from '../../data/mockData';
import logoImg from '../../assets/logo.png';

export default function NavBar({ onBookClick, onSociosClick, onLoginClick }) {
  const [navOpen, setNavOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showLoginMenu, setShowLoginMenu] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const links = [
    { name: 'SERVICIOS', href: '#servicios' },
    { name: 'EL EQUIPO', href: '#equipo' },
    { name: 'CLUB VIP', href: '#beneficios' },
    { name: 'UBICACIÓN', href: '#ubicacion' },
  ];

  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-[#0c0c0c]/95 backdrop-blur-md border-b border-[#222222] py-3 shadow-2xl' 
        : 'bg-transparent border-b border-white/5 py-4'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between">
        
        {/* 1. Logo e Identidad */}
        <a href="#" className="flex items-center gap-3 shrink-0 group">
          <img 
            src={logoImg} 
            alt={studioData?.name || 'Studio'} 
            className="w-10 h-10 object-contain rounded-full border border-[#d4af37]/60 p-0.5 bg-black/60 group-hover:scale-105 transition-transform"
          />
          <span className="font-bold text-xs sm:text-sm tracking-[0.2em] uppercase text-white font-sans whitespace-nowrap">
            {studioData?.name || 'Studio Barber'}
          </span>
        </a>

        {/* 2. Enlaces Centrales (Desktop) */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-8 text-xs font-bold tracking-[0.16em]">
          {links.map((link) => (
            <a 
              key={link.name} 
              href={link.href} 
              className="text-gray-400 hover:text-white transition-colors duration-200 uppercase relative group py-1"
            >
              <span>{link.name}</span>
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#d4af37] scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left rounded-full" />
            </a>
          ))}
        </nav>

        {/* 3. Botones de Acción (Desktop) */}
        <div className="hidden sm:flex items-center gap-3">
          
          {/* Botón Ingresar con Desplegable */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowLoginMenu(!showLoginMenu)}
              className="flex items-center gap-1.5 text-xs font-bold text-gray-300 hover:text-white bg-[#171717] hover:bg-[#222222] border border-[#2a2a2a] hover:border-[#d4af37]/60 py-2.5 px-4 rounded-full uppercase tracking-wider transition-all active:scale-95 shadow-sm"
            >
              <User size={13} className="text-[#d4af37]" />
              <span>Ingresar</span>
              <ChevronDown size={12} className={`text-gray-500 transition-transform ${showLoginMenu ? 'rotate-180' : ''}`} />
            </button>

            {/* Menú Desplegable */}
            {showLoginMenu && (
              <div 
                className="absolute right-0 mt-2 w-52 bg-[#121212] border border-[#282828] rounded-2xl shadow-2xl p-1.5 z-50 animate-fadeIn space-y-1"
                onMouseLeave={() => setShowLoginMenu(false)}
              >
                <button
                  type="button"
                  onClick={() => {
                    setShowLoginMenu(false);
                    onLoginClick?.();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-xs font-semibold text-gray-300 hover:text-white hover:bg-[#1c1c1c] transition-colors"
                >
                  <Crown size={14} className="text-[#d4af37] shrink-0" />
                  <div>
                    <span className="block text-white font-bold">Club de Socios</span>
                    <span className="text-[10px] text-gray-400">Acceso a beneficios</span>
                  </div>
                </button>

                <a
                  href="/admin"
                  onClick={() => setShowLoginMenu(false)}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-xs font-semibold text-gray-300 hover:text-white hover:bg-[#1c1c1c] transition-colors border-t border-[#1e1e1e]"
                >
                  <ShieldCheck size={14} className="text-emerald-400 shrink-0" />
                  <div>
                    <span className="block text-white font-bold">Administrador</span>
                    <span className="text-[10px] text-gray-400">Panel del local</span>
                  </div>
                </a>
              </div>
            )}
          </div>

          {/* Botón Reservar con Padding Amplio */}
          <button 
            type="button"
            onClick={onBookClick}
            className="flex items-center gap-2 bg-[#d4af37] hover:bg-[#c49f2e] text-black font-bold text-xs py-2.5 px-6 sm:px-7 rounded-full tracking-widest uppercase transition-all shadow-lg shadow-[#d4af37]/20 hover:scale-[1.03] active:scale-95 whitespace-nowrap"
          >
            <Calendar size={14} />
            <span>RESERVAR</span>
          </button>
        </div>

        {/* 4. Botón Hamburguesa Móvil */}
        <button 
          type="button"
          onClick={() => setNavOpen(!navOpen)} 
          className="lg:hidden text-[#d4af37] p-2 hover:bg-[#1a1a1a] rounded-xl transition-colors"
          aria-label="Abrir menú"
        >
          {navOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Drawer Móvil */}
      {navOpen && (
        <div className="lg:hidden bg-[#0c0c0c]/98 backdrop-blur-xl border-b border-[#222222] px-6 py-5 space-y-4 animate-fadeIn">
          <div className="space-y-2.5">
            {links.map((link) => (
              <a 
                key={link.name} 
                href={link.href} 
                onClick={() => setNavOpen(false)} 
                className="block text-xs font-bold tracking-widest text-gray-300 hover:text-[#d4af37] py-1.5 uppercase transition-colors"
              >
                {link.name}
              </a>
            ))}
          </div>

          <div className="pt-3 border-t border-[#222222] space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => { setNavOpen(false); onLoginClick?.(); }}
                className="flex items-center justify-center gap-1.5 bg-[#171717] border border-[#2a2a2a] text-white font-bold py-2.5 rounded-xl text-xs tracking-wider uppercase transition-all active:scale-95"
              >
                <Crown size={13} className="text-[#d4af37]" />
                <span>Socios</span>
              </button>

              <a
                href="/admin"
                onClick={() => setNavOpen(false)}
                className="flex items-center justify-center gap-1.5 bg-[#171717] border border-[#2a2a2a] text-white font-bold py-2.5 rounded-xl text-xs tracking-wider uppercase transition-all active:scale-95"
              >
                <ShieldCheck size={13} className="text-emerald-400" />
                <span>Admin</span>
              </a>
            </div>

            <button 
              type="button"
              onClick={() => { setNavOpen(false); onBookClick?.(); }}
              className="w-full flex items-center justify-center gap-2 bg-[#d4af37] hover:bg-[#c49f2e] text-black font-bold py-3 px-6 rounded-xl text-xs tracking-widest uppercase transition-all shadow-md active:scale-95"
            >
              <Calendar size={14} />
              <span>RESERVAR TURNO</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
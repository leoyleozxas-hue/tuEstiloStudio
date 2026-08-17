// src/components/layout/Navbar.jsx
import React, { useState, useEffect, useRef } from 'react';
import { 
  Menu, X, ChevronDown, Scissors, Users, 
  Trophy, MapPin, Crown, User
} from 'lucide-react';
import { studioData } from '../../data/mockData';
import logoImg from '../../assets/logo.png';

export default function Navbar({ onLoginClick }) {
  const [navOpen, setNavOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef(null);

  // Efecto de fondo translúcido al scrollear
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const dropdownItems = [
    {
      name: 'Nuestros Servicios',
      href: '#servicios',
      icon: Scissors,
      desc: 'Cortes, perfilado de barba y combos'
    },
    {
      name: 'Profesionales',
      href: '#equipo',
      icon: Users,
      desc: 'Equipo de estilistas y barberos'
    },
    {
      name: 'El Studio & Lounge',
      href: '#studio',
      icon: Trophy,
      desc: 'Mesa de pool, bar y café'
    },
    {
      name: 'Ubicación & Contacto',
      href: '#ubicacion',
      icon: MapPin,
      desc: 'Horarios y cómo llegar'
    }
  ];

  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-[#0c0c0c]/95 backdrop-blur-md border-b border-[#222222] py-3 shadow-2xl' 
        : 'bg-transparent border-b border-white/5 py-4'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between">
        
        {/* 1. Logo e Identidad (Izquierda) */}
        <a href="#" className="flex items-center gap-3 shrink-0 group">
          <img 
            src={logoImg} 
            alt={studioData.name} 
            className="w-9 h-9 object-contain rounded-full border border-[#d4af37]/50 p-0.5 bg-black/50 group-hover:scale-105 transition-transform"
          />
          <span className="font-bold text-xs sm:text-sm tracking-[0.2em] uppercase text-white font-sans whitespace-nowrap">
            {studioData.name}
          </span>
        </a>

        {/* 2. Todo agrupado a la derecha (Desktop) */}
        <div className="hidden md:flex items-center gap-4 lg:gap-6">
          
          {/* Dropdown Conócenos */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className={`flex items-center gap-1.5 py-1.5 px-2.5 rounded-xl text-xs font-bold tracking-widest uppercase transition-all ${
                dropdownOpen 
                  ? 'bg-[#181818] text-[#d4af37] border border-[#2a2a2a]' 
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>Conócenos</span>
              <ChevronDown size={14} className={`transition-transform duration-200 ${dropdownOpen ? 'rotate-180 text-[#d4af37]' : ''}`} />
            </button>

            {dropdownOpen && (
              <div className="absolute top-full right-0 mt-2 w-72 bg-[#121212] border border-[#282828] rounded-2xl p-2 shadow-2xl backdrop-blur-xl animate-scaleUp z-50">
                {dropdownItems.map((item) => {
                  const ItemIcon = item.icon;
                  return (
                    <a
                      key={item.name}
                      href={item.href}
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-[#1c1c1c] text-gray-300 hover:text-white transition-all group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#181818] border border-[#2a2a2a] flex items-center justify-center text-gray-400 group-hover:text-[#d4af37] group-hover:border-[#d4af37]/40 shrink-0 transition-colors">
                        <ItemIcon size={15} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-white group-hover:text-[#d4af37] transition-colors leading-tight">
                          {item.name}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-0.5 truncate">
                          {item.desc}
                        </p>
                      </div>
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          {/* Enlace Directo al Club de Socios */}
          <a
            href="#reserva"
            onClick={(e) => {
              e.preventDefault();
              onLoginClick?.();
            }}
            className="flex items-center gap-1.5 text-gray-300 hover:text-[#d4af37] transition-colors py-1.5 px-2 uppercase tracking-widest text-xs font-bold"
          >
            <Crown size={13} className="text-[#d4af37]" />
            <span>Club de Socios</span>
          </a>

          {/* Botón Ingresar */}
          <button
            type="button"
            onClick={onLoginClick}
            className="flex items-center gap-1.5 text-xs font-bold text-gray-300 hover:text-white bg-[#171717] hover:bg-[#222222] border border-[#2a2a2a] hover:border-[#d4af37]/60 py-2 px-4 rounded-full uppercase tracking-wider transition-all active:scale-95"
          >
            <User size={13} className="text-[#d4af37]" />
            <span>Ingresar</span>
          </button>

        </div>

        {/* 3. Botón Hamburguesa Móvil */}
        <button 
          type="button"
          onClick={() => setNavOpen(!navOpen)} 
          className="md:hidden text-[#d4af37] p-1.5 hover:bg-[#1a1a1a] rounded-xl transition-colors"
          aria-label="Abrir menú"
        >
          {navOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

      </div>

      {/* Drawer Móvil */}
      {navOpen && (
        <div className="md:hidden bg-[#0c0c0c]/98 backdrop-blur-xl border-b border-[#222222] px-5 py-5 space-y-4 animate-fadeIn">
          <div className="space-y-1">
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block px-2 mb-1">
              Explorar el Studio
            </span>
            {dropdownItems.map((item) => {
              const ItemIcon = item.icon;
              return (
                <a 
                  key={item.name} 
                  href={item.href} 
                  onClick={() => setNavOpen(false)} 
                  className="flex items-center gap-3 text-xs font-semibold tracking-wider text-gray-300 hover:text-[#d4af37] py-2 px-2 rounded-xl hover:bg-white/5 transition-colors"
                >
                  <ItemIcon size={14} className="text-[#d4af37]" />
                  <span>{item.name}</span>
                </a>
              );
            })}

            <a 
              href="#reserva" 
              onClick={(e) => {
                e.preventDefault();
                setNavOpen(false);
                onLoginClick?.();
              }} 
              className="flex items-center gap-3 text-xs font-semibold tracking-wider text-gray-300 hover:text-[#d4af37] py-2 px-2 rounded-xl hover:bg-white/5 transition-colors"
            >
              <Crown size={14} className="text-[#d4af37]" />
              <span>Club de Socios</span>
            </a>
          </div>

          <div className="pt-2 border-t border-[#222222]">
            <button
              type="button"
              onClick={() => { setNavOpen(false); onLoginClick?.(); }}
              className="w-full flex items-center justify-center gap-2 bg-[#171717] border border-[#2a2a2a] text-white font-bold py-2.5 rounded-xl text-xs tracking-wider uppercase transition-all active:scale-95"
            >
              <User size={13} className="text-[#d4af37]" />
              <span>Acceso Socios</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
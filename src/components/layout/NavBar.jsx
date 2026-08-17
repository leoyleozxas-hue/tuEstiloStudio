// src/components/layout/Navbar.jsx
import React, { useState, useEffect, useRef } from 'react';
import { 
  Menu, X, ChevronDown, Scissors, Users, 
  Trophy, MapPin, Crown, User, Calendar
} from 'lucide-react';
import { studioData } from '../../data/mockData';
import logoImg from '../../assets/logo.png';

export default function Navbar({ onBookClick, onSociosClick, onLoginClick }) {
  const [navOpen, setNavOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hideReserveBtn, setHideReserveBtn] = useState(true);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setScrolled(scrollY > 20);

      const heroThreshold = 350;
      const reservaEl = document.getElementById('reserva');
      let inReservaSection = false;

      if (reservaEl) {
        const rect = reservaEl.getBoundingClientRect();
        if (rect.top <= window.innerHeight * 0.5 && rect.bottom >= window.innerHeight * 0.3) {
          inReservaSection = true;
        }
      }

      setHideReserveBtn(scrollY < heroThreshold || inReservaSection);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    { name: 'Nuestros Servicios', href: '#servicios', icon: Scissors, desc: 'Cortes, perfilado de barba y combos' },
    { name: 'Profesionales', href: '#equipo', icon: Users, desc: 'Equipo de estilistas y barberos' },
    { name: 'El Studio & Lounge', href: '#studio', icon: Trophy, desc: 'Mesa de pool, bar y café' },
    { name: 'Ubicación & Contacto', href: '#ubicacion', icon: MapPin, desc: 'Horarios y cómo llegar' }
  ];

  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-[#0c0c0c]/95 backdrop-blur-md border-b border-[#222222] py-2.5 sm:py-3 shadow-2xl' 
        : 'bg-transparent border-b border-white/5 py-3.5 sm:py-4'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between">
        
        {/* Logo */}
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

        {/* Menú Desktop */}
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

          {/* Enlace Directo Club de Socios (Registro) */}
          <button
            type="button"
            onClick={onSociosClick}
            className="flex items-center gap-1.5 text-gray-300 hover:text-[#d4af37] transition-colors py-1.5 px-2 uppercase tracking-widest text-xs font-bold"
          >
            <Crown size={13} className="text-[#d4af37]" />
            <span>Club de Socios</span>
          </button>

          {/* Botón Ingresar (Login) */}
          <button
            type="button"
            onClick={onLoginClick}
            className="flex items-center gap-1.5 text-xs font-bold text-gray-300 hover:text-white bg-[#171717] hover:bg-[#222222] border border-[#2a2a2a] hover:border-[#d4af37]/60 py-2 px-3.5 rounded-full uppercase tracking-wider transition-all active:scale-95"
          >
            <User size={13} className="text-[#d4af37]" />
            <span>Ingresar</span>
          </button>

          {/* Botón Reservar */}
          <div className={`transition-all duration-300 ${
            hideReserveBtn 
              ? 'opacity-0 scale-90 pointer-events-none w-0 overflow-hidden m-0 p-0' 
              : 'opacity-100 scale-100 pointer-events-auto'
          }`}>
            <button 
              type="button"
              onClick={onBookClick}
              className="flex items-center gap-1.5 bg-[#d4af37] hover:bg-[#b89628] text-black font-bold text-xs py-2 px-4.5 rounded-full tracking-widest uppercase transition-all shadow-md shadow-[#d4af37]/20 active:scale-95 whitespace-nowrap"
            >
              <Calendar size={13} />
              <span>RESERVAR</span>
            </button>
          </div>

        </div>

        {/* Botón Móvil Hamburguesa */}
        <button 
          type="button"
          onClick={() => setNavOpen(!navOpen)} 
          className="md:hidden text-[#d4af37] p-1.5 hover:bg-[#1a1a1a] rounded-xl transition-colors"
        >
          {navOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

      </div>

      {/* Drawer Móvil */}
      {navOpen && (
        <div className="md:hidden bg-[#0c0c0c]/98 backdrop-blur-xl border-b border-[#222222] px-5 py-5 space-y-4 animate-fadeIn">
          <div className="space-y-1">
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

            <button 
              type="button"
              onClick={() => { setNavOpen(false); onSociosClick?.(); }} 
              className="w-full flex items-center gap-3 text-xs font-semibold tracking-wider text-gray-300 hover:text-[#d4af37] py-2 px-2 rounded-xl hover:bg-white/5 transition-colors text-left"
            >
              <Crown size={14} className="text-[#d4af37]" />
              <span>Club de Socios</span>
            </button>
          </div>

          <div className="pt-2 border-t border-[#222222] grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => { setNavOpen(false); onLoginClick?.(); }}
              className="flex items-center justify-center gap-1.5 bg-[#171717] border border-[#2a2a2a] text-white font-bold py-2.5 rounded-xl text-xs tracking-wider uppercase transition-all active:scale-95"
            >
              <User size={13} className="text-[#d4af37]" />
              <span>Ingresar</span>
            </button>

            <button 
              type="button"
              onClick={() => { setNavOpen(false); onBookClick?.(); }}
              className="flex items-center justify-center gap-1.5 bg-[#d4af37] hover:bg-[#b89628] text-black font-bold py-2.5 rounded-xl text-xs tracking-widest uppercase transition-all shadow-md active:scale-95"
            >
              <Calendar size={13} />
              <span>RESERVAR</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
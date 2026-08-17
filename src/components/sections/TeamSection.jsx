// src/components/sections/TeamSection.jsx
import React from 'react';
import { UserCheck, Scissors } from 'lucide-react';
import { barbersData } from '../../data/mockData';

export default function TeamSection({ onSelectBarber }) {
  const teamMembers = barbersData.filter(b => b.id !== 'any');

  return (
    <section id="equipo" className="py-8 sm:py-10 px-4 max-w-7xl mx-auto scroll-mt-20">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 sm:mb-8 gap-3">
        <div>
          <span className="text-[10px] font-bold tracking-[0.3em] text-[#d4af37] uppercase block mb-1">
            PROFESIONALES
          </span>
          <h2 className="text-2xl sm:text-4xl font-serif font-bold text-white tracking-tight">
            Nuestro Equipo
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-gray-400 max-w-md">
          Especialistas apasionados por el detalle, la precisión y la atención de primer nivel.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {teamMembers.map((barber) => (
          <div
            key={barber.id}
            className="group bg-[#121212] border border-[#222222] hover:border-[#d4af37]/60 rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between transition-all duration-300 hover:-translate-y-1"
          >
            {/* Foto con altura balanceada */}
            <div className="relative h-56 overflow-hidden bg-[#181818]">
              <img
                src={barber.image}
                alt={barber.name}
                className="w-full h-full object-cover object-center filter brightness-95 group-hover:brightness-105 group-hover:scale-105 transition-all duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-transparent" />
              
              <span className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm border border-white/10 p-1.5 rounded-full text-[#d4af37]">
                <Scissors size={13} />
              </span>
            </div>

            <div className="p-5 flex flex-col flex-grow justify-between">
              <div>
                <h3 className="text-lg font-serif font-bold text-white group-hover:text-[#d4af37] transition-colors">
                  {barber.name}
                </h3>
                <p className="text-xs text-gray-400 mt-0.5 mb-3">
                  {barber.role}
                </p>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {barber.specialties?.map((spec, sIdx) => (
                    <span
                      key={sIdx}
                      className="text-[10px] bg-[#1a1a1a] border border-[#2a2a2a] text-gray-300 px-2 py-0.5 rounded-full"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={() => onSelectBarber?.(barber.id)}
                className="w-full flex items-center justify-center gap-1.5 bg-[#181818] group-hover:bg-[#d4af37] text-gray-300 group-hover:text-black font-bold py-2 px-3 rounded-xl text-xs tracking-wider uppercase border border-[#262626] group-hover:border-[#d4af37] transition-all duration-300 shadow-md active:scale-95"
              >
                <UserCheck size={13} />
                <span>Reservar con {barber.name}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
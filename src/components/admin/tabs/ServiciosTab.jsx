// src/components/admin/tabs/ServiciosTab.jsx
import React from 'react';
import { Plus, Edit2, Trash2, Power, Scissors, Clock, Check } from 'lucide-react';

export function ServiciosTab({ servicios = [], onNewService, onEditService, onToggleActive, onDeleteService }) {
  return (
    <div className="space-y-5 animate-fadeIn">
      
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-[#131313] border border-[#242424] p-4 rounded-2xl">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Scissors className="text-[#d4af37]" size={18} />
            <span>Catálogo de Servicios & Precios</span>
          </h2>
          <p className="text-xs text-gray-400">Administra los servicios visibles en el carrusel y en el motor de reservas de la web.</p>
        </div>

        <button
          onClick={onNewService}
          className="flex items-center gap-1.5 bg-[#d4af37] text-black font-bold px-3.5 py-2.5 rounded-xl text-xs uppercase tracking-wider shadow-lg active:scale-95 transition-all"
        >
          <Plus size={14} />
          <span>Nuevo Servicio</span>
        </button>
      </div>

      {/* Grid de Tarjetas de Servicios */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {servicios.map((srv) => (
          <div 
            key={srv.id}
            className={`bg-[#131313] border rounded-2xl overflow-hidden flex flex-col justify-between transition-all ${
              srv.activo ? 'border-[#262626]' : 'border-red-500/30 opacity-60'
            }`}
          >
            {/* Cabecera / Imagen */}
            {srv.image_url && (
              <div className="h-32 w-full relative overflow-hidden bg-black">
                <img 
                  src={srv.image_url} 
                  alt={srv.nombre} 
                  className="w-full h-full object-cover brightness-90"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#131313] via-transparent to-transparent" />
                
                {srv.badge && (
                  <span className="absolute top-2.5 left-2.5 bg-[#d4af37] text-black font-bold text-[9px] uppercase px-2 py-0.5 rounded-full shadow">
                    {srv.badge}
                  </span>
                )}
              </div>
            )}

            <div className="p-4 space-y-2.5 flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-bold text-white leading-tight">{srv.nombre}</h3>
                  <div className="flex items-center gap-1 text-[11px] text-gray-400 mt-0.5">
                    <Clock size={11} className="text-[#d4af37]" />
                    <span>{srv.duracion_minutos} minutos</span>
                  </div>
                </div>
                <span className="text-base font-serif font-bold text-[#d4af37]">${srv.precio}</span>
              </div>

              {srv.descripcion && (
                <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">{srv.descripcion}</p>
              )}

              {/* Tags de características */}
              {srv.features && Array.isArray(srv.features) && srv.features.length > 0 && (
                <div className="space-y-1 pt-1.5 border-t border-[#222222]">
                  {srv.features.slice(0, 2).map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-[10px] text-gray-300">
                      <Check size={10} className="text-[#d4af37] shrink-0" />
                      <span className="truncate">{feat}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Acciones */}
            <div className="p-3 border-t border-[#222222] bg-[#101010] flex justify-between items-center">
              <button
                onClick={() => onToggleActive(srv)}
                className={`flex items-center gap-1.5 text-[10px] uppercase font-bold px-2.5 py-1 rounded-lg border transition-all ${
                  srv.activo 
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                    : 'bg-gray-800 text-gray-400 border-gray-700'
                }`}
              >
                <Power size={11} />
                <span>{srv.activo ? 'Visible en Web' : 'Pausado'}</span>
              </button>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => onEditService(srv)}
                  className="p-1.5 bg-[#1b1b1b] hover:bg-[#252525] text-gray-300 hover:text-white rounded-lg border border-[#2f2f2f] transition-colors"
                  title="Editar Servicio"
                >
                  <Edit2 size={13} />
                </button>
                <button
                  onClick={() => onDeleteService(srv.id)}
                  className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg border border-red-500/30 transition-colors"
                  title="Eliminar Servicio"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}

export default ServiciosTab;
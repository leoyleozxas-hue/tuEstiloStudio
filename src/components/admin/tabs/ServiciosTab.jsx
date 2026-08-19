// src/components/admin/tabs/ServiciosTab.jsx
import React from 'react';
import { Plus, Edit2, Trash2, Power } from 'lucide-react';

export function ServiciosTab({ servicios, onNewService, onEditService, onToggleActive, onDeleteService }) {
  return (
    <div className="space-y-5 animate-fadeIn">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-base font-bold text-white">Catálogo de Servicios</h2>
          <p className="text-xs text-gray-400">Los cambios que hagas aquí se actualizan inmediatamente en el formulario de la web.</p>
        </div>
        <button
          onClick={onNewService}
          className="flex items-center gap-1.5 bg-[#d4af37] text-black font-bold px-3.5 py-2 rounded-xl text-xs uppercase tracking-wider shadow-lg active:scale-95 transition-all"
        >
          <Plus size={14} />
          <span>Nuevo Servicio</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {servicios.map((srv) => (
          <div 
            key={srv.id}
            className={`bg-[#131313] border p-4 rounded-2xl space-y-3 transition-all ${
              srv.activo ? 'border-[#262626]' : 'border-red-500/30 opacity-60'
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-sm font-bold text-white">{srv.nombre}</h3>
                <p className="text-xs text-gray-400">{srv.duracion_minutos} minutos</p>
              </div>
              <span className="text-base font-serif font-bold text-[#d4af37]">${srv.precio}</span>
            </div>

            {srv.descripcion && (
              <p className="text-xs text-gray-400 leading-relaxed">{srv.descripcion}</p>
            )}

            <div className="flex justify-between items-center pt-2 border-t border-[#222222]">
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
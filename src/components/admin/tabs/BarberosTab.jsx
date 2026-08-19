// src/components/admin/tabs/BarberosTab.jsx
import React from 'react';
import { Plus, Edit2, Trash2, Power, Clock } from 'lucide-react';

export function BarberosTab({ 
  barberos = [], 
  asistencias = {}, 
  onNewBarber, 
  onEditBarber, 
  onToggleActive, 
  onDeleteBarber,
  onUpdateAsistencia 
}) {
  return (
    <div className="space-y-5 animate-fadeIn">
      
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-[#131313] border border-[#242424] p-4 rounded-2xl">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span>Equipo de Barberos & Control de Asistencia</span>
          </h2>
          <p className="text-xs text-gray-400">Gestiona los horarios de entrada/salida y la presencia diaria del equipo.</p>
        </div>

        <button
          onClick={onNewBarber}
          className="flex items-center gap-1.5 bg-[#d4af37] text-black font-bold px-3.5 py-2.5 rounded-xl text-xs uppercase tracking-wider shadow-lg active:scale-95 transition-all"
        >
          <Plus size={14} />
          <span>Agregar Barbero</span>
        </button>
      </div>

      {/* Grid de Tarjetas de Barberos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {barberos.map((b) => {
          const inicio = b.hora_inicio ? b.hora_inicio.slice(0, 5) : '10:00';
          const fin = b.hora_fin ? b.hora_fin.slice(0, 5) : '20:00';
          const estadoAsistencia = asistencias[b.id] || 'presente';

          return (
            <div 
              key={b.id}
              className={`bg-[#131313] border p-4 rounded-2xl space-y-3 transition-all ${
                !b.activo 
                  ? 'border-red-500/30 opacity-60' 
                  : estadoAsistencia === 'ausente'
                  ? 'border-amber-500/40'
                  : 'border-[#262626]'
              }`}
            >
              {/* Info Principal */}
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-[#1e190d] border border-[#d4af37] text-[#d4af37] font-bold flex items-center justify-center text-sm shadow-md shrink-0">
                  {b.nombre ? b.nombre.charAt(0).toUpperCase() : 'B'}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-white truncate">{b.nombre}</h3>
                  <p className="text-xs text-gray-400 truncate">{b.telefono || 'Sin teléfono'}</p>
                </div>
              </div>

              {/* Horario de Atención */}
              <div className="bg-[#1a1a1a] p-2.5 rounded-xl border border-[#262626] text-[11px] text-gray-300 flex items-center justify-between">
                <span className="flex items-center gap-1 text-gray-400">
                  <Clock size={12} className="text-[#d4af37]" />
                  <span>Turno habitual:</span>
                </span>
                <strong className="text-white font-mono">{inicio} a {fin} hs</strong>
              </div>

              {/* Control Rápido de Asistencia de Hoy */}
              <div className="bg-[#181818] p-2.5 rounded-xl border border-[#282828] space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-gray-400 block">
                  Estado Hoy:
                </span>
                <div className="grid grid-cols-3 gap-1 text-[10px] font-bold">
                  <button
                    type="button"
                    onClick={() => onUpdateAsistencia(b.id, 'presente')}
                    className={`py-1.5 rounded-lg border transition-all ${
                      estadoAsistencia === 'presente'
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-sm'
                        : 'bg-[#222222] text-gray-400 border-transparent hover:text-white'
                    }`}
                  >
                    Presente
                  </button>

                  <button
                    type="button"
                    onClick={() => onUpdateAsistencia(b.id, 'ausente')}
                    className={`py-1.5 rounded-lg border transition-all ${
                      estadoAsistencia === 'ausente'
                        ? 'bg-red-500/20 text-red-400 border-red-500/40 shadow-sm'
                        : 'bg-[#222222] text-gray-400 border-transparent hover:text-white'
                    }`}
                  >
                    Falta / Off
                  </button>

                  <button
                    type="button"
                    onClick={() => onUpdateAsistencia(b.id, 'franco')}
                    className={`py-1.5 rounded-lg border transition-all ${
                      estadoAsistencia === 'franco'
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 shadow-sm'
                        : 'bg-[#222222] text-gray-400 border-transparent hover:text-white'
                    }`}
                  >
                    Franco
                  </button>
                </div>
              </div>

              {/* Footer de Acciones */}
              <div className="flex justify-between items-center pt-2 border-t border-[#222222]">
                <button
                  onClick={() => onToggleActive(b)}
                  className={`flex items-center gap-1.5 text-[10px] uppercase font-bold px-2.5 py-1 rounded-lg border transition-all ${
                    b.activo 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                      : 'bg-gray-800 text-gray-400 border-gray-700'
                  }`}
                >
                  <Power size={11} />
                  <span>{b.activo ? 'Habilitado Web' : 'Deshabilitado'}</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onEditBarber(b)}
                    className="p-1.5 bg-[#1b1b1b] hover:bg-[#252525] text-gray-300 hover:text-white rounded-lg border border-[#2f2f2f] transition-colors"
                    title="Editar Barbero & Horario"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    onClick={() => onDeleteBarber(b.id)}
                    className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg border border-red-500/30 transition-colors"
                    title="Eliminar Barbero"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}

export default BarberosTab;
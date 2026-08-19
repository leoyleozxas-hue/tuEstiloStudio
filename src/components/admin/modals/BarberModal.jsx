// src/components/admin/modals/BarberModal.jsx
import React from 'react';

export function BarberModal({ isOpen, onClose, onSave, editingBarber, barberForm, setBarberForm }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#131313] border border-[#2a2a2a] w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4">
        <div>
          <span className="text-[10px] uppercase font-bold text-[#d4af37] tracking-wider block">Equipo & Horarios</span>
          <h3 className="text-base font-bold text-white">
            {editingBarber ? 'Editar Barbero & Horario' : 'Registrar Nuevo Barbero'}
          </h3>
        </div>

        <form onSubmit={onSave} className="space-y-3 text-xs">
          <div>
            <label className="block text-gray-400 uppercase font-bold mb-1 text-[10px]">Nombre Completo *</label>
            <input
              type="text"
              required
              placeholder="Ej: Mateo Benítez"
              value={barberForm.nombre}
              onChange={(e) => setBarberForm({ ...barberForm, nombre: e.target.value })}
              className="w-full bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl px-3 py-2 text-white focus:border-[#d4af37] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-400 uppercase font-bold mb-1 text-[10px]">Teléfono (WhatsApp)</label>
              <input
                type="tel"
                placeholder="099 123 456"
                value={barberForm.telefono}
                onChange={(e) => setBarberForm({ ...barberForm, telefono: e.target.value })}
                className="w-full bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl px-3 py-2 text-white focus:border-[#d4af37] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-400 uppercase font-bold mb-1 text-[10px]">Email</label>
              <input
                type="email"
                placeholder="mateo@barberia.com"
                value={barberForm.email}
                onChange={(e) => setBarberForm({ ...barberForm, email: e.target.value })}
                className="w-full bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl px-3 py-2 text-white focus:border-[#d4af37] focus:outline-none"
              />
            </div>
          </div>

          {/* Horarios de Entrada y Salida */}
          <div className="bg-[#181818] border border-[#282828] p-3 rounded-2xl space-y-2">
            <label className="block text-gray-300 uppercase font-bold text-[10px]">
              Horario de Atención (Disponibilidad) *
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <span className="text-[10px] text-gray-400 block mb-0.5">Hora Entrada</span>
                <input
                  type="time"
                  required
                  value={barberForm.hora_inicio || '10:00'}
                  onChange={(e) => setBarberForm({ ...barberForm, hora_inicio: e.target.value })}
                  className="w-full bg-[#131313] border border-[#303030] rounded-xl px-3 py-2 text-white focus:border-[#d4af37] focus:outline-none font-mono"
                />
              </div>

              <div>
                <span className="text-[10px] text-gray-400 block mb-0.5">Hora Salida</span>
                <input
                  type="time"
                  required
                  value={barberForm.hora_fin || '20:00'}
                  onChange={(e) => setBarberForm({ ...barberForm, hora_fin: e.target.value })}
                  className="w-full bg-[#131313] border border-[#303030] rounded-xl px-3 py-2 text-white focus:border-[#d4af37] focus:outline-none font-mono"
                />
              </div>
            </div>
            <p className="text-[10px] text-gray-500">
              * Los clientes solo podrán reservar turnos con este barbero dentro de este rango en la web.
            </p>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-[#222222] text-gray-300 font-bold hover:bg-[#2a2a2a] transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-[#d4af37] text-black font-bold hover:bg-[#c49f2e] transition-colors shadow-md uppercase tracking-wider"
            >
              Guardar Barbero
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default BarberModal;
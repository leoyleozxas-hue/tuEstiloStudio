// src/components/admin/modals/ServiceModal.jsx
import React from 'react';

export function ServiceModal({ isOpen, onClose, onSave, editingService, serviceForm, setServiceForm }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#131313] border border-[#2a2a2a] w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4">
        <h3 className="text-base font-bold text-white">
          {editingService ? 'Editar Servicio' : 'Nuevo Servicio'}
        </h3>

        <form onSubmit={onSave} className="space-y-3 text-xs">
          <div>
            <label className="block text-gray-400 uppercase font-bold mb-1 text-[10px]">Nombre del Servicio *</label>
            <input
              type="text"
              required
              placeholder="Ej: Corte Degradé + Barba"
              value={serviceForm.nombre}
              onChange={(e) => setServiceForm({ ...serviceForm, nombre: e.target.value })}
              className="w-full bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl px-3 py-2 text-white focus:border-[#d4af37] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-400 uppercase font-bold mb-1 text-[10px]">Precio ($) *</label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="450"
                value={serviceForm.precio}
                onChange={(e) => setServiceForm({ ...serviceForm, precio: e.target.value })}
                className="w-full bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl px-3 py-2 text-white focus:border-[#d4af37] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-400 uppercase font-bold mb-1 text-[10px]">Duración (Minutos) *</label>
              <select
                value={serviceForm.duracion_minutos}
                onChange={(e) => setServiceForm({ ...serviceForm, duracion_minutos: e.target.value })}
                className="w-full bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl px-3 py-2 text-white focus:border-[#d4af37] focus:outline-none"
              >
                <option value={15}>15 min</option>
                <option value={30}>30 min</option>
                <option value={45}>45 min</option>
                <option value={60}>60 min (1 h)</option>
                <option value={90}>90 min (1.5 h)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-gray-400 uppercase font-bold mb-1 text-[10px]">Descripción</label>
            <textarea
              placeholder="Detalle del servicio..."
              value={serviceForm.descripcion}
              onChange={(e) => setServiceForm({ ...serviceForm, descripcion: e.target.value })}
              rows={2}
              className="w-full bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl px-3 py-2 text-white focus:border-[#d4af37] focus:outline-none"
            />
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
              className="flex-1 py-2.5 rounded-xl bg-[#d4af37] text-black font-bold hover:bg-[#c49f2e] transition-colors shadow-md"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
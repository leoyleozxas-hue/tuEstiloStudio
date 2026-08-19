// src/components/admin/modals/PromoModal.jsx
import React from 'react';

export function PromoModal({ isOpen, onClose, onSave, editingPromo, promoForm, setPromoForm }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#131313] border border-[#2a2a2a] w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4">
        <h3 className="text-base font-bold text-white">
          {editingPromo ? 'Editar Promoción' : 'Nueva Promoción'}
        </h3>

        <form onSubmit={onSave} className="space-y-3 text-xs">
          <div>
            <label className="block text-gray-400 uppercase font-bold mb-1 text-[10px]">Título de la Promoción *</label>
            <input
              type="text"
              required
              placeholder="Ej: 20% OFF en Efectivo o Transferencia"
              value={promoForm.titulo}
              onChange={(e) => setPromoForm({ ...promoForm, titulo: e.target.value })}
              className="w-full bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl px-3 py-2 text-white focus:border-[#d4af37] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-400 uppercase font-bold mb-1 text-[10px]">Descuento / Etiqueta *</label>
              <input
                type="text"
                required
                placeholder="Ej: 20% OFF o 2x1"
                value={promoForm.descuento}
                onChange={(e) => setPromoForm({ ...promoForm, descuento: e.target.value })}
                className="w-full bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl px-3 py-2 text-white focus:border-[#d4af37] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-400 uppercase font-bold mb-1 text-[10px]">Código (Opcional)</label>
              <input
                type="text"
                placeholder="Ej: SOCIOVIP"
                value={promoForm.codigo}
                onChange={(e) => setPromoForm({ ...promoForm, codigo: e.target.value.toUpperCase() })}
                className="w-full bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl px-3 py-2 text-white focus:border-[#d4af37] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-400 uppercase font-bold mb-1 text-[10px]">Descripción / Condiciones</label>
            <textarea
              placeholder="Válido de martes a jueves para socios registrados..."
              value={promoForm.descripcion}
              onChange={(e) => setPromoForm({ ...promoForm, descripcion: e.target.value })}
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
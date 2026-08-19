// src/components/admin/modals/StockModal.jsx
import React from 'react';

export function StockModal({ isOpen, onClose, onSave, editingStock, stockForm, setStockForm }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#131313] border border-[#2a2a2a] w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4">
        <h3 className="text-base font-bold text-white">
          {editingStock ? 'Editar Producto/Insumo' : 'Nuevo Producto / Insumo'}
        </h3>

        <form onSubmit={onSave} className="space-y-3 text-xs">
          <div>
            <label className="block text-gray-400 uppercase font-bold mb-1 text-[10px]">Nombre del Producto / Material *</label>
            <input
              type="text"
              required
              placeholder="Ej: Cera Mate 100g"
              value={stockForm.nombre}
              onChange={(e) => setStockForm({ ...stockForm, nombre: e.target.value })}
              className="w-full bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl px-3 py-2 text-white focus:border-[#d4af37] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-400 uppercase font-bold mb-1 text-[10px]">Tipo *</label>
              <select
                value={stockForm.tipo}
                onChange={(e) => setStockForm({ ...stockForm, tipo: e.target.value })}
                className="w-full bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl px-3 py-2 text-white focus:border-[#d4af37] focus:outline-none"
              >
                <option value="Venta">Producto para Venta</option>
                <option value="Insumo">Insumo de Trabajo</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-400 uppercase font-bold mb-1 text-[10px]">Cantidad Inicial *</label>
              <input
                type="number"
                required
                placeholder="10"
                value={stockForm.stock}
                onChange={(e) => setStockForm({ ...stockForm, stock: e.target.value })}
                className="w-full bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl px-3 py-2 text-white focus:border-[#d4af37] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-400 uppercase font-bold mb-1 text-[10px]">Stock Mínimo (Alerta)</label>
              <input
                type="number"
                placeholder="3"
                value={stockForm.min_stock}
                onChange={(e) => setStockForm({ ...stockForm, min_stock: e.target.value })}
                className="w-full bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl px-3 py-2 text-white focus:border-[#d4af37] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-400 uppercase font-bold mb-1 text-[10px]">Precio Costo ($)</label>
              <input
                type="number"
                placeholder="250"
                value={stockForm.precio_costo}
                onChange={(e) => setStockForm({ ...stockForm, precio_costo: e.target.value })}
                className="w-full bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl px-3 py-2 text-white focus:border-[#d4af37] focus:outline-none"
              />
            </div>
          </div>

          {stockForm.tipo === 'Venta' && (
            <div>
              <label className="block text-gray-400 uppercase font-bold mb-1 text-[10px]">Precio de Venta al Público ($)</label>
              <input
                type="number"
                placeholder="500"
                value={stockForm.precio_venta}
                onChange={(e) => setStockForm({ ...stockForm, precio_venta: e.target.value })}
                className="w-full bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl px-3 py-2 text-white focus:border-[#d4af37] focus:outline-none"
              />
            </div>
          )}

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
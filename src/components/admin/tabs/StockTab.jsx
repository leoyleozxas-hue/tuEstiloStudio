// src/components/admin/tabs/StockTab.jsx
import React from 'react';
import { Package, Plus, Edit2, Trash2, AlertTriangle } from 'lucide-react';

export function StockTab({ inventario, onNewStock, onEditStock, onAdjustStock, onDeleteStock }) {
  return (
    <div className="space-y-5 animate-fadeIn">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Package className="text-[#d4af37]" size={18} /> Stock de Productos & Insumos
          </h2>
          <p className="text-xs text-gray-400">Control de cantidades disponibles para venta y materiales de uso diario.</p>
        </div>
        <button
          onClick={onNewStock}
          className="flex items-center gap-1.5 bg-[#d4af37] text-black font-bold px-3.5 py-2 rounded-xl text-xs uppercase tracking-wider shadow-lg active:scale-95 transition-all"
        >
          <Plus size={14} />
          <span>Agregar Producto</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {inventario.map((item) => {
          const bajoStock = item.stock <= item.min_stock;
          return (
            <div 
              key={item.id}
              className={`bg-[#131313] border p-4 rounded-2xl space-y-3 transition-all ${
                bajoStock ? 'border-amber-500/40' : 'border-[#262626]'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className={`text-[9px] uppercase font-extrabold px-2 py-0.5 rounded ${
                    item.tipo === 'Venta' ? 'bg-[#d4af37]/15 text-[#d4af37]' : 'bg-blue-500/15 text-blue-400'
                  }`}>
                    {item.tipo}
                  </span>
                  <h3 className="text-sm font-bold text-white mt-1.5">{item.nombre}</h3>
                </div>
                {item.precio_venta > 0 && (
                  <span className="text-sm font-serif font-bold text-[#d4af37]">${item.precio_venta}</span>
                )}
              </div>

              <div className="bg-[#1a1a1a] p-2.5 rounded-xl border border-[#282828] text-xs space-y-1">
                <div className="flex justify-between text-gray-300">
                  <span>Stock Mínimo Alerta:</span>
                  <strong className="text-gray-400">{item.min_stock} u.</strong>
                </div>
                {item.precio_costo > 0 && (
                  <div className="flex justify-between text-gray-300">
                    <span>Costo reposición:</span>
                    <strong className="text-gray-400">${item.precio_costo} UYU</strong>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-[#222222]">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">Stock:</span>
                  <span className={`text-base font-bold ${bajoStock ? 'text-amber-400' : 'text-white'}`}>
                    {item.stock} u.
                  </span>
                  {bajoStock && (
                    <span className="text-[10px] text-red-400 flex items-center gap-0.5 bg-red-500/10 px-1.5 py-0.5 rounded">
                      <AlertTriangle size={11} /> Reponer
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => onAdjustStock(item.id, -1)}
                    className="w-7 h-7 rounded-lg bg-[#1b1b1b] text-gray-300 hover:text-white hover:bg-[#252525] border border-[#2e2e2e] flex items-center justify-center font-bold text-xs"
                    title="Restar 1"
                  >
                    -
                  </button>
                  <button 
                    onClick={() => onAdjustStock(item.id, 1)}
                    className="w-7 h-7 rounded-lg bg-[#1b1b1b] text-gray-300 hover:text-white hover:bg-[#252525] border border-[#2e2e2e] flex items-center justify-center font-bold text-xs"
                    title="Sumar 1"
                  >
                    +
                  </button>
                  <button 
                    onClick={() => onEditStock(item)}
                    className="p-1.5 bg-[#1b1b1b] hover:bg-[#252525] text-gray-300 hover:text-white rounded-lg border border-[#2f2f2f] transition-colors ml-1"
                    title="Editar Producto"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button 
                    onClick={() => onDeleteStock(item.id)}
                    className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg border border-red-500/30 transition-colors"
                    title="Eliminar Producto"
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
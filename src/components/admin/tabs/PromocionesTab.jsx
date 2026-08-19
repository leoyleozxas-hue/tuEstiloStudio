// src/components/admin/tabs/PromocionesTab.jsx
import React from 'react';
import { Tag, Plus, Edit2, Trash2, Power } from 'lucide-react';

export function PromocionesTab({ promociones, onNewPromo, onEditPromo, onToggleActive, onDeletePromo }) {
  return (
    <div className="space-y-5 animate-fadeIn">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Tag className="text-[#d4af37]" size={18} /> Promociones & Beneficios Club
          </h2>
          <p className="text-xs text-gray-400">Gestiona las ofertas especiales y descuentos para socios en la web.</p>
        </div>
        <button
          onClick={onNewPromo}
          className="flex items-center gap-1.5 bg-[#d4af37] text-black font-bold px-3.5 py-2 rounded-xl text-xs uppercase tracking-wider shadow-lg active:scale-95 transition-all"
        >
          <Plus size={14} />
          <span>Nueva Promoción</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {promociones.map((promo) => (
          <div 
            key={promo.id}
            className={`bg-[#131313] border p-4 rounded-2xl space-y-3 transition-all ${
              promo.activo ? 'border-[#262626]' : 'border-red-500/30 opacity-60'
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[9px] uppercase font-extrabold px-2 py-0.5 rounded bg-[#d4af37]/15 text-[#d4af37]">
                  {promo.codigo || 'PROMO'}
                </span>
                <h3 className="text-sm font-bold text-white mt-1.5">{promo.titulo}</h3>
              </div>
              <span className="text-base font-serif font-bold text-[#d4af37]">{promo.descuento}</span>
            </div>

            {promo.descripcion && (
              <p className="text-xs text-gray-400 leading-relaxed">{promo.descripcion}</p>
            )}

            <div className="flex justify-between items-center pt-2 border-t border-[#222222]">
              <button
                onClick={() => onToggleActive(promo)}
                className={`flex items-center gap-1.5 text-[10px] uppercase font-bold px-2.5 py-1 rounded-lg border transition-all ${
                  promo.activo 
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                    : 'bg-gray-800 text-gray-400 border-gray-700'
                }`}
              >
                <Power size={11} />
                <span>{promo.activo ? 'Activa en Web' : 'Pausada'}</span>
              </button>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => onEditPromo(promo)}
                  className="p-1.5 bg-[#1b1b1b] hover:bg-[#252525] text-gray-300 hover:text-white rounded-lg border border-[#2f2f2f] transition-colors"
                  title="Editar Promo"
                >
                  <Edit2 size={13} />
                </button>
                <button
                  onClick={() => onDeletePromo(promo.id)}
                  className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg border border-red-500/30 transition-colors"
                  title="Eliminar Promo"
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

export default PromocionesTab;
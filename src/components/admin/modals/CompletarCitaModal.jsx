// src/components/admin/modals/CompletarCitaModal.jsx
import React, { useState, useEffect } from 'react';
import { CheckCircle2, HeartHandshake, CreditCard, Banknote, Smartphone, ArrowRightLeft } from 'lucide-react';

export function CompletarCitaModal({ isOpen, onClose, onConfirm, cita }) {
  const [metodoPago, setMetodoPago] = useState('Efectivo');
  const [propina, setPropina] = useState('');

  useEffect(() => {
    if (isOpen) {
      setMetodoPago('Efectivo');
      setPropina('');
    }
  }, [isOpen, cita]);

  if (!isOpen || !cita) return null;

  const montoBase = Number(cita.servicios?.precio || 0);
  const propinaNum = Number(propina || 0);
  const totalCobro = montoBase + propinaNum;

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(cita.id, {
      metodo_pago: metodoPago,
      propina: propinaNum,
      total: totalCobro
    });
    onClose();
  };

  const metodos = [
    { id: 'Efectivo', label: 'Efectivo', icon: Banknote },
    { id: 'Transferencia', label: 'Transferencia', icon: ArrowRightLeft },
    { id: 'Mercado Pago', label: 'Mercado Pago', icon: Smartphone },
    { id: 'Tarjeta / Débito', label: 'Tarjeta / POS', icon: CreditCard }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#131313] border border-[#2a2a2a] w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4">
        
        <div>
          <span className="text-[10px] uppercase font-bold text-[#d4af37] tracking-wider block">Caja & Cobro</span>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <CheckCircle2 size={18} className="text-emerald-400" />
            <span>Completar y Cobrar Turno</span>
          </h3>
        </div>

        {/* Resumen del Turno */}
        <div className="bg-[#181818] border border-[#282828] rounded-2xl p-3.5 text-xs space-y-1.5">
          <div className="flex justify-between text-gray-300">
            <span>Cliente:</span>
            <strong className="text-white">{cita.cliente_nombre}</strong>
          </div>
          <div className="flex justify-between text-gray-300">
            <span>Servicio:</span>
            <span className="text-gray-200">{cita.servicios?.nombre}</span>
          </div>
          <div className="flex justify-between text-gray-300">
            <span>Barbero:</span>
            <span className="text-[#d4af37] font-semibold">{cita.barberos?.nombre}</span>
          </div>
          <div className="flex justify-between text-gray-300 pt-1 border-t border-[#242424]">
            <span>Precio del Servicio:</span>
            <strong className="text-emerald-400 font-serif text-sm">${montoBase} UYU</strong>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          
          {/* Selector de Método de Pago */}
          <div className="space-y-1.5">
            <label className="block text-gray-300 uppercase font-bold text-[10px]">
              Medio de Pago del Cliente *
            </label>
            <div className="grid grid-cols-2 gap-2">
              {metodos.map(m => {
                const isSelected = metodoPago === m.id;
                const Icon = m.icon;

                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMetodoPago(m.id)}
                    className={`p-2.5 rounded-xl border flex items-center gap-2 text-left font-bold transition-all ${
                      isSelected
                        ? `bg-[#1e1a0f] border-[#d4af37] text-white shadow-md scale-[1.02]`
                        : 'bg-[#181818] border-[#282828] text-gray-400 hover:text-white'
                    }`}
                  >
                    <Icon size={14} className={isSelected ? 'text-[#d4af37]' : 'text-gray-500'} />
                    <span className="text-xs">{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Propina */}
          <div>
            <label className="block text-gray-300 uppercase font-bold mb-1 text-[10px] flex items-center gap-1">
              <HeartHandshake size={11} className="text-purple-400" />
              <span>Propina para el Barbero ($ UYU - Opcional)</span>
            </label>
            <input
              type="number"
              min="0"
              placeholder="Ej: 50 o 100"
              value={propina}
              onChange={(e) => setPropina(e.target.value)}
              className="w-full bg-[#181818] border border-[#2e2e2e] rounded-xl px-3 py-2 text-white focus:border-purple-400 focus:outline-none font-mono text-purple-400 font-bold"
            />
          </div>

          {/* Total Final */}
          <div className="bg-[#181818] p-3 rounded-xl border border-emerald-500/30 flex justify-between items-center">
            <span className="text-xs font-bold text-gray-300">Total a Ingresar en Caja:</span>
            <strong className="text-base font-serif font-bold text-emerald-400">${totalCobro} UYU</strong>
          </div>

          <div className="flex gap-2 pt-1">
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
              Cobrar Turno
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}

export default CompletarCitaModal;
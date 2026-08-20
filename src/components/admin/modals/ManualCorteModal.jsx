// src/components/admin/modals/ManualCorteModal.jsx
import React, { useState, useEffect } from 'react';
import { DollarSign, HeartHandshake, CreditCard, Banknote, Smartphone, ArrowRightLeft } from 'lucide-react';

export function ManualCorteModal({ isOpen, onClose, onSave, barberos = [], servicios = [] }) {
  const [formData, setFormData] = useState({
    cliente_nombre: '',
    barbero_id: '',
    servicio_id: '',
    monto: '',
    propina: '',
    metodo: 'Efectivo',
    fecha: new Date().toISOString().split('T')[0],
    hora: new Date().toLocaleTimeString('es-UY', { hour: '2-digit', minute: '2-digit', hour12: false })
  });

  useEffect(() => {
    if (isOpen) {
      const defaultSrv = servicios[0] || {};
      setFormData({
        cliente_nombre: '',
        barbero_id: barberos[0]?.id || '',
        servicio_id: defaultSrv.id || '',
        monto: defaultSrv.precio ? String(defaultSrv.precio) : '450',
        propina: '',
        metodo: 'Efectivo',
        fecha: new Date().toISOString().split('T')[0],
        hora: new Date().toLocaleTimeString('es-UY', { hour: '2-digit', minute: '2-digit', hour12: false })
      });
    }
  }, [isOpen, barberos, servicios]);

  if (!isOpen) return null;

  const handleServiceChange = (e) => {
    const sId = e.target.value;
    const srv = servicios.find(s => String(s.id) === String(sId));
    setFormData(prev => ({
      ...prev,
      servicio_id: sId,
      monto: srv ? String(srv.precio) : prev.monto
    }));
  };

  const montoNum = parseFloat(formData.monto) || 0;
  const propinaNum = parseFloat(formData.propina) || 0;
  const totalNum = montoNum + propinaNum;

  const handleSubmit = (e) => {
    e.preventDefault();
    const selBarbero = barberos.find(b => String(b.id) === String(formData.barbero_id));
    const selServicio = servicios.find(s => String(s.id) === String(formData.servicio_id));

    onSave({
      cliente_nombre: formData.cliente_nombre.trim() || 'Cliente Mostrador',
      barbero_id: formData.barbero_id,
      barbero_nombre: selBarbero ? selBarbero.nombre : 'Barbero',
      servicio_id: formData.servicio_id,
      servicio_nombre: selServicio ? selServicio.nombre : 'Servicio Mostrador',
      monto: montoNum,
      propina: propinaNum,
      total: totalNum,
      metodo: formData.metodo,
      fecha: formData.fecha,
      hora: formData.hora
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
      <div className="bg-[#131313] border border-[#2a2a2a] w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div>
          <span className="text-[10px] uppercase font-bold text-[#d4af37] tracking-wider block">Caja & Mostrador</span>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <DollarSign size={18} className="text-[#d4af37]" />
            <span>Registrar Cobro en Mostrador</span>
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-400 uppercase font-bold mb-1 text-[10px]">Fecha *</label>
              <input
                type="date"
                required
                value={formData.fecha}
                onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                className="w-full bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl px-3 py-2 text-white focus:border-[#d4af37] focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-gray-400 uppercase font-bold mb-1 text-[10px]">Hora *</label>
              <input
                type="time"
                required
                value={formData.hora}
                onChange={(e) => setFormData({ ...formData, hora: e.target.value })}
                className="w-full bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl px-3 py-2 text-white focus:border-[#d4af37] focus:outline-none font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-400 uppercase font-bold mb-1 text-[10px]">Nombre del Cliente</label>
            <input
              type="text"
              placeholder="Ej: Marcelo Gómez (o dejar vacío)"
              value={formData.cliente_nombre}
              onChange={(e) => setFormData({ ...formData, cliente_nombre: e.target.value })}
              className="w-full bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl px-3 py-2 text-white focus:border-[#d4af37] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-400 uppercase font-bold mb-1 text-[10px]">Barbero que Atendió *</label>
              <select
                required
                value={formData.barbero_id}
                onChange={(e) => setFormData({ ...formData, barbero_id: e.target.value })}
                className="w-full bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl px-3 py-2 text-white focus:border-[#d4af37] focus:outline-none"
              >
                {barberos.map(b => (
                  <option key={b.id} value={b.id}>{b.nombre}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-400 uppercase font-bold mb-1 text-[10px]">Servicio Realizado *</label>
              <select
                required
                value={formData.servicio_id}
                onChange={handleServiceChange}
                className="w-full bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl px-3 py-2 text-white focus:border-[#d4af37] focus:outline-none"
              >
                {servicios.map(s => (
                  <option key={s.id} value={s.id}>{s.nombre} (${s.precio})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Selector de Método de Pago */}
          <div className="space-y-1.5 pt-1">
            <label className="block text-gray-300 uppercase font-bold text-[10px]">
              Método de Pago *
            </label>
            <div className="grid grid-cols-2 gap-2">
              {metodos.map(m => {
                const isSelected = formData.metodo === m.id;
                const Icon = m.icon;

                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, metodo: m.id })}
                    className={`p-2.5 rounded-xl border flex items-center gap-2 text-left font-bold transition-all ${
                      isSelected
                        ? 'bg-[#1e1a0f] border-[#d4af37] text-white shadow-md scale-[1.02]'
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-400 uppercase font-bold mb-1 text-[10px]">Monto del Corte ($ UYU) *</label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.monto}
                onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
                className="w-full bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl px-3 py-2 text-white focus:border-[#d4af37] focus:outline-none font-mono font-bold text-emerald-400"
              />
            </div>

            <div>
              <label className="block text-gray-400 uppercase font-bold mb-1 text-[10px] flex items-center gap-1">
                <HeartHandshake size={11} className="text-purple-400" />
                <span>Propina ($ UYU)</span>
              </label>
              <input
                type="number"
                min="0"
                placeholder="0"
                value={formData.propina}
                onChange={(e) => setFormData({ ...formData, propina: e.target.value })}
                className="w-full bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl px-3 py-2 text-white focus:border-purple-400 focus:outline-none font-mono text-purple-400 font-bold"
              />
            </div>
          </div>

          {/* Total */}
          <div className="bg-[#181818] p-3 rounded-xl border border-emerald-500/30 flex justify-between items-center">
            <span className="text-xs font-bold text-gray-300">Total a Ingresar en Caja:</span>
            <strong className="text-base font-serif font-bold text-emerald-400">${totalNum} UYU</strong>
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
              Guardar Cobro
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ManualCorteModal;
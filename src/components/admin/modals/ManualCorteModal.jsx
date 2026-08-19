// src/components/admin/modals/ManualCorteModal.jsx
import React, { useState, useEffect } from 'react';
import { DollarSign, User, Scissors, HeartHandshake } from 'lucide-react';

export function ManualCorteModal({ isOpen, onClose, onSave, barberos = [], servicios = [] }) {
  const [formData, setFormData] = useState({
    cliente: '',
    barbero_id: '',
    servicio_id: '',
    monto: '',
    propina: '0',
    metodo: 'Efectivo',
    fecha: new Date().toISOString().split('T')[0],
    hora: new Date().toLocaleTimeString('es-UY', { hour: '2-digit', minute: '2-digit', hour12: false })
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        cliente: 'Cliente de mostrador',
        barbero_id: barberos[0]?.id || '',
        servicio_id: servicios[0]?.id || '',
        monto: servicios[0]?.precio || '',
        propina: '0',
        metodo: 'Efectivo',
        fecha: new Date().toISOString().split('T')[0],
        hora: new Date().toLocaleTimeString('es-UY', { hour: '2-digit', minute: '2-digit', hour12: false })
      });
    }
  }, [isOpen, barberos, servicios]);

  const handleServicioChange = (srvId) => {
    const srv = servicios.find(s => String(s.id) === String(srvId));
    setFormData(prev => ({
      ...prev,
      servicio_id: srvId,
      monto: srv ? srv.precio : prev.monto
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const srv = servicios.find(s => String(s.id) === String(formData.servicio_id));
    const brb = barberos.find(b => String(b.id) === String(formData.barbero_id));
    
    onSave({
      id: Date.now(),
      fecha: formData.fecha,
      hora: formData.hora,
      cliente_nombre: formData.cliente || 'Cliente de mostrador',
      barbero_nombre: brb ? brb.nombre : 'General',
      barbero_id: formData.barbero_id,
      servicio_nombre: srv ? srv.nombre : 'Servicio general',
      servicio_id: formData.servicio_id,
      monto: parseFloat(formData.monto || 0),
      propina: parseFloat(formData.propina || 0),
      total: parseFloat(formData.monto || 0) + parseFloat(formData.propina || 0),
      metodo: formData.metodo,
      estado: 'completada',
      origen: 'manual'
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#131313] border border-[#2a2a2a] w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4">
        <div>
          <span className="text-[10px] uppercase font-bold text-[#d4af37] tracking-wider block">Caja & Facturación</span>
          <h3 className="text-base font-bold text-white">Registrar Servicio / Cobro Manual</h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block text-gray-400 uppercase font-bold mb-1 text-[10px]">Nombre del Cliente</label>
            <input
              type="text"
              placeholder="Ej: Marcelo Gómez (o 'Cliente de mostrador')"
              value={formData.cliente}
              onChange={(e) => setFormData({ ...formData, cliente: e.target.value })}
              className="w-full bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl px-3 py-2 text-white focus:border-[#d4af37] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-400 uppercase font-bold mb-1 text-[10px]">Barbero *</label>
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
              <label className="block text-gray-400 uppercase font-bold mb-1 text-[10px]">Servicio *</label>
              <select
                required
                value={formData.servicio_id}
                onChange={(e) => handleServicioChange(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl px-3 py-2 text-white focus:border-[#d4af37] focus:outline-none"
              >
                {servicios.map(s => (
                  <option key={s.id} value={s.id}>{s.nombre} (${s.precio})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-400 uppercase font-bold mb-1 text-[10px]">Monto del Corte ($) *</label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="450"
                value={formData.monto}
                onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
                className="w-full bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl px-3 py-2 text-white focus:border-[#d4af37] focus:outline-none font-bold text-emerald-400"
              />
            </div>

            <div>
              <label className="block text-gray-400 uppercase font-bold mb-1 text-[10px] flex items-center gap-1">
                <HeartHandshake size={11} className="text-[#d4af37]" />
                <span>Propina ($)</span>
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="0"
                value={formData.propina}
                onChange={(e) => setFormData({ ...formData, propina: e.target.value })}
                className="w-full bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl px-3 py-2 text-white focus:border-[#d4af37] focus:outline-none font-bold text-[#d4af37]"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-gray-400 uppercase font-bold mb-1 text-[10px]">Método</label>
              <select
                value={formData.metodo}
                onChange={(e) => setFormData({ ...formData, metodo: e.target.value })}
                className="w-full bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl px-2.5 py-2 text-white focus:border-[#d4af37] focus:outline-none"
              >
                <option value="Efectivo">Efectivo</option>
                <option value="Transferencia">Transferencia</option>
                <option value="Mercado Pago">Mercado Pago</option>
                <option value="Débito">Débito</option>
                <option value="Crédito">Crédito</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-400 uppercase font-bold mb-1 text-[10px]">Fecha</label>
              <input
                type="date"
                value={formData.fecha}
                onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                className="w-full bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl px-2 py-2 text-white focus:border-[#d4af37] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-400 uppercase font-bold mb-1 text-[10px]">Hora</label>
              <input
                type="time"
                value={formData.hora}
                onChange={(e) => setFormData({ ...formData, hora: e.target.value })}
                className="w-full bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl px-2 py-2 text-white focus:border-[#d4af37] focus:outline-none"
              />
            </div>
          </div>

          {/* Resumen Total */}
          <div className="bg-[#181818] border border-[#282828] rounded-xl p-3 flex justify-between items-center text-xs">
            <span className="text-gray-400">Total a ingresar a caja:</span>
            <strong className="text-base font-serif font-bold text-white">
              ${(parseFloat(formData.monto || 0) + parseFloat(formData.propina || 0)).toLocaleString()} UYU
            </strong>
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
// src/components/admin/modals/AsistenciaModal.jsx
import React, { useState, useEffect } from 'react';
import { Clock, FileText } from 'lucide-react';

export function AsistenciaModal({ isOpen, onClose, onSave, barberos = [] }) {
  const [formData, setFormData] = useState({
    barbero_id: '',
    fecha: new Date().toISOString().split('T')[0],
    estado: 'presente', // 'presente' | 'tarde' | 'salida_anticipada' | 'ausente' | 'franco'
    hora_llegada: '10:30',
    hora_salida: '16:00',
    motivo: ''
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        barbero_id: barberos[0]?.id || '',
        fecha: new Date().toISOString().split('T')[0],
        estado: 'presente',
        hora_llegada: new Date().toLocaleTimeString('es-UY', { hour: '2-digit', minute: '2-digit', hour12: false }),
        hora_salida: '16:00',
        motivo: ''
      });
    }
  }, [isOpen, barberos]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const selectedBarber = barberos.find(b => String(b.id) === String(formData.barbero_id));

    onSave({
      barbero_id: formData.barbero_id,
      barbero_nombre: selectedBarber ? selectedBarber.nombre : 'Barbero',
      fecha: formData.fecha,
      estado: formData.estado,
      hora_llegada: formData.estado === 'tarde' ? formData.hora_llegada : null,
      hora_salida: formData.estado === 'salida_anticipada' ? formData.hora_salida : null,
      motivo: formData.motivo.trim() || null
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#131313] border border-[#2a2a2a] w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div>
          <span className="text-[10px] uppercase font-bold text-[#d4af37] tracking-wider block">
            Control de Personal & Jornales
          </span>
          <h3 className="text-base font-bold text-white">
            Registrar Asistencia / Novedad
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          
          {/* Fecha y Barbero */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-400 uppercase font-bold mb-1 text-[10px]">Fecha *</label>
              <input
                type="date"
                required
                value={formData.fecha}
                onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                className="w-full bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl px-3 py-2 text-white focus:border-[#d4af37] focus:outline-none"
              />
            </div>

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
          </div>

          {/* Selector de Tipo de Asistencia */}
          <div className="space-y-1.5">
            <label className="block text-gray-400 uppercase font-bold text-[10px]">
              Tipo de Registro / Estado *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 font-bold text-[10px]">
              
              <button
                type="button"
                onClick={() => setFormData({ ...formData, estado: 'presente' })}
                className={`py-2 px-2.5 rounded-xl border text-center transition-all ${
                  formData.estado === 'presente'
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-md scale-[1.02]'
                    : 'bg-[#181818] border-[#282828] text-gray-400 hover:text-white'
                }`}
              >
                🟢 Presente (Normal)
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, estado: 'tarde' })}
                className={`py-2 px-2.5 rounded-xl border text-center transition-all ${
                  formData.estado === 'tarde'
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/50 shadow-md scale-[1.02]'
                    : 'bg-[#181818] border-[#282828] text-gray-400 hover:text-white'
                }`}
              >
                🟡 Llegada Tarde
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, estado: 'salida_anticipada' })}
                className={`py-2 px-2.5 rounded-xl border text-center transition-all ${
                  formData.estado === 'salida_anticipada'
                    ? 'bg-purple-500/20 text-purple-400 border-purple-500/50 shadow-md scale-[1.02]'
                    : 'bg-[#181818] border-[#282828] text-gray-400 hover:text-white'
                }`}
              >
                🟠 Salida Anticipada
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, estado: 'ausente' })}
                className={`py-2 px-2.5 rounded-xl border text-center transition-all ${
                  formData.estado === 'ausente'
                    ? 'bg-red-500/20 text-red-400 border-red-500/50 shadow-md scale-[1.02]'
                    : 'bg-[#181818] border-[#282828] text-gray-400 hover:text-white'
                }`}
              >
                🔴 Falta / Inasistencia
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, estado: 'franco' })}
                className={`py-2 px-2.5 rounded-xl border text-center transition-all ${
                  formData.estado === 'franco'
                    ? 'bg-blue-500/20 text-blue-400 border-blue-500/50 shadow-md scale-[1.02]'
                    : 'bg-[#181818] border-[#282828] text-gray-400 hover:text-white'
                }`}
              >
                ⚪ Franco / Libre
              </button>

            </div>
          </div>

          {/* Campo Condicional: Hora de Llegada */}
          {formData.estado === 'tarde' && (
            <div className="bg-[#181818] p-3 rounded-2xl border border-amber-500/30 space-y-1.5 animate-fadeIn">
              <label className="block text-amber-400 uppercase font-bold text-[10px] flex items-center gap-1">
                <Clock size={11} />
                <span>Hora Real de Llegada *</span>
              </label>
              <input
                type="time"
                required
                value={formData.hora_llegada}
                onChange={(e) => setFormData({ ...formData, hora_llegada: e.target.value })}
                className="w-full bg-[#131313] border border-[#303030] rounded-xl px-3 py-2 text-white focus:border-amber-400 focus:outline-none font-mono text-sm"
              />
            </div>
          )}

          {/* Campo Condicional: Hora de Salida */}
          {formData.estado === 'salida_anticipada' && (
            <div className="bg-[#181818] p-3 rounded-2xl border border-purple-500/30 space-y-1.5 animate-fadeIn">
              <label className="block text-purple-400 uppercase font-bold text-[10px] flex items-center gap-1">
                <Clock size={11} />
                <span>Hora de Salida *</span>
              </label>
              <input
                type="time"
                required
                value={formData.hora_salida}
                onChange={(e) => setFormData({ ...formData, hora_salida: e.target.value })}
                className="w-full bg-[#131313] border border-[#303030] rounded-xl px-3 py-2 text-white focus:border-purple-400 focus:outline-none font-mono text-sm"
              />
            </div>
          )}

          {/* Motivo para faltas o justificaciones */}
          {formData.estado !== 'presente' && (
            <div className="space-y-1 animate-fadeIn">
              <label className="block text-gray-400 uppercase font-bold text-[10px] flex items-center gap-1">
                <FileText size={11} className="text-[#d4af37]" />
                <span>Motivo / Justificación *</span>
              </label>
              <textarea
                required={formData.estado === 'ausente'}
                placeholder={
                  formData.estado === 'ausente' 
                    ? 'Ej: Certificado médico / Trámite personal...' 
                    : formData.estado === 'tarde'
                    ? 'Ej: Retraso en el transporte...'
                    : 'Ej: Consulta médica urgente...'
                }
                value={formData.motivo}
                onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
                rows={2}
                className="w-full bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl px-3 py-2 text-white focus:border-[#d4af37] focus:outline-none placeholder-gray-600"
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
              className="flex-1 py-2.5 rounded-xl bg-[#d4af37] text-black font-bold hover:bg-[#c49f2e] transition-colors shadow-md uppercase tracking-wider"
            >
              Guardar Registro
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AsistenciaModal;
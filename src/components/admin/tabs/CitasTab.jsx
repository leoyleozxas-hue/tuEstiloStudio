// src/components/admin/tabs/CitasTab.jsx
import React, { useState } from 'react';
import { Calendar, RefreshCw, MessageSquare, CheckCircle2, Check, XCircle } from 'lucide-react';
import { studioData } from '../../../data/mockData';
import { CompletarCitaModal } from '../modals/CompletarCitaModal';

export function CitasTab({
  citas = [], 
  filterDate, 
  setFilterDate, 
  filterBarber, 
  setFilterBarber,
  barberos = [], 
  onRefresh, 
  onUpdateStatus,
  onCompletarCitaWithCobro
}) {
  const [selectedCitaToComplete, setSelectedCitaToComplete] = useState(null);

  return (
    <div className="space-y-5 animate-fadeIn">
      
      {/* Barra de Filtros */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-[#131313] border border-[#242424] p-4 rounded-2xl">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="block text-[9px] uppercase font-bold text-gray-400 mb-1">Fecha</label>
            <input 
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="bg-[#1b1b1b] border border-[#303030] text-white text-xs px-3 py-1.5 rounded-xl focus:border-[#d4af37] focus:outline-none font-mono"
            />
          </div>

          <div>
            <label className="block text-[9px] uppercase font-bold text-gray-400 mb-1">Barbero</label>
            <select
              value={filterBarber}
              onChange={(e) => setFilterBarber(e.target.value)}
              className="bg-[#1b1b1b] border border-[#303030] text-white text-xs px-3 py-1.5 rounded-xl focus:border-[#d4af37] focus:outline-none"
            >
              <option value="all">Todos los barberos</option>
              {barberos.map(b => (
                <option key={b.id} value={b.id}>{b.nombre}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={onRefresh}
          className="flex items-center gap-1.5 bg-[#1b1b1b] border border-[#303030] hover:border-[#d4af37] text-gray-300 hover:text-white px-3.5 py-2 rounded-xl text-xs font-semibold transition-all"
        >
          <RefreshCw size={13} />
          <span>Actualizar</span>
        </button>
      </div>

      {citas.length === 0 ? (
        <div className="bg-[#131313] border border-[#242424] rounded-3xl p-12 text-center text-gray-400 space-y-2">
          <Calendar size={36} className="mx-auto text-gray-600 mb-2" />
          <p className="text-sm font-bold text-white">No hay citas agendadas para esta fecha</p>
          <p className="text-xs text-gray-500">Los turnos que reserven los clientes aparecerán aquí automáticamente.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {citas.map((cita) => {
            const startDate = new Date(cita.fecha_hora_inicio);
            const timeStr = `${String(startDate.getHours()).padStart(2, '0')}:${String(startDate.getMinutes()).padStart(2, '0')}`;
            
            const cleanPhone = (cita.cliente_telefono || '').replace(/\D/g, '');
            const waNumber = cleanPhone.startsWith('0') ? `598${cleanPhone.slice(1)}` : `598${cleanPhone}`;
            const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(`¡Hola ${cita.cliente_nombre}! Te escribimos de ${studioData?.name || 'la barbería'} para confirmar tu turno de hoy a las ${timeStr} hs.`)}`;

            const statusColors = {
              pendiente: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
              confirmada: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
              completada: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-bold',
              cancelada: 'bg-red-500/10 text-red-400 border-red-500/30 line-through'
            };

            const statusLabels = {
              pendiente: 'Pendiente',
              confirmada: 'Confirmada',
              completada: 'Completada / Cobrada',
              cancelada: 'Cancelada'
            };

            return (
              <div 
                key={cita.id}
                className={`bg-[#131313] border rounded-2xl p-4 space-y-3 transition-all shadow-lg ${
                  cita.estado === 'completada' 
                    ? 'border-emerald-500/30 bg-[#121614]' 
                    : cita.estado === 'cancelada'
                    ? 'border-red-500/20 opacity-60'
                    : 'border-[#242424] hover:border-[#d4af37]/40'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2.5">
                    <span className="text-base sm:text-lg font-serif font-bold text-[#d4af37] bg-[#1d190d] px-2.5 py-1 rounded-xl border border-[#d4af37]/30">
                      {timeStr} hs
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-white leading-tight">{cita.cliente_nombre}</h3>
                      <p className="text-[11px] text-gray-400">{cita.cliente_telefono}</p>
                    </div>
                  </div>

                  <span className={`text-[9px] uppercase px-2 py-0.5 rounded-full border ${statusColors[cita.estado] || statusColors.pendiente}`}>
                    {statusLabels[cita.estado] || cita.estado}
                  </span>
                </div>

                <div className="bg-[#1a1a1a] p-2.5 rounded-xl border border-[#282828] text-xs space-y-1">
                  <div className="flex justify-between text-gray-300">
                    <span>Servicio:</span>
                    <strong className="text-white">{cita.servicios?.nombre}</strong>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Barbero:</span>
                    <strong className="text-[#d4af37]">{cita.barberos?.nombre}</strong>
                  </div>
                  {cita.notas && (
                    <p className="text-[10px] text-gray-400 pt-1 border-t border-[#262626]">
                      📝 {cita.notas}
                    </p>
                  )}
                </div>

                {/* Acciones */}
                <div className="flex items-center justify-between pt-1 gap-2">
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#25D366] border border-[#25D366]/40 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all"
                  >
                    <MessageSquare size={13} />
                    <span>WhatsApp</span>
                  </a>

                  <div className="flex items-center gap-1.5">
                    
                    {cita.estado === 'pendiente' && (
                      <button
                        onClick={() => onUpdateStatus(cita.id, 'confirmada')}
                        className="flex items-center gap-1 bg-blue-500/15 hover:bg-blue-500/25 text-blue-400 border border-blue-500/30 px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all"
                        title="Confirmar turno"
                      >
                        <Check size={13} />
                        <span>Confirmar</span>
                      </button>
                    )}

                    {cita.estado === 'confirmada' && (
                      <button
                        onClick={() => setSelectedCitaToComplete(cita)}
                        className="flex items-center gap-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all shadow-sm"
                        title="Cobrar Turno (Elegir Medio de Pago)"
                      >
                        <CheckCircle2 size={13} />
                        <span>Completar</span>
                      </button>
                    )}

                    {(cita.estado === 'pendiente' || cita.estado === 'confirmada') && (
                      <button
                        onClick={() => {
                          if (confirm('¿Deseas cancelar esta reserva? El turno se liberará inmediatamente en la web.')) {
                            onUpdateStatus(cita.id, 'cancelada');
                          }
                        }}
                        title="Cancelar Turno"
                        className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl transition-colors"
                      >
                        <XCircle size={15} />
                      </button>
                    )}

                    {cita.estado === 'completada' && (
                      <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">
                        <CheckCircle2 size={12} /> Facturado
                      </span>
                    )}

                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Selección de Medio de Pago y Propina */}
      <CompletarCitaModal
        isOpen={Boolean(selectedCitaToComplete)}
        onClose={() => setSelectedCitaToComplete(null)}
        cita={selectedCitaToComplete}
        onConfirm={(citaId, cobroData) => {
          onCompletarCitaWithCobro(citaId, cobroData);
          setSelectedCitaToComplete(null);
        }}
      />

    </div>
  );
}

export default CitasTab;
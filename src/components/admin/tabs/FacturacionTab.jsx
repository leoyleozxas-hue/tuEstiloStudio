// src/components/admin/tabs/FacturacionTab.jsx
import React, { useState } from 'react';
import { ReceiptText, Download, Plus, HeartHandshake } from 'lucide-react';
import { exportToCSV } from '../../../utils/exportUtils';

export function FacturacionTab({
  citas = [],
  manualCortes = [],
  barberos = [],
  onOpenManualModal
}) {
  const [periodo, setPeriodo] = useState('dia'); // 'dia' | 'semana' | 'mes' | 'todo'
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [filterBarber, setFilterBarber] = useState('all');

  // Unificar citas completadas con cobros manuales
  const todosLosCobros = [
    ...citas
      .filter(c => c.estado === 'completada')
      .map(c => ({
        id: `cita-${c.id}`,
        fecha: c.fecha_hora_inicio ? c.fecha_hora_inicio.split('T')[0] : '',
        hora: c.fecha_hora_inicio ? new Date(c.fecha_hora_inicio).toLocaleTimeString('es-UY', { hour: '2-digit', minute: '2-digit' }) : '',
        fecha_full: new Date(c.fecha_hora_inicio || Date.now()),
        cliente_nombre: c.cliente_nombre || 'Cliente',
        barbero_nombre: c.barberos?.nombre || 'General',
        barbero_id: String(c.barbero_id || ''),
        servicio_nombre: c.servicios?.nombre || 'Servicio',
        monto: Number(c.servicios?.precio || 0),
        propina: Number(c.propina || 0),
        total: Number(c.servicios?.precio || 0) + Number(c.propina || 0),
        metodo: c.metodo_pago || 'Efectivo',
        tipo: 'Cita Web'
      })),
    ...manualCortes.map(m => ({
      id: `manual-${m.id}`,
      fecha: m.fecha,
      hora: m.hora,
      fecha_full: new Date(`${m.fecha}T${m.hora || '12:00'}`),
      cliente_nombre: m.cliente_nombre || 'Cliente mostrador',
      barbero_nombre: m.barbero_nombre || 'General',
      barbero_id: String(m.barbero_id || ''),
      servicio_nombre: m.servicio_nombre || 'Servicio',
      monto: Number(m.monto || 0),
      propina: Number(m.propina || 0),
      total: Number(m.monto || 0) + Number(m.propina || 0),
      metodo: m.metodo || 'Efectivo',
      tipo: 'Mostrador'
    }))
  ].sort((a, b) => b.fecha_full - a.fecha_full);

  // Filtrado según el período seleccionado
  const cobrosFiltrados = todosLosCobros.filter(item => {
    if (filterBarber !== 'all' && item.barbero_id !== String(filterBarber)) {
      return false;
    }

    if (periodo === 'dia') {
      return item.fecha === selectedDate;
    }

    if (periodo === 'mes') {
      return item.fecha.startsWith(selectedMonth);
    }

    if (periodo === 'semana') {
      const d = new Date(item.fecha);
      const hoy = new Date();
      const diffTime = Math.abs(hoy - d);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 7;
    }

    return true; // 'todo'
  });

  // Totales
  const totalMontoServicios = cobrosFiltrados.reduce((acc, curr) => acc + curr.monto, 0);
  const totalPropinas = cobrosFiltrados.reduce((acc, curr) => acc + curr.propina, 0);
  const totalGeneralCaja = totalMontoServicios + totalPropinas;
  const ticketPromedio = cobrosFiltrados.length > 0 ? Math.round(totalMontoServicios / cobrosFiltrados.length) : 0;

  // Descarga CSV personalizada
  const handleExportCSV = () => {
    const headers = [
      'ID', 'Fecha', 'Hora', 'Cliente', 'Barbero', 'Servicio', 
      'Tipo_Registro', 'Metodo_Pago', 'Monto_Servicio_UYU', 'Propina_UYU', 'Total_Cobrado_UYU'
    ];

    const rows = cobrosFiltrados.map(c => [
      c.id,
      c.fecha,
      c.hora,
      c.cliente_nombre,
      c.barbero_nombre,
      c.servicio_nombre,
      c.tipo,
      c.metodo,
      c.monto,
      c.propina,
      c.total
    ]);

    const etiquetaPeriodo = periodo === 'dia' ? selectedDate : periodo === 'mes' ? selectedMonth : periodo;
    exportToCSV(`Facturacion_Barberia_${etiquetaPeriodo}`, headers, rows);
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      
      {/* Encabezado y Acciones */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#131313] border border-[#242424] p-4 rounded-2xl">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <ReceiptText className="text-[#d4af37]" size={18} /> Cortes, Caja & Facturación
          </h2>
          <p className="text-xs text-gray-400">Control de servicios realizados, registro de propinas y balance financiero.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenManualModal}
            className="flex items-center gap-1.5 bg-[#d4af37] text-black font-bold px-3.5 py-2.5 rounded-xl text-xs uppercase tracking-wider shadow-lg active:scale-95 transition-all"
          >
            <Plus size={14} />
            <span>Registrar Cobro / Corte</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3.5 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg active:scale-95"
            title="Descargar reporte en Excel"
          >
            <Download size={14} />
            <span>Descargar CSV</span>
          </button>
        </div>
      </div>

      {/* Barra de Filtros: Día, Semana, Mes, Barbero */}
      <div className="bg-[#131313] border border-[#242424] p-3.5 rounded-2xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 bg-[#181818] p-1 rounded-xl border border-[#282828] text-xs font-bold">
          <button
            onClick={() => setPeriodo('dia')}
            className={`px-3 py-1.5 rounded-lg transition-all ${periodo === 'dia' ? 'bg-[#d4af37] text-black shadow' : 'text-gray-400 hover:text-white'}`}
          >
            Por Día
          </button>
          <button
            onClick={() => setPeriodo('semana')}
            className={`px-3 py-1.5 rounded-lg transition-all ${periodo === 'semana' ? 'bg-[#d4af37] text-black shadow' : 'text-gray-400 hover:text-white'}`}
          >
            Esta Semana
          </button>
          <button
            onClick={() => setPeriodo('mes')}
            className={`px-3 py-1.5 rounded-lg transition-all ${periodo === 'mes' ? 'bg-[#d4af37] text-black shadow' : 'text-gray-400 hover:text-white'}`}
          >
            Por Mes
          </button>
          <button
            onClick={() => setPeriodo('todo')}
            className={`px-3 py-1.5 rounded-lg transition-all ${periodo === 'todo' ? 'bg-[#d4af37] text-black shadow' : 'text-gray-400 hover:text-white'}`}
          >
            Histórico Todo
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {periodo === 'dia' && (
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-[#181818] border border-[#303030] text-white text-xs px-3 py-1.5 rounded-xl focus:border-[#d4af37] focus:outline-none"
            />
          )}

          {periodo === 'mes' && (
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-[#181818] border border-[#303030] text-white text-xs px-3 py-1.5 rounded-xl focus:border-[#d4af37] focus:outline-none"
            />
          )}

          <select
            value={filterBarber}
            onChange={(e) => setFilterBarber(e.target.value)}
            className="bg-[#181818] border border-[#303030] text-white text-xs px-3 py-1.5 rounded-xl focus:border-[#d4af37] focus:outline-none"
          >
            <option value="all">Todos los barberos</option>
            {barberos.map(b => (
              <option key={b.id} value={b.id}>{b.nombre}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tarjetas Cuadraditas de Resumen Financiero */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-[#131313] border border-[#242424] p-4 rounded-2xl space-y-1">
          <span className="text-[10px] uppercase font-bold text-gray-400">Total Servicios</span>
          <p className="text-2xl font-serif font-bold text-emerald-400">${totalMontoServicios.toLocaleString()} UYU</p>
          <p className="text-[11px] text-gray-500">{cobrosFiltrados.length} servicios realizados</p>
        </div>

        <div className="bg-[#131313] border border-[#242424] p-4 rounded-2xl space-y-1">
          <span className="text-[10px] uppercase font-bold text-[#d4af37] flex items-center gap-1">
            <HeartHandshake size={12} />
            <span>Total Propinas</span>
          </span>
          <p className="text-2xl font-serif font-bold text-[#d4af37]">${totalPropinas.toLocaleString()} UYU</p>
          <p className="text-[11px] text-gray-500">Dejado por clientes en este período</p>
        </div>

        <div className="bg-[#131313] border border-[#242424] p-4 rounded-2xl space-y-1">
          <span className="text-[10px] uppercase font-bold text-white">Ingreso Total Caja</span>
          <p className="text-2xl font-serif font-bold text-white">${totalGeneralCaja.toLocaleString()} UYU</p>
          <p className="text-[11px] text-gray-500">Servicios + Propinas combinados</p>
        </div>

        <div className="bg-[#131313] border border-[#242424] p-4 rounded-2xl space-y-1">
          <span className="text-[10px] uppercase font-bold text-gray-400">Ticket Promedio</span>
          <p className="text-2xl font-serif font-bold text-gray-200">${ticketPromedio.toLocaleString()} UYU</p>
          <p className="text-[11px] text-gray-500">Promedio por servicio</p>
        </div>
      </div>

      {/* Tabla de Detalle */}
      <div className="bg-[#131313] border border-[#242424] rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-[#242424] flex justify-between items-center">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Detalle de Cobros ({periodo === 'dia' ? selectedDate : periodo === 'mes' ? selectedMonth : periodo})
          </h3>
          <span className="text-[11px] text-gray-500">{cobrosFiltrados.length} registros</span>
        </div>

        {cobrosFiltrados.length === 0 ? (
          <div className="p-12 text-center text-gray-500 space-y-2">
            <ReceiptText size={32} className="mx-auto text-gray-600 mb-2" />
            <p className="text-sm font-bold text-gray-300">No hay registros de cobros para este período</p>
            <p className="text-xs">Los turnos atendidos y los cobros manuales aparecerán aquí.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-[#181818] uppercase text-[10px] text-gray-400 border-b border-[#262626]">
                <tr>
                  <th className="py-3 px-4">Fecha / Hora</th>
                  <th className="py-3 px-4">Cliente</th>
                  <th className="py-3 px-4">Barbero</th>
                  <th className="py-3 px-4">Servicio</th>
                  <th className="py-3 px-4">Origen</th>
                  <th className="py-3 px-4">Método</th>
                  <th className="py-3 px-4 text-right">Monto</th>
                  <th className="py-3 px-4 text-right text-[#d4af37]">Propina</th>
                  <th className="py-3 px-4 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222222]">
                {cobrosFiltrados.map((item) => (
                  <tr key={item.id} className="hover:bg-[#181818]/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-[11px] text-gray-400">
                      {item.fecha} <strong className="text-[#d4af37] font-sans">{item.hora}</strong>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-white">{item.cliente_nombre}</td>
                    <td className="py-3.5 px-4 text-gray-300">{item.barbero_nombre}</td>
                    <td className="py-3.5 px-4">{item.servicio_nombre}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                        item.tipo === 'Cita Web' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30' : 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                      }`}>
                        {item.tipo}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-[#1f1f1f] text-gray-300 text-[10px]">
                        {item.metodo}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-semibold text-emerald-400">${item.monto}</td>
                    <td className="py-3.5 px-4 text-right font-semibold text-[#d4af37]">
                      {item.propina > 0 ? `+$${item.propina}` : '-'}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-white">${item.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}

export default FacturacionTab;
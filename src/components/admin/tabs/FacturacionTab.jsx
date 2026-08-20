// src/components/admin/tabs/FacturacionTab.jsx
import React, { useState } from 'react';
import { DollarSign, Download, Plus, Trash2 } from 'lucide-react';
import { exportToCSV } from '../../../utils/exportUtils';

export function FacturacionTab({ 
  citas = [], 
  manualCortes = [], 
  barberos = [], 
  onOpenManualModal,
  onRequestDeleteCobro
}) {
  const [periodo, setPeriodo] = useState('dia'); // 'dia' | 'semana' | 'mes' | 'todos'
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [filterBarbero, setFilterBarbero] = useState('all');
  const [filterMetodo, setFilterMetodo] = useState('all');

  // 1. Unificar Citas Completadas + Cortes Manuales
  const allVentas = [
    // Citas Web Completadas
    ...citas
      .filter(c => c.estado === 'completada')
      .map(c => {
        const start = new Date(c.fecha_hora_inicio);
        const fecha = start.toISOString().split('T')[0];
        const hora = `${String(start.getHours()).padStart(2, '0')}:${String(start.getMinutes()).padStart(2, '0')}`;
        const monto = Number(c.servicios?.precio || 0);

        return {
          id: c.id,
          tipo: 'Cita Web',
          fecha,
          hora,
          cliente_nombre: c.cliente_nombre,
          barbero_id: c.barbero_id,
          barbero_nombre: c.barberos?.nombre || 'Barbero',
          servicio_nombre: c.servicios?.nombre || 'Corte',
          monto: monto,
          propina: Number(c.propina || 0),
          total: monto + Number(c.propina || 0),
          metodo: c.metodo_pago || 'Efectivo',
          isCita: true
        };
      }),
    
    // Cortes Manuales / Mostrador / Cuotas Socios
    ...manualCortes.map(m => ({
      id: m.id,
      tipo: m.servicio_nombre?.includes('Membresía') ? 'Cuota Socio' : 'Mostrador',
      fecha: m.fecha,
      hora: m.hora,
      cliente_nombre: m.cliente_nombre || 'Cliente Ocasional',
      barbero_id: m.barbero_id,
      barbero_nombre: m.barbero_nombre || 'Barbero',
      servicio_nombre: m.servicio_nombre || 'Servicio',
      monto: Number(m.monto || 0),
      propina: Number(m.propina || 0),
      total: Number(m.total || m.monto || 0),
      metodo: m.metodo || 'Efectivo',
      isCita: false
    }))
  ].sort((a, b) => new Date(`${b.fecha}T${b.hora}`) - new Date(`${a.fecha}T${a.hora}`));

  // 2. Filtrado por período, barbero y método de pago
  const now = new Date();
  const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 1)).toISOString().split('T')[0];

  const ventasFiltradas = allVentas.filter(v => {
    if (filterBarbero !== 'all' && String(v.barbero_id) !== String(filterBarbero)) {
      return false;
    }
    if (filterMetodo !== 'all' && v.metodo !== filterMetodo) {
      return false;
    }
    if (periodo === 'dia') {
      return v.fecha === selectedDate;
    }
    if (periodo === 'semana') {
      return v.fecha >= startOfWeek;
    }
    if (periodo === 'mes') {
      return v.fecha.startsWith(selectedMonth);
    }
    return true;
  });

  // 3. Totales
  const totalFacturado = ventasFiltradas.reduce((acc, v) => acc + v.total, 0);
  const totalPropinas = ventasFiltradas.reduce((acc, v) => acc + v.propina, 0);
  const totalCortesCount = ventasFiltradas.length;
  const promedioPorCorte = totalCortesCount > 0 ? (totalFacturado / totalCortesCount).toFixed(0) : 0;

  // 4. Descargar Reporte CSV con columna de Método de Pago
  const handleExportCSV = () => {
    const headers = [
      'ID', 'Tipo_Origen', 'Fecha', 'Hora', 'Cliente', 'Barbero', 'Servicio', 
      'Metodo_Pago', 'Monto_Base_UYU', 'Propina_UYU', 'Total_UYU'
    ];

    const rows = ventasFiltradas.map(v => [
      v.id,
      v.tipo,
      v.fecha,
      v.hora,
      v.cliente_nombre,
      v.barbero_nombre,
      v.servicio_nombre,
      v.metodo,
      v.monto,
      v.propina,
      v.total
    ]);

    const etiquetaPeriodo = periodo === 'dia' ? selectedDate : periodo === 'mes' ? selectedMonth : periodo;
    exportToCSV(`Facturacion_Barberia_${etiquetaPeriodo}`, headers, rows);
  };

  const getMetodoBadge = (metodo) => {
    const met = (metodo || 'Efectivo').toLowerCase();
    if (met.includes('transferencia')) {
      return { label: 'Transferencia', class: 'bg-blue-500/15 text-blue-400 border-blue-500/30' };
    }
    if (met.includes('mercado') || met.includes('mp') || met.includes('qr')) {
      return { label: 'Mercado Pago', class: 'bg-sky-500/15 text-sky-400 border-sky-500/30' };
    }
    if (met.includes('tarjeta') || met.includes('debito') || met.includes('credito') || met.includes('pos')) {
      return { label: 'Tarjeta / Débito', class: 'bg-purple-500/15 text-purple-400 border-purple-500/30' };
    }
    return { label: 'Efectivo', class: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' };
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Cabecera y Acciones */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-[#131313] border border-[#242424] p-4 rounded-2xl">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <DollarSign className="text-[#d4af37]" size={18} />
            <span>Facturación & Registro de Ventas</span>
          </h2>
          <p className="text-xs text-gray-400">Control detallado de ingresos, medios de pago (Efectivo, Transferencia, POS, MP) y propinas.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenManualModal}
            className="flex items-center gap-1.5 bg-[#d4af37] text-black font-bold px-3.5 py-2 rounded-xl text-xs uppercase tracking-wider shadow-lg active:scale-95 transition-all"
          >
            <Plus size={14} />
            <span>Cobro Mostrador / Propina</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3.5 py-2 rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg active:scale-95"
            title="Descargar detalle en Excel"
          >
            <Download size={14} />
            <span>Descargar CSV</span>
          </button>
        </div>
      </div>

      {/* Barra de Filtros por Período y Método de Pago */}
      <div className="bg-[#131313] border border-[#242424] p-3.5 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
        
        <div className="flex items-center gap-1 bg-[#181818] p-1 rounded-xl border border-[#282828] font-bold">
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
            onClick={() => setPeriodo('todos')}
            className={`px-3 py-1.5 rounded-lg transition-all ${periodo === 'todos' ? 'bg-[#d4af37] text-black shadow' : 'text-gray-400 hover:text-white'}`}
          >
            Histórico
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {periodo === 'dia' && (
            <input 
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-[#181818] border border-[#303030] text-white px-3 py-1.5 rounded-xl focus:border-[#d4af37] focus:outline-none font-mono"
            />
          )}

          {periodo === 'mes' && (
            <input 
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-[#181818] border border-[#303030] text-white px-3 py-1.5 rounded-xl focus:border-[#d4af37] focus:outline-none font-mono"
            />
          )}

          <select
            value={filterBarbero}
            onChange={(e) => setFilterBarbero(e.target.value)}
            className="bg-[#181818] border border-[#303030] text-white px-3 py-1.5 rounded-xl focus:border-[#d4af37] focus:outline-none font-semibold"
          >
            <option value="all">Todos los barberos</option>
            {barberos.map(b => (
              <option key={b.id} value={b.id}>{b.nombre}</option>
            ))}
          </select>

          {/* FILTRO POR MEDIO DE PAGO */}
          <select
            value={filterMetodo}
            onChange={(e) => setFilterMetodo(e.target.value)}
            className="bg-[#181818] border border-[#303030] text-white px-3 py-1.5 rounded-xl focus:border-[#d4af37] focus:outline-none font-semibold"
          >
            <option value="all">Todos los medios de pago</option>
            <option value="Efectivo">Efectivo</option>
            <option value="Transferencia">Transferencia</option>
            <option value="Mercado Pago">Mercado Pago</option>
            <option value="Tarjeta / Débito">Tarjeta / Débito</option>
          </select>
        </div>

      </div>

      {/* Tarjetas KPI */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-[#131313] border border-[#242424] p-4 rounded-2xl space-y-1">
          <span className="text-[10px] uppercase font-bold text-gray-400">Total Ingresos</span>
          <p className="text-xl sm:text-2xl font-serif font-bold text-[#d4af37]">${totalFacturado.toLocaleString()} UYU</p>
          <p className="text-[10px] text-gray-500">Facturación acumulada</p>
        </div>

        <div className="bg-[#131313] border border-[#242424] p-4 rounded-2xl space-y-1">
          <span className="text-[10px] uppercase font-bold text-gray-400">Cortes / Atenciones</span>
          <p className="text-xl sm:text-2xl font-serif font-bold text-emerald-400">{totalCortesCount}</p>
          <p className="text-[10px] text-gray-500">Servicios completados</p>
        </div>

        <div className="bg-[#131313] border border-[#242424] p-4 rounded-2xl space-y-1">
          <span className="text-[10px] uppercase font-bold text-purple-400">Propinas Registradas</span>
          <p className="text-xl sm:text-2xl font-serif font-bold text-purple-400">${totalPropinas.toLocaleString()} UYU</p>
          <p className="text-[10px] text-gray-500">Para el equipo de barberos</p>
        </div>

        <div className="bg-[#131313] border border-[#242424] p-4 rounded-2xl space-y-1">
          <span className="text-[10px] uppercase font-bold text-blue-400">Ticket Promedio</span>
          <p className="text-xl sm:text-2xl font-serif font-bold text-blue-400">${promedioPorCorte} UYU</p>
          <p className="text-[10px] text-gray-500">Por cliente atendido</p>
        </div>
      </div>

      {/* Tabla con Columna de Método de Pago */}
      <div className="bg-[#131313] border border-[#242424] rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-[#242424] flex justify-between items-center">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Detalle de Ventas ({periodo === 'dia' ? selectedDate : periodo === 'mes' ? selectedMonth : periodo})
          </h3>
          <span className="text-[11px] text-gray-500">{ventasFiltradas.length} registros</span>
        </div>

        {ventasFiltradas.length === 0 ? (
          <div className="p-8 text-center text-gray-500 space-y-1">
            <DollarSign size={28} className="mx-auto text-gray-600 mb-1" />
            <p className="text-xs font-bold text-gray-300">No hay ventas registradas en este período</p>
            <p className="text-[11px]">Cuando completes citas en la agenda o registres cobros manuales, aparecerán aquí.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-[#181818] uppercase text-[10px] text-gray-400 border-b border-[#262626]">
                <tr>
                  <th className="py-3 px-4">Fecha / Hora</th>
                  <th className="py-3 px-4">Origen</th>
                  <th className="py-3 px-4">Cliente</th>
                  <th className="py-3 px-4">Barbero</th>
                  <th className="py-3 px-4">Servicio</th>
                  <th className="py-3 px-4">Método de Pago</th>
                  <th className="py-3 px-4">Monto</th>
                  <th className="py-3 px-4">Propina</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4 text-right">Anular</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222222]">
                {ventasFiltradas.map((v) => {
                  const badgeMetodo = getMetodoBadge(v.metodo);

                  return (
                    <tr key={`${v.tipo}-${v.id}`} className="hover:bg-[#181818]/60 transition-colors">
                      <td className="py-3 px-4 font-mono text-[11px] text-gray-400">
                        {v.fecha} <span className="text-gray-500">({v.hora})</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          v.tipo === 'Cita Web'
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                            : v.tipo === 'Cuota Socio'
                            ? 'bg-[#d4af37]/15 text-[#d4af37] border-[#d4af37]/30'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        }`}>
                          {v.tipo}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-white">{v.cliente_nombre}</td>
                      <td className="py-3 px-4 text-[#d4af37] font-medium">{v.barbero_nombre}</td>
                      <td className="py-3 px-4 text-gray-300">{v.servicio_nombre}</td>
                      
                      {/* COLUMNA MÉTODO DE PAGO */}
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-semibold border ${badgeMetodo.class}`}>
                          {badgeMetodo.label}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono text-gray-300">${v.monto}</td>
                      <td className="py-3 px-4 font-mono text-purple-400">
                        {v.propina > 0 ? `+$${v.propina}` : '-'}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-emerald-400 text-sm">
                        ${v.total}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => onRequestDeleteCobro(v)}
                          className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-500/30"
                          title="Anular Venta (Requiere contraseña de Admin)"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}

export default FacturacionTab;
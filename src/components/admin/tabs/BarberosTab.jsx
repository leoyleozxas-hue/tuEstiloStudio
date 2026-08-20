// src/components/admin/tabs/BarberosTab.jsx
import React, { useState } from 'react';
import { 
  Plus, Edit2, Trash2, Power, Clock, User, UserCheck, 
  Calendar, Download, FileText 
} from 'lucide-react';
import { exportToCSV } from '../../../utils/exportUtils';

export function BarberosTab({ 
  barberos = [], 
  asistenciasList = [],
  onNewBarber, 
  onEditBarber, 
  onToggleActive, 
  onDeleteBarber,
  onOpenAsistenciaModal,
  onDeleteAsistencia
}) {
  // Filtros de asistencias / jornales
  const [periodoTipo, setPeriodoTipo] = useState('mes'); // 'mes' | 'dia' | 'todo'
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterBarberoId, setFilterBarberoId] = useState('all');

  const asistenciasFiltradas = asistenciasList.filter(item => {
    if (filterBarberoId !== 'all' && String(item.barbero_id) !== String(filterBarberoId)) {
      return false;
    }
    if (periodoTipo === 'mes') {
      return item.fecha.startsWith(selectedMonth);
    }
    if (periodoTipo === 'dia') {
      return item.fecha === selectedDate;
    }
    return true;
  });

  // Métricas
  const totalPresentes = asistenciasFiltradas.filter(a => a.estado === 'presente').length;
  const totalTardes = asistenciasFiltradas.filter(a => a.estado === 'tarde').length;
  const totalSalidasAnticipadas = asistenciasFiltradas.filter(a => a.estado === 'salida_anticipada').length;
  const totalFaltas = asistenciasFiltradas.filter(a => a.estado === 'ausente').length;

  // Descarga CSV de Jornales
  const handleExportJornales = () => {
    const headers = [
      'ID', 'Fecha', 'Barbero', 'Estado_Asistencia', 'Hora_Llegada', 'Hora_Salida', 'Motivo_Justificacion'
    ];

    const rows = asistenciasFiltradas.map(a => {
      const b = barberos.find(barb => String(barb.id) === String(a.barbero_id));
      return [
        a.id,
        a.fecha,
        b ? b.nombre : (a.barbero_nombre || 'Barbero'),
        a.estado.toUpperCase(),
        a.hora_llegada ? a.hora_llegada.slice(0, 5) : '-',
        a.hora_salida ? a.hora_salida.slice(0, 5) : '-',
        a.motivo || 'Sin observaciones'
      ];
    });

    const periodoEtiqueta = periodoTipo === 'mes' ? selectedMonth : periodoTipo === 'dia' ? selectedDate : 'Historico';
    exportToCSV(`Jornales_Asistencias_Barberos_${periodoEtiqueta}`, headers, rows);
  };

  const statusBadges = {
    presente: { label: 'Presente', class: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
    tarde: { label: 'Llegada Tarde', class: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
    salida_anticipada: { label: 'Salida Anticipada', class: 'bg-purple-500/15 text-purple-400 border-purple-500/30' },
    ausente: { label: 'Falta / Ausente', class: 'bg-red-500/15 text-red-400 border-red-500/30' },
    franco: { label: 'Franco / Libre', class: 'bg-blue-500/15 text-blue-400 border-blue-500/30' }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* SECCIÓN 1: EQUIPO DE BARBEROS (TARJETAS LIMPIAS) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-[#131313] border border-[#242424] p-4 rounded-2xl">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <User className="text-[#d4af37]" size={18} />
              <span>Equipo de Barberos</span>
            </h2>
            <p className="text-xs text-gray-400">Personal activo, fotos de perfil y horarios de atención.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onOpenAsistenciaModal}
              className="flex items-center gap-1.5 bg-[#1e1e1e] hover:bg-[#282828] text-gray-200 border border-[#383838] px-3.5 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all active:scale-95"
            >
              <UserCheck size={14} className="text-[#d4af37]" />
              <span>Registrar Asistencia</span>
            </button>

            <button
              onClick={onNewBarber}
              className="flex items-center gap-1.5 bg-[#d4af37] text-black font-bold px-3.5 py-2 rounded-xl text-xs uppercase tracking-wider shadow-lg active:scale-95 transition-all"
            >
              <Plus size={14} />
              <span>Agregar Barbero</span>
            </button>
          </div>
        </div>

        {/* Grid de Tarjetas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {barberos.map((b) => {
            const inicio = b.hora_inicio ? b.hora_inicio.slice(0, 5) : '10:00';
            const fin = b.hora_fin ? b.hora_fin.slice(0, 5) : '20:00';

            return (
              <div 
                key={b.id}
                className={`bg-[#131313] border p-4 rounded-2xl space-y-3.5 transition-all ${
                  b.activo ? 'border-[#262626]' : 'border-red-500/30 opacity-60'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-[#1e190d] border border-[#d4af37]/60 overflow-hidden flex items-center justify-center shrink-0 shadow-md">
                    {b.avatar_url ? (
                      <img 
                        src={b.avatar_url} 
                        alt={b.nombre || 'Barbero'} 
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <span className="text-base font-bold text-[#d4af37]">
                        {b.nombre ? b.nombre.charAt(0).toUpperCase() : <User size={20} />}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-white truncate">{b.nombre}</h3>
                    <p className="text-[11px] text-[#d4af37] font-semibold leading-tight line-clamp-1">
                      {b.descripcion || 'Especialista en Barbería'}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">{b.telefono || 'Sin teléfono'}</p>
                  </div>
                </div>

                <div className="bg-[#1a1a1a] p-2.5 rounded-xl border border-[#262626] text-[11px] text-gray-300 flex items-center justify-between">
                  <span className="flex items-center gap-1 text-gray-400">
                    <Clock size={12} className="text-[#d4af37]" />
                    <span>Turno habitual:</span>
                  </span>
                  <strong className="text-white font-mono">{inicio} a {fin} hs</strong>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-[#222222]">
                  <button
                    onClick={() => onToggleActive(b)}
                    className={`flex items-center gap-1.5 text-[10px] uppercase font-bold px-2.5 py-1 rounded-lg border transition-all ${
                      b.activo 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                        : 'bg-gray-800 text-gray-400 border-gray-700'
                    }`}
                  >
                    <Power size={11} />
                    <span>{b.activo ? 'Habilitado Web' : 'Deshabilitado'}</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEditBarber(b)}
                      className="p-1.5 bg-[#1b1b1b] hover:bg-[#252525] text-gray-300 hover:text-white rounded-lg border border-[#2f2f2f] transition-colors"
                      title="Editar Barbero & Foto"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => onDeleteBarber(b.id)}
                      className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg border border-red-500/30 transition-colors"
                      title="Eliminar Barbero"
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

      {/* SECCIÓN 2: CONTROL DE ASISTENCIA & JORNALES */}
      <div className="space-y-4 pt-4 border-t border-[#222222]">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-[#131313] border border-[#242424] p-4 rounded-2xl">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Calendar className="text-[#d4af37]" size={16} />
              <span>Control de Asistencias & Jornales de Personal</span>
            </h3>
            <p className="text-xs text-gray-400">Historial de entradas, tardanzas, salidas anticipadas y faltas justificadas.</p>
          </div>

          <button
            onClick={handleExportJornales}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3.5 py-2 rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg active:scale-95"
            title="Descargar detalle en Excel"
          >
            <Download size={14} />
            <span>Descargar Jornales (CSV)</span>
          </button>
        </div>

        {/* Filtros */}
        <div className="bg-[#131313] border border-[#242424] p-3 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1 bg-[#181818] p-1 rounded-xl border border-[#282828] font-bold">
            <button
              onClick={() => setPeriodoTipo('mes')}
              className={`px-3 py-1.5 rounded-lg transition-all ${periodoTipo === 'mes' ? 'bg-[#d4af37] text-black shadow' : 'text-gray-400 hover:text-white'}`}
            >
              Por Mes
            </button>
            <button
              onClick={() => setPeriodoTipo('dia')}
              className={`px-3 py-1.5 rounded-lg transition-all ${periodoTipo === 'dia' ? 'bg-[#d4af37] text-black shadow' : 'text-gray-400 hover:text-white'}`}
            >
              Por Día
            </button>
            <button
              onClick={() => setPeriodoTipo('todo')}
              className={`px-3 py-1.5 rounded-lg transition-all ${periodoTipo === 'todo' ? 'bg-[#d4af37] text-black shadow' : 'text-gray-400 hover:text-white'}`}
            >
              Histórico Todo
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {periodoTipo === 'mes' && (
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-[#181818] border border-[#303030] text-white px-3 py-1.5 rounded-xl focus:border-[#d4af37] focus:outline-none font-mono"
              />
            )}

            {periodoTipo === 'dia' && (
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-[#181818] border border-[#303030] text-white px-3 py-1.5 rounded-xl focus:border-[#d4af37] focus:outline-none font-mono"
              />
            )}

            <select
              value={filterBarberoId}
              onChange={(e) => setFilterBarberoId(e.target.value)}
              className="bg-[#181818] border border-[#303030] text-white px-3 py-1.5 rounded-xl focus:border-[#d4af37] focus:outline-none font-semibold"
            >
              <option value="all">Todos los barberos</option>
              {barberos.map(b => (
                <option key={b.id} value={b.id}>{b.nombre}</option>
              ))}
            </select>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-[#131313] border border-[#242424] p-3.5 rounded-2xl space-y-1">
            <span className="text-[10px] uppercase font-bold text-gray-400">Jornales Cumplidos</span>
            <p className="text-xl font-serif font-bold text-emerald-400">{totalPresentes} días</p>
            <p className="text-[10px] text-gray-500">Asistencias normales</p>
          </div>

          <div className="bg-[#131313] border border-[#242424] p-3.5 rounded-2xl space-y-1">
            <span className="text-[10px] uppercase font-bold text-gray-400">Llegadas Tarde</span>
            <p className="text-xl font-serif font-bold text-amber-400">{totalTardes} veces</p>
            <p className="text-[10px] text-gray-500">Con registro de hora</p>
          </div>

          <div className="bg-[#131313] border border-[#242424] p-3.5 rounded-2xl space-y-1">
            <span className="text-[10px] uppercase font-bold text-gray-400">Salidas Anticipadas</span>
            <p className="text-xl font-serif font-bold text-purple-400">{totalSalidasAnticipadas} veces</p>
            <p className="text-[10px] text-gray-500">Se retiró antes</p>
          </div>

          <div className="bg-[#131313] border border-[#242424] p-3.5 rounded-2xl space-y-1">
            <span className="text-[10px] uppercase font-bold text-gray-400">Faltas / Inasistencias</span>
            <p className="text-xl font-serif font-bold text-red-400">{totalFaltas} días</p>
            <p className="text-[10px] text-gray-500">Con motivo registrado</p>
          </div>
        </div>

        {/* Tabla de Historial */}
        <div className="bg-[#131313] border border-[#242424] rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-[#242424] flex justify-between items-center">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Detalle de Novedades ({periodoTipo === 'mes' ? selectedMonth : periodoTipo === 'dia' ? selectedDate : 'Histórico'})
            </h4>
            <span className="text-[11px] text-gray-500">{asistenciasFiltradas.length} registros</span>
          </div>

          {asistenciasFiltradas.length === 0 ? (
            <div className="p-8 text-center text-gray-500 space-y-1">
              <FileText size={28} className="mx-auto text-gray-600 mb-1" />
              <p className="text-xs font-bold text-gray-300">No hay registros de asistencia para este período</p>
              <p className="text-[11px]">Usa el botón "Registrar Asistencia" para asentar la jornada o novedades.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-300">
                <thead className="bg-[#181818] uppercase text-[10px] text-gray-400 border-b border-[#262626]">
                  <tr>
                    <th className="py-3 px-4">Fecha</th>
                    <th className="py-3 px-4">Barbero</th>
                    <th className="py-3 px-4">Estado</th>
                    <th className="py-3 px-4">Horario Registro</th>
                    <th className="py-3 px-4">Motivo / Justificación</th>
                    <th className="py-3 px-4 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222222]">
                  {asistenciasFiltradas.map((item) => {
                    const barb = barberos.find(b => String(b.id) === String(item.barbero_id));
                    const badgeInfo = statusBadges[item.estado] || statusBadges.presente;

                    return (
                      <tr key={item.id} className="hover:bg-[#181818]/60 transition-colors">
                        <td className="py-3 px-4 font-mono text-[11px] text-gray-400">{item.fecha}</td>
                        <td className="py-3 px-4 font-semibold text-white">{barb ? barb.nombre : (item.barbero_nombre || 'Barbero')}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase ${badgeInfo.class}`}>
                            {badgeInfo.label}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-gray-300">
                          {item.hora_llegada && <span>Llegó: <strong className="text-amber-400">{item.hora_llegada.slice(0, 5)} hs</strong></span>}
                          {item.hora_salida && <span>Salió: <strong className="text-purple-400">{item.hora_salida.slice(0, 5)} hs</strong></span>}
                          {!item.hora_llegada && !item.hora_salida && <span className="text-gray-500">Jornada normal</span>}
                        </td>
                        <td className="py-3 px-4 text-gray-400 max-w-xs truncate">
                          {item.motivo || '-'}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => onDeleteAsistencia(item.id)}
                            className="p-1 text-gray-500 hover:text-red-400 transition-colors"
                            title="Eliminar Registro"
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

    </div>
  );
}

export default BarberosTab;
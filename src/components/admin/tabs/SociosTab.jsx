// src/components/admin/tabs/SociosTab.jsx
import React, { useState } from 'react';
import { 
  Crown, User, Plus, Search, MessageSquare, Edit2, 
  Trash2, CreditCard, Sparkles, Award 
} from 'lucide-react';
import { exportToCSV } from '../../../utils/exportUtils';

// Íconos SVG nativos para redes (sin dependencias externas)
const InstagramIcon = ({ size = 11, className = "text-pink-400 shrink-0" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

const FacebookIcon = ({ size = 11, className = "text-blue-400 shrink-0" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

export function SociosTab({
  socios = [],
  onNewSocio,
  onEditSocio,
  onToggleVip,
  onRenewMembership,
  onDeleteSocio
}) {
  const [filterTipo, setFilterTipo] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const hoyStr = new Date().toISOString().split('T')[0];

  const sociosFiltrados = socios.filter(s => {
    const matchSearch = 
      (s.nombre || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.telefono || '').includes(searchQuery) ||
      (s.instagram || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.email || '').toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchSearch) return false;

    if (filterTipo === 'vip') return s.es_vip;
    if (filterTipo === 'estandar') return !s.es_vip;
    if (filterTipo === 'vencidos') {
      return s.es_vip && s.fecha_vencimiento_vip && s.fecha_vencimiento_vip < hoyStr;
    }

    return true;
  });

  const totalSocios = socios.length;
  const totalVips = socios.filter(s => s.es_vip).length;
  const totalVencidos = socios.filter(s => s.es_vip && s.fecha_vencimiento_vip && s.fecha_vencimiento_vip < hoyStr).length;
  const totalPuntosAcumulados = socios.reduce((acc, s) => acc + (Number(s.puntos) || 0), 0);

  const handleExportSocios = () => {
    const headers = [
      'ID', 'Nombre', 'Telefono', 'Email', 'Instagram', 'Facebook', 
      'Categoria', 'Puntos', 'Fecha_Inicio_VIP', 'Fecha_Vencimiento_VIP', 'Estado_Cuota'
    ];

    const rows = sociosFiltrados.map(s => {
      const isVencido = s.es_vip && s.fecha_vencimiento_vip && s.fecha_vencimiento_vip < hoyStr;
      return [
        s.id,
        s.nombre,
        s.telefono,
        s.email || 'No indicado',
        s.instagram ? `@${s.instagram.replace('@', '')}` : '-',
        s.facebook || '-',
        s.es_vip ? 'SOCIO VIP' : 'ESTANDAR',
        s.puntos || 0,
        s.fecha_inicio_vip || '-',
        s.fecha_vencimiento_vip || '-',
        s.es_vip ? (isVencido ? 'VENCIDA' : 'AL DIA') : 'GRATUITO'
      ];
    });

    exportToCSV('Listado_Club_Socios', headers, rows);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-[#131313] border border-[#242424] p-4 rounded-2xl">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Crown className="text-[#d4af37]" size={18} />
            <span>Club de Socios & Membresías VIP</span>
          </h2>
          <p className="text-xs text-gray-400">Control de miembros registrados, vencimientos de cuotas y redes para sorteos.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onNewSocio}
            className="flex items-center gap-1.5 bg-[#d4af37] text-black font-bold px-3.5 py-2 rounded-xl text-xs uppercase tracking-wider shadow-lg active:scale-95 transition-all"
          >
            <Plus size={14} />
            <span>Registrar Socio</span>
          </button>

          <button
            onClick={handleExportSocios}
            className="flex items-center gap-1.5 bg-[#1e1e1e] hover:bg-[#282828] text-gray-200 border border-[#383838] px-3.5 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all active:scale-95"
            title="Exportar socios a Excel"
          >
            <span>Descargar CSV</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-[#131313] border border-[#242424] p-4 rounded-2xl space-y-1">
          <span className="text-[10px] uppercase font-bold text-gray-400">Total Miembros</span>
          <p className="text-xl sm:text-2xl font-serif font-bold text-white">{totalSocios}</p>
          <p className="text-[10px] text-gray-500">Registrados en la comunidad</p>
        </div>

        <div className="bg-[#131313] border border-[#d4af37]/30 p-4 rounded-2xl space-y-1 bg-gradient-to-br from-[#1a160d] to-[#131313]">
          <span className="text-[10px] uppercase font-bold text-[#d4af37] flex items-center gap-1">
            <Crown size={11} />
            <span>Socios VIP Activos</span>
          </span>
          <p className="text-xl sm:text-2xl font-serif font-bold text-[#d4af37]">{totalVips}</p>
          <p className="text-[10px] text-gray-400">Con cuota mensual</p>
        </div>

        <div className="bg-[#131313] border border-[#242424] p-4 rounded-2xl space-y-1">
          <span className="text-[10px] uppercase font-bold text-red-400">Cuotas por Vencer / Vencidas</span>
          <p className="text-xl sm:text-2xl font-serif font-bold text-red-400">{totalVencidos}</p>
          <p className="text-[10px] text-gray-500">Requieren renovación</p>
        </div>

        <div className="bg-[#131313] border border-[#242424] p-4 rounded-2xl space-y-1">
          <span className="text-[10px] uppercase font-bold text-purple-400 flex items-center gap-1">
            <Award size={11} />
            <span>Puntos Emitidos</span>
          </span>
          <p className="text-xl sm:text-2xl font-serif font-bold text-purple-400">{totalPuntosAcumulados.toLocaleString()} pts</p>
          <p className="text-[10px] text-gray-500">Para canjes y premios</p>
        </div>
      </div>

      <div className="bg-[#131313] border border-[#242424] p-3.5 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1 bg-[#181818] p-1 rounded-xl border border-[#282828] font-bold">
          <button
            onClick={() => setFilterTipo('all')}
            className={`px-3 py-1.5 rounded-lg transition-all ${filterTipo === 'all' ? 'bg-[#d4af37] text-black shadow' : 'text-gray-400 hover:text-white'}`}
          >
            Todos ({socios.length})
          </button>
          <button
            onClick={() => setFilterTipo('vip')}
            className={`px-3 py-1.5 rounded-lg transition-all ${filterTipo === 'vip' ? 'bg-[#d4af37] text-black shadow' : 'text-gray-400 hover:text-white'}`}
          >
            Socios VIP ⭐ ({totalVips})
          </button>
          <button
            onClick={() => setFilterTipo('estandar')}
            className={`px-3 py-1.5 rounded-lg transition-all ${filterTipo === 'estandar' ? 'bg-[#d4af37] text-black shadow' : 'text-gray-400 hover:text-white'}`}
          >
            Estándar ({totalSocios - totalVips})
          </button>
          {totalVencidos > 0 && (
            <button
              onClick={() => setFilterTipo('vencidos')}
              className={`px-3 py-1.5 rounded-lg transition-all ${filterTipo === 'vencidos' ? 'bg-red-500 text-white shadow' : 'text-red-400 hover:text-white'}`}
            >
              Vencidos ({totalVencidos})
            </button>
          )}
        </div>

        <div className="relative flex-1 sm:max-w-xs">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Buscar por nombre, celular o @Instagram..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#181818] border border-[#303030] rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#d4af37]"
          />
        </div>
      </div>

      {sociosFiltrados.length === 0 ? (
        <div className="bg-[#131313] border border-[#242424] rounded-3xl p-12 text-center text-gray-500 space-y-2">
          <User size={36} className="mx-auto text-gray-600 mb-1" />
          <p className="text-sm font-bold text-gray-300">No se encontraron socios con los filtros aplicados</p>
          <p className="text-xs">Los clientes que se registren desde la web aparecerán aquí automáticamente.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {sociosFiltrados.map((socio) => {
            const isVencido = socio.es_vip && socio.fecha_vencimiento_vip && socio.fecha_vencimiento_vip < hoyStr;
            const cleanPhone = (socio.telefono || '').replace(/\D/g, '');
            const waNumber = cleanPhone.startsWith('0') ? `598${cleanPhone.slice(1)}` : `598${cleanPhone}`;
            const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(`¡Hola ${socio.nombre}! Te escribimos del Club de Socios de la barbería.`)}`;

            return (
              <div
                key={socio.id}
                className={`bg-[#131313] border rounded-2xl p-4.5 space-y-3.5 transition-all shadow-lg flex flex-col justify-between ${
                  socio.es_vip
                    ? isVencido
                      ? 'border-red-500/40 bg-[#161212]'
                      : 'border-[#d4af37]/40 bg-gradient-to-b from-[#17140c] to-[#121212]'
                    : 'border-[#242424] hover:border-[#383838]'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shadow-md ${
                        socio.es_vip
                          ? 'bg-[#d4af37] text-black'
                          : 'bg-[#202020] text-gray-300 border border-[#303030]'
                      }`}>
                        {socio.nombre ? socio.nombre.charAt(0).toUpperCase() : <User size={16} />}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white leading-tight flex items-center gap-1.5">
                          <span>{socio.nombre}</span>
                          {socio.es_vip && <Crown size={12} className="text-[#d4af37]" />}
                        </h3>
                        <p className="text-[11px] text-gray-400 font-mono">{socio.telefono}</p>
                      </div>
                    </div>

                    <span className={`text-[9px] uppercase font-extrabold px-2 py-0.5 rounded-full border ${
                      socio.es_vip
                        ? isVencido
                          ? 'bg-red-500/15 text-red-400 border-red-500/30'
                          : 'bg-[#d4af37]/15 text-[#d4af37] border-[#d4af37]/40'
                        : 'bg-[#222] text-gray-400 border-[#333]'
                    }`}>
                      {socio.es_vip ? (isVencido ? 'VIP Vencido' : 'Socio VIP ⭐') : 'Estándar'}
                    </span>
                  </div>

                  <div className="bg-[#181818] p-2.5 rounded-xl border border-[#262626] text-[11px] space-y-1.5">
                    {socio.instagram && (
                      <div className="flex items-center justify-between text-gray-300">
                        <span className="flex items-center gap-1 text-gray-400">
                          <InstagramIcon size={11} />
                          <span>Instagram:</span>
                        </span>
                        <a 
                          href={`https://instagram.com/${socio.instagram.replace('@', '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#d4af37] font-semibold hover:underline"
                        >
                          @{socio.instagram.replace('@', '')}
                        </a>
                      </div>
                    )}

                    {socio.facebook && (
                      <div className="flex items-center justify-between text-gray-300">
                        <span className="flex items-center gap-1 text-gray-400">
                          <FacebookIcon size={11} />
                          <span>Facebook:</span>
                        </span>
                        <span className="text-white truncate max-w-[140px]">{socio.facebook}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-gray-300 pt-1 border-t border-[#222222]">
                      <span className="flex items-center gap-1 text-gray-400">
                        <Sparkles size={11} className="text-purple-400" />
                        <span>Puntos Acumulados:</span>
                      </span>
                      <strong className="text-purple-400 font-mono">{socio.puntos || 0} pts</strong>
                    </div>
                  </div>
                </div>

                {socio.es_vip && (
                  <div className={`p-2.5 rounded-xl border text-[11px] space-y-1 ${
                    isVencido
                      ? 'bg-red-500/10 border-red-500/30 text-red-300'
                      : 'bg-[#181818] border-[#282828] text-gray-300'
                  }`}>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Vencimiento Cuota:</span>
                      <strong className={isVencido ? 'text-red-400 font-bold' : 'text-emerald-400 font-mono'}>
                        {socio.fecha_vencimiento_vip || 'Sin fecha'} {isVencido ? '(Vencida)' : ''}
                      </strong>
                    </div>

                    <button
                      type="button"
                      onClick={() => onRenewMembership(socio)}
                      className="w-full mt-1.5 flex items-center justify-center gap-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all active:scale-95"
                    >
                      <CreditCard size={12} />
                      <span>Cobrar y Renovar Mes (+30 días)</span>
                    </button>
                  </div>
                )}

                <div className="flex justify-between items-center pt-2 border-t border-[#222222]">
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#25D366] border border-[#25D366]/40 px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all"
                  >
                    <MessageSquare size={13} />
                    <span>WhatsApp</span>
                  </a>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onToggleVip(socio)}
                      className={`p-1.5 rounded-lg border transition-colors ${
                        socio.es_vip 
                          ? 'bg-[#d4af37]/20 text-[#d4af37] border-[#d4af37]/40' 
                          : 'bg-[#1e1e1e] text-gray-400 border-[#2e2e2e] hover:text-white'
                      }`}
                      title={socio.es_vip ? 'Cambiar a Socio Estándar' : 'Ascender a Socio VIP'}
                    >
                      <Crown size={13} />
                    </button>

                    <button
                      onClick={() => onEditSocio(socio)}
                      className="p-1.5 bg-[#1b1b1b] hover:bg-[#252525] text-gray-300 hover:text-white rounded-lg border border-[#2f2f2f] transition-colors"
                      title="Editar Datos"
                    >
                      <Edit2 size={13} />
                    </button>

                    <button
                      onClick={() => onDeleteSocio(socio.id)}
                      className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg border border-red-500/30 transition-colors"
                      title="Eliminar Socio"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}

export default SociosTab;
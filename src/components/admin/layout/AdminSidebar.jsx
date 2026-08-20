// src/components/admin/layout/AdminSidebar.jsx
import React from 'react';
import { Calendar, DollarSign, Package, Tag, Scissors, Users, Crown } from 'lucide-react';

export function AdminSidebar({
  activeTab,
  setActiveTab,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  badges = {},
  totalFacturadoDia = 0,
  cortesCompletadosCount = 0
}) {
  const menuItems = [
    { id: 'citas', label: 'Agenda de Turnos', icon: Calendar, badge: badges.citas },
    { id: 'facturacion', label: 'Facturación / Caja', icon: DollarSign },
    { id: 'socios', label: 'Club de Socios VIP', icon: Crown, badge: badges.sociosVencidos },
    { id: 'barberos', label: 'Equipo & Asistencia', icon: Users },
    { id: 'servicios', label: 'Catálogo Servicios', icon: Scissors },
    { id: 'stock', label: 'Stock / Inventario', icon: Package, badge: badges.stock },
    { id: 'promociones', label: 'Promociones Web', icon: Tag, badge: badges.promociones }
  ];

  return (
    <>
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside className={`
        fixed lg:static top-[57px] bottom-0 left-0 z-40
        w-64 bg-[#0d0d0d] border-r border-[#202020] flex flex-col justify-between
        transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        
        <div className="p-4 space-y-1 overflow-y-auto flex-1">
          <span className="text-[10px] uppercase font-bold text-gray-300 tracking-wider px-3 mb-2 block">
            Módulos de Gestión
          </span>

          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-[#1e1a0f] text-[#d4af37] border border-[#d4af37]/40 shadow-md font-bold'
                    : 'text-gray-400 hover:text-white hover:bg-[#161616]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon size={16} className={isActive ? 'text-[#d4af37]' : 'text-gray-500'} />
                  <span>{item.label}</span>
                </div>

                {item.badge > 0 && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    item.id === 'socios' 
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : 'bg-[#d4af37] text-black'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Resumen del Día */}
        <div className="p-4 border-t border-[#1a1a1a] bg-[#0a0a0a]">
          <div className="bg-[#141414] border border-[#242424] rounded-2xl p-3 space-y-1.5">
            <span className="text-[10px] uppercase font-bold text-[#d4af37] block">
              Caja del Día
            </span>
            <div className="flex justify-between items-baseline">
              <span className="text-xs text-gray-400">Total Hoy:</span>
              <strong className="text-sm font-serif font-bold text-white">${totalFacturadoDia.toLocaleString()} UYU</strong>
            </div>
            <div className="flex justify-between items-baseline text-[11px] text-gray-400">
              <span>Atenciones:</span>
              <span className="font-semibold text-emerald-400">{cortesCompletadosCount} cortes</span>
            </div>
          </div>
        </div>

      </aside>
    </>
  );
}

export default AdminSidebar;
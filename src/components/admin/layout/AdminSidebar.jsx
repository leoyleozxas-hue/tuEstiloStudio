// src/components/admin/layout/AdminSidebar.jsx
import React from 'react';
import { 
  Calendar, Scissors, Users, Package, ReceiptText, 
  Tag, X, TrendingUp 
} from 'lucide-react';

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
    { id: 'citas', label: 'Agenda de Citas', icon: Calendar, badge: badges.citas || 0 },
    { id: 'facturacion', label: 'Cortes & Facturación', icon: ReceiptText, badge: null },
    { id: 'stock', label: 'Stock & Insumos', icon: Package, badge: badges.stock || 0 },
    { id: 'promociones', label: 'Promociones & Club', icon: Tag, badge: badges.promociones || 0 },
    { id: 'servicios', label: 'Servicios & Precios', icon: Scissors, badge: null },
    { id: 'barberos', label: 'Barberos & Equipo', icon: Users, badge: null }
  ];

  return (
    <>
      {/* SIDEBAR DESKTOP */}
      <aside className="hidden lg:flex w-64 flex-col justify-between bg-[#0c0c0c] border-r border-[#222222] p-4 shrink-0">
        <div className="space-y-1.5">
          <p className="px-3 text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase mb-3">
            Gestión del Local
          </p>
          
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive 
                    ? 'bg-[#d4af37] text-black shadow-md shadow-[#d4af37]/20 font-extrabold' 
                    : 'text-gray-400 hover:text-white hover:bg-[#161616]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon size={16} />
                  <span>{item.label}</span>
                </div>
                {item.badge > 0 && (
                  <span className={`px-2 py-0.5 text-[10px] rounded-full ${
                    isActive ? 'bg-black text-[#d4af37]' : 'bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/40'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="bg-[#121212] border border-[#262626] rounded-2xl p-3.5 space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
            <TrendingUp size={13} className="text-emerald-400" />
            <span>Cortes Atendidos Hoy:</span>
          </div>
          <p className="text-lg font-serif font-bold text-emerald-400">${totalFacturadoDia} UYU</p>
          <p className="text-[10px] text-gray-500">{cortesCompletadosCount} clientes completados</p>
        </div>
      </aside>

      {/* SIDEBAR MOBILE (DRAWER DESPLEGABLE) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex animate-fadeIn">
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm" 
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative w-72 max-w-[80vw] bg-[#0c0c0c] h-full border-r border-[#222222] p-5 flex flex-col justify-between z-50">
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-[#222222]">
                <span className="text-xs font-bold text-[#d4af37] uppercase tracking-wider">Menú Administrador</span>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1 text-gray-400 hover:text-white rounded-lg bg-[#181818]"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-1 pt-1">
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
                      className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
                        isActive 
                          ? 'bg-[#d4af37] text-black font-extrabold' 
                          : 'text-gray-300 hover:text-white hover:bg-[#181818]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={16} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge > 0 && (
                        <span className="px-2 py-0.5 text-[10px] rounded-full bg-black text-[#d4af37]">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bg-[#141414] p-3 rounded-xl border border-[#262626] text-xs">
              <span className="text-gray-400 block text-[10px]">Facturación del día:</span>
              <strong className="text-emerald-400 font-bold text-sm">${totalFacturadoDia} UYU</strong>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
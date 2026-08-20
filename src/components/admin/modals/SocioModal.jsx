// src/components/admin/modals/SocioModal.jsx
import React from 'react';

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

export function SocioModal({ isOpen, onClose, onSave, editingSocio, socioForm, setSocioForm }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#131313] border border-[#2a2a2a] w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div>
          <span className="text-[10px] uppercase font-bold text-[#d4af37] tracking-wider block">Comunidad & Beneficios</span>
          <h3 className="text-base font-bold text-white">
            {editingSocio ? 'Editar Datos del Socio' : 'Registrar Nuevo Socio'}
          </h3>
        </div>

        <form onSubmit={onSave} className="space-y-3 text-xs">
          
          <div>
            <label className="block text-gray-400 uppercase font-bold mb-1 text-[10px]">Nombre Completo *</label>
            <input
              type="text"
              required
              placeholder="Ej: Lucas Silva"
              value={socioForm.nombre}
              onChange={(e) => setSocioForm({ ...socioForm, nombre: e.target.value })}
              className="w-full bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl px-3 py-2 text-white focus:border-[#d4af37] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-400 uppercase font-bold mb-1 text-[10px]">Celular (WhatsApp) *</label>
              <input
                type="tel"
                required
                placeholder="099 123 456"
                value={socioForm.telefono}
                onChange={(e) => setSocioForm({ ...socioForm, telefono: e.target.value })}
                className="w-full bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl px-3 py-2 text-white focus:border-[#d4af37] focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-gray-400 uppercase font-bold mb-1 text-[10px]">Email (Opcional)</label>
              <input
                type="email"
                placeholder="lucas@email.com"
                value={socioForm.email || ''}
                onChange={(e) => setSocioForm({ ...socioForm, email: e.target.value })}
                className="w-full bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl px-3 py-2 text-white focus:border-[#d4af37] focus:outline-none"
              />
            </div>
          </div>

          {/* Redes Sociales para Sorteos */}
          <div className="bg-[#181818] p-3 rounded-2xl border border-[#282828] space-y-2">
            <span className="text-[10px] font-bold text-gray-300 uppercase tracking-wider block">
              Redes Sociales (Para Sorteos & Comunidad)
            </span>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-gray-400 text-[10px] mb-0.5 flex items-center gap-1">
                  <InstagramIcon size={10} />
                  <span>Instagram</span>
                </label>
                <input
                  type="text"
                  placeholder="@lucas_barber"
                  value={socioForm.instagram || ''}
                  onChange={(e) => setSocioForm({ ...socioForm, instagram: e.target.value })}
                  className="w-full bg-[#131313] border border-[#2c2c2c] rounded-xl px-2.5 py-1.5 text-white focus:border-[#d4af37] focus:outline-none text-[11px]"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-[10px] mb-0.5 flex items-center gap-1">
                  <FacebookIcon size={10} />
                  <span>Facebook</span>
                </label>
                <input
                  type="text"
                  placeholder="Lucas Silva"
                  value={socioForm.facebook || ''}
                  onChange={(e) => setSocioForm({ ...socioForm, facebook: e.target.value })}
                  className="w-full bg-[#131313] border border-[#2c2c2c] rounded-xl px-2.5 py-1.5 text-white focus:border-[#d4af37] focus:outline-none text-[11px]"
                />
              </div>
            </div>
          </div>

          {/* Categoría de Membresía */}
          <div className="bg-[#181818] p-3 rounded-2xl border border-[#282828] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-gray-300 uppercase tracking-wider">
                Categoría de Membresía
              </span>

              <button
                type="button"
                onClick={() => setSocioForm({ ...socioForm, es_vip: !socioForm.es_vip })}
                className={`px-3 py-1 rounded-xl text-[10px] font-extrabold uppercase transition-all ${
                  socioForm.es_vip
                    ? 'bg-[#d4af37] text-black shadow'
                    : 'bg-[#282828] text-gray-400 hover:text-white'
                }`}
              >
                {socioForm.es_vip ? 'Socio VIP ⭐' : 'Socio Estándar'}
              </button>
            </div>

            {socioForm.es_vip && (
              <div className="grid grid-cols-2 gap-2.5 pt-1.5 border-t border-[#262626] animate-fadeIn">
                <div>
                  <label className="block text-gray-400 text-[10px] mb-0.5">Inicio Membresía</label>
                  <input
                    type="date"
                    value={socioForm.fecha_inicio_vip || new Date().toISOString().split('T')[0]}
                    onChange={(e) => setSocioForm({ ...socioForm, fecha_inicio_vip: e.target.value })}
                    className="w-full bg-[#131313] border border-[#2c2c2c] rounded-xl px-2.5 py-1.5 text-white focus:border-[#d4af37] focus:outline-none font-mono text-[11px]"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 text-[10px] mb-0.5">Vencimiento Cuota</label>
                  <input
                    type="date"
                    value={socioForm.fecha_vencimiento_vip || ''}
                    onChange={(e) => setSocioForm({ ...socioForm, fecha_vencimiento_vip: e.target.value })}
                    className="w-full bg-[#131313] border border-[#2c2c2c] rounded-xl px-2.5 py-1.5 text-white focus:border-[#d4af37] focus:outline-none font-mono text-[11px]"
                  />
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-gray-400 uppercase font-bold mb-1 text-[10px]">Puntos Acumulados</label>
            <input
              type="number"
              placeholder="100"
              value={socioForm.puntos || 0}
              onChange={(e) => setSocioForm({ ...socioForm, puntos: parseInt(e.target.value) || 0 })}
              className="w-full bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl px-3 py-2 text-white focus:border-[#d4af37] focus:outline-none font-mono text-purple-400 font-bold"
            />
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
              Guardar Socio
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SocioModal;
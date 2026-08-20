// src/components/admin/modals/ConfirmDeleteVentaModal.jsx
import React, { useState } from 'react';
import { ShieldAlert, Lock, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '../../../lib/supabaseClient';

export function ConfirmDeleteVentaModal({ isOpen, onClose, onConfirm, itemToDelete, adminEmail }) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !itemToDelete) return null;

  const handleVerifyAndConfirm = async (e) => {
    e.preventDefault();
    if (!password.trim()) {
      setErrorMsg('Ingresa tu contraseña de administrador.');
      return;
    }

    setVerifying(true);
    setErrorMsg('');

    try {
      // Validar la contraseña del admin en Supabase Auth
      const { error } = await supabase.auth.signInWithPassword({
        email: adminEmail,
        password: password
      });

      if (error) {
        setErrorMsg('Contraseña de administrador incorrecta. Acción no autorizada.');
        setVerifying(false);
        return;
      }

      // Si la clave es correcta, autorizar la anulación
      await onConfirm(itemToDelete);
      setPassword('');
      onClose();
    } catch (err) {
      console.error('Error de verificación:', err);
      setErrorMsg('Error al verificar credenciales.');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#131313] border border-red-500/40 w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4 relative">
        
        {/* Cabecera de Advertencia */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-red-500/15 border border-red-500/40 flex items-center justify-center text-red-400 shrink-0 shadow-lg">
            <ShieldAlert size={24} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-red-400 tracking-wider block">Seguridad Requerida</span>
            <h3 className="text-base font-bold text-white">Anular Registro de Venta / Cobro</h3>
          </div>
        </div>

        {/* Detalle del cobro a anular */}
        <div className="bg-[#181818] border border-[#282828] rounded-2xl p-3.5 text-xs space-y-1.5">
          <div className="flex justify-between text-gray-400">
            <span>Fecha / Hora:</span>
            <strong className="text-white font-mono">{itemToDelete.fecha} ({itemToDelete.hora})</strong>
          </div>
          <div className="flex justify-between text-gray-400">
            <span>Cliente:</span>
            <strong className="text-white">{itemToDelete.cliente_nombre}</strong>
          </div>
          <div className="flex justify-between text-gray-400">
            <span>Servicio / Barbero:</span>
            <span className="text-gray-300">{itemToDelete.servicio_nombre} • {itemToDelete.barbero_nombre}</span>
          </div>
          <div className="flex justify-between text-gray-400 pt-1 border-t border-[#242424]">
            <span>Monto a descontar de caja:</span>
            <strong className="text-emerald-400 font-serif text-sm">${itemToDelete.total || itemToDelete.monto} UYU</strong>
          </div>
        </div>

        <p className="text-[11px] text-gray-400 leading-relaxed">
          Esta acción descontará el cobro de la facturación y anulará el turno. Por seguridad, ingresa la contraseña de administrador.
        </p>

        {/* Formulario de Contraseña */}
        <form onSubmit={handleVerifyAndConfirm} className="space-y-3 text-xs">
          {errorMsg && (
            <div className="bg-red-500/10 border border-red-500/40 text-red-400 p-2.5 rounded-xl text-xs flex items-center gap-2 animate-fadeIn">
              <AlertCircle size={14} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-gray-300 uppercase font-bold mb-1 text-[10px] flex items-center gap-1">
              <Lock size={11} className="text-[#d4af37]" />
              <span>Contraseña de Administrador *</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoFocus
                placeholder="Ingresa tu contraseña de admin"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#181818] border border-[#2e2e2e] rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-red-400 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => { setPassword(''); setErrorMsg(''); onClose(); }}
              className="flex-1 py-2.5 rounded-xl bg-[#222222] text-gray-300 font-bold hover:bg-[#2a2a2a] transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={verifying}
              className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold transition-colors shadow-md uppercase tracking-wider flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {verifying ? (
                <>
                  <Loader2 className="animate-spin" size={13} />
                  <span>Verificando...</span>
                </>
              ) : (
                <span>Confirmar Anulación</span>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

export default ConfirmDeleteVentaModal;
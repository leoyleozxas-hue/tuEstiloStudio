// src/components/admin/modals/BarberModal.jsx
import React, { useState } from 'react';
import { User, Upload, Loader2, Clock, Check } from 'lucide-react';
import { supabase } from '../../../lib/supabaseClient';

export function BarberModal({ isOpen, onClose, onSave, editingBarber, barberForm, setBarberForm }) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  if (!isOpen) return null;

  // Manejador de subida de archivo a Supabase Storage
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Por favor selecciona un archivo de imagen (JPG, PNG, WEBP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('La imagen no puede superar los 5MB.');
      return;
    }

    setUploading(true);
    setUploadError('');

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // 1. Subir archivo al bucket 'barberos'
      const { error: uploadErr } = await supabase.storage
        .from('barberos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadErr) throw uploadErr;

      // 2. Obtener la URL pública permanente
      const { data: { publicUrl } } = supabase.storage
        .from('barberos')
        .getPublicUrl(filePath);

      setBarberForm(prev => ({ ...prev, avatar_url: publicUrl }));
    } catch (err) {
      console.error('Error al subir imagen:', err);
      if (err.message?.includes('bucket') || err.message?.includes('not found')) {
        setUploadError('Recuerda crear el bucket público "barberos" en Supabase Storage.');
      } else {
        setUploadError(`Error al subir: ${err.message || 'Inténtalo de nuevo'}`);
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#131313] border border-[#2a2a2a] w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div>
          <span className="text-[10px] uppercase font-bold text-[#d4af37] tracking-wider block">Equipo & Perfil</span>
          <h3 className="text-base font-bold text-white">
            {editingBarber ? 'Editar Barbero & Perfil' : 'Registrar Nuevo Barbero'}
          </h3>
        </div>

        <form onSubmit={onSave} className="space-y-3 text-xs">
          
          {/* Subida de Archivo con Vista Previa */}
          <div className="bg-[#181818] p-3.5 rounded-2xl border border-[#282828] space-y-2.5">
            <label className="block text-[10px] font-bold text-gray-300 uppercase tracking-wider">
              Foto de Perfil del Barbero
            </label>

            <div className="flex items-center gap-3.5">
              {/* Círculo Vista Previa */}
              <div className="w-16 h-16 rounded-2xl bg-[#222222] border-2 border-[#d4af37]/60 overflow-hidden flex items-center justify-center shrink-0 shadow-md relative">
                {uploading ? (
                  <Loader2 className="animate-spin text-[#d4af37]" size={22} />
                ) : barberForm.avatar_url ? (
                  <img 
                    src={barberForm.avatar_url} 
                    alt={barberForm.nombre || 'Barbero'} 
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <span className="text-base font-bold text-[#d4af37]">
                    {barberForm.nombre ? barberForm.nombre.charAt(0).toUpperCase() : <User size={22} />}
                  </span>
                )}
              </div>

              {/* Botón de selección de archivo */}
              <div className="flex-1 min-w-0 space-y-1.5">
                <label className="inline-flex items-center gap-1.5 bg-[#252525] hover:bg-[#303030] text-gray-200 border border-[#383838] px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all active:scale-95">
                  <Upload size={13} className="text-[#d4af37]" />
                  <span>{uploading ? 'Subiendo imagen...' : 'Subir foto desde dispositivo'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>

                {barberForm.avatar_url && !uploading && (
                  <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                    <Check size={11} /> Foto subida y lista
                  </p>
                )}
              </div>
            </div>

            {uploadError && (
              <p className="text-[10px] text-red-400 bg-red-500/10 p-2 rounded-xl border border-red-500/30">
                {uploadError}
              </p>
            )}
          </div>

          <div>
            <label className="block text-gray-400 uppercase font-bold mb-1 text-[10px]">Nombre Completo *</label>
            <input
              type="text"
              required
              placeholder="Ej: Mateo Benítez"
              value={barberForm.nombre}
              onChange={(e) => setBarberForm({ ...barberForm, nombre: e.target.value })}
              className="w-full bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl px-3 py-2 text-white focus:border-[#d4af37] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-400 uppercase font-bold mb-1 text-[10px]">Especialidad / Descripción Corta</label>
            <input
              type="text"
              placeholder="Ej: Master Barber • Especialista en Fade y Barbas"
              value={barberForm.descripcion || ''}
              onChange={(e) => setBarberForm({ ...barberForm, descripcion: e.target.value })}
              className="w-full bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl px-3 py-2 text-white focus:border-[#d4af37] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-400 uppercase font-bold mb-1 text-[10px]">Teléfono (WhatsApp)</label>
              <input
                type="tel"
                placeholder="099 123 456"
                value={barberForm.telefono}
                onChange={(e) => setBarberForm({ ...barberForm, telefono: e.target.value })}
                className="w-full bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl px-3 py-2 text-white focus:border-[#d4af37] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-400 uppercase font-bold mb-1 text-[10px]">Email</label>
              <input
                type="email"
                placeholder="mateo@barberia.com"
                value={barberForm.email}
                onChange={(e) => setBarberForm({ ...barberForm, email: e.target.value })}
                className="w-full bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl px-3 py-2 text-white focus:border-[#d4af37] focus:outline-none"
              />
            </div>
          </div>

          {/* Horarios de Entrada y Salida */}
          <div className="bg-[#181818] border border-[#282828] p-3 rounded-2xl space-y-2">
            <label className="block text-gray-300 uppercase font-bold text-[10px] flex items-center gap-1">
              <Clock size={11} className="text-[#d4af37]" />
              <span>Horario de Trabajo *</span>
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <span className="text-[10px] text-gray-400 block mb-0.5">Hora Entrada</span>
                <input
                  type="time"
                  required
                  value={barberForm.hora_inicio || '10:00'}
                  onChange={(e) => setBarberForm({ ...barberForm, hora_inicio: e.target.value })}
                  className="w-full bg-[#131313] border border-[#303030] rounded-xl px-3 py-2 text-white focus:border-[#d4af37] focus:outline-none font-mono"
                />
              </div>

              <div>
                <span className="text-[10px] text-gray-400 block mb-0.5">Hora Salida</span>
                <input
                  type="time"
                  required
                  value={barberForm.hora_fin || '20:00'}
                  onChange={(e) => setBarberForm({ ...barberForm, hora_fin: e.target.value })}
                  className="w-full bg-[#131313] border border-[#303030] rounded-xl px-3 py-2 text-white focus:border-[#d4af37] focus:outline-none font-mono"
                />
              </div>
            </div>
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
              disabled={uploading}
              className="flex-1 py-2.5 rounded-xl bg-[#d4af37] text-black font-bold hover:bg-[#c49f2e] transition-colors shadow-md uppercase tracking-wider disabled:opacity-50"
            >
              {uploading ? 'Subiendo foto...' : 'Guardar Barbero'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default BarberModal;
// src/components/admin/modals/ServiceModal.jsx
import React, { useState, useEffect } from 'react';
import { Scissors, Upload, Loader2, Check } from 'lucide-react';
import { supabase } from '../../../lib/supabaseClient';

export function ServiceModal({ isOpen, onClose, onSave, editingService, serviceForm, setServiceForm }) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  
  // Estado de texto libre para poder escribir espacios y comas sin bloqueos
  const [featuresText, setFeaturesText] = useState('');

  // Sincronizar el texto al abrir o editar
  useEffect(() => {
    if (isOpen) {
      if (Array.isArray(serviceForm.features)) {
        setFeaturesText(serviceForm.features.join(', '));
      } else {
        setFeaturesText(serviceForm.features || '');
      }
    }
  }, [isOpen, editingService]);

  if (!isOpen) return null;

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Selecciona un archivo de imagen (JPG, PNG, WEBP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('La imagen no debe superar los 5MB.');
      return;
    }

    setUploading(true);
    setUploadError('');

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `servicios-${Date.now()}.${fileExt}`;
      const filePath = `servicios/${fileName}`;

      const { error: uploadErr } = await supabase.storage
        .from('barberos')
        .upload(filePath, file, { cacheControl: '3600', upsert: true });

      if (uploadErr) throw uploadErr;

      const { data: { publicUrl } } = supabase.storage
        .from('barberos')
        .getPublicUrl(filePath);

      setServiceForm(prev => ({ ...prev, image_url: publicUrl }));
    } catch (err) {
      console.error('Error al subir imagen:', err);
      setUploadError(`Error al subir: ${err.message || 'Inténtalo de nuevo'}`);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Convertir el texto a lista limpia únicamente al guardar
    const featuresArray = featuresText
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    onSave(e, {
      ...serviceForm,
      features: featuresArray
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#131313] border border-[#2a2a2a] w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div>
          <span className="text-[10px] uppercase font-bold text-[#d4af37] tracking-wider block">Catálogo & Precios</span>
          <h3 className="text-base font-bold text-white">
            {editingService ? 'Editar Servicio' : 'Nuevo Servicio'}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          
          {/* Subida de Imagen */}
          <div className="bg-[#181818] p-3 rounded-2xl border border-[#282828] space-y-2">
            <label className="block text-[10px] font-bold text-gray-300 uppercase tracking-wider">
              Foto Ilustrativa del Servicio
            </label>

            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-xl bg-[#222222] border border-[#d4af37]/60 overflow-hidden flex items-center justify-center shrink-0">
                {uploading ? (
                  <Loader2 className="animate-spin text-[#d4af37]" size={20} />
                ) : serviceForm.image_url ? (
                  <img 
                    src={serviceForm.image_url} 
                    alt={serviceForm.nombre || 'Servicio'} 
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <Scissors size={20} className="text-gray-500" />
                )}
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <label className="inline-flex items-center gap-1.5 bg-[#252525] hover:bg-[#303030] text-gray-200 border border-[#383838] px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all active:scale-95">
                  <Upload size={12} className="text-[#d4af37]" />
                  <span>{uploading ? 'Subiendo...' : 'Subir foto'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>

                {serviceForm.image_url && !uploading && (
                  <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                    <Check size={11} /> Foto cargada
                  </p>
                )}
              </div>
            </div>

            {uploadError && (
              <p className="text-[10px] text-red-400 bg-red-500/10 p-1.5 rounded-lg border border-red-500/30">
                {uploadError}
              </p>
            )}
          </div>

          <div>
            <label className="block text-gray-400 uppercase font-bold mb-1 text-[10px]">Nombre del Servicio *</label>
            <input
              type="text"
              required
              placeholder="Ej: Corte Degradé + Perfilado de Barba"
              value={serviceForm.nombre}
              onChange={(e) => setServiceForm({ ...serviceForm, nombre: e.target.value })}
              className="w-full bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl px-3 py-2 text-white focus:border-[#d4af37] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-400 uppercase font-bold mb-1 text-[10px]">Precio ($ UYU) *</label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="450"
                value={serviceForm.precio}
                onChange={(e) => setServiceForm({ ...serviceForm, precio: e.target.value })}
                className="w-full bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl px-3 py-2 text-white focus:border-[#d4af37] focus:outline-none font-bold text-emerald-400"
              />
            </div>

            <div>
              <label className="block text-gray-400 uppercase font-bold mb-1 text-[10px]">Duración (Minutos) *</label>
              <select
                value={serviceForm.duracion_minutos}
                onChange={(e) => setServiceForm({ ...serviceForm, duracion_minutos: e.target.value })}
                className="w-full bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl px-3 py-2 text-white focus:border-[#d4af37] focus:outline-none"
              >
                <option value={15}>15 min</option>
                <option value={30}>30 min</option>
                <option value={45}>45 min</option>
                <option value={60}>60 min (1 h)</option>
                <option value={90}>90 min (1.5 h)</option>
                <option value={120}>120 min (2 h)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-gray-400 uppercase font-bold mb-1 text-[10px]">Etiqueta / Badge (Opcional)</label>
            <input
              type="text"
              placeholder="Ej: Más Popular, Recomendado, 2x1, Exclusivo"
              value={serviceForm.badge || ''}
              onChange={(e) => setServiceForm({ ...serviceForm, badge: e.target.value })}
              className="w-full bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl px-3 py-2 text-white focus:border-[#d4af37] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-400 uppercase font-bold mb-1 text-[10px]">Descripción</label>
            <textarea
              placeholder="Detalle del servicio para el cliente..."
              value={serviceForm.descripcion || ''}
              onChange={(e) => setServiceForm({ ...serviceForm, descripcion: e.target.value })}
              rows={2}
              className="w-full bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl px-3 py-2 text-white focus:border-[#d4af37] focus:outline-none"
            />
          </div>

          {/* Campo de Qué incluye: Escribe con espacios y comas libremente */}
          <div>
            <label className="block text-gray-400 uppercase font-bold mb-1 text-[10px]">
              Qué incluye (Separar cada beneficio con una coma)
            </label>
            <input
              type="text"
              placeholder="Ej: Lavado Premium, Peinado con cera, Toalla caliente"
              value={featuresText}
              onChange={(e) => setFeaturesText(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl px-3 py-2 text-white focus:border-[#d4af37] focus:outline-none placeholder-gray-600"
            />
            <p className="text-[10px] text-gray-500 mt-1">
              * Puedes usar la barra espaciadora y comas con total libertad.
            </p>
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
              {uploading ? 'Subiendo...' : 'Guardar Servicio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ServiceModal;
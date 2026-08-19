// src/components/admin/auth/AdminLogin.jsx
import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ShieldCheck, AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { studioData } from '../../../data/mockData';
import logoImg from '../../../assets/logo.png';

export function AdminLogin({ onLogin, loggingIn, loginError }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(email, password);
  };

  return (
    <div className="min-h-screen bg-[#080808] text-white flex flex-col items-center justify-center p-4 relative font-sans selection:bg-[#d4af37] selection:text-black">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#d4af37]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm bg-[#121212] border border-[#262626] rounded-3xl p-6 sm:p-8 shadow-2xl relative animate-fadeIn space-y-6">
        <div className="text-center space-y-2">
          <img 
            src={logoImg} 
            alt={studioData?.name || 'Studio Barber'} 
            className="w-14 h-14 object-contain rounded-full border border-[#d4af37]/60 p-1 bg-black/70 mx-auto shadow-lg"
          />
          <div>
            <span className="text-[9px] uppercase tracking-[0.3em] text-[#d4af37] font-bold block">
              ADMINISTRACIÓN
            </span>
            <h2 className="text-xl font-serif font-bold text-white tracking-tight">
              Acceso al Panel
            </h2>
          </div>
          <p className="text-xs text-gray-400">
            Ingresa tus credenciales autorizadas de {studioData?.name || 'Studio'}.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {loginError && (
            <div className="bg-red-500/10 border border-red-500/40 text-red-400 p-3 rounded-xl text-xs flex items-center gap-2 animate-fadeIn">
              <AlertCircle size={15} className="shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <div>
            <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1 flex items-center gap-1">
              <Mail size={11} className="text-[#d4af37]" />
              <span>Correo Electrónico</span>
            </label>
            <input
              type="email"
              required
              placeholder="admin@barberia.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#181818] border border-[#2b2b2b] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#d4af37] transition-colors"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1 flex items-center gap-1">
              <Lock size={11} className="text-[#d4af37]" />
              <span>Contraseña</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Tu contraseña de admin"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#181818] border border-[#2b2b2b] rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#d4af37] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loggingIn}
            className="w-full bg-[#d4af37] hover:bg-[#c49f2e] text-black font-bold py-3 rounded-xl text-xs uppercase tracking-wider transition-all shadow-xl shadow-[#d4af37]/20 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 mt-2"
          >
            {loggingIn ? (
              <>
                <Loader2 className="animate-spin" size={15} />
                <span>Verificando...</span>
              </>
            ) : (
              <>
                <ShieldCheck size={15} />
                <span>Ingresar al Panel</span>
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-[#222222]">
          <a 
            href="/" 
            className="text-xs text-gray-400 hover:text-white flex items-center justify-center gap-1.5 transition-colors"
          >
            <ArrowLeft size={13} />
            <span>Volver a la Web Principal</span>
          </a>
        </div>
      </div>
    </div>
  );
}
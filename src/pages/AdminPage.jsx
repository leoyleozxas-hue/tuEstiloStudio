// src/pages/AdminPage.jsx
import React, { useState, useEffect } from 'react';
import { 
  Calendar, Scissors, Users, Clock, Phone, CheckCircle2, 
  XCircle, AlertCircle, Plus, Edit2, ArrowLeft,
  MessageSquare, Loader2, Power, RefreshCw, Eye, EyeOff,
  Lock, Mail, LogOut, ShieldCheck
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { studioData } from '../data/mockData';
import logoImg from '../assets/logo.png';

export default function AdminPage() {
  // Estados de Autenticación de Supabase
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  // Estados del Panel de Administración
  const [activeTab, setActiveTab] = useState('citas'); // 'citas' | 'servicios' | 'barberos'
  const [loading, setLoading] = useState(true);

  // Datos
  const [citas, setCitas] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [barberos, setBarberos] = useState([]);

  // Filtros
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterBarber, setFilterBarber] = useState('all');

  // Modales
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [serviceForm, setServiceForm] = useState({ nombre: '', descripcion: '', duracion_minutos: 30, precio: '' });

  const [showBarberModal, setShowBarberModal] = useState(false);
  const [editingBarber, setEditingBarber] = useState(null);
  const [barberForm, setBarberForm] = useState({ nombre: '', telefono: '', email: '' });

  // 1. Verificar si hay sesión activa en el navegador
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. Iniciar Sesión de Administrador
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoggingIn(true);
    setLoginError('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail.trim(),
        password: loginPassword
      });

      if (error) throw error;
      setSession(data.session);
    } catch (err) {
      if (err.message.includes('Invalid login credentials')) {
        setLoginError('Email o contraseña incorrectos.');
      } else {
        setLoginError(`Error al ingresar: ${err.message}`);
      }
    } finally {
      setLoggingIn(false);
    }
  };

  // 3. Cerrar Sesión
  const handleAdminLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  // 4. Cargar datos del panel solo si está autenticado
  const fetchData = async () => {
    try {
      setLoading(true);
      const [srvRes, brbRes] = await Promise.all([
        supabase.from('servicios').select('*').order('precio', { ascending: true }),
        supabase.from('barberos').select('*').order('nombre', { ascending: true })
      ]);

      if (srvRes.data) setServicios(srvRes.data);
      if (brbRes.data) setBarberos(brbRes.data);

      await fetchCitas();
    } catch (err) {
      console.error('Error al cargar datos:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCitas = async () => {
    try {
      const localStart = new Date(`${filterDate}T00:00:00`).toISOString();
      const localEnd = new Date(`${filterDate}T23:59:59.999`).toISOString();

      let query = supabase
        .from('citas')
        .select(`
          id,
          fecha_hora_inicio,
          fecha_hora_fin,
          cliente_nombre,
          cliente_telefono,
          notas,
          estado,
          barbero_id,
          servicio_id,
          barberos (nombre),
          servicios (nombre, precio, duracion_minutos)
        `)
        .gte('fecha_hora_inicio', localStart)
        .lte('fecha_hora_inicio', localEnd)
        .order('fecha_hora_inicio', { ascending: true });

      if (filterBarber !== 'all') {
        query = query.eq('barbero_id', filterBarber);
      }

      const { data, error } = await query;
      if (error) throw error;
      setCitas(data || []);
    } catch (err) {
      console.error('Error al consultar citas:', err);
    }
  };

  useEffect(() => {
    if (session) {
      fetchData();
    }
  }, [session]);

  useEffect(() => {
    if (session) {
      fetchCitas();
    }
  }, [filterDate, filterBarber]);

  // Cambiar estado de cita
  const updateCitaStatus = async (citaId, nuevoEstado) => {
    try {
      const { error } = await supabase
        .from('citas')
        .update({ estado: nuevoEstado })
        .eq('id', citaId);

      if (error) throw error;
      fetchCitas();
    } catch (err) {
      alert(`Error al actualizar estado: ${err.message}`);
    }
  };

  // Guardar / Editar Servicio
  const handleSaveService = async (e) => {
    e.preventDefault();
    try {
      if (editingService) {
        const { error } = await supabase
          .from('servicios')
          .update({
            nombre: serviceForm.nombre,
            descripcion: serviceForm.descripcion,
            duracion_minutos: parseInt(serviceForm.duracion_minutos),
            precio: parseFloat(serviceForm.precio)
          })
          .eq('id', editingService.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('servicios')
          .insert([{
            nombre: serviceForm.nombre,
            descripcion: serviceForm.descripcion,
            duracion_minutos: parseInt(serviceForm.duracion_minutos),
            precio: parseFloat(serviceForm.precio),
            activo: true
          }]);
        if (error) throw error;
      }

      setShowServiceModal(false);
      setEditingService(null);
      setServiceForm({ nombre: '', descripcion: '', duracion_minutos: 30, precio: '' });
      fetchData();
    } catch (err) {
      alert(`Error al guardar servicio: ${err.message}`);
    }
  };

  const toggleServiceActive = async (service) => {
    try {
      const { error } = await supabase
        .from('servicios')
        .update({ activo: !service.activo })
        .eq('id', service.id);
      if (error) throw error;
      fetchData();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  // Guardar / Editar Barbero
  const handleSaveBarber = async (e) => {
    e.preventDefault();
    try {
      if (editingBarber) {
        const { error } = await supabase
          .from('barberos')
          .update({
            nombre: barberForm.nombre,
            telefono: barberForm.telefono,
            email: barberForm.email
          })
          .eq('id', editingBarber.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('barberos')
          .insert([{
            nombre: barberForm.nombre,
            telefono: barberForm.telefono,
            email: barberForm.email,
            activo: true
          }])
          .select()
          .single();

        if (error) throw error;

        // Horarios base
        const horarios = [1, 2, 3, 4, 5, 6].map(dia => ({
          barbero_id: data.id,
          dia_semana: dia,
          hora_inicio: '10:00:00',
          hora_fin: '20:00:00'
        }));

        await supabase.from('horarios_trabajo').insert(horarios);
      }

      setShowBarberModal(false);
      setEditingBarber(null);
      setBarberForm({ nombre: '', telefono: '', email: '' });
      fetchData();
    } catch (err) {
      alert(`Error al guardar barbero: ${err.message}`);
    }
  };

  const toggleBarberActive = async (barber) => {
    try {
      const { error } = await supabase
        .from('barberos')
        .update({ activo: !barber.activo })
        .eq('id', barber.id);
      if (error) throw error;
      fetchData();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  // Mientras verifica sesión
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#080808] flex flex-col items-center justify-center text-gray-400 gap-3">
        <Loader2 className="animate-spin text-[#d4af37]" size={36} />
        <p className="text-xs tracking-wider uppercase font-bold text-gray-500">Verificando credenciales...</p>
      </div>
    );
  }

  // =========================================================================
  // VISTA 1: PANTALLA DE LOGIN (SI NO HAY SESIÓN ACTIVA)
  // =========================================================================
  if (!session) {
    return (
      <div className="min-h-screen bg-[#080808] text-white flex flex-col items-center justify-center p-4 relative font-sans selection:bg-[#d4af37] selection:text-black">
        
        {/* Glow decorativo de fondo */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#d4af37]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-sm bg-[#121212] border border-[#262626] rounded-3xl p-6 sm:p-8 shadow-2xl relative animate-fadeIn space-y-6">
          
          {/* Logo y Encabezado */}
          <div className="text-center space-y-2">
            <img 
              src={logoImg} 
              alt={studioData.name} 
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
              Ingresa tus credenciales autorizadas de {studioData.name}.
            </p>
          </div>

          {/* Formulario de Login */}
          <form onSubmit={handleAdminLogin} className="space-y-3.5">
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
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
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
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
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

          {/* Enlace para volver a la Web */}
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

  // =========================================================================
  // VISTA 2: PANEL DE CONTROL COMPLETO (USUARIO AUTENTICADO)
  // =========================================================================
  return (
    <div className="min-h-screen bg-[#080808] text-white font-sans selection:bg-[#d4af37] selection:text-black">
      
      {/* 1. Header con Logo, Navegación y Botón de Cerrar Sesión */}
      <header className="border-b border-[#222222] bg-[#101010]/95 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-8 py-3 flex flex-wrap items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center gap-3">
          <a 
            href="/" 
            className="flex items-center gap-2.5 group"
            title="Ir a la Web Pública"
          >
            <img 
              src={logoImg} 
              alt={studioData.name} 
              className="w-9 h-9 object-contain rounded-full border border-[#d4af37]/60 p-0.5 bg-black/60 group-hover:scale-105 transition-transform"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs sm:text-sm tracking-wider uppercase text-white">
                  {studioData.name}
                </span>
                <span className="text-[9px] bg-[#d4af37] text-black font-extrabold px-1.5 py-0.2 rounded uppercase">
                  Admin
                </span>
              </div>
              <span className="text-[10px] text-gray-400 flex items-center gap-1 group-hover:text-[#d4af37] transition-colors">
                <Eye size={10} />
                <span>Ver sitio web</span>
              </span>
            </div>
          </a>
        </div>

        {/* Pestañas del Panel */}
        <div className="flex bg-[#161616] p-1 rounded-xl border border-[#282828] max-w-full overflow-x-auto">
          <button
            onClick={() => setActiveTab('citas')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'citas' ? 'bg-[#d4af37] text-black shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Calendar size={13} />
            <span>Agenda de Citas</span>
          </button>

          <button
            onClick={() => setActiveTab('servicios')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'servicios' ? 'bg-[#d4af37] text-black shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Scissors size={13} />
            <span>Servicios & Precios</span>
          </button>

          <button
            onClick={() => setActiveTab('barberos')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'barberos' ? 'bg-[#d4af37] text-black shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Users size={13} />
            <span>Barberos</span>
          </button>
        </div>

        {/* Botón de Cerrar Sesión */}
        <button
          onClick={handleAdminLogout}
          className="flex items-center gap-1.5 bg-[#1b1b1b] hover:bg-[#282828] text-gray-300 hover:text-red-400 border border-[#2d2d2d] hover:border-red-500/40 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
          title="Cerrar Sesión de Administrador"
        >
          <LogOut size={13} />
          <span className="hidden sm:inline">Cerrar Sesión</span>
        </button>
      </header>

      {/* Contenido Principal */}
      <main className="max-w-7xl mx-auto p-4 sm:p-8">
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center text-gray-400 gap-3">
            <Loader2 className="animate-spin text-[#d4af37]" size={32} />
            <p className="text-xs">Sincronizando con la base de datos...</p>
          </div>
        ) : (
          <div>
            
            {/* TAB 1: AGENDA DE CITAS EN VIVO */}
            {activeTab === 'citas' && (
              <div className="space-y-5 animate-fadeIn">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-[#131313] border border-[#242424] p-4 rounded-2xl">
                  <div className="flex flex-wrap items-center gap-3">
                    <div>
                      <label className="block text-[9px] uppercase font-bold text-gray-400 mb-1">Fecha</label>
                      <input 
                        type="date"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                        className="bg-[#1b1b1b] border border-[#303030] text-white text-xs px-3 py-1.5 rounded-xl focus:border-[#d4af37] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] uppercase font-bold text-gray-400 mb-1">Barbero</label>
                      <select
                        value={filterBarber}
                        onChange={(e) => setFilterBarber(e.target.value)}
                        className="bg-[#1b1b1b] border border-[#303030] text-white text-xs px-3 py-1.5 rounded-xl focus:border-[#d4af37] focus:outline-none"
                      >
                        <option value="all">Todos los barberos</option>
                        {barberos.map(b => (
                          <option key={b.id} value={b.id}>{b.nombre}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={fetchCitas}
                    className="flex items-center gap-1.5 bg-[#1b1b1b] border border-[#303030] hover:border-[#d4af37] text-gray-300 hover:text-white px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                  >
                    <RefreshCw size={13} />
                    <span>Actualizar</span>
                  </button>
                </div>

                {citas.length === 0 ? (
                  <div className="bg-[#131313] border border-[#242424] rounded-3xl p-12 text-center text-gray-400 space-y-2">
                    <Calendar size={36} className="mx-auto text-gray-600 mb-2" />
                    <p className="text-sm font-bold text-white">No hay citas agendadas para esta fecha</p>
                    <p className="text-xs text-gray-500">Los turnos que reserven los clientes aparecerán aquí automáticamente.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {citas.map((cita) => {
                      const startDate = new Date(cita.fecha_hora_inicio);
                      const timeStr = `${String(startDate.getHours()).padStart(2, '0')}:${String(startDate.getMinutes()).padStart(2, '0')}`;
                      
                      const cleanPhone = (cita.cliente_telefono || '').replace(/\D/g, '');
                      const waNumber = cleanPhone.startsWith('0') ? `598${cleanPhone.slice(1)}` : `598${cleanPhone}`;
                      const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(`Hola ${cita.cliente_nombre}! Te escribimos de ${studioData.name} para confirmar tu turno de hoy a las ${timeStr} hs.`)}`;

                      const statusColors = {
                        pendiente: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
                        confirmada: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
                        completada: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
                        cancelada: 'bg-red-500/10 text-red-400 border-red-500/30 line-through'
                      };

                      return (
                        <div 
                          key={cita.id}
                          className="bg-[#131313] border border-[#242424] rounded-2xl p-4 space-y-3 hover:border-[#d4af37]/40 transition-all shadow-lg"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-2.5">
                              <span className="text-base sm:text-lg font-serif font-bold text-[#d4af37] bg-[#1d190d] px-2.5 py-1 rounded-xl border border-[#d4af37]/30">
                                {timeStr} hs
                              </span>
                              <div>
                                <h3 className="text-sm font-bold text-white leading-tight">{cita.cliente_nombre}</h3>
                                <p className="text-[11px] text-gray-400">{cita.cliente_telefono}</p>
                              </div>
                            </div>

                            <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full border ${statusColors[cita.estado] || statusColors.pendiente}`}>
                              {cita.estado}
                            </span>
                          </div>

                          <div className="bg-[#1a1a1a] p-2.5 rounded-xl border border-[#282828] text-xs space-y-1">
                            <div className="flex justify-between text-gray-300">
                              <span>Servicio:</span>
                              <strong className="text-white">{cita.servicios?.nombre}</strong>
                            </div>
                            <div className="flex justify-between text-gray-300">
                              <span>Barbero:</span>
                              <strong className="text-[#d4af37]">{cita.barberos?.nombre}</strong>
                            </div>
                            {cita.notas && (
                              <p className="text-[10px] text-gray-400 pt-1 border-t border-[#262626]">
                                📝 {cita.notas}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center justify-between pt-1 gap-2">
                            <a
                              href={waUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-1.5 bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#25D366] border border-[#25D366]/40 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all"
                            >
                              <MessageSquare size={13} />
                              <span>WhatsApp</span>
                            </a>

                            <div className="flex items-center gap-1.5">
                              {cita.estado !== 'completada' && cita.estado !== 'cancelada' && (
                                <button
                                  onClick={() => updateCitaStatus(cita.id, 'completada')}
                                  title="Marcar como Atendido"
                                  className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl transition-colors"
                                >
                                  <CheckCircle2 size={16} />
                                </button>
                              )}

                              {cita.estado !== 'cancelada' && (
                                <button
                                  onClick={() => {
                                    if (confirm('¿Deseas cancelar esta cita? El horario se liberará inmediatamente en la web.')) {
                                      updateCitaStatus(cita.id, 'cancelada');
                                    }
                                  }}
                                  title="Cancelar Cita"
                                  className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl transition-colors"
                                >
                                  <XCircle size={16} />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: GESTIÓN DE SERVICIOS */}
            {activeTab === 'servicios' && (
              <div className="space-y-5 animate-fadeIn">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-base font-bold text-white">Catálogo de Servicios</h2>
                    <p className="text-xs text-gray-400">Los cambios que hagas aquí se actualizan inmediatamente en el formulario de la web.</p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingService(null);
                      setServiceForm({ nombre: '', descripcion: '', duracion_minutos: 30, precio: '' });
                      setShowServiceModal(true);
                    }}
                    className="flex items-center gap-1.5 bg-[#d4af37] text-black font-bold px-3.5 py-2 rounded-xl text-xs uppercase tracking-wider shadow-lg active:scale-95 transition-all"
                  >
                    <Plus size={14} />
                    <span>Nuevo Servicio</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {servicios.map((srv) => (
                    <div 
                      key={srv.id}
                      className={`bg-[#131313] border p-4 rounded-2xl space-y-3 transition-all ${
                        srv.activo ? 'border-[#262626]' : 'border-red-500/30 opacity-60'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-sm font-bold text-white">{srv.nombre}</h3>
                          <p className="text-xs text-gray-400">{srv.duracion_minutos} minutos</p>
                        </div>
                        <span className="text-base font-serif font-bold text-[#d4af37]">${srv.precio}</span>
                      </div>

                      {srv.descripcion && (
                        <p className="text-xs text-gray-400 leading-relaxed">{srv.descripcion}</p>
                      )}

                      <div className="flex justify-between items-center pt-2 border-t border-[#222222]">
                        <button
                          onClick={() => toggleServiceActive(srv)}
                          className={`flex items-center gap-1.5 text-[10px] uppercase font-bold px-2.5 py-1 rounded-lg border transition-all ${
                            srv.activo 
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                              : 'bg-gray-800 text-gray-400 border-gray-700'
                          }`}
                        >
                          <Power size={11} />
                          <span>{srv.activo ? 'Visible en Web' : 'Pausado'}</span>
                        </button>

                        <button
                          onClick={() => {
                            setEditingService(srv);
                            setServiceForm({
                              nombre: srv.nombre,
                              descripcion: srv.descripcion || '',
                              duracion_minutos: srv.duracion_minutos,
                              precio: srv.precio
                            });
                            setShowServiceModal(true);
                          }}
                          className="p-1.5 bg-[#1b1b1b] hover:bg-[#252525] text-gray-300 hover:text-white rounded-lg border border-[#2f2f2f] transition-colors"
                          title="Editar Precio o Duración"
                        >
                          <Edit2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: GESTIÓN DE BARBEROS */}
            {activeTab === 'barberos' && (
              <div className="space-y-5 animate-fadeIn">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-base font-bold text-white">Equipo de Barberos</h2>
                    <p className="text-xs text-gray-400">Agrega o edita los barberos reales de tu local.</p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingBarber(null);
                      setBarberForm({ nombre: '', telefono: '', email: '' });
                      setShowBarberModal(true);
                    }}
                    className="flex items-center gap-1.5 bg-[#d4af37] text-black font-bold px-3.5 py-2 rounded-xl text-xs uppercase tracking-wider shadow-lg active:scale-95 transition-all"
                  >
                    <Plus size={14} />
                    <span>Agregar Barbero</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {barberos.map((b) => (
                    <div 
                      key={b.id}
                      className={`bg-[#131313] border p-4 rounded-2xl space-y-3 transition-all ${
                        b.activo ? 'border-[#262626]' : 'border-red-500/30 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#1e190d] border border-[#d4af37] text-[#d4af37] font-bold flex items-center justify-center text-sm">
                          {b.nombre.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-bold text-white truncate">{b.nombre}</h3>
                          <p className="text-xs text-gray-400">{b.telefono || 'Sin teléfono'}</p>
                        </div>
                      </div>

                      <div className="bg-[#1a1a1a] p-2.5 rounded-xl border border-[#262626] text-[11px] text-gray-300">
                        <span>Horario de atención: </span>
                        <strong className="text-white">Lun a Sáb (10:00 a 20:00 hs)</strong>
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t border-[#222222]">
                        <button
                          onClick={() => toggleBarberActive(b)}
                          className={`flex items-center gap-1.5 text-[10px] uppercase font-bold px-2.5 py-1 rounded-lg border transition-all ${
                            b.activo 
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                              : 'bg-gray-800 text-gray-400 border-gray-700'
                          }`}
                        >
                          <Power size={11} />
                          <span>{b.activo ? 'Disponible en Web' : 'No disponible'}</span>
                        </button>

                        <button
                          onClick={() => {
                            setEditingBarber(b);
                            setBarberForm({
                              nombre: b.nombre,
                              telefono: b.telefono || '',
                              email: b.email || ''
                            });
                            setShowBarberModal(true);
                          }}
                          className="p-1.5 bg-[#1b1b1b] hover:bg-[#252525] text-gray-300 hover:text-white rounded-lg border border-[#2f2f2f] transition-colors"
                          title="Editar Barbero"
                        >
                          <Edit2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}
      </main>

      {/* MODAL SERVICIO */}
      {showServiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#131313] border border-[#2a2a2a] w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">
              {editingService ? 'Editar Servicio' : 'Nuevo Servicio'}
            </h3>

            <form onSubmit={handleSaveService} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-400 uppercase font-bold mb-1 text-[10px]">Nombre del Servicio *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Corte Degradé + Barba"
                  value={serviceForm.nombre}
                  onChange={(e) => setServiceForm({ ...serviceForm, nombre: e.target.value })}
                  className="w-full bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl px-3 py-2 text-white focus:border-[#d4af37] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 uppercase font-bold mb-1 text-[10px]">Precio ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="450"
                    value={serviceForm.precio}
                    onChange={(e) => setServiceForm({ ...serviceForm, precio: e.target.value })}
                    className="w-full bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl px-3 py-2 text-white focus:border-[#d4af37] focus:outline-none"
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
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-400 uppercase font-bold mb-1 text-[10px]">Descripción</label>
                <textarea
                  placeholder="Detalle del servicio..."
                  value={serviceForm.descripcion}
                  onChange={(e) => setServiceForm({ ...serviceForm, descripcion: e.target.value })}
                  rows={2}
                  className="w-full bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl px-3 py-2 text-white focus:border-[#d4af37] focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowServiceModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-[#222222] text-gray-300 font-bold hover:bg-[#2a2a2a] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#d4af37] text-black font-bold hover:bg-[#c49f2e] transition-colors shadow-md"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL BARBERO */}
      {showBarberModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#131313] border border-[#2a2a2a] w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">
              {editingBarber ? 'Editar Barbero' : 'Agregar Barbero'}
            </h3>

            <form onSubmit={handleSaveBarber} className="space-y-3 text-xs">
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

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBarberModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-[#222222] text-gray-300 font-bold hover:bg-[#2a2a2a] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#d4af37] text-black font-bold hover:bg-[#c49f2e] transition-colors shadow-md"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
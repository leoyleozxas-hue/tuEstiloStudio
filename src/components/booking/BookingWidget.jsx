// src/components/booking/BookingWidget.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Scissors, User, Calendar, Clock, Sparkles, 
  CheckCircle2, ChevronRight, ArrowLeft, Check, MessageSquare,
  Crown, Lock, Eye, EyeOff, LogIn, UserPlus, ArrowRight,
  Coffee, Tag, Zap, Loader2, AlertCircle, Users,
  LogOut, History, AlertTriangle, Gift, HeartHandshake
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { studioData } from '../../data/mockData';

const InstagramIcon = ({ size = 12, className = "text-pink-400 shrink-0" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

// Generador de días
const getNextDays = () => {
  const days = [];
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const today = new Date();

  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(today.getDate() + i);
    let label = `${dayNames[d.getDay()]} ${d.getDate()}`;
    if (i === 0) label = 'Hoy';
    if (i === 1) label = 'Mañana';

    days.push({
      dateStr: d.toISOString().split('T')[0],
      displayDay: label,
      dayNumber: d.getDate(),
      dayOfWeek: d.getDay(),
      month: monthNames[d.getMonth()],
      weekday: dayNames[d.getDay()]
    });
  }
  return days;
};

const defaultTimeSlots = {
  mañana: ["10:00", "10:30", "11:00", "11:30", "12:00", "12:30"],
  tarde: ["13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"],
  noche: ["18:00", "18:30", "19:00", "19:30"]
};

const formatUruguayPhone = (val) => {
  const clean = val.replace(/\D/g, '').slice(0, 9);
  if (clean.length <= 3) return clean;
  if (clean.length <= 6) return `${clean.slice(0, 3)} ${clean.slice(3)}`;
  return `${clean.slice(0, 3)} ${clean.slice(3, 6)} ${clean.slice(6)}`;
};

const isValidUruguayPhone = (val) => {
  const digits = val.replace(/\D/g, '');
  return /^09[1-9]\d{6}$/.test(digits);
};

export default function BookingWidget({ preselectedServiceId, preselectedBarberId, forcedTab, forcedSocioMode }) {
  const daysList = getNextDays();

  const [mainTab, setMainTab] = useState(forcedTab || 'reserva');
  const [socioMode, setSocioMode] = useState(forcedSocioMode || 'registro');

  const [currentStep, setCurrentStep] = useState(1);

  // Estados de datos de Supabase
  const [services, setServices] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [existingBookings, setExistingBookings] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados de selección de reserva
  const [serviceId, setServiceId] = useState('');
  const [barberId, setBarberId] = useState('any');
  const [selectedDate, setSelectedDate] = useState(daysList[0]);
  const [activeTurno, setActiveTurno] = useState('tarde');
  const [selectedTime, setSelectedTime] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [notes, setNotes] = useState('');
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [assignedBarber, setAssignedBarber] = useState(null);

  // Estados de Socios & Sesión
  const [activeUser, setActiveUser] = useState(() => {
    try {
      const saved = localStorage.getItem('barberia_socio_session');
      return saved ? JSON.parse(saved) : null;
    } catch (_) {
      return null;
    }
  });

  const [userCitasHistory, setUserCitasHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const [socioName, setSocioName] = useState('');
  const [socioPhone, setSocioPhone] = useState('');
  const [socioEmail, setSocioEmail] = useState('');
  const [socioInstagram, setSocioInstagram] = useState('');
  const [socioPassword, setSocioPassword] = useState('');
  const [isVip, setIsVip] = useState(true);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [registerError, setRegisterError] = useState('');

  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    if (forcedTab) setMainTab(forcedTab);
  }, [forcedTab]);

  useEffect(() => {
    if (forcedSocioMode) setSocioMode(forcedSocioMode);
  }, [forcedSocioMode]);

  // 1. Cargar Servicios y Barberos
  useEffect(() => {
    async function fetchData() {
      try {
        setLoadingData(true);
        const [servicesRes, barbersRes] = await Promise.all([
          supabase.from('servicios').select('*').eq('activo', true).order('precio', { ascending: true }),
          supabase.from('barberos').select('*, horarios_trabajo(hora_inicio, hora_fin, dia_semana, activo)').eq('activo', true).order('nombre', { ascending: true })
        ]);

        if (servicesRes.data && servicesRes.data.length > 0) {
          setServices(servicesRes.data);
          const initialSrv = preselectedServiceId || servicesRes.data[0].id;
          setServiceId(initialSrv);
          if (preselectedServiceId) setCurrentStep(2);
        }

        if (barbersRes.data && barbersRes.data.length > 0) {
          const parsedBarbers = barbersRes.data.map(b => {
            const horarioBase = Array.isArray(b.horarios_trabajo) ? b.horarios_trabajo[0] : null;
            return {
              ...b,
              hora_inicio: b.hora_inicio || horarioBase?.hora_inicio || '10:00:00',
              hora_fin: b.hora_fin || horarioBase?.hora_fin || '20:00:00',
              horarios_trabajo: b.horarios_trabajo || []
            };
          });
          setBarbers(parsedBarbers);
          setBarberId(preselectedBarberId || 'any');
          if (preselectedBarberId) setCurrentStep(3);
        }
      } catch (err) {
        console.error('Error al cargar datos:', err);
      } finally {
        setLoadingData(false);
      }
    }
    fetchData();
  }, [preselectedServiceId, preselectedBarberId]);

  // 2. Traer citas de Supabase para disponibilidad
  const fetchBookings = useCallback(async () => {
    if (!selectedDate) return;

    try {
      setLoadingSlots(true);
      const localStart = new Date(`${selectedDate.dateStr}T00:00:00`);
      const localEnd = new Date(`${selectedDate.dateStr}T23:59:59.999`);

      let query = supabase
        .from('citas')
        .select('barbero_id, fecha_hora_inicio, fecha_hora_fin')
        .neq('estado', 'cancelada')
        .gte('fecha_hora_inicio', localStart.toISOString())
        .lte('fecha_hora_inicio', localEnd.toISOString());

      if (barberId !== 'any') {
        query = query.eq('barbero_id', barberId);
      }

      const { data, error } = await query;
      if (error) throw error;

      const parsed = (data || []).map(cita => ({
        barbero_id: cita.barbero_id,
        start: new Date(cita.fecha_hora_inicio),
        end: new Date(cita.fecha_hora_fin)
      }));

      setExistingBookings(parsed);
    } catch (err) {
      console.error('Error al consultar citas:', err);
    } finally {
      setLoadingSlots(false);
    }
  }, [selectedDate, barberId]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Cargar Historial de Citas del Usuario Logueado
  const fetchUserHistory = useCallback(async (userPhone) => {
    if (!userPhone) return;
    try {
      setLoadingHistory(true);
      const clean = userPhone.replace(/\D/g, '');
      const { data, error } = await supabase
        .from('citas')
        .select(`
          id,
          fecha_hora_inicio,
          estado,
          servicios (nombre, precio),
          barberos (nombre)
        `)
        .ilike('cliente_telefono', `%${clean}%`)
        .order('fecha_hora_inicio', { ascending: false })
        .limit(10);

      if (!error && data) {
        setUserCitasHistory(data);
      }
    } catch (err) {
      console.error('Error al traer historial:', err);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    if (activeUser?.telefono) {
      fetchUserHistory(activeUser.telefono);
    }
  }, [activeUser, fetchUserHistory]);

  const currentService = services.find(s => s.id === serviceId) || services[0] || {};
  const currentSelectedBarber = barbers.find(b => b.id === barberId);
  const durationMinutes = currentService.duracion_minutos || 30;
  const now = new Date();

  // Descuento VIP
  const hasVipDiscount = activeUser && activeUser.es_vip && activeUser.estado_solicitud === 'aprobado';
  const originalPrice = Number(currentService.precio || 0);
  const finalPrice = hasVipDiscount ? Math.round(originalPrice * 0.85) : originalPrice;

  // Validación de Horario de Trabajo del Barbero
  const isBarberWorkingAt = (b, slotStart, slotEnd, dayOfWeek) => {
    if (!b) return false;

    if (b.horarios_trabajo && b.horarios_trabajo.length > 0) {
      const horarioDia = b.horarios_trabajo.find(h => h.dia_semana === dayOfWeek && h.activo !== false);
      if (horarioDia) {
        const iniStr = (horarioDia.hora_inicio || '10:00').slice(0, 5);
        const finStr = (horarioDia.hora_fin || '20:00').slice(0, 5);
        const slotStartStr = `${String(slotStart.getHours()).padStart(2, '0')}:${String(slotStart.getMinutes()).padStart(2, '0')}`;
        const slotEndStr = `${String(slotEnd.getHours()).padStart(2, '0')}:${String(slotEnd.getMinutes()).padStart(2, '0')}`;
        return slotStartStr >= iniStr && slotEndStr <= finStr;
      }
    }

    const ini = (b.hora_inicio || '10:00:00').slice(0, 5);
    const fin = (b.hora_fin || '20:00:00').slice(0, 5);
    const slotStartStr = `${String(slotStart.getHours()).padStart(2, '0')}:${String(slotStart.getMinutes()).padStart(2, '0')}`;
    const slotEndStr = `${String(slotEnd.getHours()).padStart(2, '0')}:${String(slotEnd.getMinutes()).padStart(2, '0')}`;

    return slotStartStr >= ini && slotEndStr <= fin;
  };

  const isBarberFreeAt = (bId, slotStart, slotEnd) => {
    return !existingBookings.some(cita => {
      return cita.barbero_id === bId && slotStart < cita.end && slotEnd > cita.start;
    });
  };

  // Filtrar Horarios Disponibles
  const availableSlotsInTurno = (defaultTimeSlots[activeTurno] || []).filter(slot => {
    const slotStart = new Date(`${selectedDate.dateStr}T${slot}:00`);
    const slotEnd = new Date(slotStart.getTime() + durationMinutes * 60000);

    if (slotStart <= now) return false;

    if (barberId === 'any') {
      return barbers.some(b => 
        isBarberWorkingAt(b, slotStart, slotEnd, selectedDate.dayOfWeek) && 
        isBarberFreeAt(b.id, slotStart, slotEnd)
      );
    } else {
      return (
        isBarberWorkingAt(currentSelectedBarber, slotStart, slotEnd, selectedDate.dayOfWeek) && 
        isBarberFreeAt(barberId, slotStart, slotEnd)
      );
    }
  });

  const handlePhoneChange = (e) => {
    const formatted = formatUruguayPhone(e.target.value);
    setPhone(formatted);
    if (phoneError) setPhoneError('');
  };

  // Guardar Reserva en Supabase
  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Por favor completa tu nombre.');
      return;
    }

    if (!isValidUruguayPhone(phone)) {
      setPhoneError('Ingresá un celular válido de Uruguay (ej: 099 123 456)');
      return;
    }

    if (!selectedTime) {
      alert('Por favor selecciona un horario disponible.');
      return;
    }

    setIsSubmitting(true);
    try {
      const startDateTime = new Date(`${selectedDate.dateStr}T${selectedTime}:00`);
      const endDateTime = new Date(startDateTime.getTime() + durationMinutes * 60000);

      let targetBarber = null;
      if (barberId === 'any') {
        targetBarber = barbers.find(b => 
          isBarberWorkingAt(b, startDateTime, endDateTime, selectedDate.dayOfWeek) && 
          isBarberFreeAt(b.id, startDateTime, endDateTime)
        );
        if (!targetBarber) {
          alert('¡Ese horario acaba de ser ocupado! Por favor selecciona otro.');
          setCurrentStep(3);
          fetchBookings();
          return;
        }
      } else {
        targetBarber = currentSelectedBarber || barbers[0];
      }

      const newCita = {
        barbero_id: targetBarber.id,
        servicio_id: currentService.id,
        fecha_hora_inicio: startDateTime.toISOString(),
        fecha_hora_fin: endDateTime.toISOString(),
        cliente_nombre: name.trim(),
        cliente_telefono: phone.trim(),
        notas: notes.trim() ? `${notes.trim()} ${hasVipDiscount ? '(Socio VIP 15% OFF)' : ''}` : (hasVipDiscount ? '(Socio VIP 15% OFF)' : null),
        estado: 'pendiente'
      };

      const { error } = await supabase
        .from('citas')
        .insert([newCita]);

      if (error) {
        if (error.message.includes('solapadas') || error.code === '23P01') {
          alert('¡Ese horario acaba de ser tomado! Por favor elige otro.');
          setCurrentStep(3);
          fetchBookings();
        } else {
          alert(`Error al guardar: ${error.message}`);
        }
        return;
      }

      setAssignedBarber(targetBarber);
      setBookingConfirmed(true);
      fetchBookings();
      if (activeUser?.telefono) {
        fetchUserHistory(activeUser.telefono);
      }
    } catch (err) {
      console.error('Error al reservar:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // REGISTRO REAL EN SUPABASE
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegisterError('');

    if (!socioName.trim()) {
      setRegisterError('Ingresá tu nombre completo.');
      return;
    }

    if (!isValidUruguayPhone(socioPhone)) {
      setRegisterError('Ingresá un celular válido de Uruguay (ej: 099 123 456).');
      return;
    }

    if (!socioPassword.trim() || socioPassword.length < 4) {
      setRegisterError('La contraseña debe tener al menos 4 caracteres.');
      return;
    }

    setRegistering(true);
    try {
      const nuevoSocio = {
        nombre: socioName.trim(),
        telefono: socioPhone.trim(),
        email: socioEmail.trim() || null,
        instagram: socioInstagram.trim() ? socioInstagram.replace('@', '') : null,
        password_hash: socioPassword.trim(),
        es_vip: isVip,
        estado_solicitud: isVip ? 'pendiente' : 'aprobado',
        puntos: 100,
        fecha_inicio_vip: isVip ? new Date().toISOString().split('T')[0] : null,
        fecha_vencimiento_vip: isVip ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : null,
        activo: !isVip
      };

      const { data, error } = await supabase
        .from('socios')
        .insert([nuevoSocio])
        .select()
        .single();

      if (error) {
        if (error.code === '23505' || error.message?.includes('unique') || error.message?.includes('telefono')) {
          setRegisterError('Ya existe una cuenta con este número de celular. Podés Iniciar Sesión.');
        } else {
          setRegisterError(`Error al registrar: ${error.message}`);
        }
        return;
      }

      // Guardar sesión activa local
      setActiveUser(data);
      localStorage.setItem('barberia_socio_session', JSON.stringify(data));
      fetchUserHistory(data.telefono);
    } catch (err) {
      console.error('Error al registrar socio:', err);
      setRegisterError('Ocurrió un error inesperado al conectar con el servidor.');
    } finally {
      setRegistering(false);
    }
  };

  // INICIO DE SESIÓN REAL EN SUPABASE
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');

    const cleanInput = loginIdentifier.trim();
    if (!cleanInput || !loginPassword.trim()) {
      setLoginError('Por favor ingresá tu celular/email y contraseña.');
      return;
    }

    setLoggingIn(true);
    try {
      const { data, error } = await supabase
        .from('socios')
        .select('*')
        .or(`telefono.eq.${cleanInput},email.eq.${cleanInput}`)
        .single();

      if (error || !data) {
        setLoginError('No encontramos ninguna cuenta con ese celular o email.');
        setLoggingIn(false);
        return;
      }

      if (data.password_hash !== loginPassword.trim()) {
        setLoginError('Contraseña incorrecta. Verificala e intentá de nuevo.');
        setLoggingIn(false);
        return;
      }

      setActiveUser(data);
      localStorage.setItem('barberia_socio_session', JSON.stringify(data));
      fetchUserHistory(data.telefono);
    } catch (err) {
      console.error('Error de login:', err);
      setLoginError('Error al autenticar credenciales.');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = () => {
    setActiveUser(null);
    localStorage.removeItem('barberia_socio_session');
    setUserCitasHistory([]);
  };

  const finalBarberName = assignedBarber?.nombre || currentSelectedBarber?.nombre || 'Primer Barbero Disponible';

  const bookingWhatsappUrl = `https://wa.me/59899123456?text=${encodeURIComponent(
    `¡Hola ${studioData.name}! Quiero confirmar mi turno:\n\n` +
    `✂️ *Servicio:* ${currentService.nombre || ''} (${durationMinutes} min - $${finalPrice})\n` +
    `👤 *Profesional:* ${finalBarberName}\n` +
    `📅 *Fecha:* ${selectedDate.displayDay} (${selectedDate.dateStr})\n` +
    `🕒 *Horario:* ${selectedTime} hs\n` +
    `🙋‍♂️ *Cliente:* ${name}\n` +
    `📱 *Contacto:* ${phone}` +
    (hasVipDiscount ? `\n👑 *Beneficio:* Socio VIP (15% OFF Aplicado)` : '') +
    (notes ? `\n📝 *Nota:* ${notes}` : '')
  )}`;

  const vipPaymentWhatsappUrl = `https://wa.me/59899123456?text=${encodeURIComponent(
    `¡Hola ${studioData.name}! Me registré para la Membresía VIP:\n\n` +
    `👤 *Nombre:* ${activeUser?.nombre}\n` +
    `📱 *Celular:* ${activeUser?.telefono}\n` +
    `👑 *Solicitud:* Membresía VIP ($990 UYU)\n\n` +
    `Adjunto mi comprobante de pago para la activación de los beneficios.`
  )}`;

  return (
    <section id="reserva" className="py-8 sm:py-12 px-4 max-w-7xl mx-auto scroll-mt-20 relative">
      
      {/* Encabezado Principal */}
      <div className="text-center mb-6 sm:mb-8 max-w-2xl mx-auto">
        <span className="text-[10px] font-bold tracking-[0.3em] text-[#d4af37] uppercase block mb-1">
          {mainTab === 'reserva' ? 'AGENDA ONLINE EN VIVO' : 'PORTAL DE SOCIOS & BENEFICIOS'}
        </span>
        <h2 className="text-2xl sm:text-4xl font-serif font-bold text-white tracking-tight">
          {mainTab === 'reserva' ? 'Reservá tu Turno' : 'Club de Socios'}
        </h2>
        <p className="text-xs text-gray-400 mt-1.5">
          {mainTab === 'reserva'
            ? 'Seleccioná tu servicio, barbero y horario con confirmación inmediata.'
            : 'Tu membresía digital, puntos acumulados e historial de turnos en un solo lugar.'}
        </p>

        {/* Toggle Principal */}
        <div className="flex bg-[#161616] p-1 rounded-2xl border border-[#262626] mt-5 max-w-xs sm:max-w-sm mx-auto shadow-lg">
          <button
            type="button"
            onClick={() => setMainTab('reserva')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold tracking-wider uppercase transition-all ${
              mainTab === 'reserva'
                ? 'bg-[#d4af37] text-black shadow-md scale-[1.02]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Calendar size={14} />
            <span>Reservar</span>
          </button>

          <button
            type="button"
            onClick={() => setMainTab('socios')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold tracking-wider uppercase transition-all ${
              mainTab === 'socios'
                ? 'bg-[#d4af37] text-black shadow-md scale-[1.02]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Crown size={14} />
            <span>{activeUser ? 'Mi Cuenta' : 'Club de Socios'}</span>
          </button>
        </div>
      </div>

      {loadingData ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
          <Loader2 className="animate-spin text-[#d4af37]" size={32} />
          <span className="text-sm">Cargando disponibilidad...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          
          {/* COLUMNA FORMULARIO / PORTAL */}
          <div className="order-1 lg:order-2 lg:col-span-7">
            <div className="bg-[#121212] border border-[#222222] rounded-3xl p-5 sm:p-7 shadow-2xl relative min-h-[380px] flex flex-col justify-between">
              
              {/* TAB 1: RESERVA PASO A PASO */}
              {mainTab === 'reserva' && (
                <div className="w-full">
                  {bookingConfirmed ? (
                    <div className="text-center py-4 space-y-4 animate-fadeIn">
                      <div className="w-14 h-14 bg-[#d4af37]/15 border border-[#d4af37] text-[#d4af37] rounded-full flex items-center justify-center mx-auto shadow-lg">
                        <CheckCircle2 size={32} />
                      </div>
                      <div>
                        <h3 className="text-xl sm:text-2xl font-serif font-bold text-white mb-1.5">
                          ¡Turno Reservado con Éxito!
                        </h3>
                        <p className="text-xs text-gray-300 max-w-md mx-auto">
                          Tu lugar ha quedado registrado. Te esperamos el <strong>{selectedDate.displayDay}</strong> a las <strong>{selectedTime} hs</strong> con <strong>{finalBarberName}</strong>.
                        </p>
                      </div>

                      <div className="bg-[#181818] border border-[#282828] rounded-2xl p-4 text-xs text-left space-y-2 max-w-md mx-auto">
                        <div className="flex justify-between text-gray-300">
                          <span>Servicio:</span>
                          <strong className="text-white">{currentService.nombre} ({durationMinutes} min)</strong>
                        </div>
                        <div className="flex justify-between text-gray-300">
                          <span>Profesional:</span>
                          <strong className="text-white">{finalBarberName}</strong>
                        </div>
                        <div className="flex justify-between text-gray-300">
                          <span>Precio Total:</span>
                          <strong className="text-[#d4af37] font-serif text-sm">
                            ${finalPrice} UYU {hasVipDiscount && <span className="text-[10px] text-emerald-400 font-sans">(15% OFF Socio VIP)</span>}
                          </strong>
                        </div>
                        <div className="flex justify-between text-gray-300">
                          <span>Cliente:</span>
                          <strong className="text-white">{name} ({phone})</strong>
                        </div>
                      </div>

                      <div className="pt-2 flex flex-col sm:flex-row gap-2.5 justify-center">
                        <a
                          href={bookingWhatsappUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center justify-center gap-2 bg-[#25D366] text-white px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-all shadow-lg"
                        >
                          <MessageSquare size={15} />
                          <span>Avisar al Local por WhatsApp</span>
                        </a>
                        <button
                          type="button"
                          onClick={() => {
                            setBookingConfirmed(false);
                            if (!activeUser) {
                              setName('');
                              setPhone('');
                            }
                            setNotes('');
                            setPhoneError('');
                            setAssignedBarber(null);
                            setCurrentStep(1);
                            fetchBookings();
                          }}
                          className="px-5 py-3 rounded-xl text-xs font-bold text-gray-400 hover:text-white border border-[#2e2e2e] transition-colors"
                        >
                          Nueva Reserva
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      
                      {/* PASO 1: SELECCIONAR SERVICIO */}
                      {currentStep === 1 && (
                        <div className="space-y-3 animate-fadeIn">
                          <div className="flex justify-between items-center pb-2 border-b border-[#222222]">
                            <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                              <Scissors size={15} className="text-[#d4af37]" />
                              <span>1. Elegí el Servicio</span>
                            </h3>
                            <span className="text-[10px] text-gray-500 uppercase font-semibold">Paso 1 de 4</span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[260px] overflow-y-auto pr-1">
                            {services.map((srv) => {
                              const srvPrice = hasVipDiscount ? Math.round(srv.precio * 0.85) : srv.precio;

                              return (
                                <button
                                  key={srv.id}
                                  type="button"
                                  onClick={() => {
                                    setServiceId(srv.id);
                                    setCurrentStep(2);
                                  }}
                                  className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all active:scale-[0.98] ${
                                    serviceId === srv.id
                                      ? 'bg-[#1e1b12] border-[#d4af37] text-white shadow-md'
                                      : 'bg-[#171717] border-[#262626] text-gray-300 hover:border-[#383838]'
                                  }`}
                                >
                                  <div>
                                    <p className="text-xs font-bold text-white">{srv.nombre}</p>
                                    <p className="text-[10px] text-gray-400">{srv.duracion_minutos} min</p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="text-right">
                                      <span className="text-xs sm:text-sm font-serif font-bold text-[#d4af37]">
                                        ${srvPrice}
                                      </span>
                                      {hasVipDiscount && (
                                        <span className="block text-[8px] text-emerald-400 font-bold">15% VIP</span>
                                      )}
                                    </div>
                                    <ChevronRight size={14} className="text-gray-500" />
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* PASO 2: SELECCIONAR BARBERO */}
                      {currentStep === 2 && (
                        <div className="space-y-3 animate-fadeIn">
                          <div className="flex justify-between items-center pb-2 border-b border-[#222222]">
                            <button
                              type="button"
                              onClick={() => setCurrentStep(1)}
                              className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-[#d4af37] font-semibold transition-colors"
                            >
                              <ArrowLeft size={13} />
                              <span>Volver a Servicios</span>
                            </button>
                            <span className="text-[10px] text-[#d4af37] font-bold">
                              {currentService.nombre} (${finalPrice})
                            </span>
                          </div>

                          <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                            <Users size={15} className="text-[#d4af37]" />
                            <span>2. Elegí el Profesional</span>
                          </h3>

                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                            <button
                              type="button"
                              onClick={() => {
                                setBarberId('any');
                                setCurrentStep(3);
                              }}
                              className={`p-3.5 rounded-2xl border text-center transition-all active:scale-[0.98] ${
                                barberId === 'any'
                                  ? 'bg-[#1e1b12] border-[#d4af37] text-white shadow-md'
                                  : 'bg-[#171717] border-[#262626] text-gray-300 hover:border-[#383838]'
                              }`}
                            >
                              <div className="flex justify-center mb-1 text-[#d4af37]">
                                <Users size={18} />
                              </div>
                              <p className="text-xs font-bold text-white">Cualquiera</p>
                              <p className="text-[9px] text-gray-400">1º disponible</p>
                            </button>

                            {barbers.map((b) => (
                              <button
                                key={b.id}
                                type="button"
                                onClick={() => {
                                  setBarberId(b.id);
                                  setCurrentStep(3);
                                }}
                                className={`p-3.5 rounded-2xl border text-center transition-all active:scale-[0.98] ${
                                  barberId === b.id
                                  ? 'bg-[#1e1b12] border-[#d4af37] text-white shadow-md'
                                  : 'bg-[#171717] border-[#262626] text-gray-300 hover:border-[#383838]'
                                }`}
                              >
                                <div className="w-7 h-7 rounded-full bg-[#242424] text-[#d4af37] font-bold text-xs flex items-center justify-center mx-auto mb-1">
                                  {b.nombre ? b.nombre.charAt(0) : 'B'}
                                </div>
                                <p className="text-xs font-bold text-white truncate">{b.nombre}</p>
                                <p className="text-[9px] text-gray-400">
                                  {b.hora_inicio && b.hora_fin 
                                    ? `${b.hora_inicio.slice(0, 5)} a ${b.hora_fin.slice(0, 5)}`
                                    : 'Especialista'}
                                </p>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* PASO 3: SELECCIONAR FECHA Y HORARIO */}
                      {currentStep === 3 && (
                        <div className="space-y-3 animate-fadeIn">
                          <div className="flex justify-between items-center pb-2 border-b border-[#222222]">
                            <button
                              type="button"
                              onClick={() => setCurrentStep(2)}
                              className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-[#d4af37] font-semibold transition-colors"
                            >
                              <ArrowLeft size={13} />
                              <span>Volver a Barberos</span>
                            </button>
                            <span className="text-[10px] text-[#d4af37] font-bold">
                              {durationMinutes} min de atención
                            </span>
                          </div>

                          <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                            <Calendar size={15} className="text-[#d4af37]" />
                            <span>3. Elegí Fecha y Horario</span>
                          </h3>

                          <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-none">
                            {daysList.map((day) => {
                              const isSelected = selectedDate.dateStr === day.dateStr;
                              return (
                                <button
                                  key={day.dateStr}
                                  type="button"
                                  onClick={() => setSelectedDate(day)}
                                  className={`px-3.5 py-2 rounded-2xl border shrink-0 text-center transition-all ${
                                    isSelected
                                      ? 'bg-[#d4af37] border-[#d4af37] text-black font-bold scale-[1.02]'
                                      : 'bg-[#171717] border-[#262626] text-gray-300 hover:border-[#383838]'
                                  }`}
                                >
                                  <p className="text-[9px] uppercase tracking-wider">{day.weekday}</p>
                                  <p className="text-xs sm:text-sm font-bold">{day.dayNumber}</p>
                                </button>
                              );
                            })}
                          </div>

                          <div className="pt-1">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                                <span>Horarios Libres ({selectedDate.displayDay})</span>
                                {loadingSlots && <Loader2 size={11} className="animate-spin text-[#d4af37]" />}
                              </span>

                              <div className="flex bg-[#181818] p-0.5 rounded-lg border border-[#282828]">
                                {['mañana', 'tarde', 'noche'].map((t) => (
                                  <button
                                    key={t}
                                    type="button"
                                    onClick={() => setActiveTurno(t)}
                                    className={`px-2.5 py-0.5 rounded-md text-[9px] font-bold capitalize transition-all ${
                                      activeTurno === t ? 'bg-[#d4af37] text-black' : 'text-gray-400 hover:text-white'
                                    }`}
                                  >
                                    {t}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {availableSlotsInTurno.length > 0 ? (
                              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-1.5 max-h-[130px] overflow-y-auto pr-1">
                                {availableSlotsInTurno.map((slot) => {
                                  const isSelected = selectedTime === slot;
                                  return (
                                    <button
                                      key={slot}
                                      type="button"
                                      onClick={() => {
                                        setSelectedTime(slot);
                                        if (activeUser) {
                                          setName(activeUser.nombre || '');
                                          setPhone(activeUser.telefono || '');
                                        }
                                        setCurrentStep(4);
                                      }}
                                      className={`py-2 rounded-xl text-xs font-bold border transition-all active:scale-95 ${
                                        isSelected
                                          ? 'bg-[#d4af37] border-[#d4af37] text-black shadow-md scale-105'
                                          : 'bg-[#171717] border-[#262626] text-gray-200 hover:border-[#d4af37]/60'
                                      }`}
                                    >
                                      {slot} hs
                                    </button>
                                  );
                                })}
                              </div>
                            ) : (
                              <div className="bg-[#171717] border border-[#262626] rounded-xl p-3 text-center text-xs text-gray-400 flex items-center justify-center gap-2">
                                <AlertCircle size={14} className="text-[#d4af37]" />
                                <span>No hay turnos disponibles para el profesional seleccionado en este horario.</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* PASO 4: DATOS DEL CLIENTE & CONFIRMACIÓN */}
                      {currentStep === 4 && (
                        <form onSubmit={handleBookingSubmit} className="space-y-3 animate-fadeIn">
                          <div className="flex justify-between items-center pb-2 border-b border-[#222222]">
                            <button
                              type="button"
                              onClick={() => setCurrentStep(3)}
                              className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-[#d4af37] font-semibold transition-colors"
                            >
                              <ArrowLeft size={13} />
                              <span>Cambiar Horario</span>
                            </button>
                            <span className="text-[10px] text-gray-400 font-semibold uppercase">Paso 4 de 4</span>
                          </div>

                          <div className="bg-[#171717] border border-[#2a2a2a] rounded-2xl p-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                            <div className="flex items-center gap-1.5 text-gray-300">
                              <Scissors size={13} className="text-[#d4af37]" />
                              <span className="font-bold text-white">{currentService.nombre}</span>
                              <span className="text-[#d4af37] font-serif font-bold">${finalPrice}</span>
                              {hasVipDiscount && <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-bold">15% OFF</span>}
                            </div>
                            <div className="flex items-center gap-1.5 text-gray-300">
                              <Clock size={13} className="text-[#d4af37]" />
                              <span>{selectedDate.displayDay} a las <strong>{selectedTime} hs</strong></span>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            <div>
                              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                                Tu Nombre Completo *
                              </label>
                              <input
                                type="text"
                                required
                                placeholder="Ej. Lucas Silva"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-[#181818] border border-[#282828] rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#d4af37] transition-colors"
                              />
                            </div>

                            <div>
                              <div className="flex justify-between items-center mb-1">
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                  Celular (Uruguay) *
                                </label>
                                {phone && !isValidUruguayPhone(phone) && (
                                  <span className="text-[9px] text-amber-400">09X XXX XXX</span>
                                )}
                              </div>
                              <div className="relative">
                                <input
                                  type="tel"
                                  required
                                  placeholder="099 123 456"
                                  value={phone}
                                  onChange={handlePhoneChange}
                                  maxLength={11}
                                  className={`w-full bg-[#181818] border rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none transition-colors ${
                                    phoneError
                                      ? 'border-red-500 focus:border-red-500'
                                      : phone && isValidUruguayPhone(phone)
                                      ? 'border-emerald-500/70 focus:border-emerald-500'
                                      : 'border-[#282828] focus:border-[#d4af37]'
                                  }`}
                                />
                                {phone && isValidUruguayPhone(phone) && (
                                  <span className="absolute right-3 top-2 text-emerald-400 font-bold text-xs">
                                    ✓
                                  </span>
                                )}
                              </div>
                              {phoneError && (
                                <p className="text-[10px] text-red-400 mt-0.5">{phoneError}</p>
                              )}
                            </div>
                          </div>

                          <div>
                            <input
                              type="text"
                              placeholder="Nota o pedido especial (Opcional)..."
                              value={notes}
                              onChange={(e) => setNotes(e.target.value)}
                              className="w-full bg-[#181818] border border-[#282828] rounded-xl px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#d4af37] transition-colors"
                            />
                          </div>

                          <button
                            type="submit"
                            disabled={isSubmitting || !selectedTime}
                            className="w-full flex items-center justify-center gap-2 bg-[#d4af37] hover:bg-[#b89628] text-black font-bold py-3.5 px-6 rounded-2xl text-xs tracking-widest uppercase transition-all shadow-xl shadow-[#d4af37]/20 active:scale-[0.98] disabled:opacity-40"
                          >
                            {isSubmitting ? (
                              <>
                                <Loader2 className="animate-spin" size={15} />
                                <span>Registrando tu turno...</span>
                              </>
                            ) : (
                              <>
                                <span>CONFIRMAR RESERVA (${finalPrice} UYU)</span>
                                <Sparkles size={15} />
                              </>
                            )}
                          </button>
                        </form>
                      )}

                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: PORTAL DE SOCIOS & MI CUENTA */}
              {mainTab === 'socios' && (
                <div className="space-y-4 animate-fadeIn">
                  
                  {!activeUser ? (
                    <div>
                      {/* Selector Registro vs Login */}
                      <div className="flex bg-[#181818] p-1 rounded-xl border border-[#282828] mb-3.5">
                        <button
                          type="button"
                          onClick={() => { setSocioMode('registro'); setRegisterError(''); }}
                          className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                            socioMode === 'registro'
                              ? 'bg-[#282828] text-[#d4af37] border border-[#3a3a3a] shadow-sm'
                              : 'text-gray-400 hover:text-white'
                          }`}
                        >
                          <UserPlus size={13} />
                          <span>Registrarme</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => { setSocioMode('login'); setLoginError(''); }}
                          className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                            socioMode === 'login'
                              ? 'bg-[#282828] text-[#d4af37] border border-[#3a3a3a] shadow-sm'
                              : 'text-gray-400 hover:text-white'
                          }`}
                        >
                          <LogIn size={13} />
                          <span>Iniciar Sesión</span>
                        </button>
                      </div>

                      {/* FORMULARIO DE REGISTRO REAL */}
                      {socioMode === 'registro' && (
                        <form onSubmit={handleRegisterSubmit} className="space-y-3">
                          {registerError && (
                            <div className="bg-red-500/10 border border-red-500/30 p-2.5 rounded-xl text-xs text-red-400 flex items-center gap-2">
                              <AlertCircle size={14} className="shrink-0" />
                              <span>{registerError}</span>
                            </div>
                          )}

                          <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                              Nombre Completo *
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="Ej. Lucas Silva"
                              value={socioName}
                              onChange={(e) => setSocioName(e.target.value)}
                              className="w-full bg-[#171717] border border-[#262626] rounded-xl px-3.5 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#d4af37]"
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            <div>
                              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                                Celular (Uruguay) *
                              </label>
                              <input
                                type="tel"
                                required
                                placeholder="099 123 456"
                                value={socioPhone}
                                onChange={(e) => setSocioPhone(formatUruguayPhone(e.target.value))}
                                maxLength={11}
                                className="w-full bg-[#171717] border border-[#262626] rounded-xl px-3.5 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#d4af37] font-mono"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                                Email (Opcional)
                              </label>
                              <input
                                type="email"
                                placeholder="lucas@email.com"
                                value={socioEmail}
                                onChange={(e) => setSocioEmail(e.target.value)}
                                className="w-full bg-[#171717] border border-[#262626] rounded-xl px-3.5 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#d4af37]"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            <div>
                              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                                Instagram (Para Sorteos)
                              </label>
                              <input
                                type="text"
                                placeholder="@lucas_barber"
                                value={socioInstagram}
                                onChange={(e) => setSocioInstagram(e.target.value)}
                                className="w-full bg-[#171717] border border-[#262626] rounded-xl px-3.5 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#d4af37]"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                                Crear Contraseña *
                              </label>
                              <div className="relative">
                                <input
                                  type={showRegisterPassword ? 'text' : 'password'}
                                  required
                                  placeholder="Mínimo 4 caracteres"
                                  value={socioPassword}
                                  onChange={(e) => setSocioPassword(e.target.value)}
                                  className="w-full bg-[#171717] border border-[#262626] rounded-xl pl-3.5 pr-10 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#d4af37]"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                                >
                                  {showRegisterPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Casilla Membresía VIP */}
                          <div 
                            onClick={() => setIsVip(!isVip)}
                            className={`p-3.5 rounded-2xl border transition-all cursor-pointer select-none flex items-start gap-3 ${
                              isVip 
                                ? 'bg-[#d4af37]/10 border-[#d4af37] shadow-lg shadow-[#d4af37]/5' 
                                : 'bg-[#181818] border-[#2a2a2a]'
                            }`}
                          >
                            <div className={`w-5 h-5 rounded-md flex items-center justify-center mt-0.5 shrink-0 transition-colors ${
                              isVip ? 'bg-[#d4af37] text-black' : 'border border-[#444] bg-[#222]'
                            }`}>
                              {isVip && <Check size={14} />}
                            </div>

                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-xs font-bold text-white flex items-center gap-1">
                                  <Crown size={13} className="text-[#d4af37]" />
                                  Solicitar Membresía VIP ($990 UYU/mes)
                                </span>
                              </div>
                              <p className="text-[10px] text-gray-400 leading-relaxed">
                                Acceso a 15% OFF en todos los servicios, prioridad de turnos y bebidas libres en el lounge.
                              </p>
                            </div>
                          </div>

                          <button
                            type="submit"
                            disabled={registering}
                            className="w-full bg-[#d4af37] hover:bg-[#c49f2e] text-black font-bold py-3 px-6 rounded-2xl text-xs tracking-widest uppercase transition-all shadow-xl flex items-center justify-center gap-2 disabled:opacity-50"
                          >
                            {registering ? (
                              <>
                                <Loader2 className="animate-spin" size={14} />
                                <span>Creando tu cuenta...</span>
                              </>
                            ) : (
                              <>
                                <span>REGISTRARME EN EL CLUB</span>
                                <ArrowRight size={14} />
                              </>
                            )}
                          </button>

                          <div className="text-center pt-2 border-t border-[#222222]">
                            <p className="text-xs text-gray-400">
                              ¿Ya sos socio registrado?{' '}
                              <button
                                type="button"
                                onClick={() => { setSocioMode('login'); setRegisterError(''); }}
                                className="text-[#d4af37] font-bold hover:underline transition-all"
                              >
                                Iniciá sesión aquí
                              </button>
                            </p>
                          </div>
                        </form>
                      )}

                      {/* FORMULARIO DE LOGIN REAL */}
                      {socioMode === 'login' && (
                        <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                          {loginError && (
                            <div className="bg-red-500/10 border border-red-500/30 p-2.5 rounded-xl text-xs text-red-400 flex items-center gap-2">
                              <AlertCircle size={14} className="shrink-0" />
                              <span>{loginError}</span>
                            </div>
                          )}

                          <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                              <User size={11} className="text-[#d4af37]" />
                              <span>Celular o Email *</span>
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="Ej. 099 123 456 o email@correo.com"
                              value={loginIdentifier}
                              onChange={(e) => setLoginIdentifier(e.target.value)}
                              className="w-full bg-[#171717] border border-[#262626] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#d4af37]"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                              <Lock size={11} className="text-[#d4af37]" />
                              <span>Contraseña *</span>
                            </label>
                            <div className="relative">
                              <input
                                type={showLoginPassword ? 'text' : 'password'}
                                required
                                placeholder="Ingresá tu contraseña"
                                value={loginPassword}
                                onChange={(e) => setLoginPassword(e.target.value)}
                                className="w-full bg-[#171717] border border-[#262626] rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#d4af37]"
                              />
                              <button
                                type="button"
                                onClick={() => setShowLoginPassword(!showLoginPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                              >
                                {showLoginPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                              </button>
                            </div>
                          </div>

                          <button
                            type="submit"
                            disabled={loggingIn}
                            className="w-full bg-[#d4af37] hover:bg-[#c49f2e] text-black font-bold py-3.5 px-6 rounded-2xl text-xs tracking-widest uppercase transition-all shadow-xl flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
                          >
                            {loggingIn ? (
                              <>
                                <Loader2 className="animate-spin" size={14} />
                                <span>Verificando...</span>
                              </>
                            ) : (
                              <>
                                <LogIn size={14} />
                                <span>INGRESAR A MI CUENTA</span>
                              </>
                            )}
                          </button>

                          <div className="text-center pt-2 border-t border-[#222222]">
                            <p className="text-xs text-gray-400">
                              ¿No tenés cuenta todavía?{' '}
                              <button
                                type="button"
                                onClick={() => { setSocioMode('registro'); setLoginError(''); }}
                                className="text-[#d4af37] font-bold hover:underline transition-all"
                              >
                                ¡Registrate al Club gratis!
                              </button>
                            </p>
                          </div>
                        </form>
                      )}
                    </div>
                  ) : (
                    /* DASHBOARD / PANEL DE USUARIO LOGUEADO */
                    <div className="space-y-4 animate-fadeIn">
                      
                      {/* TARJETA DIGITAL VIP */}
                      <div className="bg-gradient-to-br from-[#241c09] via-[#16140f] to-[#0f0e0c] border border-[#d4af37]/60 rounded-3xl p-5 shadow-2xl relative overflow-hidden space-y-4">
                        
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-1.5 text-[#d4af37] font-bold text-[10px] tracking-widest uppercase mb-1">
                              <Crown size={13} />
                              <span>{activeUser.es_vip ? 'MEMBRESÍA VIP' : 'SOCIO ESTÁNDAR'}</span>
                            </div>
                            <h3 className="text-lg sm:text-xl font-bold text-white leading-tight">
                              {activeUser.nombre}
                            </h3>
                            <p className="text-xs text-gray-400 font-mono mt-0.5">{activeUser.telefono}</p>
                          </div>

                          <div className="text-right">
                            <span className="text-[10px] text-gray-400 uppercase font-bold block">Puntos Club</span>
                            <span className="text-lg font-serif font-bold text-purple-400">
                              {activeUser.puntos || 100} pts
                            </span>
                          </div>
                        </div>

                        {/* ESTADO DE APROBACIÓN O VENCIMIENTO */}
                        {activeUser.es_vip && activeUser.estado_solicitud === 'pendiente' && (
                          <div className="bg-amber-500/10 border border-amber-500/40 p-3 rounded-2xl space-y-2">
                            <div className="flex items-start gap-2">
                              <AlertTriangle size={15} className="text-amber-400 shrink-0 mt-0.5" />
                              <div>
                                <strong className="text-xs text-amber-300 block">Solicitud VIP Pendiente de Pago</strong>
                                <p className="text-[10px] text-gray-300 leading-relaxed">
                                  Podés abonar la cuota mensual ($990 UYU) en el local o enviar tu comprobante por WhatsApp para activar el 15% OFF.
                                </p>
                              </div>
                            </div>

                            <a
                              href={vipPaymentWhatsappUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center justify-center gap-1.5 w-full bg-[#25D366] text-white py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider shadow"
                            >
                              <MessageSquare size={13} />
                              <span>Enviar Comprobante por WhatsApp</span>
                            </a>
                          </div>
                        )}

                        {activeUser.es_vip && activeUser.estado_solicitud === 'aprobado' && (
                          <div className="bg-[#1f1a0d] border border-[#d4af37]/40 p-2.5 rounded-xl flex items-center justify-between text-xs">
                            <span className="text-gray-300">Beneficio Activo:</span>
                            <strong className="text-emerald-400 font-bold">15% OFF en todos los turnos</strong>
                          </div>
                        )}

                        {/* BOTONES PRINCIPALES DEL SOCIO */}
                        <div className="flex flex-col sm:flex-row gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              setName(activeUser.nombre || '');
                              setPhone(activeUser.telefono || '');
                              setMainTab('reserva');
                              setCurrentStep(1);
                            }}
                            className="flex-1 flex items-center justify-center gap-2 bg-[#d4af37] text-black font-bold py-2.5 px-4 rounded-xl text-xs tracking-wider uppercase transition-all shadow-md active:scale-95"
                          >
                            <Calendar size={13} />
                            <span>Reservar Turno {hasVipDiscount ? '(con 15% OFF)' : ''}</span>
                          </button>

                          <button
                            type="button"
                            onClick={handleLogout}
                            className="px-3.5 py-2.5 rounded-xl bg-[#1c1c1c] text-gray-400 hover:text-white border border-[#2a2a2a] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                          >
                            <LogOut size={13} />
                            <span>Cerrar Sesión</span>
                          </button>
                        </div>

                      </div>

                      {/* HISTORIAL DE TURNOS DEL SOCIO */}
                      <div className="bg-[#181818] border border-[#282828] rounded-2xl p-4 space-y-3">
                        <div className="flex justify-between items-center pb-2 border-b border-[#242424]">
                          <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                            <History size={13} className="text-[#d4af37]" />
                            <span>Mis Turnos Agendados</span>
                          </span>
                          {loadingHistory && <Loader2 size={11} className="animate-spin text-[#d4af37]" />}
                        </div>

                        {userCitasHistory.length === 0 ? (
                          <p className="text-xs text-gray-500 text-center py-3">
                            Aún no tienes turnos registrados con tu número de teléfono.
                          </p>
                        ) : (
                          <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1 text-xs">
                            {userCitasHistory.map(cita => {
                              const fechaObj = new Date(cita.fecha_hora_inicio);
                              const fechaStr = fechaObj.toLocaleDateString('es-UY', { day: '2-digit', month: 'short' });
                              const horaStr = `${String(fechaObj.getHours()).padStart(2, '0')}:${String(fechaObj.getMinutes()).padStart(2, '0')} hs`;

                              return (
                                <div key={cita.id} className="bg-[#121212] p-2.5 rounded-xl border border-[#242424] flex justify-between items-center">
                                  <div>
                                    <strong className="text-white block">{cita.servicios?.nombre || 'Corte'}</strong>
                                    <span className="text-[10px] text-gray-400">Con {cita.barberos?.nombre || 'Barbero'} • {fechaStr} a las {horaStr}</span>
                                  </div>
                                  <span className={`text-[9px] uppercase px-2 py-0.5 rounded-full font-bold border ${
                                    cita.estado === 'completada'
                                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                                      : cita.estado === 'confirmada'
                                      ? 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                                      : cita.estado === 'cancelada'
                                      ? 'bg-red-500/15 text-red-400 border-red-500/30'
                                      : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                                  }`}>
                                    {cita.estado}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                    </div>
                  )}
                </div>
              )}

            </div>
          </div>

          {/* COLUMNA INFORMACIÓN */}
          <div className="order-2 lg:order-1 lg:col-span-5 space-y-4">
            {mainTab === 'reserva' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="bg-gradient-to-br from-[#1c1708] via-[#141414] to-[#121212] border border-[#d4af37]/40 p-5 sm:p-6 rounded-3xl relative overflow-hidden shadow-xl">
                  <div className="flex items-center gap-2 mb-1.5 text-[#d4af37]">
                    <Tag size={15} />
                    <span className="text-[10px] font-bold tracking-widest uppercase">Promo del Mes</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-serif font-bold text-white mb-1">
                    10% OFF en Efectivo o Transferencia
                  </h3>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    Abonando en el local con efectivo o transferencia directa accedés a descuento inmediato en todos los servicios.
                  </p>
                </div>

                <div className="bg-[#121212] border border-[#222222] p-5 sm:p-6 rounded-3xl space-y-3.5 shadow-xl">
                  <span className="text-[10px] font-bold tracking-widest text-[#d4af37] uppercase block">
                    DETALLES DE TU VISITA
                  </span>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 text-xs text-gray-300">
                      <div className="w-7 h-7 rounded-xl bg-[#d4af37]/15 flex items-center justify-center text-[#d4af37] shrink-0 mt-0.5">
                        <Zap size={14} />
                      </div>
                      <div>
                        <strong className="text-white block">Sincronización en Tiempo Real</strong>
                        <span className="text-gray-400">Los horarios ocupados o fuera de turno se ocultan automáticamente.</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 text-xs text-gray-300">
                      <div className="w-7 h-7 rounded-xl bg-[#d4af37]/15 flex items-center justify-center text-[#d4af37] shrink-0 mt-0.5">
                        <Clock size={14} />
                      </div>
                      <div>
                        <strong className="text-white block">Duración Adaptable</strong>
                        <span className="text-gray-400">El sistema bloquea los minutos exactos según el servicio elegido.</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 text-xs text-gray-300">
                      <div className="w-7 h-7 rounded-xl bg-[#d4af37]/15 flex items-center justify-center text-[#d4af37] shrink-0 mt-0.5">
                        <Coffee size={14} />
                      </div>
                      <div>
                        <strong className="text-white block">Café & Lounge</strong>
                        <span className="text-gray-400">Llegá unos minutos antes y disfrutá de bebidas de cortesía.</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {mainTab === 'socios' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="bg-[#121212] border border-[#d4af37]/50 p-5 sm:p-6 rounded-3xl shadow-xl relative overflow-hidden">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-7 h-7 rounded-full bg-[#d4af37]/20 border border-[#d4af37] flex items-center justify-center text-[#d4af37]">
                      <Crown size={15} />
                    </span>
                    <span className="text-[10px] font-bold tracking-[0.25em] text-[#d4af37] uppercase">
                      BENEFICIOS EXCLUSIVOS CLUB
                    </span>
                  </div>

                  <h3 className="text-lg font-serif font-bold text-white mb-1.5">
                    Viví una experiencia preferencial
                  </h3>
                  <p className="text-xs text-gray-300 leading-relaxed mb-4">
                    Diseñado para clientes habituales que buscan comodidad, trato VIP y ahorro permanente.
                  </p>

                  <div className="space-y-3 border-t border-[#222222] pt-4">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-lg bg-[#d4af37] text-black flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                        15%
                      </div>
                      <div>
                        <strong className="text-xs text-white block">15% OFF en Todos los Servicios</strong>
                        <span className="text-[11px] text-gray-400">Descuento directo en cortes, barba y combos.</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-lg bg-[#1c1c1c] border border-[#d4af37]/50 text-[#d4af37] flex items-center justify-center shrink-0 mt-0.5">
                        <Clock size={13} />
                      </div>
                      <div>
                        <strong className="text-xs text-white block">Prioridad en Días Pico</strong>
                        <span className="text-[11px] text-gray-400">Acceso a turnos preferenciales para fines de semana.</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-lg bg-[#1c1c1c] border border-[#d4af37]/50 text-[#d4af37] flex items-center justify-center shrink-0 mt-0.5">
                        <Coffee size={13} />
                      </div>
                      <div>
                        <strong className="text-xs text-white block">Café & Bar Libre</strong>
                        <span className="text-[11px] text-gray-400">Café de especialidad o cerveza de cortesía en cada visita.</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-lg bg-[#1c1c1c] border border-[#d4af37]/50 text-[#d4af37] flex items-center justify-center shrink-0 mt-0.5">
                        <Gift size={13} />
                      </div>
                      <div>
                        <strong className="text-xs text-white block">Regalo en tu Cumpleaños</strong>
                        <span className="text-[11px] text-gray-400">Corte o perfilado de barba bonificado en tu mes.</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      )}
    </section>
  );
}
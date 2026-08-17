// src/components/booking/BookingWidget.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Scissors, User, Calendar, Clock, Phone, Sparkles, 
  Send, CheckCircle2, ChevronRight, X, Check, MessageSquare,
  Crown, Mail, Lock, Eye, EyeOff, LogIn, UserPlus, ArrowRight,
  Gift, Coffee, ShieldCheck, Tag, Zap, HeartHandshake, Loader2, AlertCircle, Users
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { studioData } from '../../data/mockData';

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

// Horarios base de la barbería
const defaultTimeSlots = {
  mañana: ["10:00", "10:30", "11:00", "11:30", "12:00", "12:30"],
  tarde: ["14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"],
  noche: ["18:00", "18:30", "19:00", "19:30"]
};

// Formato y validación de celulares Uruguay (09X XXX XXX)
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

export default function BookingWidget({ preselectedServiceId, preselectedBarberId, forcedTab }) {
  const daysList = getNextDays();

  // Pestañas principales ('reserva' | 'socios')
  const [mainTab, setMainTab] = useState(forcedTab || 'reserva');
  const [socioMode, setSocioMode] = useState('registro'); // 'registro' | 'login'

  // Estados de datos de Supabase
  const [services, setServices] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [existingBookings, setExistingBookings] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados de selección de Reserva
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

  // Estados de Club de Socios
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [activeUser, setActiveUser] = useState(null);

  const [socioName, setSocioName] = useState('');
  const [socioPhone, setSocioPhone] = useState('');
  const [socioEmail, setSocioEmail] = useState('');
  const [socioPassword, setSocioPassword] = useState('');
  const [isVip, setIsVip] = useState(true);
  const [socioRegistered, setSocioRegistered] = useState(false);

  // 1. Cargar Servicios y Barberos de Supabase
  useEffect(() => {
    async function fetchData() {
      try {
        setLoadingData(true);
        const [servicesRes, barbersRes] = await Promise.all([
          supabase.from('servicios').select('*').eq('activo', true).order('precio', { ascending: true }),
          supabase.from('barberos').select('*').eq('activo', true).order('nombre', { ascending: true })
        ]);

        if (servicesRes.data && servicesRes.data.length > 0) {
          setServices(servicesRes.data);
          setServiceId(preselectedServiceId || servicesRes.data[0].id);
        }

        if (barbersRes.data && barbersRes.data.length > 0) {
          setBarbers(barbersRes.data);
          setBarberId(preselectedBarberId || 'any');
        }
      } catch (err) {
        console.error('Error al cargar datos:', err);
      } finally {
        setLoadingData(false);
      }
    }
    fetchData();
  }, [preselectedServiceId, preselectedBarberId]);

  // 2. Consultar citas de Supabase para calcular disponibilidad
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

  const currentService = services.find(s => s.id === serviceId) || services[0] || {};
  const currentSelectedBarber = barbers.find(b => b.id === barberId);
  const durationMinutes = currentService.duracion_minutos || 30;
  const now = new Date();
  const maxClosingTime = new Date(`${selectedDate.dateStr}T20:00:00`);

  const isBarberFreeAt = (bId, slotStart, slotEnd) => {
    return !existingBookings.some(cita => {
      return cita.barbero_id === bId && slotStart < cita.end && slotEnd > cita.start;
    });
  };

  // 3. Filtrar horarios disponibles
  const availableSlotsInTurno = (defaultTimeSlots[activeTurno] || []).filter(slot => {
    const slotStart = new Date(`${selectedDate.dateStr}T${slot}:00`);
    const slotEnd = new Date(slotStart.getTime() + durationMinutes * 60000);

    if (slotStart <= now) return false;
    if (slotEnd > maxClosingTime) return false;

    if (barberId === 'any') {
      return barbers.some(b => isBarberFreeAt(b.id, slotStart, slotEnd));
    } else {
      return isBarberFreeAt(barberId, slotStart, slotEnd);
    }
  });

  useEffect(() => {
    if (availableSlotsInTurno.length > 0) {
      if (!selectedTime || !availableSlotsInTurno.includes(selectedTime)) {
        setSelectedTime(availableSlotsInTurno[0]);
      }
    } else {
      setSelectedTime('');
    }
  }, [activeTurno, serviceId, barberId, selectedDate, existingBookings]);

  const handlePhoneChange = (e) => {
    const formatted = formatUruguayPhone(e.target.value);
    setPhone(formatted);
    if (phoneError) setPhoneError('');
  };

  // 4. Guardar Cita en Supabase
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
        targetBarber = barbers.find(b => isBarberFreeAt(b.id, startDateTime, endDateTime));
        if (!targetBarber) {
          alert('¡Ese horario acaba de ser ocupado! Por favor selecciona otro.');
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
        notas: notes.trim() || null,
        estado: 'pendiente'
      };

      const { data, error } = await supabase
        .from('citas')
        .insert([newCita])
        .select()
        .single();

      if (error) {
        if (error.message.includes('solapadas') || error.code === '23P01') {
          alert('¡Ese horario acaba de ser tomado! Por favor elige otro.');
          fetchBookings();
        } else {
          alert(`Error al guardar: ${error.message}`);
        }
        return;
      }

      setAssignedBarber(targetBarber);
      setBookingConfirmed(true);
      fetchBookings();
    } catch (err) {
      console.error('Error al reservar:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 5. Manejadores de Socios
  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (!socioName.trim() || !socioPhone.trim() || !socioPassword.trim()) {
      alert('Por favor completa los campos obligatorios.');
      return;
    }
    setSocioRegistered(true);
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (!loginIdentifier.trim() || !loginPassword.trim()) {
      alert('Por favor ingresa tu email/teléfono y contraseña.');
      return;
    }
    setActiveUser({
      name: loginIdentifier.includes('@') ? loginIdentifier.split('@')[0] : 'Socio VIP',
      identifier: loginIdentifier,
      isVip: true,
      points: 240
    });
  };

  const finalBarberName = assignedBarber?.nombre || currentSelectedBarber?.nombre || 'Primer Barbero Disponible';

  const bookingWhatsappUrl = `https://wa.me/59899123456?text=${encodeURIComponent(
    `¡Hola ${studioData.name}! Quiero confirmar mi turno:\n\n` +
    `✂️ *Servicio:* ${currentService.nombre || ''} (${durationMinutes} min - $${currentService.precio || ''})\n` +
    `👤 *Profesional:* ${finalBarberName}\n` +
    `📅 *Fecha:* ${selectedDate.displayDay} (${selectedDate.dateStr})\n` +
    `🕒 *Horario:* ${selectedTime} hs\n` +
    `🙋‍♂️ *Cliente:* ${name}\n` +
    `📱 *Contacto:* ${phone}` +
    (notes ? `\n📝 *Nota:* ${notes}` : '')
  )}`;

  const socioWhatsappUrl = `https://wa.me/59899123456?text=${encodeURIComponent(
    `¡Hola ${studioData.name}! Acabo de registrarme en el Club de Socios:\n\n` +
    `👤 *Nombre:* ${socioName}\n` +
    `📱 *Celular:* ${socioPhone}\n` +
    `📧 *Email:* ${socioEmail || 'No indicado'}\n` +
    `👑 *Categoría:* ${isVip ? 'SOCIO VIP ⭐' : 'SOCIO ESTÁNDAR'}\n\n` +
    `¡Espero la activación de mi membresía!`
  )}`;

  return (
    <section id="reserva" className="py-8 sm:py-12 px-4 max-w-7xl mx-auto scroll-mt-20 relative">
      
      {/* Encabezado y Selector de Pestañas */}
      <div className="text-center mb-6 sm:mb-8 max-w-2xl mx-auto">
        <span className="text-[10px] font-bold tracking-[0.3em] text-[#d4af37] uppercase block mb-1">
          {mainTab === 'reserva' ? 'AGENDA ONLINE EN VIVO' : 'BENEFICIOS & COMUNIDAD'}
        </span>
        <h2 className="text-2xl sm:text-4xl font-serif font-bold text-white tracking-tight">
          {mainTab === 'reserva' ? 'Reservá tu Turno' : 'Club de Socios'}
        </h2>
        <p className="text-xs text-gray-400 mt-1.5">
          {mainTab === 'reserva'
            ? 'Seleccioná tu servicio y profesional en segundos con confirmación inmediata.'
            : 'Unite a nuestro programa de beneficios y disfrutá de descuentos en cada visita.'}
        </p>

        {/* Barra de Toggle Principal */}
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
            <span>Club de Socios</span>
          </button>
        </div>
      </div>

      {loadingData ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
          <Loader2 className="animate-spin text-[#d4af37]" size={32} />
          <span className="text-sm">Cargando datos del sistema...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          
          {/* Columna Izquierda: Información dinámica según pestaña */}
          <div className="lg:col-span-5 space-y-4">
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
                        <span className="text-gray-400">Los horarios ocupados se ocultan automáticamente.</span>
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

          {/* Columna Derecha: Formulario dinámico */}
          <div className="lg:col-span-7">
            <div className="bg-[#121212] border border-[#222222] rounded-3xl p-5 sm:p-7 shadow-2xl relative">
              
              {/* TAB 1: RESERVA EN VIVO */}
              {mainTab === 'reserva' && (
                <div>
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
                          <span>Precio:</span>
                          <strong className="text-[#d4af37]">${currentService.precio}</strong>
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
                            setName('');
                            setPhone('');
                            setNotes('');
                            setPhoneError('');
                            setAssignedBarber(null);
                            fetchBookings();
                          }}
                          className="px-5 py-3 rounded-xl text-xs font-bold text-gray-400 hover:text-white border border-[#2e2e2e] transition-colors"
                        >
                          Nueva Reserva
                        </button>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleBookingSubmit} className="space-y-4">
                      
                      {/* 1. Selección de Servicio */}
                      <div>
                        <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-wider mb-2">
                          1. Elegí el Servicio
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {services.map((srv) => (
                            <button
                              key={srv.id}
                              type="button"
                              onClick={() => setServiceId(srv.id)}
                              className={`p-3 rounded-2xl border text-left flex justify-between items-center transition-all ${
                                serviceId === srv.id
                                  ? 'bg-[#1e1b12] border-[#d4af37] text-white shadow-md'
                                  : 'bg-[#181818] border-[#262626] text-gray-300 hover:border-gray-600'
                              }`}
                            >
                              <div>
                                <p className="text-xs font-bold text-white">{srv.nombre}</p>
                                <p className="text-[10px] text-gray-400">{srv.duracion_minutos} min</p>
                              </div>
                              <span className="text-xs font-serif font-bold text-[#d4af37]">
                                ${srv.precio}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* 2. Selección de Barbero */}
                      <div>
                        <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-wider mb-2">
                          2. Elegí el Profesional
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            type="button"
                            onClick={() => setBarberId('any')}
                            className={`p-2.5 rounded-2xl border text-center transition-all ${
                              barberId === 'any'
                                ? 'bg-[#1e1b12] border-[#d4af37] text-white shadow-md'
                                : 'bg-[#181818] border-[#262626] text-gray-300 hover:border-gray-600'
                            }`}
                          >
                            <div className="flex justify-center mb-0.5 text-[#d4af37]">
                              <Users size={15} />
                            </div>
                            <p className="text-[11px] font-bold text-white">Cualquiera</p>
                            <p className="text-[9px] text-gray-400">1º disponible</p>
                          </button>

                          {barbers.map((b) => (
                            <button
                              key={b.id}
                              type="button"
                              onClick={() => setBarberId(b.id)}
                              className={`p-2.5 rounded-2xl border text-center transition-all ${
                                barberId === b.id
                                  ? 'bg-[#1e1b12] border-[#d4af37] text-white shadow-md'
                                  : 'bg-[#181818] border-[#262626] text-gray-300 hover:border-gray-600'
                              }`}
                            >
                              <div className="flex justify-center mb-0.5 text-gray-400">
                                <Scissors size={15} />
                              </div>
                              <p className="text-[11px] font-bold text-white truncate">{b.nombre}</p>
                              <p className="text-[9px] text-gray-400">Especialista</p>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* 3. Selección de Fecha */}
                      <div>
                        <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-wider mb-2">
                          3. Elegí la Fecha
                        </label>
                        <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-none">
                          {daysList.map((day) => (
                            <button
                              key={day.dateStr}
                              type="button"
                              onClick={() => setSelectedDate(day)}
                              className={`px-3 py-2 rounded-2xl border shrink-0 text-center transition-all ${
                                selectedDate.dateStr === day.dateStr
                                  ? 'bg-[#d4af37] border-[#d4af37] text-black font-bold shadow-md'
                                  : 'bg-[#181818] border-[#262626] text-gray-300 hover:border-gray-600'
                              }`}
                            >
                              <p className="text-[9px] uppercase tracking-wider">{day.weekday}</p>
                              <p className="text-xs sm:text-sm font-bold">{day.dayNumber}</p>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* 4. Horarios Disponibles */}
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <label className="text-[11px] font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                            <span>4. Horarios ({durationMinutes} min)</span>
                            {loadingSlots && <Loader2 size={11} className="animate-spin text-[#d4af37]" />}
                          </label>
                          
                          <div className="flex bg-[#1c1c1c] p-0.5 rounded-lg border border-[#2b2b2b]">
                            {['mañana', 'tarde', 'noche'].map((t) => (
                              <button
                                key={t}
                                type="button"
                                onClick={() => setActiveTurno(t)}
                                className={`px-2 py-0.5 rounded-md text-[9px] uppercase font-bold transition-all ${
                                  activeTurno === t
                                    ? 'bg-[#d4af37] text-black'
                                    : 'text-gray-400 hover:text-white'
                                }`}
                              >
                                {t}
                              </button>
                            ))}
                          </div>
                        </div>

                        {availableSlotsInTurno.length > 0 ? (
                          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-1.5">
                            {availableSlotsInTurno.map((slot) => (
                              <button
                                key={slot}
                                type="button"
                                onClick={() => setSelectedTime(slot)}
                                className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                                  selectedTime === slot
                                    ? 'bg-[#d4af37] border-[#d4af37] text-black shadow-md scale-[1.02]'
                                    : 'bg-[#181818] border-[#262626] text-gray-200 hover:border-[#d4af37]/60'
                                }`}
                              >
                                {slot}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="bg-[#181818] border border-[#262626] rounded-xl p-3 text-center text-xs text-gray-400 flex items-center justify-center gap-2">
                            <AlertCircle size={14} className="text-[#d4af37]" />
                            <span>No hay espacio suficiente en este turno.</span>
                          </div>
                        )}
                      </div>

                      {/* 5. Datos del Cliente */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#222222]">
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">
                            Tu Nombre Completo *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Ej: Matías Rodríguez"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-[#181818] border border-[#2b2b2b] rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#d4af37]"
                          />
                        </div>

                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <label className="block text-[10px] uppercase font-bold text-gray-400">
                              Celular / WhatsApp *
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
                              className={`w-full bg-[#181818] border rounded-xl px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none transition-colors ${
                                phoneError
                                  ? 'border-red-500 focus:border-red-500'
                                  : phone && isValidUruguayPhone(phone)
                                  ? 'border-emerald-500/70 focus:border-emerald-500'
                                  : 'border-[#2b2b2b] focus:border-[#d4af37]'
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

                      <button
                        type="submit"
                        disabled={isSubmitting || !selectedTime}
                        className="w-full bg-[#d4af37] text-black py-3 rounded-2xl text-xs font-bold uppercase tracking-wider hover:bg-[#c49f2e] transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-40 disabled:cursor-not-allowed mt-2"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="animate-spin" size={15} />
                            <span>Registrando tu turno...</span>
                          </>
                        ) : (
                          <>
                            <span>Confirmar Reserva {selectedTime ? `(${selectedTime} hs)` : ''}</span>
                            <ChevronRight size={15} />
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* TAB 2: CLUB DE SOCIOS & LOGIN */}
              {mainTab === 'socios' && (
                <div className="space-y-4 animate-fadeIn">
                  
                  {/* Selector Registro vs Login */}
                  <div className="flex bg-[#181818] p-1 rounded-xl border border-[#282828] mb-3">
                    <button
                      type="button"
                      onClick={() => { setSocioMode('registro'); setActiveUser(null); }}
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
                      onClick={() => { setSocioMode('login'); setSocioRegistered(false); }}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                        socioMode === 'login'
                          ? 'bg-[#282828] text-[#d4af37] border border-[#3a3a3a] shadow-sm'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <LogIn size={13} />
                      <span>Ingresar</span>
                    </button>
                  </div>

                  {/* Formulario de Registro */}
                  {socioMode === 'registro' && !socioRegistered && (
                    <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
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
                          className="w-full bg-[#181818] border border-[#262626] rounded-xl px-3.5 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#d4af37]"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                            className="w-full bg-[#181818] border border-[#262626] rounded-xl px-3.5 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#d4af37]"
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
                            className="w-full bg-[#181818] border border-[#262626] rounded-xl px-3.5 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#d4af37]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                          Crear Contraseña *
                        </label>
                        <div className="relative">
                          <input
                            type={showRegisterPassword ? 'text' : 'password'}
                            required
                            placeholder="Crea una clave segura"
                            value={socioPassword}
                            onChange={(e) => setSocioPassword(e.target.value)}
                            className="w-full bg-[#181818] border border-[#262626] rounded-xl pl-3.5 pr-10 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#d4af37]"
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

                      {/* Tarjeta Membresía VIP */}
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
                              Activar Membresía VIP
                            </span>
                            <span className="text-[8px] bg-[#d4af37] text-black font-extrabold px-1.5 py-0.5 rounded-full uppercase">
                              Gratis
                            </span>
                          </div>
                          <p className="text-[10px] text-gray-400 leading-relaxed">
                            Acceso preferencial en fines de semana, 15% OFF en todos los turnos y consumición libre en el lounge.
                          </p>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-[#d4af37] hover:bg-[#c49f2e] text-black font-bold py-3 px-6 rounded-2xl text-xs tracking-widest uppercase transition-all shadow-xl flex items-center justify-center gap-2"
                      >
                        <span>REGISTRARME EN EL CLUB</span>
                        <ArrowRight size={14} />
                      </button>
                    </form>
                  )}

                  {/* Confirmación de Registro de Socio */}
                  {socioMode === 'registro' && socioRegistered && (
                    <div className="text-center py-5 space-y-3 animate-fadeIn">
                      <div className="w-12 h-12 rounded-full bg-[#d4af37]/20 border border-[#d4af37] flex items-center justify-center mx-auto text-[#d4af37]">
                        <Crown size={24} />
                      </div>
                      <div>
                        <h3 className="text-lg font-serif font-bold text-white mb-0.5">
                          ¡Solicitud Recibida, {socioName}!
                        </h3>
                        <p className="text-xs text-gray-300 max-w-sm mx-auto">
                          Te has registrado como <strong>{isVip ? 'Socio VIP ⭐' : 'Socio Estándar'}</strong>. Activá tus beneficios enviando la confirmación por WhatsApp.
                        </p>
                      </div>

                      <div className="pt-2 max-w-xs mx-auto">
                        <a
                          href={socioWhatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full flex items-center justify-center gap-2 bg-[#25D366] text-white font-bold py-2.5 px-4 rounded-xl text-xs tracking-wider uppercase transition-all shadow-lg"
                        >
                          <Send size={14} />
                          <span>ACTIVAR POR WHATSAPP</span>
                        </a>
                      </div>

                      <button
                        onClick={() => {
                          setSocioRegistered(false);
                          setSocioName('');
                          setSocioPhone('');
                          setSocioEmail('');
                          setSocioPassword('');
                        }}
                        className="text-[11px] text-gray-400 hover:text-white underline block mx-auto pt-2"
                      >
                        Registrar otra cuenta
                      </button>
                    </div>
                  )}

                  {/* Formulario de Login */}
                  {socioMode === 'login' && !activeUser && (
                    <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                          <User size={11} className="text-[#d4af37]" />
                          <span>Celular o Email *</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Ej. 099 123 456"
                          value={loginIdentifier}
                          onChange={(e) => setLoginIdentifier(e.target.value)}
                          className="w-full bg-[#181818] border border-[#262626] rounded-xl px-3.5 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#d4af37]"
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
                            placeholder="Ingresa tu contraseña"
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            className="w-full bg-[#181818] border border-[#262626] rounded-xl pl-3.5 pr-10 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#d4af37]"
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
                        className="w-full bg-[#d4af37] hover:bg-[#c49f2e] text-black font-bold py-3 px-6 rounded-2xl text-xs tracking-widest uppercase transition-all shadow-xl flex items-center justify-center gap-2 mt-2"
                      >
                        <LogIn size={14} />
                        <span>INGRESAR A MI CUENTA</span>
                      </button>
                    </form>
                  )}

                  {/* Estado de Sesión Iniciada */}
                  {socioMode === 'login' && activeUser && (
                    <div className="bg-[#181818] border border-[#d4af37]/40 rounded-2xl p-4 text-center space-y-3 animate-fadeIn">
                      <div className="w-10 h-10 rounded-full bg-[#d4af37]/20 border border-[#d4af37] flex items-center justify-center mx-auto text-[#d4af37]">
                        <Crown size={20} />
                      </div>
                      <div>
                        <span className="text-[9px] uppercase tracking-widest text-[#d4af37] font-bold block">
                          SESIÓN INICIADA
                        </span>
                        <h4 className="text-sm font-bold text-white">¡Hola, {activeUser.name}!</h4>
                        <p className="text-[11px] text-gray-400">{activeUser.identifier}</p>
                      </div>

                      <div className="bg-[#202020] border border-[#2c2c2c] rounded-xl p-2 text-xs text-gray-300 flex items-center justify-around">
                        <div>
                          <span className="text-[9px] text-gray-500 block uppercase">Nivel</span>
                          <strong className="text-[#d4af37]">Socio VIP ⭐</strong>
                        </div>
                        <div className="w-[1px] h-5 bg-gray-700" />
                        <div>
                          <span className="text-[9px] text-gray-500 block uppercase">Beneficio</span>
                          <strong className="text-white">15% OFF</strong>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setName(activeUser.name);
                            if (isValidUruguayPhone(activeUser.identifier)) {
                              setPhone(activeUser.identifier);
                            }
                            setMainTab('reserva');
                          }}
                          className="flex-1 flex items-center justify-center gap-1.5 bg-[#d4af37] text-black font-bold py-2.5 px-3 rounded-xl text-xs tracking-wider uppercase transition-all shadow-md"
                        >
                          <Calendar size={13} />
                          <span>Reservar con Descuento</span>
                        </button>

                        <button
                          onClick={() => setActiveUser(null)}
                          className="px-3 py-2.5 bg-[#242424] hover:bg-[#303030] text-gray-300 hover:text-white rounded-xl text-xs font-semibold transition-colors"
                        >
                          Salir
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
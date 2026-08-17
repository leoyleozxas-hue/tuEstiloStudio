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

// Generador de los próximos 7 días
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

// Funciones de validación y formateo de celulares en Uruguay
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

export default function BookingWidget({ preselectedServiceId, preselectedBarberId }) {
  const daysList = getNextDays();

  // Datos desde Supabase
  const [services, setServices] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [existingBookings, setExistingBookings] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados de selección
  const [serviceId, setServiceId] = useState('');
  const [barberId, setBarberId] = useState('any'); // 'any' = Cualquier barbero disponible
  const [selectedDate, setSelectedDate] = useState(daysList[0]);
  const [activeTurno, setActiveTurno] = useState('tarde');
  const [selectedTime, setSelectedTime] = useState('');
  
  // Datos del cliente
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [notes, setNotes] = useState('');
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [assignedBarber, setAssignedBarber] = useState(null);

  // 1. Cargar Servicios y Barberos al inicio
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
        console.error('Error al cargar servicios y barberos:', err);
      } finally {
        setLoadingData(false);
      }
    }
    fetchData();
  }, [preselectedServiceId, preselectedBarberId]);

  // 2. Consultar citas en Supabase
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

  // Helper para verificar si un barbero está libre
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

  // Auto-seleccionar primer horario disponible
  useEffect(() => {
    if (availableSlotsInTurno.length > 0) {
      if (!selectedTime || !availableSlotsInTurno.includes(selectedTime)) {
        setSelectedTime(availableSlotsInTurno[0]);
      }
    } else {
      setSelectedTime('');
    }
  }, [activeTurno, serviceId, barberId, selectedDate, existingBookings]);

  // Manejo de cambio en el teléfono con formato
  const handlePhoneChange = (e) => {
    const formatted = formatUruguayPhone(e.target.value);
    setPhone(formatted);
    if (phoneError) setPhoneError('');
  };

  // 4. Guardar la cita en Supabase
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

  return (
    <section id="reserva" className="py-8 sm:py-10 px-4 max-w-7xl mx-auto scroll-mt-20 relative">
      <div className="text-center mb-6 sm:mb-8 max-w-2xl mx-auto">
        <span className="text-[10px] font-bold tracking-[0.3em] text-[#d4af37] uppercase block mb-1">
          AGENDA ONLINE EN VIVO
        </span>
        <h2 className="text-2xl sm:text-4xl font-serif font-bold text-white tracking-tight">
          Reservá tu Turno
        </h2>
        <p className="text-xs text-gray-400 mt-1.5">
          Elegí tu servicio y horario disponible en tiempo real.
        </p>
      </div>

      {loadingData ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
          <Loader2 className="animate-spin text-[#d4af37]" size={32} />
          <span className="text-sm">Cargando disponibilidad...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          
          {/* Columna Izquierda: Información */}
          <div className="lg:col-span-5 space-y-4">
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

          {/* Columna Derecha: Formulario */}
          <div className="lg:col-span-7">
            {bookingConfirmed ? (
              <div className="bg-[#141414] border border-[#d4af37]/60 rounded-3xl p-6 sm:p-8 text-center space-y-5 animate-fadeIn shadow-2xl">
                <div className="w-16 h-16 bg-[#d4af37]/15 border border-[#d4af37] text-[#d4af37] rounded-full flex items-center justify-center mx-auto shadow-lg">
                  <CheckCircle2 size={36} />
                </div>
                <div>
                  <h3 className="text-2xl font-serif font-bold text-white mb-2">
                    ¡Turno Reservado!
                  </h3>
                  <p className="text-xs text-gray-300 max-w-md mx-auto">
                    Tu lugar ha quedado registrado. Te esperamos el <strong>{selectedDate.displayDay}</strong> a las <strong>{selectedTime} hs</strong> con <strong>{finalBarberName}</strong>.
                  </p>
                </div>

                <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-4 text-xs text-left space-y-2 max-w-md mx-auto">
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

                <div className="pt-3 flex flex-col sm:flex-row gap-3 justify-center">
                  <a
                    href={bookingWhatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 bg-[#25D366] text-white px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-all shadow-lg"
                  >
                    <MessageSquare size={16} />
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
              <form onSubmit={handleBookingSubmit} className="bg-[#141414] border border-[#222222] rounded-3xl p-5 sm:p-7 shadow-xl space-y-5">
                
                {/* 1. Selección de Servicio */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-wider mb-2">
                    1. Elegí el Servicio
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
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
                  <div className="grid grid-cols-3 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setBarberId('any')}
                      className={`p-3 rounded-2xl border text-center transition-all ${
                        barberId === 'any'
                          ? 'bg-[#1e1b12] border-[#d4af37] text-white shadow-md'
                          : 'bg-[#181818] border-[#262626] text-gray-300 hover:border-gray-600'
                      }`}
                    >
                      <div className="flex justify-center mb-1 text-[#d4af37]">
                        <Users size={16} />
                      </div>
                      <p className="text-xs font-bold text-white">Cualquiera</p>
                      <p className="text-[10px] text-gray-400">1º disponible</p>
                    </button>

                    {barbers.map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => setBarberId(b.id)}
                        className={`p-3 rounded-2xl border text-center transition-all ${
                          barberId === b.id
                            ? 'bg-[#1e1b12] border-[#d4af37] text-white shadow-md'
                            : 'bg-[#181818] border-[#262626] text-gray-300 hover:border-gray-600'
                        }`}
                      >
                        <div className="flex justify-center mb-1 text-gray-400">
                          <Scissors size={16} />
                        </div>
                        <p className="text-xs font-bold text-white">{b.nombre}</p>
                        <p className="text-[10px] text-gray-400">Especialista</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Selección de Fecha */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-wider mb-2">
                    3. Elegí la Fecha
                  </label>
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                    {daysList.map((day) => (
                      <button
                        key={day.dateStr}
                        type="button"
                        onClick={() => setSelectedDate(day)}
                        className={`px-3.5 py-2.5 rounded-2xl border shrink-0 text-center transition-all ${
                          selectedDate.dateStr === day.dateStr
                            ? 'bg-[#d4af37] border-[#d4af37] text-black font-bold shadow-md'
                            : 'bg-[#181818] border-[#262626] text-gray-300 hover:border-gray-600'
                        }`}
                      >
                        <p className="text-[10px] uppercase tracking-wider">{day.weekday}</p>
                        <p className="text-sm font-bold">{day.dayNumber}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Horarios Disponibles */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-[11px] font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                      <span>4. Horarios Disponibles ({durationMinutes} min)</span>
                      {loadingSlots && <Loader2 size={12} className="animate-spin text-[#d4af37]" />}
                    </label>
                    
                    {/* Selector Turno */}
                    <div className="flex bg-[#1c1c1c] p-0.5 rounded-lg border border-[#2b2b2b]">
                      {['mañana', 'tarde', 'noche'].map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setActiveTurno(t)}
                          className={`px-2.5 py-1 rounded-md text-[10px] uppercase font-bold transition-all ${
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
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                      {availableSlotsInTurno.map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setSelectedTime(slot)}
                          className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
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
                    <div className="bg-[#181818] border border-[#262626] rounded-xl p-4 text-center text-xs text-gray-400 flex items-center justify-center gap-2">
                      <AlertCircle size={15} className="text-[#d4af37]" />
                      <span>No hay espacio suficiente en este turno. Probá en otro turno o fecha.</span>
                    </div>
                  )}
                </div>

                {/* 5. Datos de Contacto */}
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
                      className="w-full bg-[#181818] border border-[#2b2b2b] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-[10px] uppercase font-bold text-gray-400">
                        Celular / WhatsApp (Uruguay) *
                      </label>
                      {phone && !isValidUruguayPhone(phone) && (
                        <span className="text-[10px] text-amber-400">09X XXX XXX</span>
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
                        className={`w-full bg-[#181818] border rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none transition-colors ${
                          phoneError
                            ? 'border-red-500 focus:border-red-500'
                            : phone && isValidUruguayPhone(phone)
                            ? 'border-emerald-500/70 focus:border-emerald-500'
                            : 'border-[#2b2b2b] focus:border-[#d4af37]'
                        }`}
                      />
                      {phone && isValidUruguayPhone(phone) && (
                        <span className="absolute right-3 top-2.5 text-emerald-400 font-bold text-xs">
                          ✓
                        </span>
                      )}
                    </div>
                    {phoneError && (
                      <p className="text-[10px] text-red-400 mt-1">{phoneError}</p>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !selectedTime}
                  className="w-full bg-[#d4af37] text-black py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider hover:bg-[#c49f2e] transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      <span>Registrando tu turno...</span>
                    </>
                  ) : (
                    <>
                      <span>Confirmar Reserva {selectedTime ? `(${selectedTime} hs)` : ''}</span>
                      <ChevronRight size={16} />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
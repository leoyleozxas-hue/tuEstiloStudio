// src/pages/AdminPage.jsx
import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

// Componentes modulares
import { AdminLogin } from '../components/admin/auth/AdminLogin';
import { AdminHeader } from '../components/admin/layout/AdminHeader';
import { AdminSidebar } from '../components/admin/layout/AdminSidebar';

// Pestañas
import { CitasTab } from '../components/admin/tabs/CitasTab';
import { FacturacionTab } from '../components/admin/tabs/FacturacionTab';
import { SociosTab } from '../components/admin/tabs/SociosTab';
import { StockTab } from '../components/admin/tabs/StockTab';
import { PromocionesTab } from '../components/admin/tabs/PromocionesTab';
import { ServiciosTab } from '../components/admin/tabs/ServiciosTab';
import { BarberosTab } from '../components/admin/tabs/BarberosTab';

// Modales
import { ServiceModal } from '../components/admin/modals/ServiceModal';
import { BarberModal } from '../components/admin/modals/BarberModal';
import { SocioModal } from '../components/admin/modals/SocioModal';
import { StockModal } from '../components/admin/modals/StockModal';
import { PromoModal } from '../components/admin/modals/PromoModal';
import { ManualCorteModal } from '../components/admin/modals/ManualCorteModal';
import { AsistenciaModal } from '../components/admin/modals/AsistenciaModal';
import { ConfirmDeleteVentaModal } from '../components/admin/modals/ConfirmDeleteVentaModal';

export default function AdminPage() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  const [activeTab, setActiveTab] = useState('citas');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [citas, setCitas] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [barberos, setBarberos] = useState([]);
  const [socios, setSocios] = useState([]);
  const [asistenciasList, setAsistenciasList] = useState([]);
  const [inventario, setInventario] = useState([]);
  const [promociones, setPromociones] = useState([]);
  const [manualCortes, setManualCortes] = useState([]);

  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterBarber, setFilterBarber] = useState('all');

  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [serviceForm, setServiceForm] = useState({ 
    nombre: '', 
    precio: '', 
    duracion_minutos: 30, 
    descripcion: '', 
    badge: '', 
    image_url: '', 
    features: [] 
  });

  const [showBarberModal, setShowBarberModal] = useState(false);
  const [editingBarber, setEditingBarber] = useState(null);
  const [barberForm, setBarberForm] = useState({ 
    nombre: '', 
    telefono: '', 
    email: '', 
    avatar_url: '', 
    descripcion: '', 
    hora_inicio: '10:00', 
    hora_fin: '20:00' 
  });

  const [showSocioModal, setShowSocioModal] = useState(false);
  const [editingSocio, setEditingSocio] = useState(null);
  const [socioForm, setSocioForm] = useState({
    nombre: '',
    telefono: '',
    email: '',
    instagram: '',
    facebook: '',
    es_vip: true,
    puntos: 100,
    fecha_inicio_vip: new Date().toISOString().split('T')[0],
    fecha_vencimiento_vip: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  const [showStockModal, setShowStockModal] = useState(false);
  const [editingStock, setEditingStock] = useState(null);
  const [stockForm, setStockForm] = useState({ nombre: '', tipo: 'Venta', stock: 10, min_stock: 3, precio_costo: '', precio_venta: '' });

  const [showPromoModal, setShowPromoModal] = useState(false);
  const [editingPromo, setEditingPromo] = useState(null);
  const [promoForm, setPromoForm] = useState({ titulo: '', descuento: '', descripcion: '', codigo: '', activo: true });

  const [showManualCorteModal, setShowManualCorteModal] = useState(false);
  const [showAsistenciaModal, setShowAsistenciaModal] = useState(false);

  const [showDeleteVentaModal, setShowDeleteVentaModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // Autenticación
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

  const handleAdminLogin = async (email, password) => {
    setLoggingIn(true);
    setLoginError('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password
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

  const handleAdminLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  // Consultas principales
  const fetchData = async () => {
    try {
      setLoading(true);

      const [srvRes, brbRes, socRes, invRes, prmRes, manRes, asisRes] = await Promise.all([
        supabase.from('servicios').select('*').order('precio', { ascending: true }),
        supabase.from('barberos').select('*, horarios_trabajo(hora_inicio, hora_fin)').order('nombre', { ascending: true }),
        supabase.from('socios').select('*').order('created_at', { ascending: false }).then(r => r).catch(() => ({ data: null })),
        supabase.from('inventario').select('*').order('nombre', { ascending: true }).then(r => r).catch(() => ({ data: null })),
        supabase.from('promociones').select('*').order('created_at', { ascending: false }).then(r => r).catch(() => ({ data: null })),
        supabase.from('cortes_manuales').select('*').order('created_at', { ascending: false }).then(r => r).catch(() => ({ data: null })),
        supabase.from('asistencias_barberos').select('*').order('fecha', { ascending: false }).then(r => r).catch(() => ({ data: null }))
      ]);

      if (srvRes.data) setServicios(srvRes.data);
      
      if (brbRes.data) {
        const barberosConHorarios = brbRes.data.map(b => {
          const primerHorario = Array.isArray(b.horarios_trabajo) ? b.horarios_trabajo[0] : null;
          return {
            ...b,
            hora_inicio: primerHorario?.hora_inicio || '10:00:00',
            hora_fin: primerHorario?.hora_fin || '20:00:00'
          };
        });
        setBarberos(barberosConHorarios);
      }

      if (socRes && socRes.data) setSocios(socRes.data);
      if (asisRes && asisRes.data) setAsistenciasList(asisRes.data);
      if (invRes && invRes.data && invRes.data.length > 0) setInventario(invRes.data);
      if (prmRes && prmRes.data && prmRes.data.length > 0) setPromociones(prmRes.data);
      if (manRes && manRes.data && manRes.data.length > 0) setManualCortes(manRes.data);

      await fetchCitas();
    } catch (err) {
      console.error('Error al cargar datos:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCitas = async () => {
    if (!filterDate) return;
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
          metodo_pago,
          propina,
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
    if (session && filterDate) {
      fetchCitas();
    }
  }, [filterDate, filterBarber]);

  // Transición de estados en agenda
  const updateCitaStatus = async (citaId, nuevoEstado) => {
    try {
      const { error } = await supabase
        .from('citas')
        .update({ estado: nuevoEstado })
        .eq('id', citaId);

      if (error) throw error;
      await fetchCitas();
    } catch (err) {
      alert(`Error al actualizar estado: ${err.message}`);
    }
  };

  // Completar cita con cobro
  const handleCompletarCitaWithCobro = async (citaId, cobroData) => {
    try {
      const { error } = await supabase
        .from('citas')
        .update({
          estado: 'completada',
          metodo_pago: cobroData.metodo_pago || 'Efectivo',
          propina: cobroData.propina || 0
        })
        .eq('id', citaId);

      if (error) throw error;
      await fetchData();
    } catch (err) {
      alert(`Error al completar turno: ${err.message}`);
    }
  };

  // Anulación Segura de Venta / Cobro
  const handleConfirmDeleteVenta = async (item) => {
    try {
      if (item.isCita) {
        const { error } = await supabase
          .from('citas')
          .update({ estado: 'cancelada' })
          .eq('id', item.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('cortes_manuales')
          .delete()
          .eq('id', item.id);
        if (error) throw error;
      }

      await fetchData();
    } catch (err) {
      alert(`Error al anular venta: ${err.message}`);
    }
  };

  // APROBAR SOLICITUD VIP (+Cobro de Cuota $990 en Caja)
  const handleApproveSocio = async (socio) => {
    const cuotaMonto = 990;
    try {
      const hoy = new Date();
      const nuevaFechaVencimiento = new Date(hoy.setDate(hoy.getDate() + 30)).toISOString().split('T')[0];

      // 1. Actualizar socio a aprobado y activo
      const { error: socErr } = await supabase
        .from('socios')
        .update({
          es_vip: true,
          estado_solicitud: 'aprobado',
          activo: true,
          fecha_inicio_vip: new Date().toISOString().split('T')[0],
          fecha_vencimiento_vip: nuevaFechaVencimiento
        })
        .eq('id', socio.id);

      if (socErr) throw socErr;

      // 2. Sumar cobro de cuota a caja
      await supabase.from('cortes_manuales').insert([{
        cliente_nombre: socio.nombre,
        servicio_nombre: 'Cuota Membresía VIP (+30 días)',
        monto: cuotaMonto,
        propina: 0,
        total: cuotaMonto,
        metodo: 'Transferencia / Efectivo',
        fecha: new Date().toISOString().split('T')[0],
        hora: new Date().toLocaleTimeString('es-UY', { hour: '2-digit', minute: '2-digit', hour12: false })
      }]);

      alert(`¡Membresía VIP de ${socio.nombre} aprobada y activada hasta ${nuevaFechaVencimiento}!`);
      fetchData();
    } catch (err) {
      alert(`Error al aprobar socio: ${err.message}`);
    }
  };

  const handleRejectSocio = async (socioId) => {
    if (!confirm('¿Deseas rechazar esta solicitud de membresía VIP?')) return;
    try {
      const { error } = await supabase
        .from('socios')
        .update({ estado_solicitud: 'rechazado', es_vip: false })
        .eq('id', socioId);
      if (error) throw error;
      fetchData();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  // Guardar / Editar Socio
  const handleSaveSocio = async (e) => {
    e.preventDefault();
    const socioPayload = {
      nombre: socioForm.nombre,
      telefono: socioForm.telefono,
      email: socioForm.email || null,
      instagram: socioForm.instagram ? socioForm.instagram.replace('@', '') : null,
      facebook: socioForm.facebook || null,
      es_vip: socioForm.es_vip,
      estado_solicitud: socioForm.es_vip ? 'aprobado' : 'aprobado',
      activo: true,
      puntos: parseInt(socioForm.puntos) || 0,
      fecha_inicio_vip: socioForm.es_vip ? (socioForm.fecha_inicio_vip || new Date().toISOString().split('T')[0]) : null,
      fecha_vencimiento_vip: socioForm.es_vip ? (socioForm.fecha_vencimiento_vip || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]) : null
    };

    try {
      if (editingSocio) {
        const { error } = await supabase
          .from('socios')
          .update(socioPayload)
          .eq('id', editingSocio.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('socios')
          .insert([socioPayload]);
        if (error) throw error;
      }

      setShowSocioModal(false);
      setEditingSocio(null);
      setSocioForm({
        nombre: '',
        telefono: '',
        email: '',
        instagram: '',
        facebook: '',
        es_vip: true,
        puntos: 100,
        fecha_inicio_vip: new Date().toISOString().split('T')[0],
        fecha_vencimiento_vip: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });
      fetchData();
    } catch (err) {
      alert(`Error al guardar socio: ${err.message}`);
    }
  };

  const handleRenewMembership = async (socio) => {
    const cuotaMonto = 990;
    const confirmMsg = `¿Deseas cobrar la cuota mensual ($${cuotaMonto} UYU) a ${socio.nombre} y extender su membresía VIP por 30 días?`;
    if (!confirm(confirmMsg)) return;

    try {
      const hoy = new Date();
      const nuevaFechaVencimiento = new Date(hoy.setDate(hoy.getDate() + 30)).toISOString().split('T')[0];

      const { error: socErr } = await supabase
        .from('socios')
        .update({
          es_vip: true,
          estado_solicitud: 'aprobado',
          activo: true,
          fecha_vencimiento_vip: nuevaFechaVencimiento
        })
        .eq('id', socio.id);

      if (socErr) throw socErr;

      await supabase.from('cortes_manuales').insert([{
        cliente_nombre: socio.nombre,
        servicio_nombre: 'Cuota Membresía VIP (+30 días)',
        monto: cuotaMonto,
        propina: 0,
        total: cuotaMonto,
        metodo: 'Efectivo / Mensualidad',
        fecha: new Date().toISOString().split('T')[0],
        hora: new Date().toLocaleTimeString('es-UY', { hour: '2-digit', minute: '2-digit', hour12: false })
      }]);

      alert(`¡Membresía de ${socio.nombre} renovada hasta ${nuevaFechaVencimiento}! El cobro fue sumado a la caja.`);
      fetchData();
    } catch (err) {
      alert(`Error al renovar membresía: ${err.message}`);
    }
  };

  const toggleSocioVip = async (socio) => {
    try {
      const nuevoVip = !socio.es_vip;
      const nuevaFecha = nuevoVip ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : null;

      const { error } = await supabase
        .from('socios')
        .update({ 
          es_vip: nuevoVip,
          estado_solicitud: 'aprobado',
          activo: true,
          fecha_vencimiento_vip: nuevaFecha
        })
        .eq('id', socio.id);

      if (error) throw error;
      fetchData();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleDeleteSocio = async (id) => {
    if (!confirm('¿Deseas eliminar este socio del club?')) return;
    try {
      const { error } = await supabase.from('socios').delete().eq('id', id);
      if (error) throw error;
      fetchData();
    } catch (err) {
      alert(`Error al eliminar socio: ${err.message}`);
    }
  };

  // Guardar servicio
  const handleSaveService = async (e, customData = null) => {
    if (e && e.preventDefault) e.preventDefault();
    const dataToSave = customData || serviceForm;
    const servicePayload = {
      nombre: dataToSave.nombre,
      precio: parseFloat(dataToSave.precio),
      duracion_minutos: parseInt(dataToSave.duracion_minutos),
      descripcion: dataToSave.descripcion || null,
      badge: dataToSave.badge || null,
      image_url: dataToSave.image_url || null,
      features: Array.isArray(dataToSave.features) ? dataToSave.features : []
    };

    try {
      if (editingService) {
        const { error } = await supabase
          .from('servicios')
          .update(servicePayload)
          .eq('id', editingService.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('servicios')
          .insert([{ ...servicePayload, activo: true }]);
        if (error) throw error;
      }

      setShowServiceModal(false);
      setEditingService(null);
      setServiceForm({ nombre: '', precio: '', duracion_minutos: 30, descripcion: '', badge: '', image_url: '', features: [] });
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

  const handleDeleteService = async (id) => {
    if (!confirm('¿Deseas eliminar este servicio de la base de datos?')) return;
    try {
      const { error } = await supabase.from('servicios').delete().eq('id', id);
      if (error) throw error;
      fetchData();
    } catch (err) {
      alert(`Error al eliminar: ${err.message}`);
    }
  };

  // Barberos
  const handleSaveBarber = async (e) => {
    e.preventDefault();
    const horaIni = (barberForm.hora_inicio || '10:00') + ':00';
    const horaFin = (barberForm.hora_fin || '20:00') + ':00';

    try {
      if (editingBarber) {
        const { error: brbErr } = await supabase
          .from('barberos')
          .update({
            nombre: barberForm.nombre,
            telefono: barberForm.telefono,
            email: barberForm.email,
            avatar_url: barberForm.avatar_url || null,
            descripcion: barberForm.descripcion || null
          })
          .eq('id', editingBarber.id);
        if (brbErr) throw brbErr;

        await supabase
          .from('horarios_trabajo')
          .update({ hora_inicio: horaIni, hora_fin: horaFin })
          .eq('barbero_id', editingBarber.id);
      } else {
        const { data, error: brbErr } = await supabase
          .from('barberos')
          .insert([{
            nombre: barberForm.nombre,
            telefono: barberForm.telefono,
            email: barberForm.email,
            avatar_url: barberForm.avatar_url || null,
            descripcion: barberForm.descripcion || null,
            activo: true
          }])
          .select()
          .single();

        if (brbErr) throw brbErr;

        const diasSemana = Array.from({ length: 6 }, (_, i) => i + 1);
        const horarios = diasSemana.map((dia) => ({
          barbero_id: data.id,
          dia_semana: dia,
          hora_inicio: horaIni,
          hora_fin: horaFin,
          activo: true
        }));

        await supabase.from('horarios_trabajo').insert(horarios);
      }

      setShowBarberModal(false);
      setEditingBarber(null);
      setBarberForm({ nombre: '', telefono: '', email: '', avatar_url: '', descripcion: '', hora_inicio: '10:00', hora_fin: '20:00' });
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

  const handleDeleteBarber = async (id) => {
    if (!confirm('¿Deseas eliminar este barbero?')) return;
    try {
      await supabase.from('horarios_trabajo').delete().eq('barbero_id', id);
      const { error } = await supabase.from('barberos').delete().eq('id', id);
      if (error) throw error;
      fetchData();
    } catch (err) {
      alert(`Error al eliminar: ${err.message}`);
    }
  };

  // Guardar Asistencia
  const handleSaveAsistencia = async (asistenciaData) => {
    try {
      const payload = {
        barbero_id: asistenciaData.barbero_id,
        fecha: asistenciaData.fecha,
        estado: asistenciaData.estado,
        hora_llegada: asistenciaData.hora_llegada ? `${asistenciaData.hora_llegada}:00` : null,
        hora_salida: asistenciaData.hora_salida ? `${asistenciaData.hora_salida}:00` : null,
        motivo: asistenciaData.motivo
      };

      const { data, error } = await supabase
        .from('asistencias_barberos')
        .insert([payload])
        .select()
        .single();

      if (error) {
        console.error('Error supabase asistencia:', error);
        setAsistenciasList(prev => [{ id: Date.now(), ...asistenciaData }, ...prev]);
      } else {
        setAsistenciasList(prev => [data, ...prev]);
      }

      if (asistenciaData.estado === 'ausente') {
        try {
          await supabase.from('bloqueos_agenda').insert([{
            barbero_id: asistenciaData.barbero_id,
            fecha_inicio: `${asistenciaData.fecha}T00:00:00`,
            fecha_fin: `${asistenciaData.fecha}T23:59:59`,
            motivo: `Inasistencia: ${asistenciaData.motivo || 'Falta'}`
          }]);
        } catch (_) {}
      }
    } catch (err) {
      console.error('Error al guardar asistencia:', err);
    }
  };

  const handleDeleteAsistencia = async (id) => {
    if (!confirm('¿Deseas eliminar este registro de asistencia?')) return;
    try {
      await supabase.from('asistencias_barberos').delete().eq('id', id);
      setAsistenciasList(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      alert(`Error al eliminar: ${err.message}`);
    }
  };

  // Stock
  const handleSaveStock = async (e) => {
    e.preventDefault();
    const itemData = {
      nombre: stockForm.nombre,
      tipo: stockForm.tipo,
      stock: parseInt(stockForm.stock),
      min_stock: parseInt(stockForm.min_stock),
      precio_costo: parseFloat(stockForm.precio_costo || 0),
      precio_venta: parseFloat(stockForm.precio_venta || 0)
    };

    try {
      if (editingStock && editingStock.id) {
        await supabase.from('inventario').update(itemData).eq('id', editingStock.id);
      } else {
        await supabase.from('inventario').insert([itemData]);
      }
    } catch (_) {}

    setShowStockModal(false);
    setEditingStock(null);
    setStockForm({ nombre: '', tipo: 'Venta', stock: 10, min_stock: 3, precio_costo: '', precio_venta: '' });
    fetchData();
  };

  const adjustStockQty = async (id, delta) => {
    const item = inventario.find(i => i.id === id);
    if (!item) return;
    const newStock = Math.max(0, item.stock + delta);
    setInventario(inventario.map(i => i.id === id ? { ...i, stock: newStock } : i));
    try {
      await supabase.from('inventario').update({ stock: newStock }).eq('id', id);
    } catch (_) {}
  };

  const handleDeleteStock = async (id) => {
    if (!confirm('¿Deseas eliminar este producto del inventario?')) return;
    setInventario(inventario.filter(i => i.id !== id));
    try {
      await supabase.from('inventario').delete().eq('id', id);
    } catch (_) {}
  };

  // Promociones
  const handleSavePromo = async (e) => {
    e.preventDefault();
    const promoData = {
      titulo: promoForm.titulo,
      descuento: promoForm.descuento,
      descripcion: promoForm.descripcion,
      codigo: promoForm.codigo,
      activo: promoForm.activo
    };

    try {
      if (editingPromo && editingPromo.id) {
        await supabase.from('promociones').update(promoData).eq('id', editingPromo.id);
      } else {
        await supabase.from('promociones').insert([promoData]);
      }
    } catch (_) {}

    setShowPromoModal(false);
    setEditingPromo(null);
    setPromoForm({ titulo: '', descuento: '', descripcion: '', codigo: '', activo: true });
    fetchData();
  };

  const togglePromoActive = async (promo) => {
    const nuevoEstado = !promo.activo;
    setPromociones(promociones.map(p => p.id === promo.id ? { ...p, activo: nuevoEstado } : p));
    try {
      await supabase.from('promociones').update({ activo: nuevoEstado }).eq('id', promo.id);
    } catch (_) {}
  };

  const handleDeletePromo = async (id) => {
    if (!confirm('¿Deseas eliminar esta promoción?')) return;
    setPromociones(promociones.filter(p => p.id !== id));
    try {
      await supabase.from('promociones').delete().eq('id', id);
    } catch (_) {}
  };

  // Cobro Manual
  const handleSaveManualCorte = async (nuevoCobro) => {
    setManualCortes(prev => [nuevoCobro, ...prev]);
    try {
      await supabase.from('cortes_manuales').insert([{
        cliente_nombre: nuevoCobro.cliente_nombre,
        barbero_id: nuevoCobro.barbero_id,
        barbero_nombre: nuevoCobro.barbero_nombre,
        servicio_id: nuevoCobro.servicio_id,
        servicio_nombre: nuevoCobro.servicio_nombre,
        monto: nuevoCobro.monto,
        propina: nuevoCobro.propina,
        total: nuevoCobro.total,
        metodo: nuevoCobro.metodo,
        fecha: nuevoCobro.fecha,
        hora: nuevoCobro.hora
      }]);
    } catch (_) {}
  };

  const hoyStr = new Date().toISOString().split('T')[0];
  const badges = {
    citas: citas.filter(c => c.estado === 'pendiente').length,
    sociosPendientes: socios.filter(s => s.es_vip && s.estado_solicitud === 'pendiente').length,
    sociosVencidos: socios.filter(s => s.es_vip && s.fecha_vencimiento_vip && s.fecha_vencimiento_vip < hoyStr).length,
    stock: inventario.filter(i => i.stock <= i.min_stock).length,
    promociones: promociones.filter(p => p.activo).length
  };

  const totalFacturadoHoy = [
    ...citas.filter(c => c.estado === 'completada' && c.fecha_hora_inicio && c.fecha_hora_inicio.startsWith(hoyStr)).map(c => Number(c.servicios?.precio || 0) + Number(c.propina || 0)),
    ...manualCortes.filter(m => m.fecha === hoyStr).map(m => Number(m.total || 0))
  ].reduce((a, b) => a + b, 0);

  const totalCortesHoyCount = [
    ...citas.filter(c => c.estado === 'completada' && c.fecha_hora_inicio && c.fecha_hora_inicio.startsWith(hoyStr)),
    ...manualCortes.filter(m => m.fecha === hoyStr)
  ].length;

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#080808] flex flex-col items-center justify-center text-gray-400 gap-3">
        <Loader2 className="animate-spin text-[#d4af37]" size={36} />
        <p className="text-xs tracking-wider uppercase font-bold text-gray-500">Verificando credenciales...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <AdminLogin 
        onLogin={handleAdminLogin}
        loggingIn={loggingIn}
        loginError={loginError}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#080808] text-white font-sans selection:bg-[#d4af37] selection:text-black flex flex-col">
      
      <AdminHeader 
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        onLogout={handleAdminLogout}
      />

      <div className="flex-1 flex overflow-hidden">
        
        <AdminSidebar 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          badges={badges}
          totalFacturadoDia={totalFacturadoHoy}
          cortesCompletadosCount={totalCortesHoyCount}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[#080808]">
          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center text-gray-400 gap-3">
              <Loader2 className="animate-spin text-[#d4af37]" size={32} />
              <p className="text-xs">Sincronizando con la base de datos...</p>
            </div>
          ) : (
            <>
              {activeTab === 'citas' && (
                <CitasTab 
                  citas={citas}
                  filterDate={filterDate}
                  setFilterDate={setFilterDate}
                  filterBarber={filterBarber}
                  setFilterBarber={setFilterBarber}
                  barberos={barberos}
                  onRefresh={fetchCitas}
                  onUpdateStatus={updateCitaStatus}
                  onCompletarCitaWithCobro={handleCompletarCitaWithCobro}
                />
              )}

              {activeTab === 'facturacion' && (
                <FacturacionTab 
                  citas={citas}
                  manualCortes={manualCortes}
                  barberos={barberos}
                  onOpenManualModal={() => setShowManualCorteModal(true)}
                  onRequestDeleteCobro={(item) => {
                    setItemToDelete(item);
                    setShowDeleteVentaModal(true);
                  }}
                />
              )}

              {activeTab === 'socios' && (
                <SociosTab 
                  socios={socios}
                  onNewSocio={() => {
                    setEditingSocio(null);
                    setSocioForm({
                      nombre: '',
                      telefono: '',
                      email: '',
                      instagram: '',
                      facebook: '',
                      es_vip: true,
                      puntos: 100,
                      fecha_inicio_vip: new Date().toISOString().split('T')[0],
                      fecha_vencimiento_vip: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                    });
                    setShowSocioModal(true);
                  }}
                  onEditSocio={(socio) => {
                    setEditingSocio(socio);
                    setSocioForm({
                      nombre: socio.nombre,
                      telefono: socio.telefono,
                      email: socio.email || '',
                      instagram: socio.instagram || '',
                      facebook: socio.facebook || '',
                      es_vip: socio.es_vip,
                      puntos: socio.puntos || 0,
                      fecha_inicio_vip: socio.fecha_inicio_vip || new Date().toISOString().split('T')[0],
                      fecha_vencimiento_vip: socio.fecha_vencimiento_vip || ''
                    });
                    setShowSocioModal(true);
                  }}
                  onToggleVip={toggleSocioVip}
                  onApproveSocio={handleApproveSocio}
                  onRejectSocio={handleRejectSocio}
                  onRenewMembership={handleRenewMembership}
                  onDeleteSocio={handleDeleteSocio}
                />
              )}

              {activeTab === 'stock' && (
                <StockTab 
                  inventario={inventario}
                  onNewStock={() => {
                    setEditingStock(null);
                    setStockForm({ nombre: '', tipo: 'Venta', stock: 10, min_stock: 3, precio_costo: '', precio_venta: '' });
                    setShowStockModal(true);
                  }}
                  onEditStock={(item) => {
                    setEditingStock(item);
                    setStockForm({
                      nombre: item.nombre,
                      tipo: item.tipo,
                      stock: item.stock,
                      min_stock: item.min_stock,
                      precio_costo: item.precio_costo,
                      precio_venta: item.precio_venta
                    });
                    setShowStockModal(true);
                  }}
                  onAdjustStock={adjustStockQty}
                  onDeleteStock={handleDeleteStock}
                />
              )}

              {activeTab === 'promociones' && (
                <PromocionesTab 
                  promociones={promociones}
                  onNewPromo={() => {
                    setEditingPromo(null);
                    setPromoForm({ titulo: '', descuento: '', descripcion: '', codigo: '', activo: true });
                    setShowPromoModal(true);
                  }}
                  onEditPromo={(promo) => {
                    setEditingPromo(promo);
                    setPromoForm({
                      titulo: promo.titulo,
                      descuento: promo.descuento,
                      descripcion: promo.descripcion || '',
                      codigo: promo.codigo || '',
                      activo: promo.activo
                    });
                    setShowPromoModal(true);
                  }}
                  onToggleActive={togglePromoActive}
                  onDeletePromo={handleDeletePromo}
                />
              )}

              {activeTab === 'servicios' && (
                <ServiciosTab 
                  servicios={servicios}
                  onNewService={() => {
                    setEditingService(null);
                    setServiceForm({ 
                      nombre: '', 
                      precio: '', 
                      duracion_minutos: 30, 
                      descripcion: '', 
                      badge: '', 
                      image_url: '', 
                      features: [] 
                    });
                    setShowServiceModal(true);
                  }}
                  onEditService={(srv) => {
                    setEditingService(srv);
                    setServiceForm({
                      nombre: srv.nombre,
                      precio: srv.precio,
                      duracion_minutos: srv.duracion_minutos,
                      descripcion: srv.descripcion || '',
                      badge: srv.badge || '',
                      image_url: srv.image_url || '',
                      features: srv.features || []
                    });
                    setShowServiceModal(true);
                  }}
                  onToggleActive={toggleServiceActive}
                  onDeleteService={handleDeleteService}
                />
              )}

              {activeTab === 'barberos' && (
                <BarberosTab 
                  barberos={barberos}
                  asistenciasList={asistenciasList}
                  onNewBarber={() => {
                    setEditingBarber(null);
                    setBarberForm({ 
                      nombre: '', 
                      telefono: '', 
                      email: '', 
                      avatar_url: '', 
                      descripcion: '', 
                      hora_inicio: '10:00', 
                      hora_fin: '20:00' 
                    });
                    setShowBarberModal(true);
                  }}
                  onEditBarber={(b) => {
                    setEditingBarber(b);
                    setBarberForm({
                      nombre: b.nombre,
                      telefono: b.telefono || '',
                      email: b.email || '',
                      avatar_url: b.avatar_url || '',
                      descripcion: b.descripcion || '',
                      hora_inicio: b.hora_inicio ? b.hora_inicio.slice(0, 5) : '10:00',
                      hora_fin: b.hora_fin ? b.hora_fin.slice(0, 5) : '20:00'
                    });
                    setShowBarberModal(true);
                  }}
                  onToggleActive={toggleBarberActive}
                  onDeleteBarber={handleDeleteBarber}
                  onOpenAsistenciaModal={() => setShowAsistenciaModal(true)}
                  onDeleteAsistencia={handleDeleteAsistencia}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Modales */}
      <ServiceModal 
        isOpen={showServiceModal}
        onClose={() => setShowServiceModal(false)}
        onSave={handleSaveService}
        editingService={editingService}
        serviceForm={serviceForm}
        setServiceForm={setServiceForm}
      />

      <BarberModal 
        isOpen={showBarberModal}
        onClose={() => setShowBarberModal(false)}
        onSave={handleSaveBarber}
        editingBarber={editingBarber}
        barberForm={barberForm}
        setBarberForm={setBarberForm}
      />

      <SocioModal 
        isOpen={showSocioModal}
        onClose={() => setShowSocioModal(false)}
        onSave={handleSaveSocio}
        editingSocio={editingSocio}
        socioForm={socioForm}
        setSocioForm={setSocioForm}
      />

      <StockModal 
        isOpen={showStockModal}
        onClose={() => setShowStockModal(false)}
        onSave={handleSaveStock}
        editingStock={editingStock}
        stockForm={stockForm}
        setStockForm={setStockForm}
      />

      <PromoModal 
        isOpen={showPromoModal}
        onClose={() => setShowPromoModal(false)}
        onSave={handleSavePromo}
        editingPromo={editingPromo}
        promoForm={promoForm}
        setPromoForm={setPromoForm}
      />

      <ManualCorteModal 
        isOpen={showManualCorteModal}
        onClose={() => setShowManualCorteModal(false)}
        onSave={handleSaveManualCorte}
        barberos={barberos}
        servicios={servicios}
      />

      <AsistenciaModal 
        isOpen={showAsistenciaModal}
        onClose={() => setShowAsistenciaModal(false)}
        onSave={handleSaveAsistencia}
        barberos={barberos}
      />

      <ConfirmDeleteVentaModal 
        isOpen={showDeleteVentaModal}
        onClose={() => {
          setShowDeleteVentaModal(false);
          setItemToDelete(null);
        }}
        onConfirm={handleConfirmDeleteVenta}
        itemToDelete={itemToDelete}
        adminEmail={session?.user?.email}
      />

    </div>
  );
}
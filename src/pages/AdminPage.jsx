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
import { StockTab } from '../components/admin/tabs/StockTab';
import { PromocionesTab } from '../components/admin/tabs/PromocionesTab';
import { ServiciosTab } from '../components/admin/tabs/ServiciosTab';
import { BarberosTab } from '../components/admin/tabs/BarberosTab';

// Modales
import { ServiceModal } from '../components/admin/modals/ServiceModal';
import { BarberModal } from '../components/admin/modals/BarberModal';
import { StockModal } from '../components/admin/modals/StockModal';
import { PromoModal } from '../components/admin/modals/PromoModal';
import { ManualCorteModal } from '../components/admin/modals/ManualCorteModal';

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
  const [asistencias, setAsistencias] = useState({});
  const [inventario, setInventario] = useState([]);
  const [promociones, setPromociones] = useState([]);
  const [manualCortes, setManualCortes] = useState([]);

  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterBarber, setFilterBarber] = useState('all');

  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [serviceForm, setServiceForm] = useState({ nombre: '', descripcion: '', duracion_minutos: 30, precio: '' });

  const [showBarberModal, setShowBarberModal] = useState(false);
  const [editingBarber, setEditingBarber] = useState(null);
  const [barberForm, setBarberForm] = useState({ nombre: '', telefono: '', email: '', hora_inicio: '10:00', hora_fin: '20:00' });

  const [showStockModal, setShowStockModal] = useState(false);
  const [editingStock, setEditingStock] = useState(null);
  const [stockForm, setStockForm] = useState({ nombre: '', tipo: 'Venta', stock: 10, min_stock: 3, precio_costo: '', precio_venta: '' });

  const [showPromoModal, setShowPromoModal] = useState(false);
  const [editingPromo, setEditingPromo] = useState(null);
  const [promoForm, setPromoForm] = useState({ titulo: '', descuento: '', descripcion: '', codigo: '', activo: true });

  const [showManualCorteModal, setShowManualCorteModal] = useState(false);

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
      const hoyStr = new Date().toISOString().split('T')[0];

      const [srvRes, brbRes, invRes, prmRes, manRes, asisRes] = await Promise.all([
        supabase.from('servicios').select('*').order('precio', { ascending: true }),
        supabase.from('barberos').select('*, horarios_trabajo(hora_inicio, hora_fin)').order('nombre', { ascending: true }),
        supabase.from('inventario').select('*').order('nombre', { ascending: true }).then(r => r).catch(() => ({ data: null })),
        supabase.from('promociones').select('*').order('created_at', { ascending: false }).then(r => r).catch(() => ({ data: null })),
        supabase.from('cortes_manuales').select('*').order('created_at', { ascending: false }).then(r => r).catch(() => ({ data: null })),
        supabase.from('asistencias_barberos').select('*').eq('fecha', hoyStr).then(r => r).catch(() => ({ data: null }))
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

      if (asisRes && asisRes.data) {
        const mapAsis = {};
        asisRes.data.forEach(a => {
          mapAsis[a.barbero_id] = a.estado;
        });
        setAsistencias(mapAsis);
      }

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

  // Guardar barbero y sus horarios
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
            email: barberForm.email
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
      setBarberForm({ nombre: '', telefono: '', email: '', hora_inicio: '10:00', hora_fin: '20:00' });
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

  // Actualizar asistencia diaria de barbero
  const handleUpdateAsistencia = async (barberoId, nuevoEstado) => {
    const hoyStr = new Date().toISOString().split('T')[0];
    setAsistencias(prev => ({ ...prev, [barberoId]: nuevoEstado }));

    try {
      await supabase.from('asistencias_barberos').upsert({
        barbero_id: barberoId,
        fecha: hoyStr,
        estado: nuevoEstado
      });

      if (nuevoEstado === 'ausente' || nuevoEstado === 'franco') {
        await supabase.from('bloqueos_agenda').insert([{
          barbero_id: barberoId,
          fecha_inicio: `${hoyStr}T00:00:00`,
          fecha_fin: `${hoyStr}T23:59:59`,
          motivo: `Inasistencia / ${nuevoEstado}`
        }]);
      }
    } catch (err) {
      console.error('Error al actualizar asistencia:', err);
    }
  };

  // Servicios
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

  const badges = {
    citas: citas.filter(c => c.estado === 'pendiente').length,
    stock: inventario.filter(i => i.stock <= i.min_stock).length,
    promociones: promociones.filter(p => p.activo).length
  };

  const hoyStr = new Date().toISOString().split('T')[0];
  const totalFacturadoHoy = [
    ...citas.filter(c => c.estado === 'completada' && c.fecha_hora_inicio && c.fecha_hora_inicio.startsWith(hoyStr)).map(c => Number(c.servicios?.precio || 0)),
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
                />
              )}

              {activeTab === 'facturacion' && (
                <FacturacionTab 
                  citas={citas}
                  manualCortes={manualCortes}
                  barberos={barberos}
                  onOpenManualModal={() => setShowManualCorteModal(true)}
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
                    setServiceForm({ nombre: '', descripcion: '', duracion_minutos: 30, precio: '' });
                    setShowServiceModal(true);
                  }}
                  onEditService={(srv) => {
                    setEditingService(srv);
                    setServiceForm({
                      nombre: srv.nombre,
                      descripcion: srv.descripcion || '',
                      duracion_minutos: srv.duracion_minutos,
                      precio: srv.precio
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
                  asistencias={asistencias}
                  onNewBarber={() => {
                    setEditingBarber(null);
                    setBarberForm({ nombre: '', telefono: '', email: '', hora_inicio: '10:00', hora_fin: '20:00' });
                    setShowBarberModal(true);
                  }}
                  onEditBarber={(b) => {
                    setEditingBarber(b);
                    setBarberForm({
                      nombre: b.nombre,
                      telefono: b.telefono || '',
                      email: b.email || '',
                      hora_inicio: b.hora_inicio ? b.hora_inicio.slice(0, 5) : '10:00',
                      hora_fin: b.hora_fin ? b.hora_fin.slice(0, 5) : '20:00'
                    });
                    setShowBarberModal(true);
                  }}
                  onToggleActive={toggleBarberActive}
                  onDeleteBarber={handleDeleteBarber}
                  onUpdateAsistencia={handleUpdateAsistencia}
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

    </div>
  );
}
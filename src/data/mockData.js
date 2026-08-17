// src/data/mockData.js
import { Scissors, Sparkles, Star, Eye, Droplets, Crown, Waves } from 'lucide-react';

export const studioData = {
  name: "TU ESTILO STUDIO",
  tagline: "BARBERÍA · ESTILO · EXPERIENCIA",
  address: "Barrios Amorín 1443 esq. Colonia",
  neighborhood: "Centro",
  city: "Montevideo",
  hours: "Lunes a Sábado",
  hoursRange: "09:00 a 21:00 hs",
  walkIn: "También podés venir sin agenda",
  phone: "099 123 456",
  instagram: "tuestilostudio.uy",
  instagramUrl: "https://instagram.com/tuestilostudio.uy",
  googleMapsUrl: "https://maps.google.com/?q=Dr+Javier+Barrios+Amor%C3%ADn+1443,+Montevideo",
  googleMapsEmbed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3272.246473185348!2d-56.1834!3d-34.9048!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x959f81ca973b06bb%3A0x6a1b6f634cb941e7!2sDr%20Javier%20Barrios%20Amor%C3%ADn%201443%2C%20Montevideo!5e0!3m2!1ses!2suy!4v1700000000000!5m2!1ses!2suy",
  marquee: ["TU ESTILO STUDIO", "CORTES", "BARBA", "EXPERIENCIA PREMIUM", "POOL", "MONTEVIDEO"]
};

export const navLinks = [
  { name: 'SERVICIOS', href: '#servicios' },
  { name: 'EL STUDIO', href: '#studio' },
  { name: 'EQUIPO', href: '#equipo' },
  { name: 'UBICACIÓN', href: '#ubicacion' },
];

export const barbersData = [
  { 
    id: 'any', 
    name: 'Primer barbero disponible', 
    role: 'Asignación automática según disponibilidad',
    image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=600',
    specialties: ['Corte', 'Barba', 'Atención rápida']
  },
  { 
    id: 'b1', 
    name: 'Victor', 
    role: 'Master Barber · Tu Estilo Studio',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600',
    specialties: ['Fade Clásico', 'Navaja Libre', 'Diseño de Barba']
  },
  { 
    id: 'b2', 
    name: 'Micaela', 
    role: 'Stylist & Barber · Tu Estilo Studio',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=600',
    specialties: ['Corte Moderno', 'Perfilado & Cejas', 'Tratamientos']
  },
  { 
    id: 'b3', 
    name: 'Samuel', 
    role: 'Fade Specialist · Tu Estilo Studio',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=600',
    specialties: ['Skin Fade', 'Texturizados', 'Líneas y Diseños']
  },
  { 
    id: 'b4', 
    name: 'Yasmani', 
    role: 'Beard Stylist & Barber · Tu Estilo Studio',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=600',
    specialties: ['Ritual Toalla Caliente', 'Barbas Largas', 'Corte Clásico']
  }
];

export const servicesData = [
  {
    id: 'corte',
    name: 'Corte Tradicional / Fade',
    price: 450,
    duration: '30 min',
    desc: 'Clásico o moderno, adaptado a la morfología de tu rostro. Técnicas combinadas para un acabado prolijo y duradero.',
    image: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&q=80&w=800',
    features: ['Diagnóstico de estilo', 'Lavado previo', 'Perfilado a navaja', 'Peinado final con fijador mate'],
    icon: Scissors,
    badge: 'Más pedido'
  },
  {
    id: 'barba',
    name: 'Perfilado & Ritual de Barba',
    price: 120,
    duration: '20 min',
    desc: 'Cuidado y diseño integral con toalla caliente aromática, aceites nutritivos y afeitado tradicional a navaja.',
    image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=800',
    features: ['Toalla caliente aromática', 'Afeitado y diseño a navaja', 'Aceites nutritivos', 'Bálsamo calmante'],
    icon: Sparkles
  },
  {
    id: 'cejas',
    name: 'Perfilado de Cejas',
    price: 90,
    duration: '10 min',
    desc: 'Detalle final y prolijo para enmarcar la mirada de forma natural y masculina.',
    image: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&q=80&w=800',
    features: ['Pinza y navaja de precisión', 'Recorte de longitud', 'Gel refrescante'],
    icon: Eye
  },
  {
    id: 'combo',
    name: 'Corte + Barba Completo',
    price: 550,
    duration: '45 min',
    desc: 'Servicio integral para renovar tu imagen por completo con la mejor atención y bebida de cortesía.',
    image: 'https://images.unsplash.com/photo-1517832606299-7ae9b720a186?auto=format&fit=crop&q=80&w=800',
    features: ['Corte y fade personalizado', 'Ritual de barba completo', 'Limpieza de cejas', 'Café o bebida de cortesía'],
    icon: Star,
    badge: 'Recomendado'
  },
  {
    id: 'lavado',
    name: 'Lavado y Cuidado Capilar',
    price: 120,
    duration: '15 min',
    desc: 'Lavado profundo tonificante con masaje relajante y producto de peinado.',
    image: 'https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&q=80&w=800',
    features: ['Doble lavado refrescante', 'Masaje capilar', 'Moldeado con secador'],
    icon: Droplets
  },
  {
    id: 'lavado-corte',
    name: 'Lavado con Corte',
    price: 100,
    duration: '45 min',
    desc: 'Lavado profesional complementario para acompañar tu corte de cabello.',
    image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=800',
    features: ['Lavado antes y después del corte', 'Corte detallado', 'Peinado final'],
    icon: Waves
  },
  {
    id: 'premium',
    name: 'Servicio Premium Tu Estilo',
    price: 700,
    duration: '60 min',
    desc: 'La experiencia definitiva: corte completo, ritual de barba, cejas, lavado con masaje y bebida premium.',
    image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=800',
    features: ['Corte + Fade de autor', 'Ritual completo de toalla caliente', 'Cejas y mascarilla facial', 'Trago o café premium'],
    icon: Crown,
    badge: 'Exclusivo'
  }
];
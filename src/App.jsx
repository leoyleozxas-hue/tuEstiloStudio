// src/App.jsx
import React, { useState } from 'react';
import Preloader from './components/layout/Preloader';
import NavBar from './components/layout/Navbar';
import HeroSection from './components/sections/HeroSection';
import MarqueeTicker from './components/sections/MarqueeTicker';
import ServicesSection from './components/sections/ServicesSection';
import ExperienceSection from './components/sections/ExperienceSection';
import BenefitsSection from './components/sections/BenefitsSection';
import TeamSection from './components/sections/TeamSection';
import LocationSection from './components/sections/LocationSection';
import BookingWidget from './components/booking/BookingWidget';
import Footer from './components/layout/Footer';
import FloatingCTA from './components/layout/FloatingCTA';

export default function App() {
  const [selectedServiceId, setSelectedServiceId] = useState(null);
  const [selectedBarberId, setSelectedBarberId] = useState(null);
  const [initialWidgetTab, setInitialWidgetTab] = useState('reserva');

  // Función para ir a Reserva
  const scrollToBooking = (srvId = null, barberId = null) => {
    if (srvId) setSelectedServiceId(srvId);
    if (barberId) setSelectedBarberId(barberId);
    setInitialWidgetTab('reserva');
    document.getElementById('reserva')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Función para ir a Login de Socios
  const scrollToLogin = () => {
    setInitialWidgetTab('socios');
    document.getElementById('reserva')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#0c0c0c] text-white font-sans selection:bg-[#d4af37] selection:text-black">
      <Preloader />
      <Navbar 
        onBookClick={() => scrollToBooking()} 
        onLoginClick={scrollToLogin} 
      />
      <main>
        <HeroSection onBookClick={() => scrollToBooking()} />
        <MarqueeTicker />
        <ServicesSection onSelectService={(id) => scrollToBooking(id)} />
        <ExperienceSection />
        <BenefitsSection onBookClick={() => scrollToBooking()} />
        <TeamSection onSelectBarber={(barberId) => scrollToBooking(null, barberId)} />
        <BookingWidget 
          preselectedServiceId={selectedServiceId} 
          preselectedBarberId={selectedBarberId}
          forcedTab={initialWidgetTab}
        />
        <LocationSection />
      </main>
      <Footer />
      <FloatingCTA onClick={() => scrollToBooking()} />
    </div>
  );
}
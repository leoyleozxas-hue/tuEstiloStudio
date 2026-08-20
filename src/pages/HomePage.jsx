// src/pages/HomePage.jsx
import React, { useState } from 'react';
import Preloader from '../components/layout/Preloader';
import NavBar from '../components/layout/NavBar';
import HeroSection from '../components/sections/HeroSection';
import MarqueeTicker from '../components/sections/MarqueeTicker';
import ServicesSection from '../components/sections/ServicesSection';
import ExperienceSection from '../components/sections/ExperienceSection';
import BenefitsSection from '../components/sections/BenefitsSection';
import TeamSection from '../components/sections/TeamSection';
import LocationSection from '../components/sections/LocationSection';
import BookingWidget from '../components/booking/BookingWidget';
import Footer from '../components/layout/Footer';
import FloatingCTA from '../components/layout/FloatingCTA';

export default function HomePage() {
  const [selectedServiceId, setSelectedServiceId] = useState(null);
  const [initialWidgetTab, setInitialWidgetTab] = useState('reserva');
  const [initialSocioMode, setInitialSocioMode] = useState('registro');

  const scrollToBooking = (srvId = null) => {
    if (srvId) setSelectedServiceId(srvId);
    setInitialWidgetTab('reserva');
    document.getElementById('reserva')?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToSocios = (mode = 'registro') => {
    setInitialWidgetTab('socios');
    setInitialSocioMode(mode);
    document.getElementById('reserva')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#0c0c0c] text-white font-sans selection:bg-[#d4af37] selection:text-black">
      <Preloader />
      
      <NavBar 
        onBookClick={() => scrollToBooking()} 
        onSociosClick={() => scrollToSocios('registro')}
        onLoginClick={() => scrollToSocios('login')} 
      />

      <main>
        <HeroSection 
          onBookClick={() => scrollToBooking()} 
          onSociosClick={() => scrollToSocios('registro')}
        />
        <MarqueeTicker />
        <ServicesSection onSelectService={(id) => scrollToBooking(id)} />
        <ExperienceSection />
        <BenefitsSection onBookClick={() => scrollToBooking()} />
        
        {/* Galería limpia del equipo */}
        <TeamSection />
        
        <BookingWidget 
          preselectedServiceId={selectedServiceId} 
          forcedTab={initialWidgetTab}
          forcedSocioMode={initialSocioMode}
        />

        <LocationSection />
      </main>

      <Footer 
        onBookClick={() => scrollToBooking()} 
        onSociosClick={() => scrollToSocios('registro')}
      />

      <FloatingCTA onClick={() => scrollToBooking()} />
    </div>
  );
}
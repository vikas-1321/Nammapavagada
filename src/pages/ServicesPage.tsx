import React, { useState } from 'react';
import { SectionHeader } from '../components/common/SectionHeader';
import { TransitScheduleView } from '../components/services/TransitScheduleView';
import { CivicOfficesView } from '../components/services/CivicOfficesView';
import { EmergencyDirectory } from '../components/services/EmergencyDirectory';
import { serviceDirectoryService } from '../services/serviceDirectoryService';

export const ServicesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'TRANSIT' | 'CIVIC' | 'EMERGENCY'>('TRANSIT');

  const transitRoutes = serviceDirectoryService.getTransitRoutes();
  const civicOffices = serviceDirectoryService.getCivicOffices();
  const emergencyContacts = serviceDirectoryService.getEmergencyContacts();

  return (
    <div className="space-y-10 py-6 md:py-10">
      <SectionHeader
        number="04"
        categoryLabel="Community · Local Information & Services"
        title="Public Services & Infrastructure Directory"
        kannadaTitle="ಸಾರ್ವಜನಿಕ ಸೇವೆಗಳು ಮತ್ತು ಆಡಳಿತ ಕಚೇರಿಗಳು"
        description="Public road transit connections, municipal citizen services, taluk administrative desks, and emergency first responder contact channels."
      />

      {/* Segmented Tab Switcher (Warm Pill Segmented Bar) */}
      <div className="flex flex-wrap gap-2 pb-2 border-b border-soft-sand">
        {[
          { id: 'TRANSIT', label: '01 / Transit Corridors (KSRTC / APSRTC / Rail)' },
          { id: 'CIVIC', label: '02 / Civic Administration & Offices' },
          { id: 'EMERGENCY', label: '03 / Emergency First Response (24/7)' },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`text-xs md:text-sm font-semibold px-4 py-2.5 rounded-xl border transition-all duration-150 shadow-sm ${
                isActive
                  ? 'bg-forest-green text-white border-forest-green shadow-md'
                  : 'bg-white text-dark-text border-soft-sand hover:bg-warm-cream'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'TRANSIT' && (
        <TransitScheduleView routes={transitRoutes} />
      )}

      {activeTab === 'CIVIC' && (
        <CivicOfficesView offices={civicOffices} />
      )}

      {activeTab === 'EMERGENCY' && (
        <EmergencyDirectory contacts={emergencyContacts} />
      )}
    </div>
  );
};

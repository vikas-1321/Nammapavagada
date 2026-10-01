import React, { useState } from 'react';
import { SectionHeader } from '../components/common/SectionHeader';
import { HistoricalTimeline } from '../components/history/HistoricalTimeline';
import { FortArchitectureAtlas } from '../components/history/FortArchitectureAtlas';
import { MegalithicHeritageView } from '../components/history/MegalithicHeritageView';
import { HistoricalSourcesDrawer } from '../components/history/HistoricalSourcesDrawer';
import { historyService } from '../services/historyService';

export const HistoryPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'TIMELINE' | 'FORT_ANATOMY' | 'MEGALITHIC' | 'BIBLIOGRAPHY'>('TIMELINE');

  const eras = historyService.getAllEras();
  const fortStructures = historyService.getFortStructures();
  const megalithicSites = historyService.getMegalithicSites();
  const citations = historyService.getAcademicCitations();

  return (
    <div className="space-y-10 py-6 md:py-10">
      {/* Top Header */}
      <SectionHeader
        number="01"
        categoryLabel="Heritage & Historical Chronicles"
        title="Chronicles of Pavagada"
        kannadaTitle="ಪಾವಗಡ ಐತಿಹಾಸಿಕ ವಿವರಣಾತ್ಮಕ ಕೋಶ"
        description="Grounded strictly in peer-reviewed architectural research and archaeological records. Documenting the post-Vijayanagara hill fort, the 8 Paleygars, Mysorean artillery adaptations, and proto-historic megalithic culture."
      />

      {/* Sub-Module Navigation Tabs (Warm Pill Segmented Bar) */}
      <div className="flex flex-wrap gap-2 pb-2 border-b border-soft-sand">
        {[
          { id: 'TIMELINE', label: '01 / Chronological Epochs' },
          { id: 'FORT_ANATOMY', label: '02 / Fort Anatomical Atlas' },
          { id: 'MEGALITHIC', label: '03 / Megalithic Antiquity' },
          { id: 'BIBLIOGRAPHY', label: '04 / Bibliography & Sources' },
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

      {/* Tab Panels */}
      {activeTab === 'TIMELINE' && (
        <HistoricalTimeline eras={eras} />
      )}

      {activeTab === 'FORT_ANATOMY' && (
        <FortArchitectureAtlas structures={fortStructures} />
      )}

      {activeTab === 'MEGALITHIC' && (
        <MegalithicHeritageView sites={megalithicSites} />
      )}

      {activeTab === 'BIBLIOGRAPHY' && (
        <HistoricalSourcesDrawer citations={citations} />
      )}
    </div>
  );
};

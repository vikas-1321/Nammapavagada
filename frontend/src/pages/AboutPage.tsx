import React from 'react';
import { SectionHeader } from '../components/common/SectionHeader';

export const AboutPage: React.FC = () => {
  return (
    <div className="space-y-12 py-6 md:py-10">
      <SectionHeader
        number="06"
        categoryLabel="Taluk Profile & System Architecture"
        title="About Pavagada & The Platform"
        kannadaTitle="ಪಾವಗಡ ತಾಲ್ಲೂಕು ಪರಿಚಯ ಹಾಗೂ ತಾಂತ್ರಿಕ ನೀತಿ"
        description="Comprehensive geographic, demographic, and civic overview of Pavagada Taluk in Tumakuru District, alongside the Heritage × Explorer × Community design philosophy and SOLID architecture."
      />

      {/* Part 1: Geography & Demographics (12-Column Grid) */}
      <div className="bg-white border border-soft-sand rounded-2xl p-6 md:p-10 shadow-sm space-y-8">
        <div className="border-b border-soft-sand pb-4">
          <span className="text-[11px] uppercase font-bold tracking-wider bg-forest-green text-white px-3 py-1 rounded-full">
            Territorial Profile
          </span>
          <h3 className="text-2xl md:text-3xl font-serif font-bold text-forest-green mt-2">
            Geographic & Demographic Foundation
          </h3>
        </div>

        <div className="grid grid-cols-12 gap-8 items-center">
          <div className="col-span-12 lg:col-span-6 space-y-4 text-base text-dark-text leading-relaxed font-sans">
            <p>
              <strong>Pavagada</strong> is a town and taluk located in the northeastern perimeter of Tumakuru District, Karnataka, India (coordinates: 14.10° N, 77.28° E, elevation: 846 metres / 2,776 ft).
              Historically integrated into the Mysore Kingdom, it is geographically positioned along the border with Andhra Pradesh and flanked by Chitradurga district.
              The <strong>Uttara Pinakini</strong> river flows through this taluk.
            </p>
            <p>
              Due to its border geography, Pavagada features a bilingual cultural identity: the 2011 Census records <strong>Kannada (70.6%)</strong> and <strong>Telugu (21.2%)</strong> as the predominant spoken languages, alongside Urdu (4.04%) and Hindi (3.84%).
            </p>
            <p>
              The region is situated on a semi-arid elevated granite plateau surrounded by steep rocky hills.
              While groundnut (peanut) has traditionally been the mainstay crop, chronic water scarcity led the Government of Karnataka to declare the taluk drought-hit <strong>54 times in the past six decades</strong>.
            </p>
          </div>

          <div className="col-span-12 lg:col-span-6 bg-warm-cream/60 border border-soft-sand rounded-2xl p-6 space-y-4 shadow-sm">
            <span className="text-xs uppercase font-bold tracking-wider text-forest-green block border-b border-soft-sand pb-2">
              Official Census Demographics (Census of India 2011)
            </span>
            <div className="grid grid-cols-2 gap-4 text-xs font-mono">
              <div className="border-b border-soft-sand pb-2">
                <span className="text-muted-text uppercase block text-[11px]">Town Population:</span>
                <strong className="text-forest-green text-base">28,486</strong>
              </div>
              <div className="border-b border-soft-sand pb-2">
                <span className="text-muted-text uppercase block text-[11px]">Rural Population:</span>
                <strong className="text-forest-green text-base">216,708</strong>
              </div>
              <div className="border-b border-soft-sand pb-2">
                <span className="text-muted-text uppercase block text-[11px]">Total Taluk Pop:</span>
                <strong className="text-forest-green text-base">245,194</strong>
              </div>
              <div className="border-b border-soft-sand pb-2">
                <span className="text-muted-text uppercase block text-[11px]">Total Area:</span>
                <strong className="text-forest-green text-base">1,368.01 km²</strong>
              </div>
              <div className="border-b border-soft-sand pb-2">
                <span className="text-muted-text uppercase block text-[11px]">Overall Literacy:</span>
                <strong className="text-terracotta text-base">81.33%</strong>
              </div>
              <div className="border-b border-soft-sand pb-2">
                <span className="text-muted-text uppercase block text-[11px]">Male Literacy:</span>
                <strong className="text-forest-green text-base">88.33%</strong>
              </div>
              <div className="border-b border-soft-sand pb-2">
                <span className="text-muted-text uppercase block text-[11px]">Female Literacy:</span>
                <strong className="text-forest-green text-base">75.36%</strong>
              </div>
              <div className="border-b border-soft-sand pb-2">
                <span className="text-muted-text uppercase block text-[11px]">Vehicle Reg Code:</span>
                <strong className="text-terracotta text-base">KA-64</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Part 2: Clean Energy Transformation & Notable Figures */}
      <div className="grid grid-cols-12 gap-8">
        {/* Clean Energy */}
        <div className="col-span-12 lg:col-span-7 bg-white border border-soft-sand rounded-2xl p-6 md:p-8 space-y-4 shadow-sm">
          <span className="text-[11px] uppercase font-bold tracking-wider bg-terracotta text-white px-3 py-1 rounded-full">
            Economic Transformation
          </span>
          <h3 className="text-2xl font-serif font-bold text-forest-green">
            Shakti Sthala: The 2,050 MW Solar Renaissance
          </h3>
          <p className="text-sm md:text-base text-dark-text leading-relaxed font-sans">
            In 2015, Karnataka Renewable Energy Development Ltd (KREDL) and SECI established KSPDCL to construct Pavagada Solar Park across 13,000 acres (53 km²) in five taluk villages: <strong>Balasamudra, Tirumani, Kyataganacharlu, Vallur, and Rayacharlu</strong>.
          </p>
          <p className="text-sm md:text-base text-dark-text leading-relaxed font-sans">
            Conceptualized by KREDL Managing Director G.V. Balram, a native of Pavagada taluk, the project avoided outright land confiscation. Instead, a 25–35 year lease framework provides participating farmers ₹21,000 per acre annually with a 5% increase every two years, delivering over ₹23–25 crore annually directly into the agrarian local economy.
          </p>
          <div className="bg-warm-cream/80 p-4 rounded-xl border border-soft-sand font-mono text-xs text-forest-green font-semibold">
            Total Project Outlay: ₹14,800 Crore (US$2.1 Billion) | Commissioned Capacity: 2,050 MW
          </div>
        </div>

        {/* Notable Personalities */}
        <div className="col-span-12 lg:col-span-5 bg-white border border-soft-sand rounded-2xl p-6 md:p-8 space-y-4 shadow-sm">
          <span className="text-[11px] uppercase font-bold tracking-wider bg-forest-green text-white px-3 py-1 rounded-full">
            Notable Citizens
          </span>
          <h3 className="text-2xl font-serif font-bold text-forest-green">
            Distinguished Personalities
          </h3>

          <div className="space-y-3.5 text-xs">
            <div className="border border-soft-sand bg-warm-cream/40 p-4 rounded-xl">
              <strong className="text-sm font-serif font-bold text-forest-green block">Sulagitti Narasamma (1920–2018)</strong>
              <span className="text-terracotta font-semibold block mb-1">Padma Shri Awardee (2018)</span>
              <p className="text-muted-text leading-relaxed font-sans">
                Legendary Indian traditional midwife from Pavagada who delivered more than 15,000 babies across rural backward regions without accepting financial compensation.
              </p>
            </div>

            <div className="border border-soft-sand bg-warm-cream/40 p-4 rounded-xl">
              <strong className="text-sm font-serif font-bold text-forest-green block">Rangayana Raghu</strong>
              <span className="text-earth-brown font-semibold block mb-1">Renowned Film & Theatre Actor</span>
              <p className="text-muted-text leading-relaxed font-sans">
                Native of Pavagada taluk and veteran Kannada cinema and theatre artist, celebrated across multiple Karnataka State Film Awards.
              </p>
            </div>

            <div className="border border-soft-sand bg-warm-cream/40 p-4 rounded-xl">
              <strong className="text-sm font-serif font-bold text-forest-green block">V. S. Ugrappa</strong>
              <span className="text-earth-brown font-semibold block mb-1">Parliamentarian & Jurist</span>
              <p className="text-muted-text leading-relaxed font-sans">
                Senior advocate and parliamentarian who represented Bellary Lok Sabha constituency and served as Member of Karnataka Legislative Council.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

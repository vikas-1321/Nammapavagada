import React from 'react';
import { SectionHeader } from '../components/common/SectionHeader';
import {
  MapPin,
  Users,
  Sun,
  Zap,
  Award,
  Sparkles,
  Building2,
  GraduationCap,
  Car,
  TrendingUp,
  HeartPulse,
  Scale,
  Compass,
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="w-full max-w-full overflow-x-hidden space-y-8 md:space-y-12 py-4 sm:py-6 md:py-10">
      <SectionHeader
        number="06"
        categoryLabel="Taluk Profile & System Architecture"
        title="About Pavagada & The Platform"
        kannadaTitle="ಪಾವಗಡ ತಾಲ್ಲೂಕು ಪರಿಚಯ ಹಾಗೂ ತಾಂತ್ರಿಕ ನೀತಿ"
        description="Comprehensive geographic, demographic, and civic overview of Pavagada Taluk in Tumakuru District, alongside the Heritage × Explorer × Community design philosophy and SOLID architecture."
      />

      {/* Part 1: Geography & Demographics (12-Column Responsive Grid) */}
      <div className="bg-white border border-soft-sand rounded-2xl p-4 sm:p-6 md:p-8 lg:p-10 shadow-sm space-y-6 sm:space-y-8 overflow-hidden">
        <div className="border-b border-soft-sand pb-4">
          <div className="inline-flex items-center gap-1.5 text-[11px] uppercase font-bold tracking-wider bg-forest-green text-white px-3 py-1 rounded-full shadow-xs">
            <MapPin className="w-3 h-3 shrink-0" />
            <span>Territorial Profile</span>
          </div>
          <h3 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-forest-green mt-2 break-words">
            Geographic & Demographic Foundation
          </h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          <div className="lg:col-span-6 space-y-4 text-sm sm:text-base text-dark-text leading-relaxed font-sans break-words">
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

            <div className="pt-2 flex flex-wrap items-center gap-2 text-xs font-mono text-forest-green">
              <span className="inline-flex items-center gap-1 bg-warm-cream px-2.5 py-1 rounded-md border border-soft-sand">
                <Compass className="w-3 h-3 text-terracotta shrink-0" />
                14.10° N, 77.28° E
              </span>
              <span className="inline-flex items-center gap-1 bg-warm-cream px-2.5 py-1 rounded-md border border-soft-sand">
                Elevation: 846m
              </span>
            </div>
          </div>

          <div className="lg:col-span-6 bg-warm-cream/60 border border-soft-sand rounded-2xl p-4 sm:p-5 md:p-6 space-y-4 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 border-b border-soft-sand pb-2.5">
              <Users className="w-4 h-4 text-forest-green shrink-0" />
              <span className="text-xs uppercase font-bold tracking-wider text-forest-green truncate">
                Official Census Demographics (2011)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
              {/* Town Population */}
              <div className="bg-white/80 border border-soft-sand/70 rounded-xl p-2.5 sm:p-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-forest-green/10 flex items-center justify-center shrink-0">
                    <Building2 className="w-3.5 h-3.5 text-forest-green" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase tracking-wider text-muted-text block truncate font-semibold">
                      Town Pop
                    </span>
                    <strong className="text-xs sm:text-sm font-mono text-forest-green font-bold">
                      28,486
                    </strong>
                  </div>
                </div>
              </div>

              {/* Rural Population */}
              <div className="bg-white/80 border border-soft-sand/70 rounded-xl p-2.5 sm:p-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-forest-green/10 flex items-center justify-center shrink-0">
                    <Users className="w-3.5 h-3.5 text-forest-green" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase tracking-wider text-muted-text block truncate font-semibold">
                      Rural Pop
                    </span>
                    <strong className="text-xs sm:text-sm font-mono text-forest-green font-bold">
                      216,708
                    </strong>
                  </div>
                </div>
              </div>

              {/* Total Taluk Pop */}
              <div className="bg-white/80 border border-soft-sand/70 rounded-xl p-2.5 sm:p-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-terracotta/10 flex items-center justify-center shrink-0">
                    <Users className="w-3.5 h-3.5 text-terracotta" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase tracking-wider text-muted-text block truncate font-semibold">
                      Total Taluk Pop
                    </span>
                    <strong className="text-xs sm:text-sm font-mono text-forest-green font-bold">
                      245,194
                    </strong>
                  </div>
                </div>
              </div>

              {/* Total Area */}
              <div className="bg-white/80 border border-soft-sand/70 rounded-xl p-2.5 sm:p-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-forest-green/10 flex items-center justify-center shrink-0">
                    <MapPin className="w-3.5 h-3.5 text-forest-green" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase tracking-wider text-muted-text block truncate font-semibold">
                      Total Area
                    </span>
                    <strong className="text-xs sm:text-sm font-mono text-forest-green font-bold">
                      1,368.01 km²
                    </strong>
                  </div>
                </div>
              </div>

              {/* Overall Literacy */}
              <div className="bg-white/80 border border-soft-sand/70 rounded-xl p-2.5 sm:p-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-terracotta/10 flex items-center justify-center shrink-0">
                    <GraduationCap className="w-3.5 h-3.5 text-terracotta" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase tracking-wider text-muted-text block truncate font-semibold">
                      Overall Literacy
                    </span>
                    <strong className="text-xs sm:text-sm font-mono text-terracotta font-bold">
                      81.33%
                    </strong>
                  </div>
                </div>
              </div>

              {/* Male Literacy */}
              <div className="bg-white/80 border border-soft-sand/70 rounded-xl p-2.5 sm:p-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-forest-green/10 flex items-center justify-center shrink-0">
                    <GraduationCap className="w-3.5 h-3.5 text-forest-green" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase tracking-wider text-muted-text block truncate font-semibold">
                      Male Literacy
                    </span>
                    <strong className="text-xs sm:text-sm font-mono text-forest-green font-bold">
                      88.33%
                    </strong>
                  </div>
                </div>
              </div>

              {/* Female Literacy */}
              <div className="bg-white/80 border border-soft-sand/70 rounded-xl p-2.5 sm:p-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-forest-green/10 flex items-center justify-center shrink-0">
                    <GraduationCap className="w-3.5 h-3.5 text-forest-green" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase tracking-wider text-muted-text block truncate font-semibold">
                      Female Literacy
                    </span>
                    <strong className="text-xs sm:text-sm font-mono text-forest-green font-bold">
                      75.36%
                    </strong>
                  </div>
                </div>
              </div>

              {/* Vehicle Reg Code */}
              <div className="bg-white/80 border border-soft-sand/70 rounded-xl p-2.5 sm:p-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-terracotta/10 flex items-center justify-center shrink-0">
                    <Car className="w-3.5 h-3.5 text-terracotta" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase tracking-wider text-muted-text block truncate font-semibold">
                      Vehicle RTO
                    </span>
                    <strong className="text-xs sm:text-sm font-mono text-terracotta font-bold">
                      KA-64
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Part 2: Clean Energy Transformation & Notable Figures */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Clean Energy */}
        <div className="lg:col-span-7 bg-white border border-soft-sand rounded-2xl p-4 sm:p-6 md:p-8 space-y-4 shadow-sm overflow-hidden">
          <div className="inline-flex items-center gap-1.5 text-[11px] uppercase font-bold tracking-wider bg-terracotta text-white px-3 py-1 rounded-full shadow-xs">
            <Sun className="w-3 h-3 shrink-0" />
            <span>Economic Transformation</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-serif font-bold text-forest-green break-words">
            Shakti Sthala: The 2,050 MW Solar Renaissance
          </h3>
          <p className="text-sm md:text-base text-dark-text leading-relaxed font-sans break-words">
            In 2015, Karnataka Renewable Energy Development Ltd (KREDL) and SECI established KSPDCL to construct Pavagada Solar Park across 13,000 acres (53 km²) in five taluk villages: <strong>Balasamudra, Tirumani, Kyataganacharlu, Vallur, and Rayacharlu</strong>.
          </p>
          <p className="text-sm md:text-base text-dark-text leading-relaxed font-sans break-words">
            Conceptualized by KREDL Managing Director G.V. Balram, a native of Pavagada taluk, the project avoided outright land confiscation. Instead, a 25–35 year lease framework provides participating farmers ₹21,000 per acre annually with a 5% increase every two years, delivering over ₹23–25 crore annually directly into the agrarian local economy.
          </p>

          {/* Responsive Outlay & Capacity Metrics Box */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="bg-warm-cream/80 border border-soft-sand rounded-xl p-3 sm:p-3.5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-terracotta/10 text-terracotta flex items-center justify-center shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] sm:text-[11px] uppercase font-bold text-muted-text tracking-wider block truncate">
                  Commissioned Capacity
                </span>
                <strong className="text-sm sm:text-base font-mono text-forest-green font-bold block truncate">
                  2,050 MW
                </strong>
              </div>
            </div>

            <div className="bg-warm-cream/80 border border-soft-sand rounded-xl p-3 sm:p-3.5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-forest-green/10 text-forest-green flex items-center justify-center shrink-0">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] sm:text-[11px] uppercase font-bold text-muted-text tracking-wider block truncate">
                  Total Project Outlay
                </span>
                <strong className="text-sm sm:text-base font-mono text-forest-green font-bold block truncate">
                  ₹14,800 Cr ($2.1B)
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* Notable Personalities */}
        <div className="lg:col-span-5 bg-white border border-soft-sand rounded-2xl p-4 sm:p-6 md:p-8 space-y-4 shadow-sm overflow-hidden">
          <div className="inline-flex items-center gap-1.5 text-[11px] uppercase font-bold tracking-wider bg-forest-green text-white px-3 py-1 rounded-full shadow-xs">
            <Award className="w-3 h-3 shrink-0" />
            <span>Notable Citizens</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-serif font-bold text-forest-green break-words">
            Distinguished Personalities
          </h3>

          <div className="space-y-3 text-xs">
            {/* Sulagitti Narasamma */}
            <div className="border border-soft-sand bg-warm-cream/40 p-3.5 sm:p-4 rounded-xl space-y-1.5">
              <div className="flex items-start justify-between gap-2">
                <strong className="text-sm font-serif font-bold text-forest-green block leading-snug">
                  Sulagitti Narasamma (1920–2018)
                </strong>
                <Award className="w-4 h-4 text-terracotta shrink-0 mt-0.5" />
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] text-terracotta font-semibold bg-terracotta/10 px-2 py-0.5 rounded-md">
                <HeartPulse className="w-3 h-3 shrink-0" />
                Padma Shri Awardee (2018)
              </span>
              <p className="text-muted-text leading-relaxed font-sans pt-1">
                Legendary Indian traditional midwife from Pavagada who delivered more than 15,000 babies across rural backward regions without accepting financial compensation.
              </p>
            </div>

            {/* Rangayana Raghu */}
            <div className="border border-soft-sand bg-warm-cream/40 p-3.5 sm:p-4 rounded-xl space-y-1.5">
              <div className="flex items-start justify-between gap-2">
                <strong className="text-sm font-serif font-bold text-forest-green block leading-snug">
                  Rangayana Raghu
                </strong>
                <Sparkles className="w-4 h-4 text-earth-brown shrink-0 mt-0.5" />
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] text-earth-brown font-semibold bg-earth-brown/10 px-2 py-0.5 rounded-md">
                <Sparkles className="w-3 h-3 shrink-0" />
                Renowned Film & Theatre Actor
              </span>
              <p className="text-muted-text leading-relaxed font-sans pt-1">
                Native of Pavagada taluk and veteran Kannada cinema and theatre artist, celebrated across multiple Karnataka State Film Awards.
              </p>
            </div>

            {/* V. S. Ugrappa */}
            <div className="border border-soft-sand bg-warm-cream/40 p-3.5 sm:p-4 rounded-xl space-y-1.5">
              <div className="flex items-start justify-between gap-2">
                <strong className="text-sm font-serif font-bold text-forest-green block leading-snug">
                  V. S. Ugrappa
                </strong>
                <Scale className="w-4 h-4 text-forest-green shrink-0 mt-0.5" />
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] text-forest-green font-semibold bg-forest-green/10 px-2 py-0.5 rounded-md">
                <Scale className="w-3 h-3 shrink-0" />
                Parliamentarian & Jurist
              </span>
              <p className="text-muted-text leading-relaxed font-sans pt-1">
                Senior advocate and parliamentarian who represented Bellary Lok Sabha constituency and served as Member of Karnataka Legislative Council.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


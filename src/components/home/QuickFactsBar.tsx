import React from 'react';

export const QuickFactsBar: React.FC = () => {
  const metrics = [
    {
      value: '2,050 MW',
      label: 'Shakti Sthala',
      sublabel: 'World 3rd largest solar park',
      color: 'text-terracotta',
    },
    {
      value: '13,000 Ac',
      label: 'Solar Park Area',
      sublabel: '5 villages on land-lease',
      color: 'text-forest-green',
    },
    {
      value: '7 Rings',
      label: 'Fort Enclosures',
      sublabel: '5 on hill, 2 in town',
      color: 'text-earth-brown',
    },
    {
      value: '1586 CE',
      label: 'Paleygar Grant',
      sublabel: 'Aravidu Dynasty foundation',
      color: 'text-forest-green',
    },
    {
      value: '81.33%',
      label: 'Literacy Rate',
      sublabel: 'Census 2011 official return',
      color: 'text-forest-green',
    },
    {
      value: 'c. 1000 BCE',
      label: 'Megalithic Age',
      sublabel: 'Bodula Maramma stone cists',
      color: 'text-earth-brown',
    },
  ];

  return (
    <section className="py-10 border-b border-soft-sand" aria-label="Key Taluk Metrics">
      <div className="grid grid-cols-12 gap-4">
        {metrics.map((m, idx) => (
          <div
            key={idx}
            className="col-span-6 sm:col-span-4 lg:col-span-2 bg-white border border-soft-sand rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className={`text-2xl font-serif font-bold ${m.color} tracking-tight`}>
              {m.value}
            </div>
            <div className="text-xs font-bold uppercase tracking-wider text-forest-green font-sans mt-1">
              {m.label}
            </div>
            <div className="text-xs text-muted-text font-sans mt-0.5">
              {m.sublabel}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

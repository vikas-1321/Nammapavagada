import { HistoricalEra, FortStructureItem, MegalithicSiteRecord, AcademicCitation } from '../types/history';

export const HISTORICAL_ERAS: HistoricalEra[] = [
  {
    id: 'megalithic',
    eraName: 'Prehistoric & Megalithic Period',
    kannadaTitle: 'ಬೃಹತ್ ಶಿಲಾಯುಗ ಸಂಸ್ಕೃತಿ',
    timeRange: 'c. 1000 BCE – 300 CE',
    primaryRulers: ['Indigenous iron-age communities', 'Gudlu / Bedara settlements'],
    keyEvents: [
      'Establishment of megalithic stone cists, dolmens, and menhirs (nilusugallu) across hill tracts',
      'Construction of 14 dolmen/cist tombs in the Bodula Maramma shrine vicinity',
      'Development of natural rock rainwater catchment reservoirs (Dhones)',
      'Exploration and documentation by archaeologists (Rice, Mackenzie, Ramireddy, Peddayya, Shivatarak, Cheluvarajan)'
    ],
    summary: 'Extensive megalithic burial grounds and habitation traces were discovered surrounding Pavagada town and adjacent hills. Sites at Bodula Maramma, Kotegudda, and Udandappanapalya reveal multi-ton stone slabs, iron oxide nodules, red-and-black burial pottery, and stone circle burials.',
    pdfEvidence: 'Documented in research papers by V.R. Cheluvarajan (Ithihasa Darshana, 2009/2015) and archaeological surveys recorded in Tumakuru district gazetteers.'
  },
  {
    id: 'aravidu-foundation',
    eraName: 'Aravidu Dynasty & Chieftaincy Foundation',
    kannadaTitle: 'ಆರವೀಡು ಸಾಮ್ರಾಜ್ಯ ಹಾಗೂ ಪಾಳೆಯಗಾರ ಸಂಸ್ಥಾಪನೆ',
    timeRange: '1586 – 1652 CE',
    primaryRulers: ['Venkatapatiraya (Penukonda)', 'Ballappanayaka (1st Paleygar)'],
    keyEvents: [
      '1586: Aravidu king Venkatapatiraya of Penukonda grants chieftaincy of Pavagada to Ballappanayaka',
      'Ballappanayaka, of Telugu-speaking origin from Gutthi (Anantapur), migrates to Chikkaballapur then assumes governance',
      '1591–1600: Construction of the hill fortification, bastions, and royal citadel',
      'Transition from prior rule under Nidugal and Madakshira chieftains (1580–1586)'
    ],
    summary: 'Following the 1565 fall of Vijayanagara, the capital shifted to Penukonda under the Aravidu dynasty. Ballappanayaka established Pavagada as a heavily fortified sentinel outpost, building sturdy granite ramparts, secret escape tunnels connecting to Penukonda, and defensive gateways.',
    pdfEvidence: 'Authoritative research by Vivek C.G. & Sagar T.S. (2022) and D.N. Yogeshwarappa (2020: "Pavagada Paleygararu").'
  },
  {
    id: 'paleygar-independence',
    eraName: 'Sovereign Paleygar Era',
    kannadaTitle: 'ಸ್ವತಂತ್ರ ಪಾಳೆಯಗಾರರ ಆಡಳಿತ',
    timeRange: '1652 – mid-18th Century',
    primaryRulers: ['Lineage of 8 successive Paleygars', 'Thimmappanayaka'],
    keyEvents: [
      '1652: With the dissolution of Aravidu paramountcy, Pavagada chieftains govern independently',
      'Continuous regional conflicts with neighboring chieftains of Madakshira, Nidugal, Ratnagiri, and Chitradurga',
      'Expansion of lower settlement fortifications into 7 distinct concentric defensive rings',
      'Thimmappanayaka builds an enclosed protective courtyard for the hilltop Anjaneya shrine during wartime incursions'
    ],
    summary: 'A total of 8 successive chieftains governed Pavagada between 1586 and 1799. Despite limited treasury resources, they directed capital into fortified defense systems, stone water harvesting cisterns (Dhones), and civic shrines.',
    pdfEvidence: 'Documented in Vivek & Sagar (2022) citing Colin Mackenzie 1801 records and Barry Lewis (2002).'
  },
  {
    id: 'mysore-sultanate',
    eraName: 'Mysorean Annexation & Fort Renovation',
    kannadaTitle: 'ಮೈಸೂರು ಸುಲ್ತಾನರ ಆಳ್ವಿಕೆ (ಫತೇಹಬಾದ್)',
    timeRange: 'mid-18th Century – 1799 CE',
    primaryRulers: ['Hyder Ali', 'Tipu Sultan'],
    keyEvents: [
      'Mid-18th century: Pavagada conquered by Hyder Ali and annexed to Srirangapatna kingdom',
      'Tipu Sultan renames Pavagada as "Fatehbad"',
      'Major military retrofit: conversion of square Hindu bastions into rounded artillery platforms for modern cannons',
      'Construction of Sultan Bathery ammunition bunker and conversion of hilltop plinth into Babayya Gudi Masjid'
    ],
    summary: 'Under Hyder Ali and Tipu Sultan, Pavagada was refortified as a strategic artillery stronghold. Cannon platforms were constructed with 7-foot thick parapets, subterranean ammunition storerooms were excavated, and the fort was integrated into Mysore defense line.',
    pdfEvidence: 'Barry Lewis (2002: "British Assessments of Tipu Sultan Hill Forts") and Vivek & Sagar (2022).'
  },
  {
    id: 'colonial-annexation',
    eraName: 'British Annexation & Princely Administration',
    kannadaTitle: 'ಬ್ರಿಟಿಷ್ ವಿಲೀನ ಹಾಗೂ ಮೈಸೂರು ಸಂಸ್ಥಾನ',
    timeRange: '1799 – 1947 CE',
    primaryRulers: ['Dewan Purnayya', 'Mysore Princely State / British East India Company'],
    keyEvents: [
      '1799: Following the fall of Tipu Sultan, Pavagada is annexed into Mysore state under British paramountcy',
      'Last Paleygar is retired with an official life pension',
      '1799–1801: Governance administered by Dewan Purnayya',
      '1801: Colonel Colin Mackenzie completes detailed topographic and cultural survey (recording 7 temples, 1 mosque, 2 dargahs in town)',
      '1892: Fort decommissioned as military arms depot and subsequently preserved as heritage landmark'
    ],
    summary: 'The Paleygar era concluded in 1799. The town transitioned under Dewan Purnayyas statesmanship. Colin Mackenzies 1801 census provided the first systematic inventory of Pavagada temples and population.',
    pdfEvidence: 'McKenzie unpublished English records 1801 AD; Barry Lewis (2009); Vivek & Sagar (2022).'
  },
  {
    id: 'modern-transformation',
    eraName: 'Modern Era: Clean Energy & Civic Identity',
    kannadaTitle: 'ಆಧುನಿಕ ಯುಗ: ಶಕ್ತಿ ಸ್ಥಳ ಹಾಗೂ ಸಾಂಸ್ಕೃತಿಕ ಪರಂಪರೆ',
    timeRange: '1947 – Present',
    primaryRulers: ['Government of Karnataka', 'Town Municipal Council Pavagada'],
    keyEvents: [
      'Pavagada designated as taluk headquarters in Tumakuru district, bordering Andhra Pradesh',
      '2015: KSPDCL establishes Pavagada Solar Park project across 5 villages (13,000 acres)',
      '2018: Traditional midwife Sulagitti Narasamma awarded Padma Shri by President of India',
      '2019: Shakti Sthala achieves 2,050 MW operational capacity, becoming one of worlds largest solar energy parks',
      'Ongoing Rayadurga–Tumakuru railway infrastructure development'
    ],
    summary: 'Historically grappling with drought across 54 recorded occurrences in 6 decades, Pavagada transformed through the Shakti Sthala solar initiative using an innovative farmer-lease framework, standing alongside its centuries-old cultural and architectural legacy.',
    pdfEvidence: 'Wikipedia documentation on Pavagada & Pavagada Solar Park (2021/2024); Govt of India Padma Awards.'
  }
];

export const FORT_STRUCTURES: FortStructureItem[] = [
  {
    id: 'penukonda-bagilu',
    name: 'Penukonda Bagilu (Main Gateway)',
    kannadaName: 'ಪೆನುಗೊಂಡ ಬಾಗಿಲು',
    classification: 'DEFENSE',
    historicalPeriod: 'c. 1591–1600 (Aravidu / Paleygar)',
    builder: 'Ballappanayaka',
    architecturalHighlights: [
      'Monolithic granite gateway guarding the historic royal highway toward Penukonda capital',
      'Flanked by two strategic barracks: Koruchu Muthiyalammans Buruju and Achari Buruju',
      'Adjacent sacred stepwell (Kalyani) for ceremonial and logistical water supply'
    ],
    currentCondition: 'Partially preserved stone lintel and flanking ramparts; subject to urban settlement encroachment',
    conservationAction: 'Priority 1: Urgent structural reinforcement, demarcate protected perimeter, clear modern debris',
    sourceReference: 'Vivek & Sagar (2022), Section 4.1.1 & Language Handbook of Tumkur District (1951)'
  },
  {
    id: 'sultan-bathery',
    name: 'Sultan Bathery (Ammunition Bastion)',
    kannadaName: 'ಸುಲ್ತಾನ್ ಬತ್ತೇರಿ',
    classification: 'DEFENSE',
    historicalPeriod: 'Late 18th Century (Tipu Sultan)',
    builder: 'Tipu Sultan / Hyder Ali',
    architecturalHighlights: [
      'Constructed of burnt clay bricks and stone composite lime masonry',
      'Subterranean vaulted ammunition storage chambers engineered to resist direct bombardment',
      'Low structural elevation designed to subdue visibility while elevating defensive firing lines'
    ],
    currentCondition: 'Under structural and material deterioration; vegetation intrusion across brick mortar',
    conservationAction: 'Priority 2: Structural mortar consolidation, removal of organic vegetation, lime grouting',
    sourceReference: 'Vivek & Sagar (2022), Section 4.1.1, Figure 4'
  },
  {
    id: 'apex-circular-battery',
    name: 'Apex Circular Artillery Platform',
    kannadaName: 'ಶಿಖರ ದುಂಡು ಕೊತ್ತಲ',
    classification: 'DEFENSE',
    historicalPeriod: 'Late 18th Century retrofit',
    builder: 'Mysorean Military Engineers',
    architecturalHighlights: [
      'Massive 100-foot circumference platform built atop the highest granite crest of Pavagada hill',
      'Equipped with 4 corner guard chambers and 6 circular firing ports for lightweight field cannons',
      'Southern monumental stone access stairway and central signaling flagpole foundation'
    ],
    currentCondition: 'Granite paving intact; parapet wall displays weathering and missing coping stones',
    conservationAction: 'Priority 1: Re-anchor loose parapet stones, install visitor safety railings',
    sourceReference: 'Vivek & Sagar (2022), Section 4.1.1, Figure 3'
  },
  {
    id: 'khan-darbar',
    name: 'Khan Darbar (Khas Darbar)',
    kannadaName: 'ಖಾನ್ ದರ್ಬಾರ್ / ಖಾಸ್ ದರ್ಬಾರ್',
    classification: 'ROYAL',
    historicalPeriod: '16th–18th Century',
    builder: 'Paleygars & Subsequent Governors',
    architecturalHighlights: [
      'Private royal council hall situated adjacent to the natural rock reservoir (Dhone)',
      'Colonnaded semi-open pavilion design with solid windbreak masonry wall only on western exposure',
      'Engineered without conventional foundation footings, utilizing interlocking dry stone masonry',
      'Natural passive cooling airflow generated by proximity to the shaded water cistern'
    ],
    currentCondition: 'Completely ruined; only stone plinth, pillar sockets, and floor boundary remain visible',
    conservationAction: 'Priority 3: Archaeological clearance of encroaching thorny scrub, boundary demarcation',
    sourceReference: 'Vivek & Sagar (2022), Section 4.1.3, Figure 7'
  },
  {
    id: 'babayya-gudi-masjid',
    name: 'Babayya Gudi Masjid',
    kannadaName: 'ಬಾಬಯ್ಯ ಗುಡಿ ಮಸೀದಿ',
    classification: 'RELIGIOUS',
    historicalPeriod: 'Mid-to-Late 18th Century',
    builder: 'Tipu Sultan (superimposed on earlier temple plinth)',
    architecturalHighlights: [
      'Constructed directly upon the granite plinth of an earlier Hindu shrine',
      'Preserves original temple sculpted base motifs including sacred serpent iconography (Naga stones)',
      'Entrance marked by an authentic stone mantapa featuring traditional side jagati platforms',
      'Stone masonry liwan (prayer hall) and qibla wall plastered with historic lime wash; actively venerated during Moharram'
    ],
    currentCondition: 'Structurally stable due to periodic local community maintenance; multiple layers of paint obscuring stone carvings',
    conservationAction: 'Priority 3: Scientific removal of modern synthetic paints, lime-wash restoration, preservation of snake carvings',
    sourceReference: 'Vivek & Sagar (2022), Section 4.1.2 & 5.2, Figure 6'
  },
  {
    id: 'kote-anjaneya-temple',
    name: 'Kote Anjaneya Temple (Fort Hanuman)',
    kannadaName: 'ಕೋಟೆ ಆಂಜನೇಯ ಸ್ವಾಮಿ ದೇವಾಲಯ',
    classification: 'RELIGIOUS',
    historicalPeriod: '16th Century (enclosed during Hyder Ali invasion)',
    builder: 'Initiated 16th c.; Courtyard built by Palegar Thimmappanayaka',
    architecturalHighlights: [
      'Monolithic relief idol of Lord Hanuman positioned strategically at the third defensive gate',
      'Low stone perimeter enclosure walls and open courtyard built as a sanctified redoubt',
      'Historically, the town Venugopalaswamy idol was moved downhill to protect it during wartime invasions',
      'Popular resting pause point for trekkers ascending the fortified trail'
    ],
    currentCondition: 'Active living worship site in fair condition; soot deposits on ceiling slabs',
    conservationAction: 'Priority 3: Gentle laser/water cleaning of soot deposits, non-invasive lighting installation',
    sourceReference: 'Vivek & Sagar (2022), Section 4.1.2 & 5.2, Figure 5; Cheluvarajan (2015)'
  },
  {
    id: 'hajama-mantapa',
    name: 'Hajama Mantapa',
    kannadaName: 'ಹಜಾಮ ಮಂಟಪ',
    classification: 'ROYAL',
    historicalPeriod: '16th–17th Century',
    builder: 'Pavagada Paleygars',
    architecturalHighlights: [
      'Semi-open granite pillared pavilion situated directly to the rear of Babayya Gudi Masjid',
      'Exhibits classic Vijayanagara post-and-lintel proportions and square pillar capitals',
      'Integrates rain catchment channels directing roof water toward subterranean cisterns'
    ],
    currentCondition: 'Fair structural condition; moss growth and surface grime across pillar shafts',
    conservationAction: 'Priority 3: Vegetation clearing, lime mortar pointing between roof slabs',
    sourceReference: 'Vivek & Sagar (2022), Section 4.1.3, Figure 8'
  },
  {
    id: 'royal-granary-kitchen',
    name: 'Royal Kitchen and Granary Complex',
    kannadaName: 'ಅರಮನೆ ಅಡುಗೆಶಾಲೆ ಹಾಗೂ ಧಾನ್ಯಾಗಾರ',
    classification: 'ROYAL',
    historicalPeriod: '16th–17th Century',
    builder: 'Pavagada Paleygars',
    architecturalHighlights: [
      'Located midway between Babayya Gudi Masjid and Khan Darbar',
      'Divided stone granary bins and stone mortar receptacles for grain threshing',
      'Designed to sustain prolonged garrison sieges with deep storage pits'
    ],
    currentCondition: 'Vandalized by illicit treasure-hunting excavations in previous decades; flooring disturbed',
    conservationAction: 'Priority 3: Floor excavation stabilization, debris backfilling, structural fencing',
    sourceReference: 'Vivek & Sagar (2022), Section 4.1.3 & Table 1'
  }
];

export const MEGALITHIC_SITES: MegalithicSiteRecord[] = [
  {
    id: 'bodula-maramma',
    siteName: 'Bodula Maramma Megalithic Complex',
    kannadaName: 'ಬೋದುಲ ಮಾರಮ್ಮನ ಬೃಹತ್ ಶಿಲಾ ನೆಲೆ',
    locationDetails: '1.5 km from Pavagada town along Tumakuru highway, situated on an elevated ridge near Kanive Narasimhaswamy temple',
    tombTypes: [
      'Chamber cist burials with multi-ton capstones (Swastika-plan cists)',
      'Cairn stone mounds (Kalluguppe)',
      '14 documented stone tomb chambers (2 well-preserved, 12 historic pit traces)'
    ],
    artifactFindings: [
      'Red-and-black earthen funerary pots (Mrutpatregalu)',
      'Iron smelting slag and small forged weapons',
      'Iron oxide nodules (Mandoora)',
      'Human skeletal fragments buried within stone cists (5 ft x 3 ft x 3 ft)'
    ],
    scholarlyResearchers: [
      'B.L. Rice (Epigraphia Carnatica pioneer)',
      'Colonel Colin Mackenzie (1801 Survey)',
      'Dr. Ramireddy',
      'Dr. Peddayya',
      'Dr. Shivatarak',
      'V.R. Cheluvarajan'
    ],
    significance: 'Demonstrates organized proto-historic agro-pastoral settlements in Pavagada circa 1st millennium BCE, exploiting the granite geology for megalithic monumental engineering.',
    culturalLore: 'Historically safeguarded by local Gudlu Nayakas, who guarded the mounds believing them to be ancestral gold treasuries buried by the Pandavas during their exile.'
  },
  {
    id: 'kotegudda-udandappanapalya',
    siteName: 'Kotegudda & Udandappanapalya Menhir Alignments',
    kannadaName: 'ಕೋಟೆಗುಡ್ಡ ಹಾಗೂ ಉದಂಡಪ್ಪನಪಾಳ್ಯ ಶಿಲಾನೆಲೆಗಳು',
    locationDetails: 'Outskirts of Pavagada hill perimeter toward Chinnehalli border tract',
    tombTypes: [
      'Standing memorial menhirs (Nilusugallugalu)',
      'Boulder circle burials surrounding rock outcrops'
    ],
    artifactFindings: [
      'Pottery shards with slip finish',
      'Prehistoric rock hollows utilized for grain pounding and rainwater storage'
    ],
    scholarlyResearchers: ['V.R. Cheluvarajan', 'Dr. Shivatarak'],
    significance: 'Corroborates that Pavagadas distinctive boulder topography provided natural shelter, lookout points, and water harvest cisterns for early human societies thousands of years before the medieval stone fort.',
    culturalLore: 'Preserved in folk memory as ancient sentinel marks and cattle assembly stations.'
  }
];

export const ACADEMIC_CITATIONS: AcademicCitation[] = [
  {
    id: 'vivek-sagar-2022',
    title: 'Understanding the Fort and its Built Heritage in Pavagada of Tumakuru District in Karnataka',
    authors: 'Vivek C. G. & Sagar T. S.',
    publication: 'Civil Engineering and Architecture, Vol. 10(5), pp. 2013–2022',
    year: 2022,
    isbnOrDoi: '10.13189/cea.2022.100523',
    notes: 'Peer-reviewed architectural survey utilizing GIS and drone mapping to categorize defense, religious, and royal structures of Pavagada fort with conservation appraisal.'
  },
  {
    id: 'cheluvarajan-2009',
    title: 'Pavagada Taluka Darshana',
    authors: 'V. R. Cheluvarajan',
    publication: 'Ithihasa Darshana Publications, Pavagada',
    year: 2009,
    notes: 'Monograph on regional history, etymology ("Paa Gonde"), and cultural heritage of Pavagada taluk.'
  },
  {
    id: 'cheluvarajan-megalithic',
    title: 'Pavagada Baliya Bruhat Shilayuga Samskrutiya Taana (Megalithic Cultural Sites near Pavagada)',
    authors: 'V. R. Cheluvarajan',
    publication: 'Ithihasa Darshana, Vol. 16, pp. 16–20',
    year: 2015,
    notes: 'Detailed field documentation of 14 megalithic stone cists, menhirs, and cairns discovered at Bodula Maramma and Kotegudda.'
  },
  {
    id: 'yogeshwarappa-2020',
    title: 'Pavagada Paleygararu',
    authors: 'D. N. Yogeshwarappa',
    publication: 'Sahitya Prakashana, Bangalore',
    year: 2020,
    isbnOrDoi: 'ISBN: 978-93-81821-57-2',
    notes: 'In-depth historical exploration of Ballappanayaka and the 8 Paleygar rulers between 1586 and 1799.'
  },
  {
    id: 'lewis-2002',
    title: 'British Assessments of Tipu Sultans Hill Forts in Northern Mysore, South India, 1802',
    authors: 'Barry Lewis',
    publication: 'International Journal of Historical Archaeology, Vol. 16, Issue 1',
    year: 2002,
    isbnOrDoi: 'DOI: 10.1007/s10761-012-0172-3',
    notes: 'Analysis of East India Company military engineering surveys and Mackenzie reports covering Pavagada.'
  },
  {
    id: 'mackenzie-1801',
    title: 'Unpublished Survey Records of Pavagada & Mysore Maidan Villages',
    authors: 'Colonel Colin Mackenzie',
    publication: 'IOR Board of Control Collections, British Library, London (Ref: F/4/154/2682)',
    year: 1801,
    notes: 'Earliest modern European census and building survey recording 7 temples, 1 mosque, and 2 dargahs in Pavagada town.'
  }
];

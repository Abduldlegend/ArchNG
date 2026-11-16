export type Specialty =
  | "Tropical Modernism"
  | "Rammed Earth"
  | "Coastal Residential"
  | "Civic Architecture"
  | "Concrete Brutalism"
  | "Institutional"
  | "Timber Structures"
  | "Hospitality"
  | "Earth Architecture"
  | "Cultural"
  | "Adaptive Reuse"
  | "Healthcare"
  | "Public Realm"
  | "Interiors"
  | "Small Residential"
  | "Furniture";

export interface Architect {
  id: string;
  slug: string;
  name: string;
  firm: string;
  city: string;
  state: string;
  arcon: string;
  years: number;
  works: number;
  feeTier: string;
  specialties: Specialty[];
  verified: boolean;
  demoAvailable: boolean;
  portrait: string;
  cover: string;
  philosophy: string;
  bio: string;
}

export interface ProjectPlate {
  label: string;
  title: string;
  year: string;
  scale: string;
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  architectSlug: string;
  city: string;
  state: string;
  year: string;
  typology: string;
  gfa: string;
  budget: number;
  structural: string;
  climate: string;
  cover: string;
  gallery: string[];
  summary: string;
  plates: ProjectPlate[];
}

export type RequestStatus = "Requested" | "Accepted" | "Completed" | "Declined" | "Cancelled";

export interface DemoRequest {
  id: string;
  architectSlug: string;
  projectType: string;
  state: string;
  budget: string;
  brief: string;
  status: RequestStatus;
  createdAt: string;
  note?: string;
}

export interface Lead {
  id: string;
  client: string;
  projectType: string;
  city: string;
  budget: string;
  brief: string;
  receivedAt: string;
  deadline: string;
  status: "Pending" | "Accepted" | "Declined";
}

export interface VerificationCase {
  id: string;
  name: string;
  firm: string;
  arcon: string;
  city: string;
  submitted: string;
  sla: string;
  status: "Pending" | "Verified" | "Rejected";
  email: string;
  documents: string[];
}

const u = (id: string, width = 1400) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=80`;

export const IMG = {
  courtyard: u("photo-1600585154340-be6161a56a0c"),
  rammedEarth: u("photo-1600607687939-ce8a6c25118c"),
  villa: u("photo-1600566753086-00f18fb6b3ea"),
  pavilion: u("photo-1600585154526-990dced4db0d"),
  lagoon: u("photo-1600047509807-ba8f99d2cdde"),
  interior: u("photo-1600607687920-4e2a09cf159d"),
  concrete: u("photo-1511818966892-d7d671e672a2"),
  facade: u("photo-1487958449943-2429e8be8625"),
  atrium: u("photo-1518005020951-eccb494ad742"),
  city: u("photo-1449157291145-7efd050a4d0e"),
  drafting: u("photo-1503387762-592deb58ef4e"),
  studio: u("photo-1479839672679-a46483c0e7c8"),
  lounge: u("photo-1600210492486-724fe5c67fb0"),
  detail: u("photo-1600566753190-17f0baa2a6c3"),
  palm: u("photo-1542621334-a254cf47733d"),
  portraitA: u("photo-1573496359142-b8d87734a5a2", 800),
  portraitB: u("photo-1560250097-0b93528c311a", 800),
  portraitC: u("photo-1580489944761-15a19d654956", 800),
  portraitD: u("photo-1507003211169-0a1dd7228f2d", 800),
  portraitE: u("photo-1500648767791-00dcc994a43e", 800),
  portraitF: u("photo-1494790108377-be9c29b29330", 800),
} as const;

export const architects: Architect[] = [
  {
    id: "a1",
    slug: "adaeze-okafor-studio",
    name: "Adaeze Okafor",
    firm: "Adaeze Okafor Studio",
    city: "Ikoyi, Lagos",
    state: "Lagos",
    arcon: "ARCON #3812",
    years: 14,
    works: 28,
    feeTier: "₦150m+",
    specialties: ["Tropical Modernism", "Rammed Earth", "Coastal Residential"],
    verified: true,
    demoAvailable: true,
    portrait: IMG.portraitA,
    cover: IMG.courtyard,
    philosophy:
      "I build for the Nigerian climate first. Deep shade, honest materials, and rooms that breathe are not luxuries — they are the brief.",
    bio: "Adaeze Okafor founded her Lagos practice in 2011 after a decade with heritage conservation studios in Edinburgh and Accra. The studio works almost exclusively with rammed earth, laterite, and locally milled hardwood, pairing them with the discipline of tropical modernism.",
  },
  {
    id: "a2",
    slug: "balogun-adeyemi",
    name: "Tunde Balogun",
    firm: "Balogun / Adeyemi Architects",
    city: "Maitama, Abuja",
    state: "Abuja FCT",
    arcon: "ARCON #2207",
    years: 19,
    works: 41,
    feeTier: "₦250m+",
    specialties: ["Civic Architecture", "Concrete Brutalism", "Institutional"],
    verified: true,
    demoAvailable: true,
    portrait: IMG.portraitB,
    cover: IMG.concrete,
    philosophy:
      "Public buildings should feel inevitable. We use board-formed concrete and shaded courtyards to give institutions a civic calm that lasts decades.",
    bio: "Tunde Balogun leads one of Abuja's most established practices, with a portfolio spanning civic halls, university faculties, and diplomatic residences across the FCT and northern states.",
  },
  {
    id: "a3",
    slug: "eze-atelier",
    name: "Amaka Eze",
    firm: "Eze Atelier",
    city: "Port Harcourt, Rivers",
    state: "Rivers",
    arcon: "ARCON #4410",
    years: 9,
    works: 16,
    feeTier: "₦80m+",
    specialties: ["Coastal Residential", "Timber Structures", "Hospitality"],
    verified: true,
    demoAvailable: true,
    portrait: IMG.portraitC,
    cover: IMG.lagoon,
    philosophy:
      "The creek is our client too. Every project begins by mapping tide, breeze, and shade before we draw a single wall.",
    bio: "Eze Atelier is a Port Harcourt studio known for elevated timber houses and small hospitality projects across the Niger Delta. The practice is a certified ARCON provider for coastal residential works.",
  },
  {
    id: "a4",
    slug: "studio-ife",
    name: "Femi Adebayo",
    firm: "Studio Ife",
    city: "Ibadan, Oyo",
    state: "Oyo",
    arcon: "ARCON #5198",
    years: 11,
    works: 22,
    feeTier: "₦100m+",
    specialties: ["Earth Architecture", "Cultural", "Adaptive Reuse"],
    verified: true,
    demoAvailable: false,
    portrait: IMG.portraitD,
    cover: IMG.facade,
    philosophy:
      "Yoruba building knowledge already solved most of our climate problems. Our work is a careful update, not a reinvention.",
    bio: "Studio Ife works with compressed earth blocks, laterite finishes, and existing building stock. The practice has delivered cultural centres and libraries across Oyo and Osun states.",
  },
  {
    id: "a5",
    slug: "umeh-partners",
    name: "Ngozi Umeh",
    firm: "Umeh & Partners",
    city: "Enugu, Enugu",
    state: "Enugu",
    arcon: "ARCON #6021",
    years: 22,
    works: 55,
    feeTier: "₦300m+",
    specialties: ["Institutional", "Healthcare", "Public Realm"],
    verified: true,
    demoAvailable: true,
    portrait: IMG.portraitF,
    cover: IMG.atrium,
    philosophy:
      "A hospital, a market, a school — each is a small city. We plan them as civic infrastructure, not isolated buildings.",
    bio: "Umeh & Partners is an award-winning Enugu practice with a focus on healthcare and institutional infrastructure. The firm has delivered over 55 verified projects across south-east Nigeria.",
  },
  {
    id: "a6",
    slug: "obi-design-office",
    name: "Kelechi Obi",
    firm: "Obi Design Office",
    city: "Lekki, Lagos",
    state: "Lagos",
    arcon: "ARCON #7344",
    years: 7,
    works: 12,
    feeTier: "₦50m+",
    specialties: ["Interiors", "Small Residential", "Furniture"],
    verified: true,
    demoAvailable: true,
    portrait: IMG.portraitE,
    cover: IMG.interior,
    philosophy:
      "Good rooms are measured in millimetres. We sweat the joinery, the light switch height, the exact width of a corridor.",
    bio: "Obi Design Office is a young Lagos studio working across compact residential projects, interior architecture, and bespoke furniture for private clients.",
  },
];

export const projects: Project[] = [
  {
    id: "p1",
    slug: "the-epe-courtyard-villa",
    title: "The Epe Courtyard Villa",
    architectSlug: "adaeze-okafor-studio",
    city: "Epe, Lagos",
    state: "Lagos",
    year: "2024",
    typology: "Private Residence",
    gfa: "620 m²",
    budget: 450000000,
    structural: "Insulated rammed earth + glulam",
    climate: "Cross-ventilation, deep overhangs, thermal mass",
    cover: IMG.rammedEarth,
    gallery: [IMG.courtyard, IMG.villa, IMG.detail, IMG.lounge],
    summary:
      "A courtyard house organised around a shaded central garden, built from laterite rammed earth and a glulam roof that lifts toward the lagoon breeze. The plan separates guest and family wings, holding a continuous veranda between them.",
    plates: [
      { label: "Plate 01 of 04", title: "Approach and courtyard threshold", year: "2024", scale: "1:200" },
      { label: "Plate 02 of 04", title: "Principal living wing", year: "2024", scale: "1:100" },
      { label: "Plate 03 of 04", title: "Rammed earth detail", year: "2023", scale: "1:20" },
      { label: "Plate 04 of 04", title: "Roof and ventilation section", year: "2023", scale: "1:50" },
    ],
  },
  {
    id: "p2",
    slug: "lagoon-house",
    title: "Lagoon House",
    architectSlug: "eze-atelier",
    city: "Port Harcourt, Rivers",
    state: "Rivers",
    year: "2023",
    typology: "Coastal Residence",
    gfa: "410 m²",
    budget: 280000000,
    structural: "Steel frame + iroko screens",
    climate: "Salt-tolerant envelope, shaded verandas",
    cover: IMG.lagoon,
    gallery: [IMG.lagoon, IMG.palm, IMG.interior, IMG.detail],
    summary:
      "An elevated family house on the Bonny River creek, wrapped in adjustable iroko screens. The structure is raised on a steel frame to allow tidal flooding beneath the living plate.",
    plates: [
      { label: "Plate 01 of 03", title: "Creek elevation", year: "2023", scale: "1:200" },
      { label: "Plate 02 of 03", title: "Screened veranda", year: "2023", scale: "1:50" },
      { label: "Plate 03 of 03", title: "Floodable ground plane", year: "2022", scale: "1:100" },
    ],
  },
  {
    id: "p3",
    slug: "maitama-civic-pavilion",
    title: "Maitama Civic Pavilion",
    architectSlug: "balogun-adeyemi",
    city: "Maitama, Abuja",
    state: "Abuja FCT",
    year: "2025",
    typology: "Civic / Institutional",
    gfa: "1,850 m²",
    budget: 1200000000,
    structural: "Board-formed concrete",
    climate: "Thermal mass, night purge, shaded arcade",
    cover: IMG.pavilion,
    gallery: [IMG.pavilion, IMG.concrete, IMG.atrium, IMG.facade],
    summary:
      "A civic pavilion for public hearings and community assembly, conceived as a shaded concrete arcade around an open-air forum. Night purging keeps the main hall comfortable without mechanical cooling.",
    plates: [
      { label: "Plate 01 of 03", title: "Civic forum plan", year: "2025", scale: "1:500" },
      { label: "Plate 02 of 03", title: "Board-formed arcade", year: "2024", scale: "1:50" },
      { label: "Plate 03 of 03", title: "Night purge section", year: "2024", scale: "1:100" },
    ],
  },
  {
    id: "p4",
    slug: "ife-earth-library",
    title: "Ife Earth Library",
    architectSlug: "studio-ife",
    city: "Ile-Ife, Osun",
    state: "Osun",
    year: "2022",
    typology: "Cultural",
    gfa: "960 m²",
    budget: 610000000,
    structural: "Compressed earth block + timber",
    climate: "Evaporative courtyards, deep reveals",
    cover: IMG.facade,
    gallery: [IMG.facade, IMG.drafting, IMG.studio, IMG.detail],
    summary:
      "A public reading library built from compressed earth blocks around three evaporatively cooled courtyards. The reading rooms sit within the thermal mass of the walls, opening to shaded gardens.",
    plates: [
      { label: "Plate 01 of 02", title: "Courtyard reading plan", year: "2022", scale: "1:300" },
      { label: "Plate 02 of 02", title: "Earth block bond", year: "2022", scale: "1:20" },
    ],
  },
];

export const requestsSeed: DemoRequest[] = [
  {
    id: "r1",
    architectSlug: "adaeze-okafor-studio",
    projectType: "Private Residence",
    state: "Lagos",
    budget: "₦250m+",
    brief:
      "A five-bedroom family house on a 1,200 m² plot near Epe, with a strong preference for rammed earth and deep shaded verandas.",
    status: "Accepted",
    createdAt: "2026-02-12",
    note: "Adaeze has reviewed your brief and opened the full monograph, including the 21-minute technical walkthrough.",
  },
  {
    id: "r2",
    architectSlug: "balogun-adeyemi",
    projectType: "Civic / Institutional",
    state: "Abuja FCT",
    budget: "₦250m+",
    brief:
      "A community hall and skills centre for a foundation in Guzape. We need a practice experienced with public procurement and accessible design.",
    status: "Requested",
    createdAt: "2026-02-14",
  },
  {
    id: "r3",
    architectSlug: "eze-atelier",
    projectType: "Hospitality",
    state: "Rivers",
    budget: "₦50m – ₦250m",
    brief:
      "A six-key creek-side guest lodge with a shared dining pavilion. Timber-led design preferred, with flood resilience as a priority.",
    status: "Completed",
    createdAt: "2026-01-28",
    note: "Commission completed and handed over in January 2026.",
  },
  {
    id: "r4",
    architectSlug: "studio-ife",
    projectType: "Cultural",
    state: "Oyo",
    budget: "₦5m – ₦20m",
    brief:
      "Early-stage feasibility for a small community archive in Ibadan, reusing an existing colonial-era structure.",
    status: "Declined",
    createdAt: "2026-01-16",
    note: "The studio is at capacity for Q2 2026 and cannot take on new feasibility studies.",
  },
];

export const leadsSeed: Lead[] = [
  {
    id: "l1",
    client: "Chiamaka Nwosu",
    projectType: "Private Residence",
    city: "Lekki, Lagos",
    budget: "₦50m – ₦250m",
    brief:
      "Four-bedroom courtyard house on a lagoon-facing plot. We have a survey and soil report ready and would like to start concept design in March.",
    receivedAt: "2 hours ago",
    deadline: "46h",
    status: "Pending",
  },
  {
    id: "l2",
    client: "Dangote Estates",
    projectType: "Commercial",
    city: "Victoria Island, Lagos",
    budget: "₦250m+",
    brief:
      "A mixed-use office and retail block of approximately 6,000 m². We are shortlisting three verified practices for a design competition.",
    receivedAt: "5 hours ago",
    deadline: "39h",
    status: "Pending",
  },
  {
    id: "l3",
    client: "Rivers State Ministry of Works",
    projectType: "Institutional",
    city: "Port Harcourt, Rivers",
    budget: "₦250m+",
    brief:
      "Rehabilitation and extension of a primary healthcare centre. ARCON registration and evidence of healthcare delivery are mandatory.",
    receivedAt: "1 day ago",
    deadline: "18h",
    status: "Pending",
  },
  {
    id: "l4",
    client: "Bature Family Office",
    projectType: "Hospitality",
    city: "Abuja FCT",
    budget: "₦50m – ₦250m",
    brief:
      "A private guest house with eight suites, a spa, and a small restaurant. Preference for a practice with tropical landscape experience.",
    receivedAt: "2 days ago",
    deadline: "4h",
    status: "Pending",
  },
];

export const verificationSeed: VerificationCase[] = [
  {
    id: "v1",
    name: "Olumide Fashola",
    firm: "Fashola Studio",
    arcon: "ARCON #8812",
    city: "Lagos",
    submitted: "2026-02-14",
    sla: "12h left",
    status: "Pending",
    email: "olumide@fasholastudio.ng",
    documents: ["Form B — 2026 practising licence", "ARCON certificate of registration", "Professional indemnity cover"],
  },
  {
    id: "v2",
    name: "Halima Yusuf",
    firm: "Northline Architects",
    arcon: "ARCON #9034",
    city: "Abuja FCT",
    submitted: "2026-02-13",
    sla: "1d left",
    status: "Pending",
    email: "halima@northline.ng",
    documents: ["Form B — 2026 practising licence", "ARCON certificate of registration"],
  },
  {
    id: "v3",
    name: "Ikenna Nnaji",
    firm: "Nnaji & Co. Architects",
    arcon: "ARCON #8711",
    city: "Enugu",
    submitted: "2026-02-12",
    sla: "SLA breached",
    status: "Pending",
    email: "ikenna@nnajico.ng",
    documents: ["Form B — 2025 practising licence", "ARCON certificate of registration", "Tax clearance certificate"],
  },
  {
    id: "v4",
    name: "Zainab Bello",
    firm: "Bello Atelier",
    arcon: "ARCON #6210",
    city: "Ibadan",
    submitted: "2026-02-10",
    sla: "Verified",
    status: "Verified",
    email: "zainab@belloatelier.ng",
    documents: ["Form B — 2026 practising licence", "ARCON certificate of registration"],
  },
];

export const activityFeed = [
  { title: "Bello Atelier approved", detail: "ARCON #6210 · Ibadan chapter", time: "18 min ago", tone: "verified" },
  { title: "New monograph published", detail: "The Epe Courtyard Villa · 4 plates", time: "42 min ago", tone: "neutral" },
  { title: "Verification SLA escalated", detail: "Nnaji & Co. · Enugu chapter", time: "1 hr ago", tone: "warning" },
  { title: "Commission accepted", detail: "Lagoon House · Port Harcourt", time: "2 hr ago", tone: "verified" },
  { title: "New practice registered", detail: "Fashola Studio · Lagos chapter", time: "3 hr ago", tone: "neutral" },
] as const;

export const getArchitect = (slug: string) => architects.find((item) => item.slug === slug);
export const getProject = (slug: string) => projects.find((item) => item.slug === slug);
export const getProjectsByArchitect = (slug: string) =>
  projects.filter((item) => item.architectSlug === slug);

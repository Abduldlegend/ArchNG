import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import argon2 from "argon2";

const prisma = new PrismaClient();

const uid = (n) => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const u = (id, width = 1400) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=80`;

const IMG = {
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
};

const SPECIALTIES = [
  "Tropical Modernism",
  "Rammed Earth",
  "Coastal Residential",
  "Civic Architecture",
  "Concrete Brutalism",
  "Institutional",
  "Timber Structures",
  "Hospitality",
  "Earth Architecture",
  "Cultural",
  "Adaptive Reuse",
  "Healthcare",
  "Public Realm",
  "Interiors",
  "Small Residential",
  "Furniture",
];

const providers = [
  {
    n: 10,
    name: "Adaeze Okafor",
    email: "adaeze@archng.test",
    slug: "adaeze-okafor-studio",
    firm: "Adaeze Okafor Studio",
    city: "Ikoyi, Lagos",
    state: "Lagos",
    yearsExperience: 14,
    worksCount: 28,
    feeTier: "TIER_150M",
    registrationNumber: "ARCON #3812",
    specialties: ["Tropical Modernism", "Rammed Earth", "Coastal Residential"],
    portraitUrl: IMG.portraitA,
    coverUrl: IMG.courtyard,
    philosophy:
      "I build for the Nigerian climate first. Deep shade, honest materials, and rooms that breathe are not luxuries — they are the brief.",
    bio: "Adaeze Okafor founded her Lagos practice in 2011 after a decade with heritage conservation studios in Edinburgh and Accra. The studio works almost exclusively with rammed earth, laterite, and locally milled hardwood, pairing them with the discipline of tropical modernism.",
    demoVideoUrl: "https://vimeo.com/1040300001",
    demoVideoSource: "vimeo",
    contactEmail: "studio@adaezeokafor.ng",
    contactPhone: "+234 803 555 0101",
    whatsapp: "+234 803 555 0101",
    website: "https://adaezeokafor.ng",
    published: true,
    verificationStatus: "VERIFIED",
  },
  {
    n: 11,
    name: "Tunde Balogun",
    email: "tunde@archng.test",
    slug: "balogun-adeyemi",
    firm: "Balogun / Adeyemi Architects",
    city: "Maitama, Abuja",
    state: "Abuja FCT",
    yearsExperience: 19,
    worksCount: 41,
    feeTier: "TIER_250M",
    registrationNumber: "ARCON #2207",
    specialties: ["Civic Architecture", "Concrete Brutalism", "Institutional"],
    portraitUrl: IMG.portraitB,
    coverUrl: IMG.concrete,
    philosophy:
      "Public buildings should feel inevitable. We use board-formed concrete and shaded courtyards to give institutions a civic calm that lasts decades.",
    bio: "Tunde Balogun leads one of Abuja's most established practices, with a portfolio spanning civic halls, university faculties, and diplomatic residences across the FCT and northern states.",
    demoVideoUrl: "https://vimeo.com/1040300002",
    demoVideoSource: "vimeo",
    contactEmail: "enquiries@balogunadeyemi.ng",
    contactPhone: "+234 803 555 0102",
    whatsapp: "+234 803 555 0102",
    website: "https://balogunadeyemi.ng",
    published: true,
    verificationStatus: "VERIFIED",
  },
  {
    n: 12,
    name: "Amaka Eze",
    email: "amaka@archng.test",
    slug: "eze-atelier",
    firm: "Eze Atelier",
    city: "Port Harcourt, Rivers",
    state: "Rivers",
    yearsExperience: 9,
    worksCount: 16,
    feeTier: "TIER_80M",
    registrationNumber: "ARCON #4410",
    specialties: ["Coastal Residential", "Timber Structures", "Hospitality"],
    portraitUrl: IMG.portraitC,
    coverUrl: IMG.lagoon,
    philosophy:
      "The creek is our client too. Every project begins by mapping tide, breeze, and shade before we draw a single wall.",
    bio: "Eze Atelier is a Port Harcourt studio known for elevated timber houses and small hospitality projects across the Niger Delta. The practice is a certified ARCON provider for coastal residential works.",
    demoVideoUrl: "https://vimeo.com/1040300003",
    demoVideoSource: "vimeo",
    contactEmail: "hello@ezeatelier.ng",
    contactPhone: "+234 803 555 0103",
    whatsapp: "+234 803 555 0103",
    website: "https://ezeatelier.ng",
    published: true,
    verificationStatus: "VERIFIED",
  },
  {
    n: 13,
    name: "Femi Adebayo",
    email: "femi@archng.test",
    slug: "studio-ife",
    firm: "Studio Ife",
    city: "Ibadan, Oyo",
    state: "Oyo",
    yearsExperience: 11,
    worksCount: 22,
    feeTier: "TIER_100M",
    registrationNumber: "ARCON #5198",
    specialties: ["Earth Architecture", "Cultural", "Adaptive Reuse"],
    portraitUrl: IMG.portraitD,
    coverUrl: IMG.facade,
    philosophy:
      "Yoruba building knowledge already solved most of our climate problems. Our work is a careful update, not a reinvention.",
    bio: "Studio Ife works with compressed earth blocks, laterite finishes, and existing building stock. The practice has delivered cultural centres and libraries across Oyo and Osun states.",
    demoVideoUrl: null,
    demoVideoSource: null,
    contactEmail: "studio@studioife.ng",
    contactPhone: "+234 803 555 0104",
    whatsapp: "+234 803 555 0104",
    website: "https://studioife.ng",
    published: true,
    verificationStatus: "VERIFIED",
  },
  {
    n: 14,
    name: "Ngozi Umeh",
    email: "ngozi@archng.test",
    slug: "umeh-partners",
    firm: "Umeh & Partners",
    city: "Enugu, Enugu",
    state: "Enugu",
    yearsExperience: 22,
    worksCount: 55,
    feeTier: "TIER_300M",
    registrationNumber: "ARCON #6021",
    specialties: ["Institutional", "Healthcare", "Public Realm"],
    portraitUrl: IMG.portraitF,
    coverUrl: IMG.atrium,
    philosophy:
      "A hospital, a market, a school — each is a small city. We plan them as civic infrastructure, not isolated buildings.",
    bio: "Umeh & Partners is an award-winning Enugu practice with a focus on healthcare and institutional infrastructure. The firm has delivered over 55 verified projects across south-east Nigeria.",
    demoVideoUrl: "https://vimeo.com/1040300004",
    demoVideoSource: "vimeo",
    contactEmail: "mail@umehpartners.ng",
    contactPhone: "+234 803 555 0105",
    whatsapp: "+234 803 555 0105",
    website: "https://umehpartners.ng",
    published: true,
    verificationStatus: "VERIFIED",
  },
  {
    n: 15,
    name: "Kelechi Obi",
    email: "kelechi@archng.test",
    slug: "obi-design-office",
    firm: "Obi Design Office",
    city: "Lekki, Lagos",
    state: "Lagos",
    yearsExperience: 7,
    worksCount: 12,
    feeTier: "TIER_50M",
    registrationNumber: "ARCON #7344",
    specialties: ["Interiors", "Small Residential", "Furniture"],
    portraitUrl: IMG.portraitE,
    coverUrl: IMG.interior,
    philosophy:
      "Good rooms are measured in millimetres. We sweat the joinery, the light switch height, the exact width of a corridor.",
    bio: "Obi Design Office is a young Lagos studio working across compact residential projects, interior architecture, and bespoke furniture for private clients.",
    demoVideoUrl: "https://vimeo.com/1040300005",
    demoVideoSource: "vimeo",
    contactEmail: "studio@obidesign.ng",
    contactPhone: "+234 803 555 0106",
    whatsapp: "+234 803 555 0106",
    website: "https://obidesign.ng",
    published: true,
    verificationStatus: "VERIFIED",
  },
];

const verificationCases = [
  {
    n: 20,
    name: "Olumide Fashola",
    email: "olumide@fasholastudio.ng",
    slug: "fashola-studio",
    firm: "Fashola Studio",
    city: "Lagos",
    state: "Lagos",
    registrationNumber: "ARCON #8812",
    submittedAt: new Date("2026-02-14T09:00:00.000Z"),
    documents: ["Form B — 2026 practising licence", "ARCON certificate of registration", "Professional indemnity cover"],
  },
  {
    n: 21,
    name: "Halima Yusuf",
    email: "halima@northline.ng",
    slug: "northline-architects",
    firm: "Northline Architects",
    city: "Abuja FCT",
    state: "Abuja FCT",
    registrationNumber: "ARCON #9034",
    submittedAt: new Date("2026-02-13T09:00:00.000Z"),
    documents: ["Form B — 2026 practising licence", "ARCON certificate of registration"],
  },
  {
    n: 22,
    name: "Ikenna Nnaji",
    email: "ikenna@nnajico.ng",
    slug: "nnaji-co-architects",
    firm: "Nnaji & Co. Architects",
    city: "Enugu",
    state: "Enugu",
    registrationNumber: "ARCON #8711",
    submittedAt: new Date("2026-02-12T09:00:00.000Z"),
    documents: ["Form B — 2025 practising licence", "ARCON certificate of registration", "Tax clearance certificate"],
  },
  {
    n: 23,
    name: "Zainab Bello",
    email: "zainab@belloatelier.ng",
    slug: "bello-atelier",
    firm: "Bello Atelier",
    city: "Ibadan",
    state: "Oyo",
    registrationNumber: "ARCON #6210",
    submittedAt: new Date("2026-02-10T09:00:00.000Z"),
    documents: ["Form B — 2026 practising licence", "ARCON certificate of registration"],
    verificationStatus: "VERIFIED",
  },
];

const projectSeed = [
  {
    n: 30,
    provider: "adaeze-okafor-studio",
    slug: "the-epe-courtyard-villa",
    title: "The Epe Courtyard Villa",
    city: "Epe, Lagos",
    state: "Lagos",
    year: 2024,
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
    n: 31,
    provider: "eze-atelier",
    slug: "lagoon-house",
    title: "Lagoon House",
    city: "Port Harcourt, Rivers",
    state: "Rivers",
    year: 2023,
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
    n: 32,
    provider: "balogun-adeyemi",
    slug: "maitama-civic-pavilion",
    title: "Maitama Civic Pavilion",
    city: "Maitama, Abuja",
    state: "Abuja FCT",
    year: 2025,
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
    n: 33,
    provider: "studio-ife",
    slug: "ife-earth-library",
    title: "Ife Earth Library",
    city: "Ile-Ife, Osun",
    state: "Osun",
    year: 2022,
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

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@archng.test";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "Password123!";
  const demoPassword = process.env.SEED_DEMO_PASSWORD || "Password123!";
  const adminHash = await argon2.hash(adminPassword);
  const demoHash = await argon2.hash(demoPassword);

  const specialties = new Map();
  for (let i = 0; i < SPECIALTIES.length; i += 1) {
    const name = SPECIALTIES[i];
    const specialty = await prisma.specialty.upsert({
      where: { name },
      update: { slug: slugify(name) },
      create: { id: uid(400 + i), name, slug: slugify(name) },
    });
    specialties.set(name, specialty.id);
  }

  await prisma.user.upsert({
    where: { id: uid(1) },
    update: { name: "ArchNG Admin", email: adminEmail, passwordHash: adminHash, role: "ADMIN", status: "ACTIVE" },
    create: {
      id: uid(1),
      name: "ArchNG Admin",
      email: adminEmail,
      passwordHash: adminHash,
      role: "ADMIN",
      status: "ACTIVE",
    },
  });

  const client = await prisma.user.upsert({
    where: { id: uid(2) },
    update: { name: "Tola Adeyemi", email: "client@archng.test", passwordHash: demoHash, role: "USER", status: "ACTIVE" },
    create: {
      id: uid(2),
      name: "Tola Adeyemi",
      email: "client@archng.test",
      passwordHash: demoHash,
      role: "USER",
      status: "ACTIVE",
    },
  });

  const extraClients = [
    { n: 40, name: "Chiamaka Nwosu", email: "chiamaka@archng.test" },
    { n: 41, name: "Dangote Estates", email: "estates@dangote.test" },
    { n: 42, name: "Rivers State Ministry of Works", email: "works@riversstate.test" },
    { n: 43, name: "Bature Family Office", email: "office@bature.test" },
  ];

  for (const extra of extraClients) {
    await prisma.user.upsert({
      where: { id: uid(extra.n) },
      update: { name: extra.name, email: extra.email, passwordHash: demoHash, role: "USER", status: "ACTIVE" },
      create: {
        id: uid(extra.n),
        name: extra.name,
        email: extra.email,
        passwordHash: demoHash,
        role: "USER",
        status: "ACTIVE",
      },
    });
  }

  const providerProfiles = new Map();

  for (const provider of providers) {
    await prisma.user.upsert({
      where: { id: uid(provider.n) },
      update: { name: provider.name, email: provider.email, passwordHash: demoHash, role: "PROVIDER", status: "ACTIVE" },
      create: {
        id: uid(provider.n),
        name: provider.name,
        email: provider.email,
        passwordHash: demoHash,
        role: "PROVIDER",
        status: "ACTIVE",
      },
    });

    const profile = await prisma.providerProfile.upsert({
      where: { id: uid(provider.n + 200) },
      update: {
        userId: uid(provider.n),
        slug: provider.slug,
        firm: provider.firm,
        headline: provider.philosophy,
        bio: provider.bio,
        city: provider.city,
        state: provider.state,
        yearsExperience: provider.yearsExperience,
        worksCount: provider.worksCount,
        feeTier: provider.feeTier,
        portraitUrl: provider.portraitUrl,
        coverUrl: provider.coverUrl,
        contactEmail: provider.contactEmail,
        contactPhone: provider.contactPhone,
        whatsapp: provider.whatsapp,
        website: provider.website,
        demoVideoUrl: provider.demoVideoUrl,
        demoVideoSource: provider.demoVideoSource,
        registrationNumber: provider.registrationNumber,
        verificationStatus: provider.verificationStatus,
        verificationSubmittedAt: new Date("2026-01-08T09:00:00.000Z"),
        verificationReviewedAt: new Date("2026-01-10T09:00:00.000Z"),
        licenceExpiresAt: new Date("2026-12-31T00:00:00.000Z"),
        published: provider.published,
        acceptingLeads: true,
        specialties: { set: provider.specialties.map((name) => ({ id: specialties.get(name) })) },
      },
      create: {
        id: uid(provider.n + 200),
        userId: uid(provider.n),
        slug: provider.slug,
        firm: provider.firm,
        headline: provider.philosophy,
        bio: provider.bio,
        city: provider.city,
        state: provider.state,
        yearsExperience: provider.yearsExperience,
        worksCount: provider.worksCount,
        feeTier: provider.feeTier,
        portraitUrl: provider.portraitUrl,
        coverUrl: provider.coverUrl,
        contactEmail: provider.contactEmail,
        contactPhone: provider.contactPhone,
        whatsapp: provider.whatsapp,
        website: provider.website,
        demoVideoUrl: provider.demoVideoUrl,
        demoVideoSource: provider.demoVideoSource,
        registrationNumber: provider.registrationNumber,
        verificationStatus: provider.verificationStatus,
        verificationSubmittedAt: new Date("2026-01-08T09:00:00.000Z"),
        verificationReviewedAt: new Date("2026-01-10T09:00:00.000Z"),
        licenceExpiresAt: new Date("2026-12-31T00:00:00.000Z"),
        published: provider.published,
        acceptingLeads: true,
        specialties: { connect: provider.specialties.map((name) => ({ id: specialties.get(name) })) },
      },
    });
    providerProfiles.set(provider.slug, profile);
  }

  await prisma.experience.deleteMany({ where: { providerId: uid(210) } });
  await prisma.experience.createMany({
    data: [
      {
        id: uid(450),
        providerId: uid(210),
        title: "Founding Principal",
        organisation: "Adaeze Okafor Studio",
        year: 2011,
        description: "Established the studio around a research-led practice in laterite and rammed earth construction.",
        order: 1,
      },
      {
        id: uid(451),
        providerId: uid(210),
        title: "Senior Architect",
        organisation: "Heritage + Climate Collective, Accra",
        year: 2005,
        description: "Led conservation and tropical modernism projects across Ghana and Nigeria.",
        order: 2,
      },
    ],
  });

  for (const item of verificationCases) {
    const verificationStatus = item.verificationStatus || "PENDING";
    await prisma.user.upsert({
      where: { id: uid(item.n) },
      update: { name: item.name, email: item.email, passwordHash: demoHash, role: "PROVIDER", status: "ACTIVE" },
      create: {
        id: uid(item.n),
        name: item.name,
        email: item.email,
        passwordHash: demoHash,
        role: "PROVIDER",
        status: "ACTIVE",
      },
    });

    const profile = await prisma.providerProfile.upsert({
      where: { id: uid(item.n + 200) },
      update: {
        userId: uid(item.n),
        slug: item.slug,
        firm: item.firm,
        headline: `${item.firm} is applying for verified provider status on ArchNG.`,
        bio: `${item.firm} is a practice based in ${item.city}. Verification documents are held securely for the ArchNG review team.`,
        city: item.city,
        state: item.state,
        yearsExperience: 8,
        worksCount: 14,
        feeTier: "TIER_100M",
        registrationNumber: item.registrationNumber,
        verificationStatus,
        verificationSubmittedAt: item.submittedAt,
        verificationReviewedAt: verificationStatus === "VERIFIED" ? new Date("2026-02-10T15:00:00.000Z") : null,
        licenceExpiresAt: new Date("2026-12-31T00:00:00.000Z"),
        published: false,
      },
      create: {
        id: uid(item.n + 200),
        userId: uid(item.n),
        slug: item.slug,
        firm: item.firm,
        headline: `${item.firm} is applying for verified provider status on ArchNG.`,
        bio: `${item.firm} is a practice based in ${item.city}. Verification documents are held securely for the ArchNG review team.`,
        city: item.city,
        state: item.state,
        yearsExperience: 8,
        worksCount: 14,
        feeTier: "TIER_100M",
        registrationNumber: item.registrationNumber,
        verificationStatus,
        verificationSubmittedAt: item.submittedAt,
        verificationReviewedAt: verificationStatus === "VERIFIED" ? new Date("2026-02-10T15:00:00.000Z") : null,
        licenceExpiresAt: new Date("2026-12-31T00:00:00.000Z"),
        published: false,
      },
    });

    for (let i = 0; i < item.documents.length; i += 1) {
      const documentName = item.documents[i];
      const documentId = uid(700 + item.n * 10 + i);
      await prisma.verificationDocument.upsert({
        where: { id: documentId },
        update: {
          providerId: profile.id,
          name: documentName,
          fileType: "application/pdf",
          url: `/uploads/seed/${slugify(documentName)}.pdf`,
          status: verificationStatus === "VERIFIED" ? "VERIFIED" : "PENDING",
        },
        create: {
          id: documentId,
          providerId: profile.id,
          name: documentName,
          fileType: "application/pdf",
          url: `/uploads/seed/${slugify(documentName)}.pdf`,
          status: verificationStatus === "VERIFIED" ? "VERIFIED" : "PENDING",
        },
      });
    }
  }

  for (const item of projectSeed) {
    const provider = providerProfiles.get(item.provider);
    if (!provider) throw new Error(`Missing seeded provider ${item.provider}`);

    const project = await prisma.project.upsert({
      where: { id: uid(item.n) },
      update: {
        providerId: provider.id,
        title: item.title,
        slug: item.slug,
        typology: item.typology,
        city: item.city,
        state: item.state,
        year: item.year,
        gfa: item.gfa,
        budget: item.budget,
        structural: item.structural,
        climate: item.climate,
        summary: item.summary,
        status: "PUBLISHED",
        adminHidden: false,
      },
      create: {
        id: uid(item.n),
        providerId: provider.id,
        title: item.title,
        slug: item.slug,
        typology: item.typology,
        city: item.city,
        state: item.state,
        year: item.year,
        gfa: item.gfa,
        budget: item.budget,
        structural: item.structural,
        climate: item.climate,
        summary: item.summary,
        status: "PUBLISHED",
        adminHidden: false,
      },
    });

    const images = [
      { url: item.cover, isCover: true, kind: "PHOTO", alt: `${item.title} cover`, order: 0 },
      ...item.gallery.map((url, index) => ({
        url,
        isCover: false,
        kind: "PHOTO",
        alt: `${item.title} photograph ${index + 2}`,
        order: index + 1,
      })),
      ...item.plates.map((plate, index) => ({
        url: item.gallery[index % item.gallery.length],
        isCover: false,
        kind: "PLATE",
        alt: plate.title,
        order: item.gallery.length + index + 1,
        plateLabel: plate.label,
        plateTitle: plate.title,
        plateYear: plate.year,
        plateScale: plate.scale,
      })),
    ];

    let coverId = null;
    for (let i = 0; i < images.length; i += 1) {
      const image = images[i];
      const imageId = uid(800 + item.n * 40 + i);
      if (image.isCover) coverId = imageId;
      await prisma.projectImage.upsert({
        where: { id: imageId },
        update: { ...image, projectId: project.id },
        create: { id: imageId, projectId: project.id, ...image },
      });
    }

    await prisma.project.update({ where: { id: project.id }, data: { coverImageId: coverId } });
  }

  const adaeze = providerProfiles.get("adaeze-okafor-studio");
  const balogun = providerProfiles.get("balogun-adeyemi");
  const eze = providerProfiles.get("eze-atelier");
  const studioIfe = providerProfiles.get("studio-ife");
  if (!adaeze || !balogun || !eze || !studioIfe) throw new Error("Missing public provider profiles");

  const requests = [
    {
      n: 60,
      userId: client.id,
      providerId: adaeze.id,
      projectType: "Private Residence",
      state: "Lagos",
      location: "Epe, Lagos",
      budgetRange: "ABOVE_250M",
      brief:
        "A five-bedroom family house on a 1,200 m² plot near Epe, with a strong preference for rammed earth and deep shaded verandas.",
      status: "ACCEPTED",
      providerNote:
        "Adaeze has reviewed your brief and opened the full monograph, including the 21-minute technical walkthrough.",
      createdAt: new Date("2026-02-12T10:00:00.000Z"),
    },
    {
      n: 61,
      userId: client.id,
      providerId: balogun.id,
      projectType: "Civic / Institutional",
      state: "Abuja FCT",
      location: "Guzape, Abuja",
      budgetRange: "ABOVE_250M",
      brief:
        "A community hall and skills centre for a foundation in Guzape. We need a practice experienced with public procurement and accessible design.",
      status: "REQUESTED",
      providerNote: null,
      createdAt: new Date("2026-02-14T10:00:00.000Z"),
    },
    {
      n: 62,
      userId: client.id,
      providerId: eze.id,
      projectType: "Hospitality",
      state: "Rivers",
      location: "Bonny River, Rivers",
      budgetRange: "50M_250M",
      brief:
        "A six-key creek-side guest lodge with a shared dining pavilion. Timber-led design preferred, with flood resilience as a priority.",
      status: "COMPLETED",
      providerNote: "Commission completed and handed over in January 2026.",
      createdAt: new Date("2026-01-28T10:00:00.000Z"),
    },
    {
      n: 63,
      userId: client.id,
      providerId: studioIfe.id,
      projectType: "Cultural",
      state: "Oyo",
      location: "Ibadan, Oyo",
      budgetRange: "5M_20M",
      brief:
        "Early-stage feasibility for a small community archive in Ibadan, reusing an existing colonial-era structure.",
      status: "DECLINED",
      providerNote: "The studio is at capacity for Q2 2026 and cannot take on new feasibility studies.",
      createdAt: new Date("2026-01-16T10:00:00.000Z"),
    },
  ];

  for (const request of requests) {
    const { n, createdAt, ...requestData } = request;
    const videoAccessGrantedAt =
      request.status === "ACCEPTED" || request.status === "COMPLETED"
        ? new Date(createdAt.getTime() + 6 * 60 * 60 * 1000)
        : null;
    await prisma.demoRequest.upsert({
      where: { id: uid(n) },
      update: { ...requestData, createdAt, videoAccessGrantedAt },
      create: { id: uid(n), ...requestData, createdAt, videoAccessGrantedAt },
    });
  }

  const now = Date.now();
  const leads = [
    {
      n: 70,
      userId: uid(40),
      projectType: "Private Residence",
      state: "Lagos",
      location: "Lekki, Lagos",
      budgetRange: "50M_250M",
      brief:
        "Four-bedroom courtyard house on a lagoon-facing plot. We have a survey and soil report ready and would like to start concept design in March.",
      hoursAgo: 2,
      deadlineHours: 46,
    },
    {
      n: 71,
      userId: uid(41),
      projectType: "Commercial",
      state: "Lagos",
      location: "Victoria Island, Lagos",
      budgetRange: "ABOVE_250M",
      brief:
        "A mixed-use office and retail block of approximately 6,000 m². We are shortlisting three verified practices for a design competition.",
      hoursAgo: 5,
      deadlineHours: 39,
    },
    {
      n: 72,
      userId: uid(42),
      projectType: "Institutional",
      state: "Rivers",
      location: "Port Harcourt, Rivers",
      budgetRange: "ABOVE_250M",
      brief:
        "Rehabilitation and extension of a primary healthcare centre. ARCON registration and evidence of healthcare delivery are mandatory.",
      hoursAgo: 24,
      deadlineHours: 18,
    },
    {
      n: 73,
      userId: uid(43),
      projectType: "Hospitality",
      state: "Abuja FCT",
      location: "Abuja FCT",
      budgetRange: "50M_250M",
      brief:
        "A private guest house with eight suites, a spa, and a small restaurant. Preference for a practice with tropical landscape experience.",
      hoursAgo: 48,
      deadlineHours: 4,
    },
  ];

  for (const lead of leads) {
    const createdAt = new Date(now - lead.hoursAgo * 60 * 60 * 1000);
    await prisma.demoRequest.upsert({
      where: { id: uid(lead.n) },
      update: {
        userId: lead.userId,
        providerId: adaeze.id,
        projectType: lead.projectType,
        state: lead.state,
        location: lead.location,
        budgetRange: lead.budgetRange,
        brief: lead.brief,
        status: "REQUESTED",
        providerNote: null,
        createdAt,
        updatedAt: createdAt,
        videoAccessGrantedAt: null,
      },
      create: {
        id: uid(lead.n),
        userId: lead.userId,
        providerId: adaeze.id,
        projectType: lead.projectType,
        state: lead.state,
        location: lead.location,
        budgetRange: lead.budgetRange,
        brief: lead.brief,
        status: "REQUESTED",
        providerNote: null,
        createdAt,
        updatedAt: createdAt,
        videoAccessGrantedAt: null,
      },
    });
  }

  await prisma.favorite.upsert({
    where: { userId_providerId: { userId: client.id, providerId: adaeze.id } },
    update: {},
    create: { id: uid(900), userId: client.id, providerId: adaeze.id },
  });

  console.log("Seed complete.");
  console.log(`Admin:  ${adminEmail} / ${adminPassword}`);
  console.log("Client: client@archng.test / Password123!");
  console.log("Provider: adaeze@archng.test / Password123!");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

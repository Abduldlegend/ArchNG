export type Specialty = string;

export interface Contact {
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  website: string | null;
}

export interface VideoInfo {
  available: boolean;
  url: string | null;
  source: string | null;
}

export interface ProviderExperience {
  id: string;
  title: string;
  organisation: string;
  year: number;
  description: string;
  order: number;
}

export interface VerificationDocument {
  id: string;
  name: string;
  fileType: string | null;
  url: string;
  status: string;
  uploadedAt: string;
}

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
  gated?: boolean;
  canManage?: boolean;
  contact?: Contact | null;
  video?: VideoInfo;
  registrationNumber?: string | null;
  acceptingLeads?: boolean;
  verificationStatus?: string;
  verificationNote?: string | null;
  verificationSubmittedAt?: string | null;
  verificationDocuments?: VerificationDocument[];
  experiences?: ProviderExperience[];
  projects?: Project[];
}

export interface ProjectPlate {
  label: string;
  title: string;
  year: string;
  scale: string;
}

export interface ProjectImage {
  id?: string;
  url: string;
  publicId?: string | null;
  kind: string;
  alt?: string | null;
  isCover?: boolean;
  order?: number;
  plateLabel?: string | null;
  plateTitle?: string | null;
  plateYear?: string | null;
  plateScale?: string | null;
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  architectSlug: string;
  architectName?: string;
  architectFirm?: string;
  architectPortrait?: string;
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
  images?: ProjectImage[];
  status?: string;
}

export type RequestStatus = "Requested" | "Accepted" | "Completed" | "Declined" | "Cancelled";

export interface DemoRequest {
  id: string;
  architectSlug: string;
  projectType: string;
  state: string;
  budget: string;
  budgetRange?: string;
  brief: string;
  status: RequestStatus;
  createdAt: string;
  note?: string;
  providerName?: string;
  providerFirm?: string;
  providerPortrait?: string;
  providerContact?: Contact | null;
  video?: VideoInfo;
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
  status: "Pending" | "Accepted" | "Declined" | "Completed" | "Cancelled";
  note?: string;
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
  documentLinks?: Array<{ id: string; name: string; url: string; status: string }>;
  verificationStatus?: string;
}

export interface ActivityItem {
  title: string;
  detail: string;
  time: string;
  tone: "verified" | "warning" | "neutral";
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

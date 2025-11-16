export interface User {
  id: string;
  email: string;
  name: string;
  preferredLanguage?: "en" | "es";
  username?: string;
  phone?: string;
  acceptedTerms?: boolean;
  type: "busco_lugar" | "tengo_lugar";
  avatar?: string;
  profileComplete?: boolean;
  preferences: UserPreferences;
  profile: UserProfile;
  createdAt: Date;
  verified: boolean;
}

export interface UserPreferences {
  maxPrice: number;
  minPrice: number;
  location: string;
  city: string;
  country: string;
  smoking: boolean;
  pets: boolean;
  genderPreference: "male" | "female" | "any";
  minAge: number;
  maxAge: number;
}

export interface UserProfile {
  // Screen 1: Identifícate
  username?: string;
  birthday?: {
    day: string;
    month: string;
    year: string;
  };
  gender?: "male" | "female" | "other";
  
  // Screen 2: Tu estilo de vida
  lifestyle?: {
    smoking: "yes" | "no";
    allergies: "yes" | "no";
    allergiesDescription?: string;
    pets: "yes" | "no";
    petTypes?: string;
    willingToLivePets: "yes" | "no";
    convivence: "quiet" | "social" | "flexible";
    schedule: "day" | "night" | "mixed";
  };
  
  // Screen 3: Profile photo
  profilePhoto?: string;
  
  // Screen 4: Role selection (busco_lugar | tengo_lugar)
  
  // Screen 5A: If "Busco vivienda"
  searchingHousing?: {
    zone: string;
    numberOfPeople: number;
    roomType: "individual" | "shared";
    essentialServices: string[];
    commonSpaces: string[];
    moveInDate: "immediate" | "next_month" | "2_3_months";
  };
  
  // Screen 5B: If "Ofrezco vivienda"
  offeringHousing?: {
    zone: string;
    availableRooms: number;
    pricePerRoom: number;
    servicesIncluded: string[];
    commonSpaces: string[];
    houseRules: string[];
    petFriendly: boolean;
    propertyPhotos?: string[];
    propertyVideo?: string;
  };
  
  // Original fields
  age?: number;
  occupation?: string;
  description?: string;
  habits?: string[];
  languages?: string[];
}

export interface Publication {
  id: string;
  userId: string;
  title: string;
  description: string;
  price: number;
  location: string;
  city: string;
  country: string;
  images: string[];
  amenities: string[];
  rules: string[];
  availableFrom: Date;
  roomType: "single" | "shared" | "studio";
  createdAt: Date;
  status: "active" | "inactive";
}

export interface Match {
  id: string;
  user1Id: string;
  user2Id: string;
  publicationId?: string;
  score: number;
  status: "pending" | "accepted" | "rejected";
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  matchId: string;
  senderId: string;
  content: string;
  timestamp: Date;
  read: boolean;
  type: "text" | "system";
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "match" | "message" | "system" | "security";
  read: boolean;
  timestamp: Date;
  actionUrl?: string;
}

export interface Event {
  id: string;
  type: EventType;
  origin: string;
  destination: string;
  timestamp: Date;
  payload: any;
}

export type EventType =
  | "UsuarioRegistrado"
  | "PublicacionCreada"
  | "PublicacionActualizada"
  | "MatchEncontrado"
  | "MatchAceptado"
  | "MatchRechazado"
  | "MensajeEnviado"
  | "AlertaDeSeguridad"
  | "UsuarioConectado"
  | "UsuarioDesconectado";

export interface AnalyticsData {
  totalMatches: number;
  totalMessages: number;
  activePublications: number;
  securityAlerts: number;
  userEngagement: number;
}

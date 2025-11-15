export interface User {
  id: string;
  email: string;
  name: string;
  username?: string;
  phone?: string;
  acceptedTerms?: boolean;
  type: "busco_lugar" | "tengo_lugar";
  avatar?: string;
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
  age: number;
  gender: "male" | "female" | "other";
  occupation: string;
  description: string;
  habits: string[];
  languages: string[];
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

export type Role = 'client' | 'admin';

export interface Service {
  id: string;
  name: string;
  price: number;
  duration: string;
  description?: string;
  active: boolean; // For soft delete/hiding
  imageUrl?: string; // Future Firebase Storage URL
  updatedAt?: number;
}

export interface User {
  id: string;
  name: string;
  phone: string;
  role: Role;
  avatar?: string;
}

export type AppointmentStatus = 'confirmed' | 'pending' | 'cancelled' | 'completed' | 'rescheduled';

export interface Appointment {
  id: string;
  userId: string;
  userName: string;
  userPhone?: string; // Snapshot of phone at booking time or fetched reference
  serviceName: string;
  servicePrice: number; // Snapshot of price
  serviceDuration: string; // Snapshot of duration
  date: string; // ISO string YYYY-MM-DD
  time: string; // HH:mm
  originalDate?: string; // For history tracking
  originalTime?: string;
  status: AppointmentStatus;
  createdAt: number;
  updatedAt?: number;
  notes?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  isBookingConfirmation?: boolean;
}

export interface BarbershopInfo {
  name: string;
  owner: string;
  whatsapp: string;
  address: string;
}
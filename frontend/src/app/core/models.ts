export type LessonFormat = 'online' | 'offline' | 'both';
export type BookingStatus = 'confirmed' | 'pending' | 'completed' | 'cancelled';

export interface User {
  id: number;
  name: string;
  email: string;
  major: string;
  studyYear: number;
  bio: string;
  avatar: string;
  isTutor: boolean;
}

export interface Subject {
  id: number;
  name: string;
  icon?: string;
}

export interface TutorAvailabilitySlot {
  id?: number;
  date: string;
  start_time: string;
  end_time: string;
  format: LessonFormat;
}

export interface TutorServicePayload {
  subject_id: number;
  service_title: string;
  description: string;
  price_per_hour: number;
  format: LessonFormat;
  slots: TutorAvailabilitySlot[];
}

export interface Review {
  id: number;
  studentName: string;
  rating: number;
  date: string;
  comment: string;
}

export interface TutorService {
  id: number;
  subjectId: number;
  title: string;
  description: string;
  pricePerHour: number;
  format: LessonFormat;
  teachingStyle: string;
}

export interface TutorProfile {
  id: number;
  name: string;
  quote: string;
  bio: string;
  avatar: string;
  studyYear: number;
  major: string;
  rating: number;
  reviewsCount: number;
  responseSpeed: string;
  languages: string[];
  formats: LessonFormat[];
  service: TutorService;
  availability: string[];
}

export interface Booking {
  id: number;
  tutorId: number;
  subjectName: string;
  date: string;
  time: string;
  format: Exclude<LessonFormat, 'both'>;
  sessionsCount: number;
  totalPrice: number;
  status: BookingStatus;
  eventColor: string;
  meetLink?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
}

export interface SignupRequest {
  fullName: string;
  username: string;
  email: string;
  password: string;
}

export interface AuthUser {
  id: number;
  fullName: string;
  username: string;
  email: string;
  bio: string;
  major: string;
  studyYear: number | null;
  avatar: string;
  isTutor: boolean;
}

export interface StoredUser extends AuthUser {
  password: string;
}

export interface UserSearchResult {
  id: number;
  fullName: string;
  username: string;
  email: string;
  avatar: string;
}


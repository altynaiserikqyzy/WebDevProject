export type LessonFormat = 'online' | 'offline' | 'both';
export type BookingStatus = 'pending' | 'confirmed' | 'rejected' | 'cancelled' | 'completed' | 'no_show';
export type BookingAction = 'confirm' | 'reject' | 'cancel' | 'complete' | 'no_show';

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
  status: BookingStatus;
  student_name: string;
  teacher_name: string;
  subject_name: string;
  service_title: string;
  scheduled_start_at: string;
  scheduled_end_at: string;
  format: LessonFormat;
  number_of_sessions: number;
  total_price: string | null;
  meet_link?: string;
  cancel_reason?: string;
  rejection_reason?: string;
  no_show_marked_at?: string | null;
  completed_at?: string | null;
  cancellation_deadline_at?: string | null;
  allowed_actions: BookingAction[];
  can_payment_be_initiated: boolean;
  created_at: string;
  updated_at: string;
}

export interface BookingCreatePayload {
  service_id: number;
  slot_id: number;
}

export interface BookingReasonPayload {
  reason?: string;
}

export interface BookingActionResponse extends Booking {
  status: BookingStatus;
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


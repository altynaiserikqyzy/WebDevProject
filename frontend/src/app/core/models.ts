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
  icon: string;
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

export interface ChatThread {
  id: number;
  tutorId: number;
  tutorName: string;
  avatar: string;
  lastMessage: string;
  updatedAt: string;
}

export interface Message {
  id: number;
  threadId: number;
  sender: 'me' | 'tutor';
  content: string;
  time: string;
}

export interface LoginRequest {
  username: string;
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
  studyYear: number;
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

export interface LocalChatThread {
  id: number;
  participantIds: [number, number];
  createdAt: string;
  updatedAt: string;
}

export interface LocalChatMessage {
  id: number;
  threadId: number;
  senderId: number;
  text: string;
  createdAt: string;
}

export interface ChatPreview {
  id: number;
  otherUser: UserSearchResult;
  lastMessage: string;
  updatedAt: string;
}

export interface ChatViewMessage {
  id: number;
  senderId: number;
  text: string;
  createdAt: string;
  isMine: boolean;
}

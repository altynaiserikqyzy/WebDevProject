import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import {
  Booking,
  BookingCreatePayload,
  BookingReasonPayload,
  LoginRequest,
  LoginResponse,
  SignupRequest,
  Subject,
  TutorAvailabilitySlot,
  TutorServicePayload
} from './models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly baseUrl = 'http://127.0.0.1:8000/api';

  constructor(private readonly http: HttpClient) {}

  signup(payload: SignupRequest): Observable<{
    detail: string;
    access: string;
    refresh: string;
    user: { id: number; username: string; email: string };
  }> {
    return this.http.post<{
      detail: string;
      access: string;
      refresh: string;
      user: { id: number; username: string; email: string };
    }>(`${this.baseUrl}/auth/signup/`, {
      username: payload.username,
      full_name: payload.fullName,
      email: payload.email,
      password: payload.password,
    });
  }

  login(payload: LoginRequest): Observable<LoginResponse & {
    detail: string;
    user_id: number;
    username: string;
    email: string;
  }> {
    return this.http.post<LoginResponse & {
      detail: string;
      user_id: number;
      username: string;
      email: string;
    }>(`${this.baseUrl}/auth/login/`, payload);
  }

  me(): Observable<{ id: number; username: string; email: string }> {
    return this.http.get<{ id: number; username: string; email: string }>(`${this.baseUrl}/auth/me/`);
  }

  getMyProfile(): Observable<{
    id: number;
    user: { id: number; username: string; email: string };
    full_name: string;
    bio: string;
    major: string;
    study_year: number | null;
    avatar: string;
    is_tutor: boolean;
  }> {
    return this.http.get<{
      id: number;
      user: { id: number; username: string; email: string };
      full_name: string;
      bio: string;
      major: string;
      study_year: number | null;
      avatar: string;
      is_tutor: boolean;
    }>(`${this.baseUrl}/profile/me/`);
  }

  updateMyProfile(payload: {
    full_name?: string;
    bio?: string;
    major?: string;
    study_year?: number | null;
    avatarFile?: File | null;
  }): Observable<any> {
    const formData = new FormData();

    if (payload.full_name !== undefined) {
      formData.append('full_name', payload.full_name);
    }
    if (payload.bio !== undefined) {
      formData.append('bio', payload.bio);
    }
    if (payload.major !== undefined) {
      formData.append('major', payload.major);
    }
    if (payload.study_year !== undefined && payload.study_year !== null) {
      formData.append('study_year', String(payload.study_year));
    }
    if (payload.avatarFile) {
      formData.append('avatar', payload.avatarFile);
    }

    return this.http.patch(`${this.baseUrl}/profile/me/`, formData);
  }

  setTutorStatus(is_tutor: boolean): Observable<any> {
    return this.http.patch(`${this.baseUrl}/profile/tutor-status/`, { is_tutor });
  }

  listSubjects(): Observable<Subject[]> {
    return this.http.get<Subject[]>(`${this.baseUrl}/subjects/`);
  }
  deleteService(id: number) {
    return this.http.delete(`${this.baseUrl}/services/${id}/`);
}

  publish(payload: {
    subjectId?: number;
    subjectName?: string;
    pricePerHour: number;
    title: string;
    description: string;
    format: string;
  }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/services/`, {
      subject_id: payload.subjectId,
      subject_name: payload.subjectName,
      price_per_hour: payload.pricePerHour,
      title: payload.title,
      description: payload.description,
      format: payload.format
    });
  }
  listServices(params?: {
    search?: string;
    subject?: string | number;
    format?: string;
    min_price?: string | number;
    max_price?: string | number;
  }): Observable<any[]> {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set('search', String(params.search));
    if (params?.subject) searchParams.set('subject', String(params.subject));
    if (params?.format) searchParams.set('format', String(params.format));
    if (params?.min_price) searchParams.set('min_price', String(params.min_price));
    if (params?.max_price) searchParams.set('max_price', String(params.max_price));

    const suffix = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return this.http.get<any[]>(`${this.baseUrl}/services/${suffix}`);
  }

  getService(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/services/${id}/`);
  }
  listTutors(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/tutors/`);
  }
  getTutorProfile(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/tutors/${id}/`);
  }
  getMyServices(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/services/my/`);
  }

  getMyTutorServices(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/my-tutor-services/`);
  }

  createService(payload: {
    subject_id?: number;
    subject_name?: string;
    title: string;
    description: string;
    price_per_hour: string;
    format: string;
  }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/tutor-services/`, {
      subject_id: payload.subject_id,
      service_title: payload.title,
      description: payload.description,
      price_per_hour: Number(payload.price_per_hour),
      format: payload.format,
      slots: [],
    });
  }

  createTutorService(payload: TutorServicePayload): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/tutor-services/`, payload);
  }

  createTutorServiceSlot(serviceId: number, slot: TutorAvailabilitySlot): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/tutor-services/${serviceId}/slots/`, slot);
  }

  listMyBookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.baseUrl}/bookings/`);
  }

  getBooking(id: number): Observable<Booking> {
    return this.http.get<Booking>(`${this.baseUrl}/bookings/${id}/`);
  }

  createBooking(payload: BookingCreatePayload): Observable<Booking> {
    return this.http.post<Booking>(`${this.baseUrl}/bookings/`, payload);
  }

  confirmBooking(id: number): Observable<Booking> {
    return this.http.post<Booking>(`${this.baseUrl}/bookings/${id}/confirm/`, {});
  }

  rejectBooking(id: number, payload: BookingReasonPayload): Observable<Booking> {
    return this.http.post<Booking>(`${this.baseUrl}/bookings/${id}/reject/`, payload);
  }

  cancelBooking(id: number, payload: BookingReasonPayload): Observable<Booking> {
    return this.http.post<Booking>(`${this.baseUrl}/bookings/${id}/cancel/`, payload);
  }

  completeBooking(id: number): Observable<Booking> {
    return this.http.post<Booking>(`${this.baseUrl}/bookings/${id}/complete/`, {});
  }

  markNoShowBooking(id: number): Observable<Booking> {
    return this.http.post<Booking>(`${this.baseUrl}/bookings/${id}/no-show/`, {});
  }
}

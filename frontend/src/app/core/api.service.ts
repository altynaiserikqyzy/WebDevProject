import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Booking, LoginRequest, LoginResponse, Subject, TutoringService } from './models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly baseUrl = 'http://127.0.0.1:8000/api';

  constructor(private readonly http: HttpClient) {}

  login(payload: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/auth/login/`, payload);
  }

  logout(refresh: string): Observable<{ detail: string }> {
    return this.http.post<{ detail: string }>(`${this.baseUrl}/auth/logout/`, { refresh });
  }

  me(): Observable<{ id: number; username: string }> {
    return this.http.get<{ id: number; username: string }>(`${this.baseUrl}/auth/me/`);
  }

  listSubjects(): Observable<Subject[]> {
    return this.http.get<Subject[]>(`${this.baseUrl}/subjects/`);
  }

  listServices(): Observable<TutoringService[]> {
    return this.http.get<TutoringService[]>(`${this.baseUrl}/services/`);
  }

  createService(payload: {
    subject: number;
    title: string;
    description: string;
    price_per_hour: string;
    format: string;
  }): Observable<TutoringService> {
    return this.http.post<TutoringService>(`${this.baseUrl}/services/`, payload);
  }

  deleteService(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/services/${id}/`);
  }

  listMyBookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.baseUrl}/bookings/`);
  }

  createBooking(payload: { service: number; scheduled_for: string; notes: string }): Observable<Booking> {
    return this.http.post<Booking>(`${this.baseUrl}/bookings/`, payload);
  }

  getTutorProfile(profileId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/tutors/${profileId}/`);
  }

  getTutorReviews(tutorId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/tutors/${tutorId}/reviews/`);
  }

  getTutorAvailability(tutorId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/tutors/${tutorId}/availability/`);
  }
}

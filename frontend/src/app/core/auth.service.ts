import { Injectable, computed, signal } from '@angular/core';
import { Router } from '@angular/router';

import { ApiService } from './api.service';
import { AuthUser, LoginRequest, SignupRequest } from './models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly userState = signal<AuthUser | null>(null);

  readonly user = computed(() => this.userState());
  readonly isLoggedIn = computed(() => !!this.userState() && !!localStorage.getItem('access'));

  constructor(
    private readonly router: Router,
    private readonly api: ApiService
  ) {
    if (localStorage.getItem('access')) {
      this.loadProfile();
    }
  }

  signup(payload: SignupRequest, handlers: {
    next: () => void;
    error: (message: string) => void;
  }) {
    this.api.signup(payload).subscribe({
      next: (response) => {
        localStorage.setItem('access', response.access);
        localStorage.setItem('refresh', response.refresh);
        this.loadProfile(handlers.next, handlers.error);
      },
      error: (err) => {
        handlers.error(err?.error?.detail ?? 'Signup failed.');
      },
    });
  }

  login(payload: LoginRequest, handlers: {
    next: () => void;
    error: (message: string) => void;
  }) {
    this.api.login(payload).subscribe({
      next: (response) => {
        localStorage.setItem('access', response.access);
        localStorage.setItem('refresh', response.refresh);
        this.loadProfile(handlers.next, handlers.error);
      },
      error: (err) => {
        handlers.error(err?.error?.detail ?? 'Login failed.');
      },
    });
  }

  becomeTutor(onDone?: () => void) {
    this.setTutorStatus(true, onDone);
  }

  setTutorStatus(isTutor: boolean, onDone?: () => void, onError?: (message: string) => void) {
    this.api.setTutorStatus(isTutor).subscribe({
      next: (profile) => {
        this.userState.set(this.mapProfileToUser(profile));
        onDone?.();
      },
      error: (err) => {
        onError?.(err?.error?.detail ?? 'Failed to update tutor status.');
      },
    });
  }

  logout() {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    this.userState.set(null);
    this.router.navigateByUrl('/auth');
  }

  updateProfile(
    payload: { fullName: string; bio: string; major: string; studyYear: number; avatar?: string },
    onDone?: () => void,
    onError?: (message: string) => void
  ) {
    this.api.updateMyProfile({
      full_name: payload.fullName,
      bio: payload.bio,
      major: payload.major,
      study_year: payload.studyYear,
      avatar: payload.avatar,
    }).subscribe({
      next: (profile) => {
        this.userState.set(this.mapProfileToUser(profile));
        onDone?.();
      },
      error: (err) => {
        onError?.(err?.error?.detail ?? 'Failed to update profile.');
      },
    });
  }

  loadProfile(onDone?: () => void, onError?: (message: string) => void) {
    this.api.getMyProfile().subscribe({
      next: (profile) => {
        this.userState.set(this.mapProfileToUser(profile));
        onDone?.();
      },
      error: (err) => {
        this.logout();
        onError?.(err?.error?.detail ?? 'Failed to load profile.');
      },
    });
  }

  private mapProfileToUser(profile: {
    user: { id: number; username: string; email: string };
    full_name: string;
    bio: string;
    major: string;
    study_year: number | null;
    avatar: string;
    is_tutor: boolean;
  }): AuthUser {
    return {
      id: profile.user.id,
      fullName: profile.full_name,
      username: profile.user.username,
      email: profile.user.email,
      bio: profile.bio ?? '',
      major: profile.major ?? '',
      studyYear: profile.study_year ?? 1,
      avatar: profile.avatar || `https://i.pravatar.cc/160?u=${encodeURIComponent(profile.user.username)}`,
      isTutor: profile.is_tutor,
    };
  }
}

import { Injectable, computed, signal } from '@angular/core';
import { Router } from '@angular/router';

import { ApiService } from './api.service';
import { AuthUser, LoginRequest, SignupRequest } from './models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly userState = signal<AuthUser | null>(null);
  private readonly accessTokenState = signal<string | null>(localStorage.getItem('access'));

  readonly user = computed(() => this.userState());
  readonly isLoggedIn = computed(() => !!this.accessTokenState());

  constructor(
    private readonly router: Router,
    private readonly api: ApiService
  ) {
    if (this.accessTokenState()) {
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
        this.accessTokenState.set(response.access);
        this.userState.set({
          id: response.user.id,
          fullName: payload.fullName,
          username: response.user.username,
          email: response.user.email,
          bio: '',
          major: '',
          studyYear: 1,
          avatar: `https://i.pravatar.cc/160?u=${encodeURIComponent(response.user.username)}`,
          isTutor: false,
        });
        handlers.next();
        this.loadProfile(undefined, undefined);
      },
      error: (err) => {
        handlers.error(this.extractErrorMessage(err, 'Signup failed.'));
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
        this.accessTokenState.set(response.access);
        this.userState.set({
          id: response.user_id,
          fullName: response.username,
          username: response.username,
          email: response.email,
          bio: '',
          major: '',
          studyYear: 1,
          avatar: `https://i.pravatar.cc/160?u=${encodeURIComponent(response.username)}`,
          isTutor: false,
        });
        handlers.next();
        this.loadProfile(undefined, undefined);
      },
      error: (err) => {
        handlers.error(this.extractErrorMessage(err, 'Login failed.'));
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
    this.accessTokenState.set(null);
    this.userState.set(null);
    this.router.navigateByUrl('/auth');
  }

  updateProfile(
    payload: { fullName: string; bio: string; major: string; studyYear: number },
    onDone?: () => void,
    onError?: (message: string) => void
  ) {
    this.api.updateMyProfile({
      full_name: payload.fullName,
      bio: payload.bio,
      major: payload.major,
      study_year: payload.studyYear,
    }).subscribe({
      next: (profile) => {
        this.userState.set(this.mapProfileToUser(profile));
        onDone?.();
      },
      error: (err) => {
        onError?.(this.extractErrorMessage(err, 'Failed to update profile.'));
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
        if (err?.status === 401) {
          this.logout();
        }
        onError?.(this.extractErrorMessage(err, 'Failed to load profile.'));
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

  private extractErrorMessage(err: any, fallback: string) {
    const detail = err?.error?.detail;
    if (typeof detail === 'string' && detail.trim()) {
      return detail;
    }

    const errorBody = err?.error;
    if (errorBody && typeof errorBody === 'object') {
      const firstValue = Object.values(errorBody)[0];
      if (Array.isArray(firstValue) && typeof firstValue[0] === 'string') {
        return firstValue[0];
      }
      if (typeof firstValue === 'string' && firstValue.trim()) {
        return firstValue;
      }
    }

    return fallback;
  }
}

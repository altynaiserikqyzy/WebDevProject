import { Injectable, computed } from '@angular/core';
import { Router } from '@angular/router';

import { LocalAppDataService } from './local-app-data.service';
import { LoginRequest, SignupRequest } from './models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly user = computed(() => this.data.currentUser());
  readonly isLoggedIn = computed(() => this.data.isLoggedIn());

  constructor(
    private readonly router: Router,
    private readonly data: LocalAppDataService
  ) {}

  login(payload: LoginRequest) {
    return this.data.login(payload.username, payload.password);
  }

  signup(payload: SignupRequest) {
    return this.data.signup(payload);
  }

  becomeTutor() {
    this.data.becomeTutor();
  }

  logout() {
    this.data.logout();
    this.router.navigateByUrl('/auth');
  }

  updateProfile(payload: { fullName: string; bio: string; major: string; studyYear: number }) {
    this.data.updateProfile(payload);
  }
}

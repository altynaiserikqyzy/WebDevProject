import { Injectable, computed, signal } from '@angular/core';
import { Router } from '@angular/router';

import { User } from './models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly userState = signal<User | null>({
    id: 101,
    name: 'Aruzhan Sadykova',
    email: 'aruzhan@kbtu.edu.kz',
    major: 'Information Systems',
    studyYear: 3,
    bio: 'Focused on machine learning and product design.',
    avatar: 'https://i.pravatar.cc/120?img=48',
    isTutor: false
  });

  readonly user = computed(() => this.userState());
  readonly isLoggedIn = computed(() => !!this.userState());

  constructor(private readonly router: Router) {}

  login(email: string) {
    this.userState.update((user) => (user ? { ...user, email } : user));
  }

  signup(name: string, email: string) {
    this.userState.set({
      id: Date.now(),
      name,
      email,
      major: 'Computer Science',
      studyYear: 2,
      bio: 'Excited to level up grades with NoRetake KBTU.',
      avatar: 'https://i.pravatar.cc/120?img=26',
      isTutor: false
    });
  }

  becomeTutor() {
    this.userState.update((user) => (user ? { ...user, isTutor: true } : user));
  }

  logout() {
    this.userState.set(null);
    this.router.navigateByUrl('/auth');
  }
}

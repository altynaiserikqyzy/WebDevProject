import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../core/auth.service';

@Component({
  standalone: true,
  imports: [FormsModule],
  template: `
    <section class="section-wrap grid gap-6 md:grid-cols-2">
      <article class="glass p-8">
        <p class="text-sm uppercase tracking-widest text-brand-200">NoRetake KBTU</p>
        <h1 class="mt-3 text-3xl font-bold">Welcome back</h1>
        <p class="mt-2 text-slate-300">All users start as students and can become tutors from profile.</p>
      </article>
      <article class="glass p-8">
        <div class="mb-6 flex rounded-xl bg-slate-900 p-1">
          <button class="flex-1 rounded-lg py-2" [class]="tab() === 'login' ? 'bg-brand-500 text-white' : 'text-slate-300'" (click)="tab.set('login')">Login</button>
          <button class="flex-1 rounded-lg py-2" [class]="tab() === 'signup' ? 'bg-brand-500 text-white' : 'text-slate-300'" (click)="tab.set('signup')">Sign Up</button>
        </div>
        @if (error) {
          <p class="mb-4 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">{{ error }}</p>
        }
        <form class="space-y-4" (ngSubmit)="submit()">
          @if (tab() === 'signup') {
            <input [(ngModel)]="fullName" name="fullName" class="w-full rounded-xl border border-white/20 bg-slate-900 px-4 py-3" placeholder="Full name" required />
          }
          <input [(ngModel)]="username" name="username" class="w-full rounded-xl border border-white/20 bg-slate-900 px-4 py-3" placeholder="Username" required />
          <input [(ngModel)]="email" name="email" type="email" class="w-full rounded-xl border border-white/20 bg-slate-900 px-4 py-3" placeholder="Email" [required]="tab() === 'signup'" />
          <input [(ngModel)]="password" name="password" type="password" class="w-full rounded-xl border border-white/20 bg-slate-900 px-4 py-3" placeholder="Password" required minlength="6" />
          <button class="btn-primary w-full">{{ tab() === 'login' ? 'Login' : 'Create Account' }}</button>
        </form>
      </article>
    </section>
  `
})
export class AuthPage {
  readonly tab = signal<'login' | 'signup'>('login');
  fullName = '';
  username = '';
  email = '';
  password = '';
  error = '';

  constructor(private readonly auth: AuthService, private readonly router: Router) {}

  submit() {
    this.error = '';

    if (this.tab() === 'signup') {
      const result = this.auth.signup({
        fullName: this.fullName || 'KBTU Student',
        username: this.username,
        email: this.email,
        password: this.password,
      });

      if (!result.ok) {
        this.error = result.error;
        return;
      }
    } else {
      const result = this.auth.login({
        username: this.username,
        password: this.password,
      });

      if (!result.ok) {
        this.error = result.error;
        return;
      }
    }

    this.router.navigateByUrl('/profile');
  }
}

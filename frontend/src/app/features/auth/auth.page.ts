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
        <form class="space-y-4" (ngSubmit)="submit()">
          @if (tab() === 'signup') {
            <input [(ngModel)]="name" name="name" class="w-full rounded-xl border border-white/20 bg-slate-900 px-4 py-3" placeholder="Full name" required />
          }
          <input [(ngModel)]="email" name="email" type="email" class="w-full rounded-xl border border-white/20 bg-slate-900 px-4 py-3" placeholder="Email" required />
          <input [(ngModel)]="password" name="password" type="password" class="w-full rounded-xl border border-white/20 bg-slate-900 px-4 py-3" placeholder="Password" required minlength="6" />
          <button class="btn-primary w-full">{{ tab() === 'login' ? 'Login' : 'Create Account' }}</button>
        </form>
      </article>
    </section>
  `
})
export class AuthPage {
  readonly tab = signal<'login' | 'signup'>('login');
  name = '';
  email = '';
  password = '';

  constructor(private readonly auth: AuthService, private readonly router: Router) {}

  submit() {
    if (this.tab() === 'signup') {
      this.auth.signup(this.name || 'KBTU Student', this.email);
    } else {
      this.auth.login(this.email);
    }
    this.router.navigateByUrl('/explore');
  }
}

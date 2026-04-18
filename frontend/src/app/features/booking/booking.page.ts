import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { PlatformService } from '../../core/platform.service';

@Component({
  standalone: true,
  imports: [FormsModule],
  template: `
    <section class="section-wrap">
      <div class="mx-auto max-w-3xl glass p-7">
        <h1 class="text-3xl font-bold">Complete booking</h1>
        <div class="mt-5 grid gap-4 md:grid-cols-2">
          <input [(ngModel)]="subject" class="rounded-xl border border-white/20 bg-slate-900 px-4 py-3" placeholder="Subject" />
          <input [(ngModel)]="date" type="date" class="rounded-xl border border-white/20 bg-slate-900 px-4 py-3" />
          <input [(ngModel)]="time" class="rounded-xl border border-white/20 bg-slate-900 px-4 py-3" placeholder="Time" />
          <select [(ngModel)]="format" class="rounded-xl border border-white/20 bg-slate-900 px-4 py-3">
            <option value="online">Online</option>
            <option value="offline">Offline</option>
          </select>
          <input [(ngModel)]="sessionsCount" (ngModelChange)="normalizeSessionsCount()" type="number" min="1" class="rounded-xl border border-white/20 bg-slate-900 px-4 py-3" />
        </div>
        <div class="mt-6 rounded-xl border border-brand-300/30 bg-brand-500/10 p-4">
          <p>Total price: <span class="font-semibold text-brand-200">{{ safeSessionsCount() * 7000 }} KZT</span></p>
          <p class="text-sm text-slate-300">Mock payment summary included.</p>
        </div>
        <button class="btn-primary mt-5 w-full" (click)="confirm()">Confirm Booking</button>
        @if (success()) {
          <p class="mt-3 rounded-xl bg-emerald-500/20 p-3 text-emerald-200">Booking confirmed. Added to calendar automatically.</p>
        }
      </div>
    </section>
  `
})
export class BookingPage {
  readonly success = signal(false);
  subject = 'Calculus';
  date = '2026-04-21';
  time = '19:00';
  format: 'online' | 'offline' = 'online';
  sessionsCount = 1;

  constructor(private readonly platform: PlatformService) {}

  confirm() {
    this.normalizeSessionsCount();
    this.platform.addBooking({
      tutorId: 1,
      subjectName: this.subject,
      date: this.date,
      time: this.time,
      format: this.format,
      sessionsCount: this.safeSessionsCount(),
      totalPrice: this.safeSessionsCount() * 7000,
      eventColor: '#8b5cf6',
      meetLink: this.format === 'online' ? 'https://meet.google.com/new-kbtu-session' : undefined
    });
    this.success.set(true);
  }

  normalizeSessionsCount() {
    this.sessionsCount = this.safeSessionsCount();
  }

  safeSessionsCount() {
    return Math.max(1, Number(this.sessionsCount) || 1);
  }
}

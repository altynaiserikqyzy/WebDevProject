import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { ApiService } from '../../core/api.service';

@Component({
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `
    @if (loading) {
      <section class="section-wrap">
        <article class="glass p-8 text-center text-slate-300">Loading tutor profile...</article>
      </section>
    } @else if (error) {
      <section class="section-wrap">
        <article class="glass p-8 text-center">
          <p class="text-xl font-semibold text-white">Tutor profile is unavailable</p>
          <p class="mt-3 text-slate-300">{{ error }}</p>
          <a routerLink="/tutors" class="btn-secondary mt-5 inline-flex">Back to tutors</a>
        </article>
      </section>
    } @else if (tutor) {
      <section class="section-wrap grid gap-6 lg:grid-cols-3">
        <article class="glass p-6 lg:col-span-2">
          <div class="flex items-center gap-4">
            <img [src]="tutor.avatar" [alt]="tutor.name" class="h-20 w-20 rounded-full object-cover" />
            <div>
              <h1 class="text-3xl font-bold">{{ tutor.name }}</h1>
              <p class="text-slate-300">{{ tutor.title }}</p>
              <p class="text-brand-200">{{ tutor.subject }} · {{ tutor.price }} KZT/h</p>
            </div>
          </div>
          <p class="mt-5 text-slate-200">{{ tutor.description }}</p>
          <h3 class="mt-6 text-xl font-semibold">Format</h3>
          <div class="mt-3 flex flex-wrap gap-2">
            <span class="rounded-full border border-white/15 px-3 py-1 text-sm">{{ tutor.format }}</span>
          </div>
          <h3 class="mt-6 text-xl font-semibold">Tutor Info</h3>
          <div class="mt-3 space-y-3">
            <article class="rounded-xl bg-slate-900/75 p-4">
              <p class="text-sm text-brand-200">@{{ tutor.username }}</p>
              <p class="mt-1 text-slate-300">{{ tutor.bio || 'This tutor has not added extra profile information yet.' }}</p>
            </article>
          </div>
        </article>
        <aside class="glass h-fit p-6">
          <h2 class="text-xl font-semibold">Book session</h2>
          <label class="mt-4 block text-sm text-slate-300">Date</label>
          <input type="date" [(ngModel)]="date" class="mt-1 w-full rounded-xl border border-white/20 bg-slate-900 px-3 py-2" />
          <label class="mt-3 block text-sm text-slate-300">Time</label>
          <select [(ngModel)]="time" class="mt-1 w-full rounded-xl border border-white/20 bg-slate-900 px-3 py-2">
            <option>18:00</option>
            <option>19:00</option>
            <option>20:00</option>
          </select>
          <label class="mt-3 block text-sm text-slate-300">Sessions</label>
          <input type="number" min="1" [(ngModel)]="sessionsCount" (ngModelChange)="normalizeSessionsCount()" class="mt-1 w-full rounded-xl border border-white/20 bg-slate-900 px-3 py-2" />
          <p class="mt-4 text-sm text-brand-200">Total: {{ totalPrice() }} KZT</p>
          <a [routerLink]="['/chat']" [queryParams]="{ userId: tutor.userId }" class="btn-primary mt-4 inline-flex w-full justify-center">Contact Tutor</a>
        </aside>
      </section>
    }
  `
})
export class TutorDetailPage {
  tutor: {
    id: number;
    userId: number;
    name: string;
    username: string;
    title: string;
    description: string;
    subject: string;
    price: string;
    format: string;
    avatar: string;
    bio: string;
  } | null = null;
  loading = true;
  error = '';
  date = '2026-04-20';
  time = '18:00';
  sessionsCount = 1;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly api: ApiService
  ) {
    const serviceId = Number(this.route.snapshot.paramMap.get('id'));
    if (serviceId) {
      this.api.getService(serviceId).subscribe({
        next: (service) => {
          this.tutor = {
            id: service.id,
            userId: service.tutor?.user?.id ?? 0,
            name: service.tutor?.full_name ?? service.tutor?.user?.username ?? 'Tutor',
            username: service.tutor?.user?.username ?? 'tutor',
            title: service.title,
            description: service.description,
            subject: service.subject?.name ?? 'Subject',
            price: service.price_per_hour,
            format: service.format,
            avatar: service.tutor?.avatar || `https://i.pravatar.cc/160?u=${encodeURIComponent(service.tutor?.user?.username ?? service.id)}`,
            bio: service.tutor?.bio ?? '',
          };
          this.loading = false;
        },
        error: () => {
          this.error = 'This tutor service could not be loaded.';
          this.loading = false;
        },
      });
    } else {
      this.error = 'Invalid tutor link.';
      this.loading = false;
    }
  }

  totalPrice() {
    return (Number(this.tutor?.price ?? 0) || 0) * this.safeSessionsCount();
  }

  normalizeSessionsCount() {
    this.sessionsCount = this.safeSessionsCount();
  }

  private safeSessionsCount() {
    return Math.max(1, Number(this.sessionsCount) || 1);
  }
}

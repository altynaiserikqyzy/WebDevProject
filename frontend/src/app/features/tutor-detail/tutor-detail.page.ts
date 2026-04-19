import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize, timeout } from 'rxjs';

import { ApiService } from '../../core/api.service';
import { PlatformService } from '../../core/platform.service';

@Component({
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `
    @if (loading()) {
      <section class="section-wrap">
        <article class="glass p-8 text-center text-slate-300">Loading tutor profile...</article>
      </section>
    } @else if (error()) {
      <section class="section-wrap">
        <article class="glass p-8 text-center">
          <p class="text-xl font-semibold text-white">Tutor profile is unavailable</p>
          <p class="mt-3 text-slate-300">{{ error() }}</p>
          <a routerLink="/tutors" class="btn-secondary mt-5 inline-flex">Back to tutors</a>
        </article>
      </section>
    } @else if (tutor(); as tutor) {
      <section class="section-wrap grid gap-6 lg:grid-cols-3">
        <article class="glass p-6 lg:col-span-2">
          <div class="flex items-center gap-4">
            <img [src]="tutor.avatar" [alt]="tutor.name" class="h-20 w-20 rounded-full object-cover" />
            <div>
              <h1 class="text-3xl font-bold">{{ tutor.name }}</h1>
              <p class="text-slate-300">{{ selectedService()?.title || 'KBTU tutor' }}</p>
              <p class="text-brand-200">{{ selectedService()?.subject || tutor.major }} · {{ selectedService()?.price || '0.00' }} KZT/h</p>
            </div>
          </div>
          <p class="mt-5 text-slate-200">{{ selectedService()?.description || tutor.bio || 'This tutor has not added extra profile information yet.' }}</p>
          <h3 class="mt-6 text-xl font-semibold">Format</h3>
          <div class="mt-3 flex flex-wrap gap-2">
            <span class="rounded-full border border-white/15 px-3 py-1 text-sm">{{ selectedService()?.format || 'online' }}</span>
          </div>
          <h3 class="mt-6 text-xl font-semibold">Services</h3>
          <div class="mt-3 grid gap-3">
            @for (service of tutor.services; track service.id) {
              <button
                class="rounded-xl border px-4 py-3 text-left transition"
                [class]="service.id === selectedServiceId ? 'border-brand-300 bg-brand-500/10' : 'border-white/10 bg-slate-900/70 hover:bg-slate-800'"
                (click)="selectService(service.id)"
              >
                <p class="font-semibold">{{ service.title }}</p>
                <p class="mt-1 text-sm text-brand-200">{{ service.subject }} · {{ service.price }} KZT/h · {{ service.format }}</p>
                <p class="mt-2 text-sm text-slate-300">{{ service.description || 'No description.' }}</p>
              </button>
            } @empty {
              <article class="rounded-xl border border-dashed border-white/10 px-4 py-6 text-sm text-slate-400">
                This tutor has no services yet. You can still message them.
              </article>
            }
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
          <button class="btn-primary mt-4 w-full" [disabled]="!selectedService()" (click)="bookSelectedService()">Book selected service</button>
          <a [routerLink]="['/chat']" [queryParams]="{ userId: tutor.userId }" class="btn-primary mt-4 inline-flex w-full justify-center">Contact Tutor</a>
        </aside>
      </section>
    }
  `
})
export class TutorDetailPage {
  readonly tutor = signal<{
    id: number;
    userId: number;
    name: string;
    username: string;
    major: string;
    avatar: string;
    bio: string;
    services: Array<{
    id: number;
    title: string;
    description: string;
    subject: string;
    price: string;
    format: string;
  }>;
} | null>(null);

  readonly loading = signal(true);
  readonly error = signal('');
  selectedServiceId: number | null = null;
  date = '2026-04-20';
  time = '18:00';
  sessionsCount = 1;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly api: ApiService,
    private readonly platform: PlatformService,
    private readonly router: Router
  ) {
    const tutorId = Number(this.route.snapshot.paramMap.get('id'));
    if (tutorId) {
      this.api.getTutorProfile(tutorId).pipe(
      timeout(8000),
      finalize(() => {
        this.loading.set(false);
      })
    ).subscribe({
      next: (profile) => {
        try {
          const tutor = this.mapProfileToTutor(profile);
          this.tutor.set(tutor);
          this.selectedServiceId = tutor.services[0]?.id ?? null;
        } catch (e) {
          console.error('mapping failed', e);
          this.error.set('Failed to process tutor profile.');
        }
      },
      error: (err) => {
        console.error('Failed to load tutor profile:', err);
        this.error.set(err?.error?.detail || 'This tutor profile could not be loaded.');
      },
    });
    } else {
      this.error.set('Invalid tutor link.');
      this.loading.set(false);
    }
  }

  totalPrice() {
    return (Number(this.selectedService()?.price ?? 0) || 0) * this.safeSessionsCount();
  }

  normalizeSessionsCount() {
    this.sessionsCount = this.safeSessionsCount();
  }

  selectedService() {
    const tutor = this.tutor();
    if (!tutor || !this.selectedServiceId) {
      return null;
    }
    return tutor.services.find((service) => service.id === this.selectedServiceId) ?? null;
  }

  selectService(serviceId: number) {
    this.selectedServiceId = serviceId;
  }

  bookSelectedService() {
    const tutor = this.tutor();
    const service = this.selectedService();
    if (!tutor || !service) {
      return;
    }

    const format = service.format === 'offline' ? 'offline' : 'online';
    this.platform.addBooking({
      tutorId: tutor.userId,
      subjectName: service.subject,
      date: this.date,
      time: this.time,
      format,
      sessionsCount: this.safeSessionsCount(),
      totalPrice: this.totalPrice(),
      eventColor: '#8b5cf6',
      meetLink: format === 'online' ? this.generateMeetLink(tutor.id, service.id) : undefined,
    });

    this.router.navigateByUrl('/calendar');
  }

  private safeSessionsCount() {
    return Math.max(1, Number(this.sessionsCount) || 1);
  }

  private mapProfileToTutor(profile: any) {
  const username = profile.user?.username ?? 'tutor';

  return {
      id: profile.id,
      userId: profile.user?.id ?? 0,
      name: profile.full_name?.trim() || username || 'Tutor',
      username,
      major: profile.major ?? '',
      avatar: this.getAvatarUrl(profile.avatar, username || String(profile.id)),
      bio: profile.bio ?? '',
      services: (profile.services ?? []).map((service: any) => ({
      id: service.id,
      title: service.title ?? 'KBTU tutor',
      description: service.description ?? '',
      subject: service.subject?.name ?? profile.major ?? 'Subject',
      price: service.price_per_hour ?? '0.00',
      format: service.format ?? 'online',
    })),
  };
}
  private getAvatarUrl(avatar: string | null | undefined, fallbackKey: string) {
    if (!avatar) {
      return `https://i.pravatar.cc/160?u=${encodeURIComponent(fallbackKey)}`;
    }
    if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
      return avatar;
    }
    if (avatar.startsWith('/media/http')) {
      return decodeURIComponent(avatar.replace('/media/', ''));
    }
    return `http://127.0.0.1:8000${avatar}`;
  }

  private generateMeetLink(tutorId: number, serviceId: number) {
    return `https://meet.google.com/kbtu-${tutorId}-${serviceId}-${Date.now().toString().slice(-4)}`;
  }
}

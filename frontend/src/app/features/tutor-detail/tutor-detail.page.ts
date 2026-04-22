import { Component, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { catchError, finalize, forkJoin, map, of, timeout } from 'rxjs';

import { ApiService } from '../../core/api.service';

type SlotFormat = 'online' | 'offline' | 'both';

interface TutorSlot {
  id: number;
  date: string;
  start_time: string;
  end_time: string;
  format: SlotFormat;
  is_booked: boolean;
}

interface TutorReview {
  id: number;
  reviewer_name: string;
  reviewer_major: string;
  rating: number;
  comment: string;
}

interface TutorServiceItem {
  id: number;
  title: string;
  description: string;
  subject: string;
  price: string;
  format: SlotFormat;
  slots: TutorSlot[];
}

interface TutorViewModel {
  id: number;
  userId: number;
  name: string;
  username: string;
  major: string;
  avatar: string;
  bio: string;
  rating: number;
  reviewsCount: number;
  services: TutorServiceItem[];
  reviews: TutorReview[];
}

@Component({
  standalone: true,
  imports: [RouterLink],
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
      <section class="section-wrap grid gap-6 lg:grid-cols-[2fr,1fr]">
        <article class="glass space-y-6 p-6">
          <header class="flex items-start gap-4">
            <img [src]="tutor.avatar" [alt]="tutor.name" class="h-20 w-20 rounded-full object-cover" />
            <div class="flex-1">
              <div class="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h1 class="text-3xl font-bold">{{ tutor.name }}</h1>
                  <p class="mt-1 text-slate-300">{{ selectedService()?.subject }} · {{ selectedService()?.price }} KZT/h · {{ formatLabel(selectedService()?.format || 'online') }}</p>
                </div>
                <div class="text-right">
                  <p class="text-3xl font-bold">{{ tutor.rating.toFixed(1) }}</p>
                  <p class="text-sm text-brand-200">{{ stars(tutor.rating) }}</p>
                  <p class="text-xs text-slate-400">({{ tutor.reviewsCount }} reviews)</p>
                </div>
              </div>
              <h2 class="mt-4 text-2xl font-semibold">{{ selectedService()?.title }}</h2>
              <p class="mt-2 text-slate-300">{{ selectedService()?.description || tutor.bio }}</p>
            </div>
          </header>

          <section>
            <h3 class="text-xl font-semibold">Services</h3>
            <div class="mt-3 flex flex-wrap gap-2">
              @for (service of tutor.services; track service.id) {
                <button
                  type="button"
                  class="rounded-xl border px-3 py-2 text-sm transition"
                  [class]="service.id === selectedServiceId() ? 'border-brand-300 bg-brand-500/10 text-brand-100' : 'border-white/15 bg-slate-900/70 text-slate-200 hover:bg-slate-800'"
                  (click)="selectService(service.id)"
                >
                  {{ service.subject }}
                </button>
              }
            </div>
          </section>

          <section>
            <div class="mb-3 flex items-center justify-between gap-3">
              <h3 class="text-xl font-semibold">Student reviews</h3>
              <span class="text-sm text-brand-200">Total {{ tutor.reviewsCount }}</span>
            </div>
            <div class="grid gap-3 md:grid-cols-3">
              @for (review of tutor.reviews.slice(0, 3); track review.id) {
                <article class="rounded-xl border border-white/10 bg-slate-900/70 p-4">
                  <p class="text-brand-200">{{ stars(review.rating) }}</p>
                  <p class="mt-2 text-sm text-slate-200">{{ review.comment }}</p>
                  <p class="mt-3 text-xs text-slate-400">{{ review.reviewer_name }}{{ review.reviewer_major ? ' · ' + review.reviewer_major : '' }}</p>
                </article>
              } @empty {
                <article class="rounded-xl border border-dashed border-white/10 px-4 py-6 text-sm text-slate-400 md:col-span-3">
                  No reviews yet.
                </article>
              }
            </div>
          </section>

          <section>
            <h3 class="text-xl font-semibold">Available slots</h3>
            <p class="mt-1 text-xs text-slate-400">All times are in KZT timezone.</p>
            <div class="mt-3 space-y-2">
              @for (slot of serviceSlots(); track slot.id) {
                <button
                  type="button"
                  class="flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition"
                  [class]="isSlotSelected(slot.id) ? 'border-brand-300 bg-brand-500/10' : 'border-white/10 bg-slate-900/70 hover:bg-slate-800'"
                  (click)="toggleSlot(slot.id)"
                >
                  <div class="flex flex-wrap items-center gap-x-4 gap-y-1">
                    <span class="font-semibold">{{ prettyDate(slot.date) }}</span>
                    <span class="text-slate-300">{{ slot.start_time }} - {{ slot.end_time }}</span>
                    <span class="text-brand-200">{{ formatLabel(slot.format) }}</span>
                  </div>
                  <span class="h-4 w-4 rounded-full border border-white/30" [class.bg-brand-500]="isSlotSelected(slot.id)"></span>
                </button>
              } @empty {
                <article class="rounded-xl border border-dashed border-white/10 px-4 py-6 text-sm text-slate-400">
                  No available slots yet.
                </article>
              }
            </div>
          </section>
        </article>

        <aside class="glass h-fit space-y-4 p-6">
          <h2 class="text-2xl font-semibold">Book session</h2>
          <p class="text-sm text-slate-300">Choose one or more slots from the tutor list.</p>

          @if (selectedSlots().length) {
            <article class="rounded-xl border border-white/15 bg-slate-900/70 p-4 text-sm">
              <p class="font-semibold text-brand-100">Selected slots ({{ selectedSlots().length }})</p>
              <div class="mt-2 space-y-2">
                @for (slot of selectedSlots(); track slot.id) {
                  <div class="rounded-lg border border-white/10 bg-slate-800/70 px-3 py-2">
                    <p>{{ prettyDate(slot.date) }}</p>
                    <p class="mt-1">{{ slot.start_time }} - {{ slot.end_time }}</p>
                    <p class="mt-1">{{ formatLabel(slot.format) }}</p>
                  </div>
                }
              </div>
              <div class="mt-3 border-t border-white/10 pt-3">
                <p>Subject: <span class="text-brand-100">{{ selectedService()?.subject }}</span></p>
                <p class="mt-1">Total: <span class="text-brand-100">{{ totalPrice() }} KZT</span></p>
              </div>
            </article>
          } @else {
            <article class="rounded-xl border border-dashed border-white/15 px-4 py-6 text-sm text-slate-400">
              Select a slot to continue.
            </article>
          }

          <button class="btn-primary w-full" [disabled]="!selectedSlots().length || !selectedService()" (click)="bookSelectedSlots()">Book selected slots</button>
          @if (bookingActionError()) {
            <p class="rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">{{ bookingActionError() }}</p>
          }
          <a href="https://t.me/" target="_blank" rel="noopener noreferrer" class="btn-secondary inline-flex w-full justify-center">Contact via Telegram</a>
        </aside>
      </section>
    }
  `,
})
export class TutorDetailPage {
  readonly tutor = signal<TutorViewModel | null>(null);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly bookingSubmitting = signal(false);
  readonly bookingActionError = signal('');

  readonly selectedServiceId = signal<number | null>(null);
  readonly selectedSlotIds = signal<number[]>([]);

  constructor(
    private readonly route: ActivatedRoute,
    private readonly api: ApiService,
    private readonly router: Router
  ) {
    const tutorId = Number(this.route.snapshot.paramMap.get('id'));
    if (!tutorId) {
      this.error.set('Invalid tutor link.');
      this.loading.set(false);
      return;
    }

    this.api.getTutorProfile(tutorId).pipe(
      timeout(8000),
      finalize(() => this.loading.set(false))
    ).subscribe({
      next: (profile) => {
        const tutor = this.mapProfileToTutor(profile);
        this.tutor.set(tutor);
        const firstService = tutor.services[0];
        this.selectedServiceId.set(firstService?.id ?? null);
        this.selectedSlotIds.set([]);
      },
      error: (err) => {
        this.error.set(err?.error?.detail || 'This tutor profile could not be loaded.');
      },
    });
  }

  selectedService() {
    const tutor = this.tutor();
    const serviceId = this.selectedServiceId();
    if (!tutor || !serviceId) {
      return null;
    }
    return tutor.services.find((service) => service.id === serviceId) ?? null;
  }

  serviceSlots() {
    return (this.selectedService()?.slots ?? []).filter((slot) => !slot.is_booked);
  }

  selectedSlots() {
    const selectedIds = this.selectedSlotIds();
    if (!selectedIds.length) {
      return [];
    }
    const selectedIdSet = new Set(selectedIds);
    return this.serviceSlots().filter((slot) => selectedIdSet.has(slot.id));
  }

  selectService(serviceId: number) {
    this.selectedServiceId.set(serviceId);
    this.selectedSlotIds.set([]);
    this.bookingActionError.set('');
  }

  isSlotSelected(slotId: number) {
    return this.selectedSlotIds().includes(slotId);
  }

  toggleSlot(slotId: number) {
    this.bookingActionError.set('');
    if (this.isSlotSelected(slotId)) {
      this.selectedSlotIds.update((ids) => ids.filter((id) => id !== slotId));
      return;
    }
    this.selectedSlotIds.update((ids) => [...ids, slotId]);
  }

  totalPrice() {
    const price = Number(this.selectedService()?.price ?? 0) || 0;
    return price * this.selectedSlots().length;
  }

  bookSelectedSlots() {
    if (this.bookingSubmitting()) {
      return;
    }

    const tutor = this.tutor();
    const service = this.selectedService();
    const slots = this.selectedSlots();
    if (!tutor || !service || !slots.length) {
      return;
    }

    this.bookingSubmitting.set(true);
    this.bookingActionError.set('');

    const createCalls = slots.map((slot) =>
      this.api.createBooking({
        service_id: service.id,
        slot_id: slot.id,
      }).pipe(
        map((booking) => ({ ok: true as const, booking, slotId: slot.id })),
        catchError((err) => of({
          ok: false as const,
          error: this.extractErrorMessage(err, 'Failed to create booking.'),
          slotId: slot.id,
        }))
      )
    );

    forkJoin(createCalls)
      .pipe(finalize(() => this.bookingSubmitting.set(false)))
      .subscribe({
        next: (results) => {
          const successCount = results.filter((r) => r.ok).length;
          if (successCount > 0) {
            this.router.navigateByUrl('/calendar');
            return;
          }

          const firstFailure = results.find((r) => !r.ok);
          this.bookingActionError.set(firstFailure?.error || 'Failed to create booking.');
        },
      });
  }

  formatLabel(format: SlotFormat) {
    if (format === 'offline') return 'Offline';
    if (format === 'both') return 'Online & Offline';
    return 'Online';
  }

  prettyDate(date: string) {
    const d = new Date(`${date}T00:00:00`);
    if (Number.isNaN(d.getTime())) {
      return date;
    }
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  stars(rating: number) {
    const rounded = Math.max(1, Math.min(5, Math.round(rating || 0)));
    return '★'.repeat(rounded) + '☆'.repeat(5 - rounded);
  }

  private mapProfileToTutor(profile: any): TutorViewModel {
    const username = profile.user?.username ?? 'tutor';
    return {
      id: profile.id,
      userId: profile.user?.id ?? 0,
      name: profile.full_name?.trim() || username || 'Tutor',
      username,
      major: profile.major ?? '',
      avatar: this.getAvatarUrl(profile.avatar, username || String(profile.id)),
      bio: profile.bio ?? '',
      rating: Number(profile.rating ?? 0),
      reviewsCount: Number(profile.reviews_count ?? 0),
      reviews: (profile.reviews ?? []).map((review: any) => ({
        id: review.id,
        reviewer_name: review.reviewer_name ?? 'Student',
        reviewer_major: review.reviewer_major ?? '',
        rating: Number(review.rating ?? 0),
        comment: review.comment ?? '',
      })),
      services: (profile.services ?? []).map((service: any) => ({
        id: service.id,
        title: service.title ?? 'KBTU tutor',
        description: service.description ?? '',
        subject: service.subject?.name ?? profile.major ?? 'Subject',
        price: service.price_per_hour ?? '0.00',
        format: (service.format ?? 'online') as SlotFormat,
        slots: (service.availability_slots ?? []).map((slot: any) => ({
          id: slot.id,
          date: slot.date,
          start_time: slot.start_time,
          end_time: slot.end_time,
          format: (slot.format ?? 'online') as SlotFormat,
          is_booked: Boolean(slot.is_booked),
        })),
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

  private generateMeetLink(tutorId: number, serviceId: number, slotId: number) {
    return `https://meet.google.com/kbtu-${tutorId}-${serviceId}-${slotId}`;
  }

  private extractErrorMessage(err: any, fallback: string) {
    const detail = err?.error?.detail;
    if (typeof detail === 'string' && detail.trim()) {
      return detail;
    }
    if (Array.isArray(detail) && detail.length) {
      return String(detail[0]);
    }
    if (detail && typeof detail === 'object') {
      const first = Object.values(detail)[0];
      if (Array.isArray(first) && first.length) {
        return String(first[0]);
      }
      if (typeof first === 'string') {
        return first;
      }
    }

    const errorBody = err?.error;
    if (errorBody && typeof errorBody === 'object') {
      const firstValue = Object.values(errorBody)[0];
      if (Array.isArray(firstValue) && firstValue.length) {
        return String(firstValue[0]);
      }
      if (typeof firstValue === 'string' && firstValue.trim()) {
        return firstValue;
      }
    }

    return fallback;
  }
}

import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { PlatformService } from '../../core/platform.service';

@Component({
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `
    @if (tutor(); as tutor) {
      <section class="section-wrap grid gap-6 lg:grid-cols-3">
        <article class="glass p-6 lg:col-span-2">
          <div class="flex items-center gap-4">
            <img [src]="tutor.avatar" [alt]="tutor.name" class="h-20 w-20 rounded-full object-cover" />
            <div>
              <h1 class="text-3xl font-bold">{{ tutor.name }}</h1>
              <p class="text-slate-300">{{ tutor.quote }}</p>
              <p class="text-brand-200">★ {{ tutor.rating }} ({{ tutor.reviewsCount }} reviews)</p>
            </div>
          </div>
          <p class="mt-5 text-slate-200">{{ tutor.bio }}</p>
          <h3 class="mt-6 text-xl font-semibold">Availability</h3>
          <div class="mt-3 flex flex-wrap gap-2">
            @for (slot of tutor.availability; track slot) {
              <span class="rounded-full border border-white/15 px-3 py-1 text-sm">{{ slot }}</span>
            }
          </div>
          <h3 class="mt-6 text-xl font-semibold">Reviews</h3>
          <div class="mt-3 space-y-3">
            @for (review of platform.reviews(); track review.id) {
              <article class="rounded-xl bg-slate-900/75 p-4">
                <p class="text-sm text-brand-200">{{ review.studentName }} · ★ {{ review.rating }}</p>
                <p class="mt-1 text-slate-300">{{ review.comment }}</p>
              </article>
            }
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
          <input type="number" min="1" [(ngModel)]="sessionsCount" class="mt-1 w-full rounded-xl border border-white/20 bg-slate-900 px-3 py-2" />
          <p class="mt-4 text-sm text-brand-200">Total: {{ tutor.service.pricePerHour * sessionsCount }} KZT</p>
          <a routerLink="/booking" class="btn-primary mt-4 inline-flex w-full justify-center">Continue Booking</a>
        </aside>
      </section>
    }
  `
})
export class TutorDetailPage {
  readonly tutorId: number;
  readonly tutor = computed(() => this.platform.tutors().find((t) => t.id === this.tutorId));
  date = '2026-04-20';
  time = '18:00';
  sessionsCount = 1;

  constructor(private readonly route: ActivatedRoute, public readonly platform: PlatformService) {
    this.tutorId = Number(this.route.snapshot.paramMap.get('id'));
  }
}

import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { PlatformService } from '../../core/platform.service';

@Component({
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="section-wrap">
      <div class="glass p-5">
        <h1 class="text-3xl font-bold">Tutors Listing</h1>
        <div class="mt-4 grid gap-3 md:grid-cols-3">
          <input class="rounded-xl border border-white/20 bg-slate-900 px-4 py-2" placeholder="Search tutor or subject" (input)="search.set(($any($event.target).value || '').toLowerCase())" />
          <select class="rounded-xl border border-white/20 bg-slate-900 px-4 py-2" (change)="sort.set($any($event.target).value)">
            <option value="rating">Sort by rating</option>
            <option value="price">Sort by price</option>
          </select>
          <select class="rounded-xl border border-white/20 bg-slate-900 px-4 py-2" (change)="format.set($any($event.target).value)">
            <option value="all">All formats</option>
            <option value="online">Online</option>
            <option value="offline">Offline</option>
          </select>
        </div>
      </div>
      <div class="mt-6 grid gap-4 md:grid-cols-2">
        @for (tutor of tutors(); track tutor.id) {
          <article class="glass rounded-2xl p-5 transition hover:-translate-y-1">
            <div class="flex gap-4">
              <img [src]="tutor.avatar" class="h-16 w-16 rounded-full object-cover" [alt]="tutor.name" />
              <div class="flex-1">
                <h3 class="font-semibold">{{ tutor.name }}</h3>
                <p class="text-sm text-slate-300">{{ tutor.service.title }}</p>
                <p class="text-sm text-brand-200">★ {{ tutor.rating }} · {{ tutor.service.pricePerHour }} KZT/h · Year {{ tutor.studyYear }}</p>
              </div>
            </div>
            <p class="mt-3 text-sm text-slate-300">{{ tutor.quote }}</p>
            <div class="mt-4 flex gap-2">
              <a routerLink="/chat" class="btn-secondary px-4 py-2 text-sm">Message</a>
              <a [routerLink]="['/tutors', tutor.id]" class="btn-primary px-4 py-2 text-sm">View Profile</a>
            </div>
          </article>
        } @empty {
          <article class="glass p-8 text-center text-slate-300">No tutors found. Try another filter.</article>
        }
      </div>
    </section>
  `
})
export class TutorsPage {
  readonly search = signal('');
  readonly sort = signal<'rating' | 'price'>('rating');
  readonly format = signal<'all' | 'online' | 'offline'>('all');

  readonly tutors = computed(() => {
    let list = this.platform.tutors().filter((t) => `${t.name} ${t.service.title}`.toLowerCase().includes(this.search()));
    if (this.format() !== 'all') {
      list = list.filter((t) => t.formats.includes(this.format() as 'online' | 'offline'));
    }
    return [...list].sort((a, b) =>
      this.sort() === 'rating' ? b.rating - a.rating : a.service.pricePerHour - b.service.pricePerHour
    );
  });

  constructor(private readonly platform: PlatformService) {}
}

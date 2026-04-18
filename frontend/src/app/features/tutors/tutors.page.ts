import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ApiService } from '../../core/api.service';

@Component({
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="section-wrap">
      <div class="glass p-5">
        <h1 class="text-3xl font-bold">Tutors Listing</h1>
        <div class="mt-4 grid gap-3 md:grid-cols-3">
          <input class="rounded-xl border border-white/20 bg-slate-900 px-4 py-2" placeholder="Search tutor or subject" (input)="onSearch(($any($event.target).value || '').toLowerCase())" />
          <select class="rounded-xl border border-white/20 bg-slate-900 px-4 py-2" (change)="onSort($any($event.target).value)">
            <option value="newest">Sort by newest</option>
            <option value="price">Sort by price</option>
          </select>
          <select class="rounded-xl border border-white/20 bg-slate-900 px-4 py-2" (change)="onFormat($any($event.target).value)">
            <option value="">All formats</option>
            <option value="online">Online</option>
            <option value="offline">Offline</option>
            <option value="both">Both</option>
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
                <p class="text-sm text-slate-300">{{ tutor.title }}</p>
                <p class="text-sm text-brand-200">{{ tutor.price }} KZT/h · {{ tutor.format }}</p>
              </div>
            </div>
            <p class="mt-3 text-sm text-slate-300">{{ tutor.description }}</p>
            <div class="mt-4 flex gap-2">
              <a [routerLink]="['/chat']" [queryParams]="{ userId: tutor.userId }" class="btn-secondary px-4 py-2 text-sm">Message</a>
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
  readonly tutors = signal<Array<{
    id: number;
    userId: number;
    name: string;
    username: string;
    subject: string;
    title: string;
    description: string;
    price: string;
    format: string;
    avatar: string;
    createdAt: string;
  }>>([]);

  private search = '';
  private format = '';
  private sort: 'newest' | 'price' = 'newest';

  constructor(private readonly api: ApiService) {
    this.loadServices();
  }

  onSearch(value: string) {
    this.search = value;
    this.loadServices();
  }

  onFormat(value: string) {
    this.format = value;
    this.loadServices();
  }

  onSort(value: 'newest' | 'price') {
    this.sort = value;
    this.loadServices();
  }

  private loadServices() {
    this.api.listServices().subscribe({
      next: (services) => {
        const normalizedSearch = this.search.trim().toLowerCase();
        const mapped = services.map((service) => ({
          id: service.id,
          userId: service.tutor?.user?.id ?? 0,
          name: service.tutor?.full_name?.trim() || service.tutor?.user?.username || 'Tutor',
          username: service.tutor?.user?.username ?? '',
          subject: service.subject?.name ?? '',
          title: service.title,
          description: service.description,
          price: service.price_per_hour,
          format: String(service.format ?? '').toLowerCase(),
          avatar: service.tutor?.avatar || `https://i.pravatar.cc/160?u=${encodeURIComponent(service.tutor?.user?.username ?? service.id)}`,
          createdAt: service.created_at,
        }));

        const deduped = Array.from(
          new Map(
            mapped.map((service) => [
              `${service.username}|${service.subject}|${service.title}|${service.price}|${service.format}|${service.description}`.toLowerCase(),
              service,
            ])
          ).values()
        );

        const formatFiltered = this.format
          ? deduped.filter((service) => service.format === this.format.toLowerCase())
          : deduped;

        const filtered = normalizedSearch
          ? formatFiltered.filter((service) =>
              `${service.name} ${service.username} ${service.subject} ${service.title} ${service.description}`
                .toLowerCase()
                .includes(normalizedSearch)
            )
          : formatFiltered;

        const sorted = [...filtered].sort((a, b) =>
          this.sort === 'price'
            ? Number(a.price) - Number(b.price)
            : b.createdAt.localeCompare(a.createdAt)
        );

        this.tutors.set(sorted);
      },
      error: () => {
        this.tutors.set([]);
      },
    });
  }
}

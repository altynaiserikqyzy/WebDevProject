import { Component, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

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
                <p class="text-xs font-semibold uppercase tracking-[0.08em] text-brand-200">{{ tutor.subject }}</p>
                <h3 class="font-semibold">{{ tutor.name }}</h3>
                <p class="text-sm text-slate-300">{{ tutor.title }}</p>
                <p class="text-sm text-brand-200">{{ tutor.price }} KZT/h · {{ formatLabel(tutor.format) }}</p>
                <p class="mt-1 text-xs text-slate-400">{{ tutor.rating.toFixed(1) }} в… В· {{ tutor.reviewsCount }} reviews</p>
              </div>
            </div>
            <p class="mt-3 text-sm text-slate-300">{{ tutor.description }}</p>
            <div class="mt-4 flex gap-2">
              <a href="https://t.me/" target="_blank" rel="noopener noreferrer" class="btn-secondary px-4 py-2 text-sm">Telegram</a>
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
    rating: number;
    reviewsCount: number;
    createdAt: string;
  }>>([]);

  private search = '';
  private format = '';
  private sort: 'newest' | 'price' = 'newest';
  private subjectFromQuery = '';

  constructor(
    private readonly api: ApiService,
    private readonly route: ActivatedRoute
  ) {
    this.route.queryParamMap.subscribe((params) => {
      this.subjectFromQuery = (params.get('subject') ?? '').trim().toLowerCase();
      this.loadTutors();
    });

    this.loadTutors();
  }

  onSearch(value: string) {
    this.search = value;
    this.loadTutors();
  }

  onFormat(value: string) {
    this.format = value;
    this.loadTutors();
  }

  onSort(value: 'newest' | 'price') {
    this.sort = value;
    this.loadTutors();
  }
  formatLabel(format: string) {
    const normalized = String(format ?? '').toLowerCase();
    if (normalized === 'both') {
      return 'Online/Offline';
    }
    if (normalized === 'offline') {
      return 'Offline';
    }
    return 'Online';
  }
  private loadTutors() {
    this.api.listTutors().subscribe({
      next: (profiles) => {
        const normalizedSearch = this.search.trim().toLowerCase();
        const mapped = profiles
          .filter((profile) => (profile.services?.length ?? 0) > 0)
          .map((profile) => {
          const primaryService = profile.services?.[0];
          const username = profile.user?.username ?? '';

          return {
            id: profile.id,
            userId: profile.user?.id ?? 0,
            name: profile.full_name?.trim() || username || 'Tutor',
            username,
            subject: primaryService?.subject?.name ?? profile.major ?? '',
            title: primaryService?.title ?? 'KBTU tutor',
            description: primaryService?.description ?? profile.bio ?? '',
            price: primaryService?.price_per_hour ?? '0.00',
            format: String(primaryService?.format ?? 'online').toLowerCase(),
            avatar: this.getAvatarUrl(profile.avatar, username || String(profile.id)),
            rating: Number(profile.rating ?? 0),
            reviewsCount: Number(profile.reviews_count ?? 0),
            createdAt: primaryService?.created_at ?? '',
          };
        });

        const selectedFormat = this.format.toLowerCase();
        const formatFiltered = selectedFormat
          ? mapped.filter((tutor) =>
              selectedFormat === 'both'
                ? ['online', 'offline', 'both'].includes(tutor.format)
                : selectedFormat === 'online'
                  ? ['online', 'both'].includes(tutor.format)
                  : selectedFormat === 'offline'
                    ? ['offline', 'both'].includes(tutor.format)
                    : tutor.format === selectedFormat
            )
          : mapped;

        const filtered = normalizedSearch
          ? formatFiltered.filter((tutor) =>
              `${tutor.name} ${tutor.username} ${tutor.subject} ${tutor.title} ${tutor.description}`
                .toLowerCase()
                .includes(normalizedSearch)
            )
          : formatFiltered;

        const subjectFiltered = this.subjectFromQuery
          ? filtered.filter((tutor) => tutor.subject.toLowerCase().includes(this.subjectFromQuery))
          : filtered;

        const sorted = [...subjectFiltered].sort((a, b) =>
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
}



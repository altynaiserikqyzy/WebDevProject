import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { PlatformService } from '../../core/platform.service';

@Component({
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="section-wrap space-y-8">
      <div class="glass p-6">
        <h1 class="text-3xl font-bold">Explore tutors and subjects</h1>
        <input class="mt-4 w-full rounded-xl border border-white/20 bg-slate-900 px-4 py-3" placeholder="Search tutor or subject..." [value]="query()" (input)="query.set(($any($event.target).value || '').toLowerCase())" />
      </div>
      <div class="grid gap-4 md:grid-cols-3">
        @for (subject of platform.subjects(); track subject.id) {
          <a routerLink="/tutors" class="glass block rounded-2xl p-5 transition hover:-translate-y-1">
            <p class="text-2xl">{{ subject.icon }}</p>
            <h3 class="mt-2 font-semibold text-white">{{ subject.name }}</h3>
          </a>
        }
      </div>
      <div>
        <h2 class="text-xl font-semibold">Featured tutors</h2>
        <div class="mt-4 grid gap-4 md:grid-cols-2">
          @for (tutor of filteredTutors(); track tutor.id) {
            <article class="glass rounded-2xl p-5">
              <div class="flex items-center gap-3">
                <img [src]="tutor.avatar" [alt]="tutor.name" class="h-14 w-14 rounded-full object-cover" />
                <div>
                  <h3 class="font-semibold">{{ tutor.name }}</h3>
                  <p class="text-sm text-slate-300">{{ tutor.service.title }}</p>
                </div>
              </div>
              <div class="mt-4 flex items-center justify-between">
                <span class="text-sm text-brand-200">★ {{ tutor.rating }} · {{ tutor.responseSpeed }}</span>
                <a [routerLink]="['/tutors', tutor.id]" class="btn-secondary px-4 py-2 text-sm">View Profile</a>
              </div>
            </article>
          }
        </div>
      </div>
    </section>
  `
})
export class ExplorePage {
  readonly query = signal('');
  readonly filteredTutors = computed(() =>
    this.platform
      .tutors()
      .filter((t) => `${t.name} ${t.service.title}`.toLowerCase().includes(this.query()))
      .slice(0, 4)
  );

  constructor(public readonly platform: PlatformService) {}
}

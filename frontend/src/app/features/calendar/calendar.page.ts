import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { PlatformService } from '../../core/platform.service';

@Component({
  standalone: true,
  imports: [FormsModule],
  template: `
    <section class="section-wrap">
      <h1 class="text-3xl font-bold">Study Calendar</h1>
      <div class="mt-6 grid gap-6 lg:grid-cols-3">
        <div class="space-y-3 lg:col-span-2">
          @for (event of platform.upcomingSessions(); track event.id) {
            <article class="glass flex items-center justify-between rounded-2xl p-4">
              <div>
                <p class="font-semibold">{{ event.subjectName }} · {{ event.date }} at {{ event.time }}</p>
                <p class="text-sm text-slate-300">{{ event.status }} · {{ event.format }}</p>
                @if (event.meetLink) {
                  <p class="text-xs text-brand-200">Google Meet: {{ event.meetLink }}</p>
                }
              </div>
              <input type="color" [(ngModel)]="event.eventColor" class="h-10 w-12 rounded-lg border border-white/20 bg-transparent" />
            </article>
          }
        </div>
        <aside class="glass rounded-2xl p-5">
          <h2 class="font-semibold">Upcoming sessions</h2>
          <p class="mt-2 text-sm text-slate-300">Email reminder 15 minutes before online lessons.</p>
          <ul class="mt-4 space-y-2 text-sm text-slate-200">
            @for (event of platform.upcomingSessions(); track event.id) {
              <li>{{ event.date }} · {{ event.subjectName }}</li>
            }
          </ul>
        </aside>
      </div>
    </section>
  `
})
export class CalendarPage {
  readonly selectedView = signal<'week' | 'month'>('week');
  constructor(public readonly platform: PlatformService) {}
}

import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../core/auth.service';
import { PlatformService } from '../../core/platform.service';

@Component({
  standalone: true,
  imports: [RouterLink],
  template: `
    @if (auth.user(); as user) {
      <section class="section-wrap space-y-6">
        <article class="glass grid gap-4 p-6 md:grid-cols-[auto,1fr]">
          <img [src]="user.avatar" [alt]="user.name" class="h-24 w-24 rounded-full object-cover" />
          <div>
            <h1 class="text-3xl font-bold">{{ user.name }}</h1>
            <p class="text-slate-300">{{ user.major }} · Year {{ user.studyYear }}</p>
            <p class="mt-2 text-slate-300">{{ user.bio }}</p>
          </div>
        </article>
        <div class="grid gap-4 md:grid-cols-3">
          <article class="glass p-4"><p class="text-sm text-slate-300">Booked Sessions</p><p class="text-2xl font-bold">{{ platform.bookings().length }}</p></article>
          <article class="glass p-4"><p class="text-sm text-slate-300">Favorite Tutors</p><p class="text-2xl font-bold">6</p></article>
          <article class="glass p-4"><p class="text-sm text-slate-300">Tutoring History</p><p class="text-2xl font-bold">12h</p></article>
        </div>
        <article class="glass p-6">
          <h2 class="text-xl font-semibold">Become a Tutor</h2>
          <p class="mt-1 text-slate-300">Turn your knowledge into income by publishing your tutoring service.</p>
          <a routerLink="/profile/create-service" class="btn-primary mt-4 inline-flex">Create Tutor Service</a>
        </article>
      </section>
    }
  `
})
export class ProfilePage {
  constructor(public readonly auth: AuthService, public readonly platform: PlatformService) {}
}

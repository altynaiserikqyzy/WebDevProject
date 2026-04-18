import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';

@Component({
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    @if (auth.user(); as user) {
      <section class="section-wrap space-y-6">
        <article class="glass grid gap-5 p-6 md:grid-cols-[auto,1fr]">
          <img [src]="user.avatar" [alt]="user.fullName" class="h-24 w-24 rounded-full object-cover" />
          <div>
            <div class="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 class="text-3xl font-bold">{{ user.fullName }}</h1>
                <p class="text-slate-300">@{{ user.username }} · {{ user.email }}</p>
              </div>
              <button class="btn-secondary" (click)="toggleEdit()">{{ editing ? 'Close' : 'Edit Profile' }}</button>
            </div>
            <p class="mt-3 text-slate-200">{{ user.bio }}</p>
            <p class="mt-2 text-sm text-brand-100">{{ user.major }} · Year {{ user.studyYear }}</p>
          </div>
        </article>

        <div class="grid gap-4 md:grid-cols-3">
          <article class="glass p-4">
            <p class="text-sm text-slate-300">Registered chats</p>
            <p class="text-2xl font-bold">Backend</p>
          </article>
          <article class="glass p-4">
            <p class="text-sm text-slate-300">Account type</p>
            <p class="text-2xl font-bold">{{ user.isTutor ? 'Tutor' : 'Student' }}</p>
          </article>
          <article class="glass p-4">
            <p class="text-sm text-slate-300">Stored locally</p>
            <p class="text-2xl font-bold">Frontend</p>
          </article>
        </div>

        @if (editing) {
          <article class="glass grid gap-4 p-6 md:grid-cols-2">
            <input [(ngModel)]="fullName" class="rounded-xl border border-white/20 bg-slate-900 px-4 py-3" placeholder="Full name" />
            <input [(ngModel)]="major" class="rounded-xl border border-white/20 bg-slate-900 px-4 py-3" placeholder="Major" />
            <input [(ngModel)]="studyYear" type="number" min="1" max="6" class="rounded-xl border border-white/20 bg-slate-900 px-4 py-3" placeholder="Study year" />
            <textarea [(ngModel)]="bio" rows="4" class="rounded-xl border border-white/20 bg-slate-900 px-4 py-3 md:col-span-2" placeholder="Bio"></textarea>
            @if (error()) {
              <p class="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200 md:col-span-2">{{ error() }}</p>
            }
            <div class="flex gap-3 md:col-span-2">
              <button class="btn-primary disabled:cursor-not-allowed disabled:opacity-60" [disabled]="saving()" (click)="save()">
                {{ saving() ? 'Saving...' : 'Save' }}
              </button>
              <button class="btn-secondary" [disabled]="saving()" (click)="toggleEdit()">Cancel</button>
            </div>
          </article>
        }

        @if (!user.isTutor) {
          <article class="glass p-6">
            <h2 class="text-xl font-semibold">Become a Tutor</h2>
            <p class="mt-1 text-slate-300">Turn on tutor mode to publish services and appear as a tutor in the app.</p>
            <button class="btn-primary mt-4" (click)="becomeTutor()">Become Tutor</button>
          </article>
        } @else {
          <article class="glass p-6">
            <div class="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 class="text-xl font-semibold">Tutor Settings</h2>
                <p class="mt-1 text-slate-300">Tutor mode is active. You can keep it on and manage services later, or turn it off at any time.</p>
              </div>
              <span class="rounded-full bg-emerald-500/15 px-3 py-1 text-sm text-emerald-200">Tutor mode active</span>
            </div>
            <div class="mt-5 flex flex-wrap gap-3">
              <a routerLink="/profile/create-service" class="btn-primary inline-flex">Create Service</a>
              <button class="btn-secondary" (click)="disableTutorMode()">Disable Tutor Mode</button>
            </div>
            <p class="mt-3 text-sm text-slate-400">When tutor mode is turned off, your tutor-only actions should stop and your services can be hidden.</p>
          </article>
        }

        <article class="glass p-6">
          <div class="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 class="text-xl font-semibold">My Services</h2>
              <p class="mt-1 text-slate-300">Services you have published appear here.</p>
            </div>
            @if (user.isTutor) {
              <a routerLink="/profile/create-service" class="btn-secondary inline-flex">Add New Service</a>
            }
          </div>

          <div class="mt-4 rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-slate-400">
            @if (servicesLoading()) {
              Loading services...
            } @else {
              Services found: {{ myServices().length }}
            }
          </div>

          <div class="mt-5 grid gap-4 md:grid-cols-2">
            @for (service of myServices(); track service.id) {
              <article class="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
                <div class="flex items-start justify-between gap-3">
                <div>
                  <h3 class="font-semibold text-white">{{ service.title }}</h3>
                  <p class="mt-1 text-sm text-brand-200">
                    {{ service.subject }} · {{ service.price }} KZT/h · {{ service.format }}
                  </p>
                </div>

                <div class="flex gap-2">
                  <button (click)="deleteService(service.id)">Delete</button>
                </div>
              </div>
                              <p class="mt-3 text-sm text-slate-300">{{ service.description }}</p>
              </article>
            } @empty {
              <article class="rounded-2xl border border-dashed border-white/10 px-4 py-6 text-sm text-slate-400 md:col-span-2">
                You have not published any services yet.
              </article>
            }
          </div>
        </article>

        <article class="glass p-6">
          <h2 class="text-xl font-semibold">Start chatting</h2>
          <p class="mt-1 text-slate-300">Use the chat page to find registered users and open one unique conversation per pair.</p>
          <a routerLink="/chat" class="btn-secondary mt-4 inline-flex">Open Chat</a>
        </article>
      </section>
    }
  `,
})
export class ProfilePage {
  editing = false;
  readonly saving = signal(false);
  readonly error = signal('');
  readonly servicesLoading = signal(true);
  fullName = '';
  bio = '';
  major = '';
  studyYear = 1;
  readonly myServices = signal<Array<any>>([]);

  constructor(
    public readonly auth: AuthService,
    private readonly api: ApiService
  ) {
    this.auth.loadProfile(() => {
      this.loadMyServices();
    });
  }

  toggleEdit() {
    this.editing = !this.editing;
    if (this.editing) {
      this.fillForm();
    }
  }
  deleteService(id: number) {
  if (!confirm('Delete this service?')) return;

  this.api.deleteService(id).subscribe({
    next: () => {
      // удалить из UI сразу (без reload)
      this.myServices.update(services =>
        services.filter(s => s.id !== id)
      );
    },
    error: (err) => {
      console.log(err);
      alert('Failed to delete');
    }
  });
}
  save() {
    const fullName = this.fullName.trim();
    const major = this.major.trim();
    const bio = this.bio.trim();
    const studyYear = Number(this.studyYear);

    if (!fullName) {
      this.error.set('Full name is required.');
      return;
    }
    if (!Number.isFinite(studyYear) || studyYear < 1 || studyYear > 6) {
      this.error.set('Study year must be between 1 and 6.');
      return;
    }

    this.error.set('');
    this.saving.set(true);
    this.auth.updateProfile({
      fullName,
      bio,
      major,
      studyYear,
    }, () => {
      this.saving.set(false);
      this.editing = false;
    }, (message) => {
      this.saving.set(false);
      this.error.set(message);
    });
  }

  becomeTutor() {
    this.auth.becomeTutor(() => {
      this.loadMyServices();
    });
  }

  disableTutorMode() {
    this.auth.setTutorStatus(false, () => {
      this.myServices.set([]);
    });
  }

  private fillForm() {
    const user = this.auth.user();
    if (!user) {
      return;
    }

    this.fullName = user.fullName;
    this.bio = user.bio;
    this.major = user.major;
    this.studyYear = user.studyYear;
    this.error.set('');
  }

  private loadMyServices() {
    this.servicesLoading.set(true);
    this.api.getMyServices().subscribe({
      next: (services) => {
        this.myServices.set(
          services
            .map((service) => ({
              id: service.id,
              title: service.title,
              description: service.description,
              subject: service.subject?.name ?? 'Subject',
              price: service.price_per_hour,
              format: service.format,
            }))
            .sort((a, b) => b.id - a.id)
        );
        this.servicesLoading.set(false);
      },
      error: () => {
        this.myServices.set([]);
        this.servicesLoading.set(false);
      },
    });
  }
}

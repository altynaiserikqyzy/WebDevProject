import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

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
            <input [(ngModel)]="avatar" class="rounded-xl border border-white/20 bg-slate-900 px-4 py-3" placeholder="Avatar URL" />
            <textarea [(ngModel)]="bio" rows="4" class="rounded-xl border border-white/20 bg-slate-900 px-4 py-3 md:col-span-2" placeholder="Bio"></textarea>
            <div class="flex gap-3 md:col-span-2">
              <button class="btn-primary" (click)="save()">Save</button>
              <button class="btn-secondary" (click)="toggleEdit()">Cancel</button>
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
  fullName = '';
  bio = '';
  major = '';
  studyYear = 1;
  avatar = '';

  constructor(
    public readonly auth: AuthService
  ) {
    if (!this.auth.user()) {
      this.auth.loadProfile();
    }
  }

  toggleEdit() {
    this.editing = !this.editing;
    if (this.editing) {
      this.fillForm();
    }
  }

  save() {
    this.auth.updateProfile({
      fullName: this.fullName,
      bio: this.bio,
      major: this.major,
      studyYear: Number(this.studyYear) || 1,
      avatar: this.avatar.trim(),
    }, () => {
      this.editing = false;
    });
  }

  becomeTutor() {
    this.auth.becomeTutor();
  }

  disableTutorMode() {
    this.auth.setTutorStatus(false);
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
    this.avatar = user.avatar;
  }
}

import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { ApiService } from '../../core/api.service';
import { LessonFormat } from '../../core/models';

@Component({
  standalone: true,
  imports: [FormsModule],
  template: `
    <section class="section-wrap">
      <div class="mx-auto max-w-3xl glass p-7">
        <h1 class="text-3xl font-bold">Create Tutor Service</h1>
        <p class="mt-2 text-slate-300">Publish a tutor card that will appear in the tutors listing.</p>
        <div class="mt-5 grid gap-4 md:grid-cols-2">
          <select [(ngModel)]="subjectId" class="rounded-xl border border-white/20 bg-slate-900 px-4 py-3">
            <option [ngValue]="null">Select subject</option>
            @for (subject of subjects; track subject.id) {
              <option [ngValue]="subject.id">{{ subject.name }}</option>
            }
          </select>
          <input [(ngModel)]="subjectName" class="rounded-xl border border-white/20 bg-slate-900 px-4 py-3" placeholder="Or type subject manually" />
          <input [(ngModel)]="pricePerHour" type="number" min="1" class="rounded-xl border border-white/20 bg-slate-900 px-4 py-3" placeholder="Price per hour" />
          <select [(ngModel)]="format" class="rounded-xl border border-white/20 bg-slate-900 px-4 py-3">
            <option value="online">Online</option>
            <option value="offline">Offline</option>
            <option value="both">Both</option>
          </select>
          <input [(ngModel)]="title" class="rounded-xl border border-white/20 bg-slate-900 px-4 py-3" placeholder="Short quote/title" />
          <textarea [(ngModel)]="description" class="md:col-span-2 rounded-xl border border-white/20 bg-slate-900 px-4 py-3" rows="4" placeholder="Description"></textarea>
        </div>
        @if (!subjects.length) {
          <p class="mt-4 rounded-xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
            No subjects were loaded from the server. Enter the subject manually and the service will still be created.
          </p>
        }
        @if (error) {
          <p class="mt-4 rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{{ error }}</p>
        }
        <button class="btn-primary mt-5 w-full disabled:cursor-not-allowed disabled:opacity-60" [disabled]="isPublishing" (click)="publish()">
          {{ isPublishing ? 'Publishing...' : 'Publish Service' }}
        </button>
      </div>
    </section>
  `
})
export class CreateServicePage {
  subjects: Array<{ id: number; name: string }> = [];
  subjectId: number | null = null;
  subjectName = '';
  pricePerHour = 7000;
  format: LessonFormat = 'online';
  title = 'Programming mentor from KBTU';
  description = 'Exam prep, practical coding and confidence boosting sessions.';
  error = '';
  isPublishing = false;

  constructor(
    private readonly api: ApiService,
    private readonly router: Router
  ) {
    this.api.listSubjects().subscribe({
      next: (subjects) => {
        this.subjects = subjects;
        this.subjectId = subjects[0]?.id ?? null;
      },
      error: () => {
        this.subjects = [];
      },
    });
  }

  publish() {
    this.error = '';
    const subjectId = Number(this.subjectId);
    const subjectName = this.subjectName.trim();
    const pricePerHour = Number(this.pricePerHour);
    const title = this.title.trim();
    const description = this.description.trim();

    if (!subjectId && !subjectName) {
      this.error = 'Select a subject or enter one manually.';
      return;
    }
    if (!title) {
      this.error = 'Enter a service title.';
      return;
    }
    if (!pricePerHour || pricePerHour < 1) {
      this.error = 'Price per hour must be greater than 0.';
      return;
    }

    this.isPublishing = true;
    this.api.createService({
      ...(subjectId ? { subject_id: subjectId } : {}),
      ...(subjectName ? { subject_name: subjectName } : {}),
      title,
      description,
      price_per_hour: String(pricePerHour),
      format: this.format,
    }).subscribe({
      next: () => {
        this.router.navigateByUrl('/profile');
      },
      error: (err) => {
        this.error = err?.error?.detail ?? 'Failed to create service.';
        this.isPublishing = false;
      },
    });
  }
}

import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { LessonFormat } from '../../core/models';

@Component({
  standalone: true,
  imports: [FormsModule],
  template: `
    <section class="section-wrap">
      <div class="mx-auto max-w-3xl glass p-7">
        <h1 class="text-3xl font-bold">Create Tutor Service</h1>
        <div class="mt-5 grid gap-4 md:grid-cols-2">
          <input [(ngModel)]="subjectId" type="number" class="rounded-xl border border-white/20 bg-slate-900 px-4 py-3" placeholder="Subject ID" />
          <input [(ngModel)]="pricePerHour" type="number" class="rounded-xl border border-white/20 bg-slate-900 px-4 py-3" placeholder="Price per hour" />
          <select [(ngModel)]="format" class="rounded-xl border border-white/20 bg-slate-900 px-4 py-3">
            <option value="online">Online</option>
            <option value="offline">Offline</option>
            <option value="both">Both</option>
          </select>
          <input [(ngModel)]="title" class="rounded-xl border border-white/20 bg-slate-900 px-4 py-3" placeholder="Short quote/title" />
          <textarea [(ngModel)]="description" class="md:col-span-2 rounded-xl border border-white/20 bg-slate-900 px-4 py-3" rows="4" placeholder="Description"></textarea>
        </div>
        <button class="btn-primary mt-5 w-full" (click)="publish()">Publish Service</button>
      </div>
    </section>
  `
})
export class CreateServicePage {
  subjectId = 1;
  pricePerHour = 7000;
  format: LessonFormat = 'online';
  title = 'Programming mentor from KBTU';
  description = 'Exam prep, practical coding and confidence boosting sessions.';
  error = '';

  constructor(
    private readonly api: ApiService,
    private readonly auth: AuthService,
    private readonly router: Router
  ) {}

  publish() {
    this.error = '';
    this.api.createService({
      subject_id: Number(this.subjectId),
      title: this.title,
      description: this.description,
      price_per_hour: String(this.pricePerHour),
      format: this.format,
    }).subscribe({
      next: () => {
        this.auth.becomeTutor(() => {
          this.router.navigateByUrl('/tutors');
        });
      },
      error: (err) => {
        this.error = err?.error?.detail ?? 'Failed to create service.';
      },
    });
  }
}

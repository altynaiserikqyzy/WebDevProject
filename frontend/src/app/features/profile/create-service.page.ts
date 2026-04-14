import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../core/auth.service';
import { LessonFormat } from '../../core/models';
import { PlatformService } from '../../core/platform.service';

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
  subjectId = 4;
  pricePerHour = 7000;
  format: LessonFormat = 'online';
  title = 'Programming mentor from KBTU';
  description = 'Exam prep, practical coding and confidence boosting sessions.';

  constructor(
    private readonly platform: PlatformService,
    private readonly auth: AuthService,
    private readonly router: Router
  ) {}

  publish() {
    this.platform.addTutorService({
      id: Date.now(),
      subjectId: Number(this.subjectId),
      title: this.title,
      description: this.description,
      pricePerHour: Number(this.pricePerHour),
      format: this.format,
      teachingStyle: 'Interactive and student-centered.'
    });
    this.auth.becomeTutor();
    this.router.navigateByUrl('/tutors');
  }
}

import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { timeout } from 'rxjs';

import { ApiService } from '../../core/api.service';
import { LessonFormat, TutorAvailabilitySlot } from '../../core/models';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="section-wrap">
      <form
        class="mx-auto max-w-5xl rounded-3xl border border-white/15 bg-gradient-to-br from-slate-800/90 to-indigo-900/70 p-6 shadow-2xl backdrop-blur-xl md:p-8"
        [formGroup]="serviceForm"
        (ngSubmit)="publish()"
      >
        <h1 class="text-4xl font-bold md:text-5xl">Create Tutor Service</h1>
        <p class="mt-2 text-slate-300">Publish a tutor card that will appear in the tutors listing.</p>
        <p class="text-slate-300">Add one-time availability slots manually — no recurring schedule.</p>

        <div class="mt-6 grid gap-4 md:grid-cols-2">
          <label class="block">
            <span class="mb-2 block text-sm text-slate-200">Subject</span>
            <select formControlName="subject_id" class="w-full rounded-xl border border-white/20 bg-slate-900 px-4 py-3">
              <option value="">Select subject</option>
              @for (subject of subjects; track subject.id) {
                <option [value]="subject.id">{{ subject.name }}</option>
              }
            </select>
          </label>

          <label class="block">
            <span class="mb-2 block text-sm text-slate-200">Price per hour (KZT)</span>
            <input formControlName="price_per_hour" type="number" min="1" class="w-full rounded-xl border border-white/20 bg-slate-900 px-4 py-3" />
          </label>

          <label class="block">
            <span class="mb-2 block text-sm text-slate-200">Format</span>
            <select formControlName="format" class="w-full rounded-xl border border-white/20 bg-slate-900 px-4 py-3">
              <option value="">Select format</option>
              <option value="online">Online</option>
              <option value="offline">Offline</option>
              <option value="both">Both</option>
            </select>
          </label>

          <label class="block">
            <span class="mb-2 block text-sm text-slate-200">Service title</span>
            <input formControlName="service_title" type="text" maxlength="255" class="w-full rounded-xl border border-white/20 bg-slate-900 px-4 py-3" />
            <span class="mt-2 block text-xs text-slate-400">Short, catchy title that shows the value of your help.</span>
          </label>

          <label class="block md:col-span-2">
            <span class="mb-2 block text-sm text-slate-200">Description (optional)</span>
            <textarea formControlName="description" rows="4" maxlength="500" class="w-full rounded-xl border border-white/20 bg-slate-900 px-4 py-3"></textarea>
            <span class="mt-2 block text-right text-xs text-slate-400">{{ descriptionLength() }} / 500</span>
          </label>
        </div>

        <div class="mt-6 rounded-2xl border border-white/15 bg-slate-900/35 p-4 md:p-5">
          <h2 class="text-xl font-semibold">Available slots</h2>
          <p class="text-sm text-slate-300">Students book only the slots you add.</p>

          <div class="mt-4 grid gap-3 md:grid-cols-[1fr,1fr,1fr,1fr,auto]" [formGroup]="slotForm">
            <label class="block">
              <span class="mb-2 block text-xs text-slate-300">Date</span>
              <input type="date" formControlName="date" class="w-full rounded-xl border border-white/20 bg-slate-900 px-3 py-2" />
            </label>
            <label class="block">
              <span class="mb-2 block text-xs text-slate-300">Start time</span>
              <input type="time" formControlName="start_time" class="w-full rounded-xl border border-white/20 bg-slate-900 px-3 py-2" />
            </label>
            <label class="block">
              <span class="mb-2 block text-xs text-slate-300">End time</span>
              <input type="time" formControlName="end_time" class="w-full rounded-xl border border-white/20 bg-slate-900 px-3 py-2" />
            </label>
            <label class="block">
              <span class="mb-2 block text-xs text-slate-300">Format</span>
              <select formControlName="format" class="w-full rounded-xl border border-white/20 bg-slate-900 px-3 py-2">
                <option value="">Select format</option>
                <option value="online">Online</option>
                <option value="offline">Offline</option>
                <option value="both">Both</option>
              </select>
            </label>
            <div class="flex items-end">
              <button
                type="button"
                class="w-full rounded-xl border border-brand-300/35 bg-brand-500/25 px-4 py-2 font-semibold text-brand-100 transition hover:bg-brand-500/35"
                (click)="addSlot()"
              >
                Add slot
              </button>
            </div>
          </div>

          @if (slotError) {
            <p class="mt-3 rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">{{ slotError }}</p>
          }

          <div class="mt-4 flex flex-wrap gap-2">
            @for (slot of slots; track slot.date + slot.start_time + slot.end_time + slot.format; let i = $index) {
              <div class="inline-flex items-center gap-2 rounded-xl border border-brand-300/35 bg-slate-900 px-3 py-2 text-sm text-brand-100">
                <span>{{ slot.date }}</span>
                <span>{{ slot.start_time }}-{{ slot.end_time }}</span>
                <span class="capitalize">{{ slot.format }}</span>
                <button type="button" class="rounded px-2 py-1 text-xs text-rose-200 hover:bg-rose-500/15" (click)="removeSlot(i)">Remove</button>
              </div>
            } @empty {
              <p class="text-sm text-slate-400">No slots added yet.</p>
            }
          </div>
        </div>

        @if (error) {
          <p class="mt-4 rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{{ error }}</p>
        }
        @if (success) {
          <p class="mt-4 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{{ success }}</p>
        }

        <button type="submit" class="btn-primary mt-6 w-full disabled:cursor-not-allowed disabled:opacity-60" [disabled]="!canPublish()">
          {{ isPublishing ? 'Publishing...' : 'Publish Service' }}
        </button>
      </form>
    </section>
  `,
})
export class CreateServicePage {
  private readonly fb = inject(FormBuilder);

  subjects: Array<{ id: number; name: string }> = [];
  slots: TutorAvailabilitySlot[] = [];
  slotError = '';
  error = '';
  success = '';
  isPublishing = false;

  readonly serviceForm = this.fb.group({
    subject_id: ['', Validators.required],
    price_per_hour: ['', [Validators.required, Validators.min(1)]],
    format: ['', Validators.required],
    service_title: ['', [Validators.required, Validators.maxLength(255)]],
    description: ['', Validators.maxLength(500)],
  });

  readonly slotForm = this.fb.group(
    {
      date: ['', Validators.required],
      start_time: ['', Validators.required],
      end_time: ['', Validators.required],
      format: ['', Validators.required],
    },
    { validators: [this.slotTimeRangeValidator] }
  );

  constructor(
    private readonly api: ApiService,
    private readonly router: Router
  ) {
    this.api.listSubjects().subscribe({
      next: (subjects) => {
        this.subjects = subjects;
      },
      error: () => {
        this.subjects = [];
      },
    });
  }

  descriptionLength() {
    return (this.serviceForm.get('description')?.value ?? '').length;
  }

  canPublish() {
    return !this.isPublishing && this.serviceForm.valid && this.slots.length > 0;
  }

  addSlot() {
    this.slotError = '';
    this.success = '';
    this.error = '';

    if (this.slotForm.invalid) {
      this.slotForm.markAllAsTouched();
      this.slotError = this.slotForm.hasError('timeRange') ? 'Start time must be earlier than end time.' : 'Fill all slot fields.';
      return;
    }

    const value = this.slotForm.getRawValue();
    const slot: TutorAvailabilitySlot = {
      date: value.date ?? '',
      start_time: value.start_time ?? '',
      end_time: value.end_time ?? '',
      format: (value.format ?? '') as LessonFormat,
    };

    const duplicate = this.slots.some(
      (item) =>
        item.date === slot.date &&
        item.start_time === slot.start_time &&
        item.end_time === slot.end_time &&
        item.format === slot.format
    );
    if (duplicate) {
      this.slotError = 'This slot is already added.';
      return;
    }

    this.slots = [...this.slots, slot];
    this.slotForm.reset({ date: '', start_time: '', end_time: '', format: '' });
  }

  removeSlot(index: number) {
    this.success = '';
    this.slots = this.slots.filter((_, i) => i !== index);
  }

  publish() {
    this.error = '';
    this.success = '';
    this.slotError = '';

    if (this.serviceForm.invalid) {
      this.serviceForm.markAllAsTouched();
      this.error = 'Please fill all required fields correctly.';
      return;
    }
    if (!this.slots.length) {
      this.error = 'Add at least one slot before publishing.';
      return;
    }

    const value = this.serviceForm.getRawValue();
    this.isPublishing = true;
    this.api.createTutorService({
      subject_id: Number(value.subject_id),
      price_per_hour: Number(value.price_per_hour),
      format: value.format as LessonFormat,
      service_title: (value.service_title ?? '').trim(),
      description: (value.description ?? '').trim(),
      slots: this.slots,
    }).pipe(
      timeout(15000)
    ).subscribe({
      next: () => {
        this.isPublishing = false;
        this.success = 'Service published successfully.';
        this.serviceForm.reset({
          subject_id: '',
          price_per_hour: '',
          format: '',
          service_title: '',
          description: '',
        });
        this.slotForm.reset({ date: '', start_time: '', end_time: '', format: '' });
        this.slots = [];
        setTimeout(() => this.router.navigateByUrl('/tutors'), 500);
      },
      error: (err) => {
        this.isPublishing = false;
        const apiDetail = err?.error?.detail;
        if (err?.name === 'TimeoutError') {
          this.error = 'Publishing timed out. Check backend server and try again.';
          return;
        }
        this.error = Array.isArray(apiDetail) ? apiDetail.join(', ') : apiDetail || 'Failed to publish service.';
      },
    });
  }

  private slotTimeRangeValidator(control: AbstractControl): ValidationErrors | null {
    const start = control.get('start_time')?.value;
    const end = control.get('end_time')?.value;
    if (!start || !end) {
      return null;
    }
    return start < end ? null : { timeRange: true };
  }
}

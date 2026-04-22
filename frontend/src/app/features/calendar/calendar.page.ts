import { Component, signal } from '@angular/core';

import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { Booking, BookingAction } from '../../core/models';

@Component({
  standalone: true,
  template: `
    <section class="section-wrap">
      <div class="rounded-3xl border border-[#d8d3bc] bg-[#f3efd9] p-5 text-[#14532d] shadow-[0_20px_40px_rgba(20,83,45,0.12)] md:p-6">
        <div class="flex items-center justify-between gap-3">
          <button
            class="rounded-xl border border-[#b9cf9d] bg-[#f7f3e2] px-3 py-2 text-sm font-medium text-[#14532d] transition hover:bg-[#e7f0d8] disabled:cursor-not-allowed disabled:opacity-40"
            [disabled]="!canGoPrev()"
            (click)="previousMonth()"
          >
            Prev
          </button>

          <h2 class="text-2xl font-bold tracking-tight text-[#14532d] md:text-3xl">
            {{ currentMonthName }}
          </h2>

          <button
            class="rounded-xl border border-[#b9cf9d] bg-[#f7f3e2] px-3 py-2 text-sm font-medium text-[#14532d] transition hover:bg-[#e7f0d8] disabled:cursor-not-allowed disabled:opacity-40"
            [disabled]="!canGoNext()"
            (click)="nextMonth()"
          >
            Next
          </button>
        </div>

        @if (error()) {
          <p class="mt-4 rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-800">{{ error() }}</p>
        }

        <div class="mt-5 grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase tracking-[0.08em] text-[#2f6a45] md:gap-3">
          @for (d of weekLabels; track d) {
            <div>{{ d }}</div>
          }
        </div>

        <div class="mt-3 grid grid-cols-7 gap-2 md:gap-3">
          @for (day of monthDays; track day.dateKey; let i = $index) {
            <div
              class="rounded-2xl border border-[#d6dfc7] bg-[#fffdf4] p-2 text-xs shadow-[0_8px_22px_rgba(20,83,45,0.08)] transition hover:border-[#adc78f] hover:bg-[#f7f5e8] md:min-h-[124px]"
              [style.grid-column-start]="i === 0 ? firstDayColumnStart : null"
            >
              <div class="mb-2 text-sm font-semibold text-[#1f5a37]">{{ day.dayNumber }}</div>

              @for (event of day.events; track event.id) {
                <button
                  class="mb-1 block w-full rounded-lg px-2 py-1 text-left text-[11px] font-medium transition"
                  [class]="eventChipClass(event)"
                  (click)="openModal(event)"
                >
                  {{ event.subject_name }} - {{ statusLabel(event.status) }}
                </button>
              }
            </div>
          }
        </div>
      </div>
    </section>

    @if (isModalOpen()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4">
        <div class="relative w-full max-w-md rounded-2xl border border-[#cbd8bc] bg-[#f3efd9] p-6 text-[#14532d] shadow-[0_16px_36px_rgba(20,83,45,0.18)]">
          <button class="absolute right-3 top-3 text-lg text-[#2f6a45] transition hover:text-[#14532d]" (click)="closeModal()">
            X
          </button>

          <h2 class="mb-4 text-xl font-bold text-[#14532d]">Session Details</h2>

          <p><b>Status:</b> {{ statusLabel(selectedEvent?.status) }}</p>
          <p><b>Subject:</b> {{ selectedEvent?.subject_name }}</p>
          <p><b>Date:</b> {{ formatDate(selectedEvent?.scheduled_start_at) }}</p>
          <p><b>Time:</b> {{ formatTimeRange(selectedEvent?.scheduled_start_at, selectedEvent?.scheduled_end_at) }}</p>
          <p><b>Format:</b> {{ formatLabel(selectedEvent?.format) }}</p>
          <p><b>Student:</b> {{ selectedEvent?.student_name }}</p>
          <p><b>Teacher:</b> {{ selectedEvent?.teacher_name }}</p>

          @if (selectedEvent?.cancel_reason) {
            <p><b>Cancel reason:</b> {{ selectedEvent?.cancel_reason }}</p>
          }
          @if (selectedEvent?.rejection_reason) {
            <p><b>Rejection reason:</b> {{ selectedEvent?.rejection_reason }}</p>
          }

          @if (selectedEvent?.meet_link) {
            <a
              [href]="selectedEvent?.meet_link"
              target="_blank"
              rel="noopener noreferrer"
              class="mt-4 inline-flex items-center gap-2 rounded-lg border border-[#a9ca8c] bg-[#e4f0d5] px-3 py-1 font-medium text-[#14532d] transition hover:bg-[#d4e6bf]"
            >
              Open Google Meet
            </a>
          }

          @if (selectedEvent?.allowed_actions?.length) {
            <div class="mt-4 grid grid-cols-2 gap-2">
              @if (canAction('confirm')) {
                <button class="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm font-semibold text-emerald-800" (click)="applyAction('confirm')">Confirm</button>
              }
              @if (canAction('reject')) {
                <button class="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm font-semibold text-rose-800" (click)="applyAction('reject')">Reject</button>
              }
              @if (canAction('cancel')) {
                <button class="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm font-semibold text-amber-800" (click)="applyAction('cancel')">Cancel</button>
              }
              @if (canAction('complete')) {
                <button class="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm font-semibold text-emerald-800" (click)="applyAction('complete')">Complete</button>
              }
              @if (canAction('no_show')) {
                <button class="rounded-lg border border-fuchsia-500/40 bg-fuchsia-500/10 px-3 py-2 text-sm font-semibold text-fuchsia-800" (click)="applyAction('no_show')">No Show</button>
              }
            </div>
          }
        </div>
      </div>
    }
  `
})
export class CalendarPage {
  selectedEvent: Booking | null = null;
  isModalOpen = signal(false);
  error = signal('');

  readonly weekLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  readonly monthsOfYear = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  readonly calendarYear = 2026;

  readonly bookings = signal<Booking[]>([]);
  monthDays: Array<{ dateKey: string; dayNumber: number; events: Booking[] }> = [];
  currentMonthIndex = this.getInitialMonthIndex();
  firstDayColumnStart = 1;

  constructor(
    private readonly api: ApiService,
    private readonly auth: AuthService,
  ) {
    this.generateMonth();
    this.loadBookings();
  }

  get currentMonthName() {
    return `${this.monthsOfYear[this.currentMonthIndex]} ${this.calendarYear}`;
  }

  canGoPrev() {
    return this.currentMonthIndex > 0;
  }

  canGoNext() {
    return this.currentMonthIndex < 11;
  }

  previousMonth() {
    if (!this.canGoPrev()) return;
    this.currentMonthIndex -= 1;
    this.generateMonth();
  }

  nextMonth() {
    if (!this.canGoNext()) return;
    this.currentMonthIndex += 1;
    this.generateMonth();
  }

  loadBookings() {
    this.error.set('');
    this.api.listMyBookings().subscribe({
      next: (bookings) => {
        this.bookings.set(bookings);
        this.generateMonth();
      },
      error: (err) => {
        this.error.set(this.extractErrorMessage(err, 'Failed to load bookings.'));
        this.bookings.set([]);
        this.generateMonth();
      },
    });
  }

  generateMonth() {
    const sessions = this.bookings().filter((booking) => {
      const date = new Date(booking.scheduled_start_at);
      return date.getFullYear() === this.calendarYear;
    });

    const firstDay = new Date(this.calendarYear, this.currentMonthIndex, 1);
    const firstWeekdayIndex = (firstDay.getDay() + 6) % 7;
    this.firstDayColumnStart = firstWeekdayIndex + 1;

    const daysInMonth = new Date(this.calendarYear, this.currentMonthIndex + 1, 0).getDate();

    this.monthDays = Array.from({ length: daysInMonth }, (_, i) => {
      const dayNumber = i + 1;
      const dateKey = this.makeLocalDateKey(this.calendarYear, this.currentMonthIndex, dayNumber);

      return {
        dateKey,
        dayNumber,
        events: sessions.filter((event) => this.isoToLocalDateKey(event.scheduled_start_at) === dateKey)
      };
    });
  }

  openModal(event: Booking) {
    this.selectedEvent = event;
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.selectedEvent = null;
    this.isModalOpen.set(false);
  }

  canAction(action: BookingAction) {
    return Boolean(this.selectedEvent?.allowed_actions?.includes(action));
  }

  applyAction(action: BookingAction) {
    const event = this.selectedEvent;
    if (!event) {
      return;
    }

    if (!event.allowed_actions?.includes(action)) {
      return;
    }

    if (!confirm(`Are you sure you want to ${action.replace('_', ' ')} this booking?`)) {
      return;
    }

    if (action === 'confirm') {
      this.api.confirmBooking(event.id).subscribe({ next: () => this.afterActionSuccess(event.id), error: (err) => this.error.set(this.extractErrorMessage(err, 'Action failed.')) });
      return;
    }

    if (action === 'complete') {
      this.api.completeBooking(event.id).subscribe({ next: () => this.afterActionSuccess(event.id), error: (err) => this.error.set(this.extractErrorMessage(err, 'Action failed.')) });
      return;
    }

    if (action === 'no_show') {
      this.api.markNoShowBooking(event.id).subscribe({ next: () => this.afterActionSuccess(event.id), error: (err) => this.error.set(this.extractErrorMessage(err, 'Action failed.')) });
      return;
    }

    if (action === 'reject') {
      const reason = prompt('Rejection reason (optional):') ?? '';
      this.api.rejectBooking(event.id, { reason }).subscribe({ next: () => this.afterActionSuccess(event.id), error: (err) => this.error.set(this.extractErrorMessage(err, 'Action failed.')) });
      return;
    }

    if (action === 'cancel') {
      const reason = prompt('Cancellation reason (optional):') ?? '';
      this.api.cancelBooking(event.id, { reason }).subscribe({ next: () => this.afterActionSuccess(event.id), error: (err) => this.error.set(this.extractErrorMessage(err, 'Action failed.')) });
    }
  }

  afterActionSuccess(bookingId: number) {
    this.api.getBooking(bookingId).subscribe({
      next: (updatedBooking) => {
        this.bookings.update((items) => items.map((item) => (item.id === bookingId ? updatedBooking : item)));
        this.selectedEvent = updatedBooking;
        this.generateMonth();
      },
      error: () => this.loadBookings(),
    });
  }

  eventChipClass(event: Booking) {
    if (event.status === 'pending') {
      return 'border border-amber-400/70 bg-amber-200/90 text-amber-900 hover:bg-amber-200';
    }
    return this.isTeacherEvent(event)
      ? 'border border-violet-300/60 bg-violet-200/80 text-violet-900 hover:bg-violet-200'
      : 'border border-[#b7d3a7] bg-[#e4f0d5] text-[#14532d] hover:bg-[#d6e8c3]';
  }

  statusLabel(status: Booking['status'] | undefined) {
    if (status === 'pending') return 'Not yet confirmed';
    if (status === 'confirmed') return 'Confirmed';
    if (status === 'rejected') return 'Rejected';
    if (status === 'cancelled') return 'Cancelled';
    if (status === 'completed') return 'Completed';
    if (status === 'no_show') return 'No show';
    return 'Unknown';
  }

  formatLabel(format: 'online' | 'offline' | 'both' | null | undefined) {
    if (format === 'offline') return 'Offline';
    if (format === 'both') return 'Online/Offline';
    return 'Online';
  }

  formatDate(value: string | null | undefined) {
    if (!value) return '—';
    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? value
      : date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  formatTimeRange(start: string | null | undefined, end: string | null | undefined) {
    if (!start || !end) {
      return '—';
    }
    const startDate = new Date(start);
    const endDate = new Date(end);
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      return `${start} - ${end}`;
    }
    const opts: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', hour12: false };
    return `${startDate.toLocaleTimeString('en-GB', opts)} - ${endDate.toLocaleTimeString('en-GB', opts)}`;
  }

  private getInitialMonthIndex() {
    const now = new Date();
    return now.getFullYear() === this.calendarYear ? now.getMonth() : 0;
  }

  private makeLocalDateKey(year: number, monthIndex: number, day: number) {
    const month = String(monthIndex + 1).padStart(2, '0');
    const dayPart = String(day).padStart(2, '0');
    return `${year}-${month}-${dayPart}`;
  }

  private isoToLocalDateKey(iso: string | null | undefined) {
    if (!iso) {
      return '';
    }
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) {
      return iso.split('T')[0] ?? '';
    }
    return this.makeLocalDateKey(date.getFullYear(), date.getMonth(), date.getDate());
  }

  private isTeacherEvent(event: Booking) {
    const user = this.auth.user();
    if (!user) return false;

    const teacherName = String(event.teacher_name ?? '').trim().toLowerCase();
    const candidates = [user.fullName, user.username]
      .map((value) => String(value ?? '').trim().toLowerCase())
      .filter(Boolean);

    return candidates.includes(teacherName);
  }

  private extractErrorMessage(err: any, fallback: string) {
    const detail = err?.error?.detail;
    if (typeof detail === 'string' && detail.trim()) {
      return detail;
    }
    if (Array.isArray(detail) && detail.length) {
      return String(detail[0]);
    }
    if (detail && typeof detail === 'object') {
      const first = Object.values(detail)[0];
      if (Array.isArray(first) && first.length) {
        return String(first[0]);
      }
      if (typeof first === 'string') {
        return first;
      }
    }
    return fallback;
  }
}

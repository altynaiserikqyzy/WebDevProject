import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PlatformService } from '../../core/platform.service';

@Component({
  standalone: true,
  imports: [FormsModule],
  template: `
  <section class="section-wrap">

    <!-- MONTH TITLE -->
    <h2 class="text-2xl font-bold mt-4">
      {{ currentMonthName }}
    </h2>

    <!-- WEEK DAYS -->
    <div class="grid grid-cols-7 gap-2 mt-4 text-xs text-slate-400 text-center">
      @for (d of weekLabels; track d) {
        <div>{{ d }}</div>
      }
    </div>

    <!-- CALENDAR GRID -->
    <div class="grid grid-cols-7 gap-2 mt-2">

      @for (day of monthDays; track day.dateKey) {

        <div class="glass rounded-xl p-2 min-h-[110px] text-xs">

          <div class="mb-1 text-slate-300">
            {{ day.dayNumber }}
          </div>

          @for (event of day.events; track event.id) {
            <div
              class="mt-1 p-1 rounded text-[10px] cursor-pointer hover:opacity-80 transition"
              [style.background]="event.eventColor"
              (click)="openModal(event)"
            >
              {{ event.subjectName }}
            </div>
          }

        </div>

      }

    </div>

  </section>

  <!-- MODAL -->
  @if (isModalOpen()) {
    <div class="fixed inset-0 bg-black/60 flex items-center justify-center z-50">

      <div class="glass w-[420px] rounded-2xl p-6 relative">

        <!-- close -->
        <button
          class="absolute top-2 right-3 text-xl"
          (click)="closeModal()"
        >
          ✕
        </button>

        <h2 class="text-xl font-bold mb-4">Session Details</h2>

        <p><b>Subject:</b> {{ selectedEvent?.subjectName }}</p>
        <p><b>Date:</b> {{ selectedEvent?.date }}</p>
        <p><b>Time:</b> {{ selectedEvent?.time }}</p>

        <p><b>Student:</b> {{ selectedEvent?.studentName }}</p>
        <p><b>Teacher:</b> {{ selectedEvent?.teacherName }}</p>

        @if (selectedEvent?.meetLink) {
          <a
            [href]="selectedEvent.meetLink"
            target="_blank"
            class="inline-flex items-center gap-2 mt-4 px-3 py-1 rounded-lg bg-violet-500/20 text-violet-300 hover:bg-violet-500/30 transition"
          >
            🎥 Google Meet
          </a>
        }

      </div>

    </div>
  }
  `
})
export class CalendarPage {

  selectedEvent: any = null;
  isModalOpen = signal(false);

  weekLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  monthDays: any[] = [];

  currentDate = new Date();

  currentMonthName = '';

  constructor(public readonly platform: PlatformService) {
    this.generateMonth();
  }

  generateMonth() {
    const sessions = this.platform.upcomingSessions();

    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();

    this.currentMonthName = this.currentDate.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });

    const firstDay = new Date(year, month, 1);

    const start = new Date(firstDay);
    const day = firstDay.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    start.setDate(firstDay.getDate() + diff);

    this.monthDays = [];

    for (let i = 0; i < 42; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);

      const dateKey = date.toISOString().split('T')[0];

      this.monthDays.push({
        dateKey,
        dayNumber: date.getDate(),
        events: sessions.filter((e: any) => e.date === dateKey)
      });
    }
  }

  openModal(event: any) {
    this.selectedEvent = event;
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
    this.selectedEvent = null;
  }
}
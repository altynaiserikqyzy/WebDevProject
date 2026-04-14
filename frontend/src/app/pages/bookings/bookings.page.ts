import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

import { ApiService } from '../../core/api.service';
import { Booking } from '../../core/models';

@Component({
  selector: 'app-bookings-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bookings.page.html',
  styleUrl: './bookings.page.css'
})
export class BookingsPage {
  bookings: Booking[] = [];
  error: string | null = null;
  loading: boolean = false;

  constructor(private readonly api: ApiService) {}

  onLoadBookingsClick() {
    this.error = '';
    this.loading = true;
    this.api.listMyBookings().subscribe({
      next: (data: Booking[]) => {
        this.bookings = data;
        this.loading = false;
      },
      error: (err: any) => {
        this.error = 'Failed to load bookings: ' + err.message;
        this.loading = false;
      }
    });
  }

  onMessageClick(bookingId: number) {
    // TODO: Implement messaging functionality
    alert('Messaging feature coming soon!');
  }
}

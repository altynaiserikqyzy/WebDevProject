import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { ApiService } from '../../core/api.service';

interface TutorProfile {
  id: number;
  username: string;
  bio: string;
  photo?: string;
  study_year?: number;
  course?: string;
  rating: number;
  total_reviews: number;
  google_meet_link?: string;
  services: TutoringService[];
}

interface TutoringService {
  id: number;
  title: string;
  subject_name: string;
  price_per_hour: string;
  format: string;
  description: string;
}

interface Review {
  id: number;
  reviewer_username: string;
  rating: number;
  comment: string;
  created_at: string;
}

interface Availability {
  id: number;
  weekday: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

@Component({
  selector: 'app-tutor-detail-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tutor-detail.page.html',
  styleUrl: './tutor-detail.page.css'
})
export class TutorDetailPage {
  tutorId = 0;
  tutor: TutorProfile | null = null;
  reviews: Review[] = [];
  availability: Availability[] = [];
  loading = false;
  error = '';

  // Booking form
  selectedServiceId: number | null = null;
  bookingDate = '';
  bookingTime = '';
  bookingFormat = 'online';
  numberOfSessions = 1;
  totalPrice = 0;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly api: ApiService,
    private readonly router: Router
  ) {}

  ngOnInit() {
    this.tutorId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.tutorId) {
      this.loadTutorDetails();
      this.loadReviews();
      this.loadAvailability();
    }
  }

  loadTutorDetails() {
    this.loading = true;
    this.api.getTutorProfile(this.tutorId).subscribe({
      next: (data: TutorProfile) => {
        this.tutor = data;
        this.loading = false;
      },
      error: (err: any) => {
        this.error = 'Failed to load tutor details: ' + err.message;
        this.loading = false;
      }
    });
  }

  loadReviews() {
    this.api.getTutorReviews(this.tutorId).subscribe({
      next: (data: Review[]) => {
        this.reviews = data;
      },
      error: (err: any) => {
        console.error('Failed to load reviews:', err);
      }
    });
  }

  loadAvailability() {
    this.api.getTutorAvailability(this.tutorId).subscribe({
      next: (data: Availability[]) => {
        this.availability = data;
      },
      error: (err: any) => {
        console.error('Failed to load availability:', err);
      }
    });
  }

  onServiceSelect(serviceId: number, pricePerHour: string) {
    this.selectedServiceId = serviceId;
    this.updateTotalPrice(pricePerHour);
  }

  updateTotalPrice(pricePerHour: string) {
    this.totalPrice = Number(pricePerHour) * this.numberOfSessions;
  }

  onSessionsChange() {
    if (this.tutor && this.selectedServiceId) {
      const service = this.tutor.services.find((s) => s.id === this.selectedServiceId);
      if (service) {
        this.updateTotalPrice(service.price_per_hour);
      }
    }
  }

  onBookClick() {
    if (!this.selectedServiceId || !this.bookingDate || !this.bookingTime) {
      this.error = 'Please fill in all required fields';
      return;
    }

    this.loading = true;
    const scheduledFor = new Date(`${this.bookingDate}T${this.bookingTime}`).toISOString();

    this.api.createBooking({
      service: this.selectedServiceId,
      scheduled_for: scheduledFor,
      notes: ''
    }).subscribe({
      next: () => {
        this.loading = false;
        alert('Booking created successfully!');
        this.router.navigateByUrl('/bookings');
      },
      error: (err: any) => {
        this.error = 'Failed to create booking: ' + err.message;
        this.loading = false;
      }
    });
  }

  getWeekdayName(weekday: number): string {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    return days[weekday] || 'Unknown';
  }

  formatTime(time: string): string {
    return time.substring(0, 5);
  }
}

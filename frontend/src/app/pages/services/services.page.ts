import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';

interface Subject {
  id: number;
  name: string;
  icon?: string;
}

interface TutoringService {
  id: number;
  title: string;
  subject: number;
  subject_name: string;
  tutor: number;
  tutor_username: string;
  tutor_photo?: string;
  tutor_rating?: number;
  tutor_study_year?: number;
  description: string;
  price_per_hour: string;
  format: string;
  is_active: boolean;
  created_at: string;
}

@Component({
  selector: 'app-services-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './services.page.html',
  styleUrl: './services.page.css'
})
export class ServicesPage {
  subjects: Subject[] = [];
  services: TutoringService[] = [];
  loading = false;
  error = '';
  searchQuery = '';
  showCreateForm = false;

  // Form fields
  subjectId: number | null = null;
  title = '';
  description = '';
  pricePerHour = '';
  format = '';

  // Booking fields
  bookingDateTime = '';
  bookingNotes = '';

  constructor(private readonly api: ApiService, private readonly router: Router, private readonly auth: AuthService) {}

  onLoadSubjectsClick() {
    this.error = '';
    this.loading = true;
    this.api.listSubjects().subscribe({
      next: (data: Subject[]) => {
        this.subjects = data;
        this.loading = false;
      },
      error: (err: any) => {
        this.error = 'Failed to load subjects: ' + err.message;
        this.loading = false;
      }
    });
  }

  onLoadServicesClick() {
    this.error = '';
    this.loading = true;
    this.api.listServices().subscribe({
      next: (data: TutoringService[]) => {
        this.services = data;
        this.loading = false;
      },
      error: (err: any) => {
        this.error = 'Failed to load services: ' + err.message;
        this.loading = false;
      }
    });
  }

  onSearchClick() {
    this.error = '';
    this.loading = true;
    this.api.listServices().subscribe({
      next: (data: TutoringService[]) => {
        if (this.searchQuery) {
          const query = this.searchQuery.toLowerCase();
          this.services = data.filter(
            (s: TutoringService) =>
              s.subject_name.toLowerCase().includes(query) ||
              s.tutor_username.toLowerCase().includes(query) ||
              s.title.toLowerCase().includes(query)
          );
        } else {
          this.services = data;
        }
        this.loading = false;
      },
      error: (err: any) => {
        this.error = 'Failed to search: ' + err.message;
        this.loading = false;
      }
    });
  }

  onSubjectClick(subjectId: number) {
    this.subjectId = subjectId;
    this.showCreateForm = true;
    // Scroll to create form
    setTimeout(() => {
      document.querySelector('.create-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }

  onMessageClick(serviceId: number) {
    // TODO: Implement messaging functionality
    alert('Messaging feature coming soon!');
  }

  onTutorCardClick(tutorId: number) {
    this.router.navigateByUrl(`/tutors/${tutorId}`);
  }

  toggleCreateForm() {
    this.showCreateForm = !this.showCreateForm;
  }

  onCreateServiceClick() {
    this.error = '';
    this.loading = true;
    this.api.createService({
      subject: this.subjectId!,
      title: this.title,
      description: this.description,
      price_per_hour: this.pricePerHour,
      format: this.format
    }).subscribe({
      next: () => {
        this.loading = false;
        this.title = '';
        this.description = '';
        this.pricePerHour = '';
        this.format = '';
        this.showCreateForm = false;
        this.onLoadServicesClick();
      },
      error: (err) => {
        this.error = 'Failed to create service: ' + err.message;
        this.loading = false;
      }
    });
  }

  onBookClick(serviceId: number) {
    this.error = '';
    this.loading = true;
    this.api.createBooking({
      service: serviceId,
      scheduled_for: this.bookingDateTime || new Date().toISOString(),
      notes: this.bookingNotes
    }).subscribe({
      next: () => {
        this.loading = false;
        alert('Booking created!');
        this.router.navigateByUrl('/bookings');
      },
      error: (err) => {
        this.error = 'Failed to book: ' + err.message;
        this.loading = false;
      }
    });
  }

  onDeleteServiceClick(serviceId: number) {
    this.error = '';
    this.loading = true;
    this.api.deleteService(serviceId).subscribe({
      next: () => {
        this.loading = false;
        this.onLoadServicesClick();
      },
      error: (err) => {
        this.error = 'Failed to delete: ' + err.message;
        this.loading = false;
      }
    });
  }

  onLogoutClick() {
    this.auth.logout();
  }
}

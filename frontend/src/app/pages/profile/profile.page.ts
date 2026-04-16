import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { Booking } from '../../core/models';

interface UserProfile {
  id: number;
  username: string;
}

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
}

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.page.html',
  styleUrl: './profile.page.css'
})
export class ProfilePage {
  user: UserProfile | null = null;
  bookings: Booking[] = [];
  tutorProfile: TutorProfile | null = null;
  loading = false;
  error = '';

  // Edit profile form
  showEditForm = false;
  bio = '';
  course = '';
  studyYear: number | null = null;
  googleMeetLink = '';
  selectedAvatarFile: File | null = null;

  // Become tutor form
  showTutorForm = false;
  tutorBio = '';
  tutorCourse = '';
  tutorStudyYear: number | null = null;
  tutorGoogleMeetLink = '';

  constructor(
    private readonly api: ApiService,
    private readonly auth: AuthService,
    private readonly router: Router
  ) {}

  ngOnInit() {
    this.loadUserProfile();
    this.loadBookings();
    this.loadTutorProfile();
  }

  loadUserProfile() {
    this.api.me().subscribe({
      next: (data: UserProfile) => {
        this.user = data;
      },
      error: (err: any) => {
        console.error('Failed to load user profile:', err);
      }
    });
  }

  loadBookings() {
    this.api.listMyBookings().subscribe({
      next: (data: Booking[]) => {
        this.bookings = data;
      },
      error: (err: any) => {
        console.error('Failed to load bookings:', err);
      }
    });
  }

  loadTutorProfile() {
    // For now, we'll check if the user has a tutor profile by trying to get it
    // This would need a proper endpoint to get current user's tutor profile
    // For now, we'll skip this
  }

  onEditProfileClick() {
    if (this.tutorProfile) {
      this.bio = this.tutorProfile.bio;
      this.course = this.tutorProfile.course || '';
      this.studyYear = this.tutorProfile.study_year || null;
      this.googleMeetLink = this.tutorProfile.google_meet_link || '';
    }
    this.showEditForm = true;
  }
  onAvatarSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    this.selectedAvatarFile = input.files?.[0] ?? null;
}

  onSaveProfileClick() {
    this.loading = true;
    this.error = '';

    const formData = new FormData();
    formData.append('bio', this.bio);
    formData.append('major', this.course);
    if (this.studyYear !== null) {
      formData.append('study_year', String(this.studyYear));
    }
    if (this.selectedAvatarFile) {
      formData.append('avatar', this.selectedAvatarFile);
    }

    this.api.updateMyProfile(formData).subscribe({
      next: () => {
        this.loading = false;
        this.showEditForm = false;
        this.selectedAvatarFile = null;
        this.loadUserProfile();
      },
      error: (err: any) => {
        this.loading = false;
        this.error = err?.error?.detail ?? 'Failed to update profile';
      }
  });
}



  onBecomeTutorClick() {
    this.showTutorForm = true;
  }

  onCreateTutorProfileClick() {
    this.loading = true;
    this.error = '';
    // TODO: Implement create tutor profile API call
    alert('Become tutor feature coming soon!');
    this.loading = false;
    this.showTutorForm = false;
  }

  onCancelClick() {
    this.showEditForm = false;
    this.showTutorForm = false;
  }

  onLogoutClick() {
    this.auth.logout();
  }
}
